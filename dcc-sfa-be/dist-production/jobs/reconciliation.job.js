"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleReconciliationJob = void 0;
exports.runReconciliationJob = runReconciliationJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
/**
 * Reconciliation Cron Job
 *
 * Runs every day at 6:00 PM (18:00).
 *
 * Logic:
 *  1. Find all active users with 'Salesman' role
 *  2. For each salesman, check if they have loaded van inventory
 *     (inventory_stock with current_stock > 0 and is_active = 'Y')
 *  3. If they do, and no reconciliation exists for today:
 *     - Create a `reconciliation` record (header)
 *     - Create `reconciliation_items` for each unique product loaded
 *       with expected_qty = total current_stock for that product
 *  4. If reconciliation already exists for today, skip (idempotent)
 */
async function runReconciliationJob() {
    logger_1.default.info('Reconciliation Cron: Started');
    logger_1.default.info(`Time: ${new Date().toISOString()}`);
    const startTime = Date.now();
    const results = {
        totalSalespersons: 0,
        skipped: 0, // Already has reconciliation today
        created: 0, // New reconciliation created
        noStock: 0, // No loaded van inventory
        failed: 0,
    };
    try {
        // 1. Get all active Salesman-role users
        const salespersons = await prisma_client_1.default.users.findMany({
            where: {
                is_active: 'Y',
                user_role: { name: 'Salesman' },
            },
            select: {
                id: true,
                name: true,
                employee_id: true,
                depot_id: true,
                sap_code: true,
            },
        });
        results.totalSalespersons = salespersons.length;
        logger_1.default.info(`Reconciliation Cron: Found ${salespersons.length} salesmen`);
        const now = new Date();
        const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        for (const salesman of salespersons) {
            try {
                const existing = await prisma_client_1.default.reconciliation.findFirst({
                    where: {
                        salesman_id: salesman.id,
                        reconciliation_date: { gte: today, lt: tomorrow },
                        is_active: 'Y',
                    },
                });
                if (existing) {
                    results.skipped++;
                    logger_1.default.info(`Reconciliation Cron: Skipping ${salesman.name} — already reconciled today`);
                    continue;
                }
                const stockRecords = await prisma_client_1.default.inventory_stock.findMany({
                    where: {
                        salesperson_id: salesman.id,
                        is_active: 'Y',
                        current_stock: { gt: 0 },
                    },
                    select: {
                        id: true,
                        product_id: true,
                        inventory_stock_products: {
                            select: {
                                code: true,
                            },
                        },
                        current_stock: true,
                        batch_id: true,
                        inventory_stock_batch: {
                            select: {
                                batch_number: true,
                            },
                        },
                    },
                });
                if (stockRecords.length === 0) {
                    results.noStock++;
                    logger_1.default.info(`Reconciliation Cron: Skipping ${salesman.name} — no loaded inventory`);
                    continue;
                }
                const productMap = new Map();
                for (const rec of stockRecords) {
                    if (rec.product_id === null)
                        continue;
                    const existing = productMap.get(rec.product_id);
                    const qty = Number(rec.current_stock) || 0;
                    const batchNum = rec.inventory_stock_batch?.batch_number ?? null;
                    const productCode = rec.inventory_stock_products?.code ||
                        String(rec.product_id);
                    if (existing) {
                        existing.total_qty += qty;
                    }
                    else {
                        productMap.set(rec.product_id, {
                            product_id: rec.product_id,
                            product_code: productCode,
                            total_qty: qty,
                            batch_number: batchNum,
                        });
                    }
                }
                if (productMap.size === 0) {
                    results.noStock++;
                    continue;
                }
                // 5. Create reconciliation header + items in a transaction
                await prisma_client_1.default.$transaction(async (tx) => {
                    const reconciliation = await tx.reconciliation.create({
                        data: {
                            salesman_id: salesman.id,
                            depot_id: salesman.depot_id ?? null,
                            status: 'P',
                            reconciliation_date: today,
                            is_active: 'Y',
                            createdate: new Date(),
                            createdby: 1,
                        },
                    });
                    const itemsData = Array.from(productMap.values()).map(p => ({
                        reconciliation_id: reconciliation.id,
                        product_id: p.product_id,
                        batch_number: p.batch_number,
                        expected_qty: p.total_qty,
                        actual_qty: null,
                        variance: null,
                        resolution_action: 'Awaiting Verification',
                        default_outlet_posting_qty: 0,
                        unload_adjustment_qty: 0,
                        stock_key: `${salesman.sap_code ?? salesman.id} | ${p.product_code} | ${p.batch_number}`,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: 1,
                    }));
                    await tx.reconciliation_items.createMany({ data: itemsData });
                    logger_1.default.info(`Reconciliation Cron: Created reconciliation #${reconciliation.id} for ${salesman.name} — ${itemsData.length} items`);
                });
                results.created++;
            }
            catch (err) {
                results.failed++;
                logger_1.default.error(`Reconciliation Cron: Failed for ${salesman.name} — ${err.message}`);
            }
        }
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger_1.default.info('Reconciliation Cron: Completed');
        logger_1.default.info(`Duration: ${duration}s | Total: ${results.totalSalespersons} | Created: ${results.created} | Skipped (today): ${results.skipped} | No stock: ${results.noStock} | Failed: ${results.failed}`);
    }
    catch (err) {
        logger_1.default.error('Reconciliation Cron: Fatal error —', err.message);
    }
}
/**
 * Schedule the reconciliation cron at 6:00 PM daily.
 */
const scheduleReconciliationJob = () => {
    // '0 18 * * *' = every day at 18:00
    node_cron_1.default.schedule('0 18 * * *', async () => {
        await runReconciliationJob();
    });
    logger_1.default.info('Reconciliation Cron: Scheduled at 6:00 PM daily');
};
exports.scheduleReconciliationJob = scheduleReconciliationJob;
//# sourceMappingURL=reconciliation.job.js.map