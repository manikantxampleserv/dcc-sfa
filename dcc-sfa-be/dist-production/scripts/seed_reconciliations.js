"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    logger_1.default.info('Starting ROP Reconciliation seeding...');
    // 1. Load Excel file
    const filePath = '../ROP Window in SFA Application.xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['T_ROP'];
    if (!sheet) {
        throw new Error('Sheet T_ROP not found in Excel file');
    }
    // Parse worksheet rows
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Row 12 contains the column headers (0-indexed is row index 11)
    const headerRowIndex = 11;
    const headers = rows[headerRowIndex];
    if (!headers || !headers.includes('ROP ID')) {
        throw new Error('Could not find column headers in row 11 of sheet T_ROP');
    }
    // Parse rows into objects
    const rawRecords = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0)
            continue;
        const record = {};
        headers.forEach((h, colIndex) => {
            record[h] = row[colIndex] !== undefined ? row[colIndex] : null;
        });
        if (record['ROP ID'] && record['ROP ID'] !== 'SUMMARY') {
            rawRecords.push(record);
        }
    }
    logger_1.default.info(`Parsed ${rawRecords.length} records from Excel sheet.`);
    // 2. Fetch existing users, depots, and products
    const dbUsers = await prisma_client_1.default.users.findMany();
    const dbDepots = await prisma_client_1.default.depots.findMany();
    const dbProducts = await prisma_client_1.default.products.findMany();
    // Find Sales Person role
    const salesPersonRole = await prisma_client_1.default.roles.findFirst({
        where: { name: { contains: 'Sales' } },
    });
    if (!salesPersonRole) {
        throw new Error('Role "Sales Person" or containing "Sales" not found in database');
    }
    // Find or create salesman James
    let james = dbUsers.find(u => u.employee_id === 'MOS100801');
    if (!james) {
        logger_1.default.info('Creating salesperson James (MOS100801)...');
        const passwordHash = await bcrypt_1.default.hash('James@123', 10);
        james = await prisma_client_1.default.users.create({
            data: {
                name: 'James',
                email: 'james.mos@bbl.co.tz',
                employee_id: 'MOS100801',
                password_hash: passwordHash,
                role_id: salesPersonRole.id,
                createdby: 1,
                is_active: 'Y',
                createdate: new Date(),
            },
        });
        dbUsers.push(james);
    }
    // Build lookup maps
    const userMapByName = new Map();
    dbUsers.forEach(u => {
        userMapByName.set(u.name.trim().toLowerCase(), u.id);
    });
    const depotMapByCode = new Map();
    dbDepots.forEach(d => {
        depotMapByCode.set(d.code.trim().toUpperCase(), d.id);
    });
    const productMapByCode = new Map();
    dbProducts.forEach(p => {
        productMapByCode.set(p.code.trim().toUpperCase(), p.id);
    });
    // 3. Clear existing reconciliation data
    logger_1.default.info('Clearing old reconciliation items and headers...');
    await prisma_client_1.default.reconciliation_items.deleteMany({});
    await prisma_client_1.default.reconciliation.deleteMany({});
    const reconciliationDate = new Date('2026-06-22');
    const groupedRecords = new Map();
    rawRecords.forEach(r => {
        const key = r['Salesman SAP Code'];
        if (!groupedRecords.has(key)) {
            groupedRecords.set(key, []);
        }
        groupedRecords.get(key).push(r);
    });
    logger_1.default.info(`Grouping seeded data into ${groupedRecords.size} reconciliation headers...`);
    let headersCreated = 0;
    let itemsCreated = 0;
    for (const [sapCode, records] of groupedRecords.entries()) {
        const firstRec = records[0];
        const salesmanName = firstRec['Salesman Name'];
        const depotCode = firstRec['Depot'];
        let salesmanId = null;
        let depotId = null;
        // Resolve salesman ID
        if (sapCode === 'MOS100801' ||
            !salesmanName ||
            salesmanName === 'UNMAPPED') {
            salesmanId = james.id;
        }
        else {
            salesmanId =
                userMapByName.get(salesmanName.toString().trim().toLowerCase()) || null;
        }
        if (!salesmanId) {
            logger_1.default.warn(`Could not resolve salesman name: ${salesmanName} for SAP code: ${sapCode}. Skipping.`);
            continue;
        }
        if (depotCode && depotCode !== 'UNMAPPED') {
            depotId = depotMapByCode.get(depotCode.trim().toUpperCase()) || null;
        }
        const reconciliationStatus = sapCode === 'MOS100801'
            ? 'Blocked - Force-Push Required'
            : 'Pending Verification';
        const recon = await prisma_client_1.default.reconciliation.create({
            data: {
                salesman_id: salesmanId,
                depot_id: depotId,
                status: reconciliationStatus,
                reconciliation_date: reconciliationDate,
                is_active: 'Y',
                createdate: new Date(),
                createdby: 1,
            },
        });
        headersCreated++;
        // Create reconciliation items
        for (const r of records) {
            const skuCode = r['SKU Code'];
            if (!skuCode)
                continue;
            const product_id = productMapByCode.get(skuCode.toString().trim().toUpperCase()) || null;
            if (!product_id) {
                logger_1.default.warn(`Could not resolve SKU Code: ${skuCode}. Skipping item.`);
                continue;
            }
            const expectedQty = parseFloat(r['Expected ROP']) || 0;
            const actualQty = r['Actual ROP (Clerk)'] !== null
                ? parseFloat(r['Actual ROP (Clerk)'])
                : null;
            let variance = null;
            let resAction = 'Awaiting Verification';
            if (sapCode === 'MOS100801') {
                resAction = 'Awaiting Force-Push';
            }
            else if (actualQty !== null) {
                variance = expectedQty - actualQty;
                if (Math.abs(variance) < 0.0001) {
                    variance = 0;
                    resAction = 'CLEAN';
                }
                else if (variance > 0) {
                    resAction = 'Post to Default Outlet';
                }
                else {
                    resAction = 'Adjust Unload Upward';
                }
            }
            const defaultOutletPostingQty = resAction === 'Post to Default Outlet' && variance !== null
                ? variance
                : 0;
            const unloadAdjustmentQty = resAction === 'Adjust Unload Upward' && variance !== null
                ? -variance
                : 0;
            await prisma_client_1.default.reconciliation_items.create({
                data: {
                    reconciliation_id: recon.id,
                    product_id,
                    batch_number: r['Batch Number'] ? r['Batch Number'].toString() : null,
                    expected_qty: expectedQty,
                    actual_qty: actualQty,
                    variance,
                    resolution_action: resAction,
                    default_outlet_posting_qty: defaultOutletPostingQty,
                    unload_adjustment_qty: unloadAdjustmentQty,
                    stock_key: r['Stock Key'] ? r['Stock Key'].toString() : null,
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: 1,
                },
            });
            itemsCreated++;
        }
    }
    logger_1.default.info(`Successfully seeded ${headersCreated} reconciliation headers and ${itemsCreated} items.`);
}
main()
    .catch(err => {
    logger_1.default.error('Error seeding reconciliation data:', err);
    process.exit(1);
})
    .finally(() => prisma_client_1.default.$disconnect());
//# sourceMappingURL=seed_reconciliations.js.map