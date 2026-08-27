"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salespersonStockController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const inventory_utils_1 = require("../utils/inventory.utils");
const permissions_config_1 = require("../../configs/permissions.config");
/**
 * Salesperson Stock Controller
 *
 * This controller replaces the old getSalespersonInventory method in
 * vanInventory.controller.ts with one that reads from inventory_stock —
 * the single source of truth for current hand stock quantities.
 *
 * Flow:
 *  1. Find the salesperson's van location_id(s) from van_inventory (is_active='Y')
 *  2. Query inventory_stock for those location IDs
 *  3. Group by product_id, sum current_stock
 *  4. Attach batch & serial info
 *  5. Return response matching SingleSalespersonResponse / AllSalespersonsResponse shape
 */
exports.salespersonStockController = {
    async getSalespersonInventory(req, res) {
        try {
            const { salesperson_id } = req.params;
            const { page, limit, product_id, batch_status, serial_status, depot_id } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 50;
            if (!salesperson_id ||
                salesperson_id === '' ||
                salesperson_id === 'all') {
                return await handleAllSalespersons(req, res, pageNum, limitNum);
            }
            const salespersonIdNum = parseInt(salesperson_id, 10);
            if (isNaN(salespersonIdNum)) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid salesperson_id' });
            }
            const user = req.user;
            let isScopeRestricted = false;
            let depotIds = [];
            if (user && !(0, permissions_config_1.isAdminRole)(user.role)) {
                isScopeRestricted = true;
                const userDepots = await prisma_client_1.default.user_depots.findMany({
                    where: { user_id: user.id },
                    select: { depot_id: true },
                });
                depotIds = userDepots
                    .map((ud) => ud.depot_id)
                    .filter((id) => id !== null);
            }
            const spWhere = { id: salespersonIdNum };
            if (isScopeRestricted && user.id !== salespersonIdNum) {
                if (depotIds.length > 0) {
                    spWhere.users_depots_users = {
                        some: {
                            depot_id: { in: depotIds },
                        },
                    };
                }
                else {
                    spWhere.id = -1;
                }
            }
            const salesperson = await prisma_client_1.default.users.findFirst({
                where: spWhere,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    profile_image: true,
                    address: true,
                    employee_id: true,
                    sap_code: true,
                    user_role: { select: { name: true } },
                    sub_inventory_users: {
                        where: { is_active: 'Y' },
                        select: { name: true },
                    },
                },
            });
            if (!salesperson) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Salesperson not found' });
            }
            const targetSalespersonIds = await (0, inventory_utils_1.getContainerOwnerAndSelf)(prisma_client_1.default, salespersonIdNum);
            const totalVanInventories = await prisma_client_1.default.van_inventory.count({
                where: {
                    user_id: { in: targetSalespersonIds },
                    is_active: 'Y',
                },
            });
            let parsedDepotId = null;
            if (depot_id) {
                parsedDepotId = parseInt(depot_id, 10);
            }
            const stockWhere = {
                AND: [
                    {
                        OR: [{ salesperson_id: { in: targetSalespersonIds } }],
                    },
                    {
                        OR: [{ is_unloadAll: 'N' }, { is_unloadAll: null }],
                    },
                ],
                is_active: 'Y',
            };
            if (parsedDepotId) {
                stockWhere.location_id = parsedDepotId;
            }
            if (product_id) {
                stockWhere.product_id = parseInt(product_id, 10);
            }
            const stockRecords = await prisma_client_1.default.inventory_stock.findMany({
                where: stockWhere,
                include: {
                    inventory_stock_products: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            base_price: true,
                            tracking_type: true,
                            product_unit_of_measurement: {
                                select: { id: true, name: true, conversion_rate: true },
                            },
                            product_tax_master: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    tax_rate: true,
                                    description: true,
                                },
                            },
                            serial_numbers_products: {
                                where: {
                                    is_active: 'Y',
                                    ...(serial_status ? { status: serial_status } : {}),
                                },
                                select: {
                                    id: true,
                                    serial_number: true,
                                    status: true,
                                    warranty_expiry: true,
                                    batch_id: true,
                                    customer_id: true,
                                    sold_date: true,
                                    batch_lots: {
                                        select: {
                                            id: true,
                                            batch_number: true,
                                            lot_number: true,
                                            expiry_date: true,
                                        },
                                    },
                                    serial_numbers_customers: {
                                        select: { id: true, name: true, code: true },
                                    },
                                },
                            },
                        },
                    },
                    inventory_stock_batch: {
                        select: {
                            id: true,
                            batch_number: true,
                            lot_number: true,
                            manufacturing_date: true,
                            expiry_date: true,
                            supplier_name: true,
                            quality_grade: true,
                            quantity: true,
                            remaining_quantity: true,
                        },
                    },
                    inventory_stock_serial: {
                        select: {
                            id: true,
                            serial_number: true,
                            status: true,
                            warranty_expiry: true,
                            batch_id: true,
                            customer_id: true,
                            sold_date: true,
                            serial_numbers_customers: {
                                select: { id: true, name: true, code: true },
                            },
                            batch_lots: {
                                select: {
                                    id: true,
                                    batch_number: true,
                                    lot_number: true,
                                    expiry_date: true,
                                },
                            },
                        },
                    },
                },
            });
            const productsMap = new Map();
            for (const stock of stockRecords) {
                const productId = stock.product_id;
                const product = stock.inventory_stock_products;
                const batch = stock.inventory_stock_batch;
                const serial = stock.inventory_stock_serial;
                if (!productsMap.has(productId)) {
                    productsMap.set(productId, {
                        product_id: productId,
                        product_name: product?.name || null,
                        product_code: product?.code || null,
                        tracking_type: product?.tracking_type || 'none',
                        unit_price: product?.base_price ? Number(product.base_price) : null,
                        product_unit_of_measurement: product?.product_unit_of_measurement || null,
                        unit_of_measurment: product?.product_unit_of_measurement || null,
                        tax_details: product?.product_tax_master
                            ? {
                                id: product.product_tax_master.id,
                                name: product.product_tax_master.name,
                                code: product.product_tax_master.code,
                                tax_rate: Number(product.product_tax_master.tax_rate),
                                description: product.product_tax_master.description,
                            }
                            : null,
                        quantity: 0,
                        total_quantity: 0,
                        total_remaining_quantity: 0,
                        total_base_quantity: 0,
                        total_remaining_base_quantity: 0,
                        batches: [],
                        serials: [],
                        van_inventories: [],
                    });
                }
                const productData = productsMap.get(productId);
                const qty = Number(stock.current_stock) || 0;
                const baseQty = Number(stock.base_quantity) || 0;
                productData.quantity += qty;
                productData.total_quantity += qty;
                productData.total_remaining_quantity += qty;
                productData.total_base_quantity += baseQty;
                productData.total_remaining_base_quantity += baseQty;
                if (batch) {
                    const batchStatusValue = getBatchStatus(batch.expiry_date);
                    if (batch_status) {
                        if (batch_status === 'active' && batchStatusValue !== 'active') {
                        }
                        else if (batch_status === 'expiring_soon' &&
                            batchStatusValue !== 'expiring_soon') {
                        }
                        else if (batch_status === 'expired' &&
                            batchStatusValue !== 'expired') {
                        }
                        else {
                            upsertBatch(productData.batches, {
                                batch_lot_id: batch.id,
                                batch_number: batch.batch_number,
                                lot_number: batch.lot_number,
                                manufacturing_date: batch.manufacturing_date,
                                expiry_date: batch.expiry_date,
                                supplier_name: batch.supplier_name,
                                quality_grade: batch.quality_grade,
                                total_quantity: Number(batch.quantity) || 0,
                                remaining_quantity: qty,
                                base_quantity: stock.base_quantity,
                                is_expired: batchStatusValue === 'expired',
                                is_expiring_soon: batchStatusValue === 'expiring_soon',
                                days_until_expiry: daysUntilExpiry(batch.expiry_date),
                                status: batchStatusValue,
                            });
                        }
                    }
                    else {
                        upsertBatch(productData.batches, {
                            batch_lot_id: batch.id,
                            batch_number: batch.batch_number,
                            lot_number: batch.lot_number,
                            manufacturing_date: batch.manufacturing_date,
                            expiry_date: batch.expiry_date,
                            supplier_name: batch.supplier_name,
                            quality_grade: batch.quality_grade,
                            total_quantity: Number(batch.quantity) || 0,
                            remaining_quantity: qty,
                            base_quantity: stock.base_quantity || 0,
                            is_expired: batchStatusValue === 'expired',
                            is_expiring_soon: batchStatusValue === 'expiring_soon',
                            days_until_expiry: daysUntilExpiry(batch.expiry_date),
                            status: batchStatusValue,
                        });
                    }
                }
                if (serial) {
                    upsertSerial(productData.serials, {
                        serial_id: serial.id,
                        serial_number: serial.serial_number,
                        status: serial.status,
                        warranty_expiry: serial.warranty_expiry,
                        warranty_expired: serial.warranty_expiry
                            ? new Date(serial.warranty_expiry) <= new Date()
                            : false,
                        warranty_days_remaining: serial.warranty_expiry
                            ? Math.floor((new Date(serial.warranty_expiry).getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24))
                            : null,
                        batch_id: serial.batch_id,
                        batch: serial.batch_lots,
                        customer_id: serial.customer_id,
                        customer: serial.serial_numbers_customers,
                        sold_date: serial.sold_date,
                    });
                }
                if (product?.serial_numbers_products?.length) {
                    for (const sn of product.serial_numbers_products) {
                        upsertSerial(productData.serials, {
                            serial_id: sn.id,
                            serial_number: sn.serial_number,
                            status: sn.status,
                            warranty_expiry: sn.warranty_expiry,
                            warranty_expired: sn.warranty_expiry
                                ? new Date(sn.warranty_expiry) <= new Date()
                                : false,
                            warranty_days_remaining: sn.warranty_expiry
                                ? Math.floor((new Date(sn.warranty_expiry).getTime() - Date.now()) /
                                    (1000 * 60 * 60 * 24))
                                : null,
                            batch_id: sn.batch_id,
                            batch: sn.batch_lots,
                            customer_id: sn.customer_id,
                            customer: sn.serial_numbers_customers,
                            sold_date: sn.sold_date,
                        });
                    }
                }
            }
            const products = Array.from(productsMap.values())
                .map(p => {
                p.batches = p.batches.filter((b) => (Number(b.remaining_quantity) || 0) > 0 ||
                    (Number(b.base_quantity) || 0) > 0);
                return p;
            })
                .filter(p => (Number(p.total_remaining_quantity) || 0) > 0 ||
                (Number(p.total_remaining_base_quantity) || 0) > 0);
            let totalBatches = 0;
            let totalSerials = 0;
            let totalRemainingQty = 0;
            let totalRemainingBaseQty = 0;
            products.forEach(p => {
                totalBatches += p.batches.length;
                totalSerials += p.serials.length;
                totalRemainingQty += p.total_remaining_quantity;
                totalRemainingBaseQty += p.total_remaining_base_quantity;
            });
            const startIndex = (pageNum - 1) * limitNum;
            const paginatedProducts = products.slice(startIndex, startIndex + limitNum);
            return res.json({
                success: true,
                message: 'Salesperson inventory retrieved successfully',
                data: {
                    salesperson_id: salesperson.id,
                    salesperson_name: salesperson.name,
                    salesperson_role: salesperson.user_role?.name || 'Unknown',
                    salesperson_email: salesperson.email,
                    salesperson_phone: salesperson.phone_number,
                    salesperson_profile_image: salesperson.profile_image,
                    salesperson_address: salesperson.address,
                    salesperson_employee_id: salesperson.employee_id || null,
                    salesperson_sap_code: salesperson.sap_code || null,
                    helpers: salesperson.sub_inventory_users
                        ?.map((u) => u.name)
                        .join(', ') || null,
                    combined_salesperson_ids: targetSalespersonIds,
                    total_van_inventories: totalVanInventories,
                    total_products: products.length,
                    total_quantity: totalRemainingQty,
                    total_remaining_quantity: totalRemainingQty,
                    total_base_quantity: totalRemainingBaseQty,
                    total_remaining_base_quantity: totalRemainingBaseQty,
                    total_batches: totalBatches,
                    total_serials: totalSerials,
                    products: paginatedProducts,
                },
                filters: {
                    product_id: product_id || null,
                    batch_status: batch_status || null,
                    serial_status: serial_status || null,
                },
                pagination: buildPagination(pageNum, limitNum, products.length),
            });
        }
        catch (error) {
            console.error('salespersonStockController.getSalespersonInventory error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve salesperson inventory',
                error: error.message,
            });
        }
    },
    async getSalespersonSummary(req, res) {
        try {
            const { salesperson_id } = req.params;
            const { time_filter, start_date, end_date } = req.query;
            const salespersonIdNum = parseInt(salesperson_id, 10);
            if (isNaN(salespersonIdNum)) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid salesperson_id' });
            }
            const targetSalespersonIds = await (0, inventory_utils_1.getContainerOwnerAndSelf)(prisma_client_1.default, salespersonIdNum);
            /** Build date filter */
            let dateFilterForVan = undefined;
            let dateFilterForInvoice = undefined;
            if (time_filter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dateFilterForVan = { gte: today };
                dateFilterForInvoice = { gte: today };
            }
            else if (time_filter === 'this_week') {
                const today = new Date();
                const first = today.getDate() - today.getDay();
                const firstDay = new Date(today.setDate(first));
                firstDay.setHours(0, 0, 0, 0);
                dateFilterForVan = { gte: firstDay };
                dateFilterForInvoice = { gte: firstDay };
            }
            else if (time_filter === 'this_month') {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                dateFilterForVan = { gte: firstDay };
                dateFilterForInvoice = { gte: firstDay };
            }
            else if (time_filter === 'custom' && start_date && end_date) {
                dateFilterForVan = {
                    gte: new Date(start_date),
                    lte: new Date(`${end_date}T23:59:59.999Z`),
                };
                dateFilterForInvoice = {
                    gte: new Date(start_date),
                    lte: new Date(`${end_date}T23:59:59.999Z`),
                };
            }
            const vanWhere = {
                user_id: { in: targetSalespersonIds },
                approval_status: 'A',
                is_cancelled: 'N',
            };
            if (dateFilterForVan) {
                /** usually document_date or createdate, we can check document_date primarily, fallback createdate
                 * to simplify, check document_date */
                vanWhere.document_date = dateFilterForVan;
            }
            const vanInventories = await prisma_client_1.default.van_inventory.findMany({
                where: vanWhere,
                include: { van_inventory_items_inventory: true },
            });
            const invoiceWhere = {
                OR: [
                    { salesperson_id: { in: targetSalespersonIds } },
                    { createdby: { in: targetSalespersonIds } },
                ],
            };
            if (dateFilterForInvoice) {
                invoiceWhere.invoice_date = dateFilterForInvoice;
            }
            const invoices = await prisma_client_1.default.invoices.findMany({
                where: invoiceWhere,
                include: { invoice_items: true },
            });
            let loadCount = 0;
            let totalQtyLoaded = 0;
            let totalBaseQtyLoaded = 0;
            let unloadCount = 0;
            let totalQtyUnloaded = 0;
            let totalBaseQtyUnloaded = 0;
            for (const v of vanInventories) {
                if (v.loading_type === 'L') {
                    loadCount++;
                    if (v.van_inventory_items_inventory) {
                        for (const item of v.van_inventory_items_inventory) {
                            totalQtyLoaded += Number(item.quantity) || 0;
                            totalBaseQtyLoaded += Number(item.base_quantity) || 0;
                        }
                    }
                }
                else if (v.loading_type === 'U') {
                    unloadCount++;
                    if (v.van_inventory_items_inventory) {
                        for (const item of v.van_inventory_items_inventory) {
                            totalQtyUnloaded += Number(item.quantity) || 0;
                            totalBaseQtyUnloaded += Number(item.base_quantity) || 0;
                        }
                    }
                }
            }
            let totalRevenue = 0;
            let totalQtySold = 0;
            let totalBaseQtySold = 0;
            const uniqueCustomers = new Set();
            for (const inv of invoices) {
                totalRevenue += Number(inv.total_amount) || 0;
                if (inv.customer_id)
                    uniqueCustomers.add(inv.customer_id);
                if (inv.invoice_items) {
                    for (const item of inv.invoice_items) {
                        totalQtySold += Number(item.quantity) || 0;
                        totalBaseQtySold += Number(item.base_quantity) || 0;
                    }
                }
            }
            return res.json({
                success: true,
                data: {
                    loadCount,
                    totalQtyLoaded,
                    totalBaseQtyLoaded,
                    unloadCount,
                    totalQtyUnloaded,
                    totalBaseQtyUnloaded,
                    totalRevenue,
                    totalQtySold,
                    totalBaseQtySold,
                    totalInvoicesCount: invoices.length,
                    uniqueCustomersCount: uniqueCustomers.size,
                    averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
                },
            });
        }
        catch (error) {
            console.error('getSalespersonSummary error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve salesperson summary',
                error: error.message,
            });
        }
    },
};
async function handleAllSalespersons(req, res, pageNum, limitNum) {
    const { product_id, batch_status, serial_status, depot_id, supervisor_id } = req.query;
    const usersWhere = {
        AND: [
            {
                OR: [
                    {
                        user_role: {
                            OR: [
                                { name: { contains: 'Salesman' } },
                                { name: { contains: 'salesman' } },
                                { name: { contains: 'Sales Person' } },
                                { name: { contains: 'sales person' } },
                                { name: { contains: 'Sales Man' } },
                                { name: { contains: 'sales man' } },
                                { name: { contains: 'Group' } },
                                { name: { contains: 'group' } },
                            ],
                        },
                    },
                    {
                        van_inventory_users: {
                            some: { is_active: 'Y' },
                        },
                    },
                ],
            },
            { sub_inventory_parent_id: null },
        ],
    };
    if (supervisor_id) {
        usersWhere.reporting_to = parseInt(supervisor_id, 10);
    }
    const user = req.user;
    let isScopeRestricted = false;
    let depotIds = [];
    if (user && !(0, permissions_config_1.isAdminRole)(user.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma_client_1.default.user_depots.findMany({
            where: { user_id: user.id },
            select: { depot_id: true },
        });
        depotIds = userDepots
            .map((ud) => ud.depot_id)
            .filter((id) => id !== null);
    }
    if (isScopeRestricted) {
        if (depotIds.length > 0) {
            usersWhere.AND.push({
                users_depots_users: {
                    some: {
                        depot_id: { in: depotIds },
                    },
                },
            });
        }
        else {
            usersWhere.AND.push({ id: -1 });
        }
    }
    const allSalespersons = await prisma_client_1.default.users.findMany({
        where: usersWhere,
        select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            profile_image: true,
            address: true,
            sap_code: true,
            user_role: { select: { name: true } },
            sub_inventory_users: {
                where: { is_active: 'Y' },
                select: { name: true },
            },
        },
    });
    const consolidated = [];
    let overallTotalQty = 0;
    let overallProducts = new Set();
    let overallVanInventories = 0;
    let overallBatches = 0;
    let overallSerials = 0;
    let parsedDepotId = null;
    if (depot_id) {
        parsedDepotId = parseInt(depot_id, 10);
    }
    const allSalespersonIds = allSalespersons.map(sp => sp.id);
    /** Bulk fetch van inventory counts */
    const vanInventoriesCounts = await prisma_client_1.default.van_inventory.groupBy({
        by: ['user_id'],
        where: { user_id: { in: allSalespersonIds }, is_active: 'Y' },
        _count: { id: true },
    });
    const vanInventoryCountMap = new Map(vanInventoriesCounts.map((item) => [item.user_id, item._count.id]));
    /** Bulk fetch stock records */
    const stockWhere = {
        AND: [
            { salesperson_id: { in: allSalespersonIds } },
            { OR: [{ is_unloadAll: 'N' }, { is_unloadAll: null }] },
        ],
        is_active: 'Y',
    };
    if (parsedDepotId)
        stockWhere.location_id = parsedDepotId;
    if (product_id)
        stockWhere.product_id = parseInt(product_id, 10);
    const stockRecordsAll = await prisma_client_1.default.inventory_stock.findMany({
        where: stockWhere,
        select: {
            salesperson_id: true,
            product_id: true,
            current_stock: true,
            base_quantity: true,
            batch_id: true,
            serial_number_id: true,
        },
    });
    /** Group stock records by salesperson */
    const stockBySalesperson = new Map();
    for (const s of stockRecordsAll) {
        if (s.salesperson_id) {
            if (!stockBySalesperson.has(s.salesperson_id)) {
                stockBySalesperson.set(s.salesperson_id, []);
            }
            stockBySalesperson.get(s.salesperson_id).push(s);
        }
    }
    /** Bulk fetch today's invoices count */
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayInvoicesCounts = await prisma_client_1.default.invoices.groupBy({
        by: ['salesperson_id'],
        where: {
            salesperson_id: { in: allSalespersonIds },
            invoice_date: { gte: todayDate },
            is_active: 'Y',
        },
        _count: { id: true },
    });
    const todayInvoicesCountMap = new Map(todayInvoicesCounts.map((item) => [
        item.salesperson_id,
        item._count.id,
    ]));
    for (const sp of allSalespersons) {
        const vanInventoriesCount = vanInventoryCountMap.get(sp.id) || 0;
        const stockRecords = stockBySalesperson.get(sp.id) || [];
        if (stockRecords.length === 0)
            continue;
        const productStockMap = new Map();
        const productBaseStockMap = new Map();
        const batchIds = new Set();
        const serialIds = new Set();
        for (const s of stockRecords) {
            const qty = Number(s.current_stock) || 0;
            const baseQty = Number(s.base_quantity) || 0;
            if (qty <= 0 && baseQty <= 0)
                continue;
            productStockMap.set(s.product_id, (productStockMap.get(s.product_id) || 0) + qty);
            productBaseStockMap.set(s.product_id, (productBaseStockMap.get(s.product_id) || 0) + baseQty);
            if (s.batch_id)
                batchIds.add(s.batch_id);
            if (s.serial_number_id)
                serialIds.add(s.serial_number_id);
        }
        const totalQty = Array.from(productStockMap.values()).reduce((a, b) => a + b, 0);
        const totalBaseQty = Array.from(productBaseStockMap.values()).reduce((a, b) => a + b, 0);
        if (totalQty === 0 && totalBaseQty === 0)
            continue;
        const todayInvoicesCount = todayInvoicesCountMap.get(sp.id) || 0;
        productStockMap.forEach((_, pid) => overallProducts.add(pid));
        overallTotalQty += totalQty;
        overallVanInventories += vanInventoriesCount;
        overallBatches += batchIds.size;
        overallSerials += serialIds.size;
        consolidated.push({
            salesperson_id: sp.id,
            salesperson_name: sp.name,
            salesperson_email: sp.email,
            salesperson_phone: sp.phone_number,
            salesperson_profile_image: sp.profile_image,
            salesperson_sap_code: sp.sap_code || null,
            salesperson_address: sp.address,
            helpers: sp.sub_inventory_users?.map((u) => u.name).join(', ') || null,
            total_van_inventories: vanInventoriesCount,
            today_invoices: todayInvoicesCount,
            total_products: productStockMap.size,
            total_quantity: totalQty,
            total_base_quantity: totalBaseQty,
            total_remaining_quantity: totalQty,
            total_batches: batchIds.size,
            total_serials: serialIds.size,
        });
    }
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedData = consolidated.slice(startIndex, startIndex + limitNum);
    return res.json({
        success: true,
        message: 'All salesperson inventory data retrieved successfully',
        data: paginatedData,
        filters: {
            product_id: product_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
        },
        statistics: {
            total_salespersons: consolidated.length,
            total_van_inventories: overallVanInventories,
            total_unique_products: overallProducts.size,
            total_quantity: overallTotalQty,
            total_remaining_quantity: overallTotalQty,
            total_batches: overallBatches,
            total_serials: overallSerials,
        },
        pagination: buildPagination(pageNum, limitNum, consolidated.length),
    });
}
function buildPagination(page, limit, total) {
    return {
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit) || 0,
        total_count: total,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
    };
}
function getBatchStatus(expiryDate) {
    if (!expiryDate)
        return 'active';
    const nowStr = new Date().toISOString().split('T')[0];
    const now = new Date(`${nowStr}T00:00:00.000Z`);
    const expiryStr = new Date(expiryDate).toISOString().split('T')[0];
    const expiry = new Date(`${expiryStr}T00:00:00.000Z`);
    if (expiry.getTime() < now.getTime())
        return 'expired';
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30)
        return 'expiring_soon';
    return 'active';
}
function daysUntilExpiry(expiryDate) {
    if (!expiryDate)
        return 0;
    const nowStr = new Date().toISOString().split('T')[0];
    const now = new Date(`${nowStr}T00:00:00.000Z`);
    const expiryStr = new Date(expiryDate).toISOString().split('T')[0];
    const expiry = new Date(`${expiryStr}T00:00:00.000Z`);
    return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
function upsertBatch(batches, batchInfo) {
    const existing = batches.find(b => b.batch_lot_id === batchInfo.batch_lot_id);
    if (existing) {
        existing.remaining_quantity += batchInfo.remaining_quantity;
    }
    else {
        batches.push(batchInfo);
    }
}
function upsertSerial(serials, serialInfo) {
    if (!serials.find(s => s.serial_id === serialInfo.serial_id)) {
        serials.push(serialInfo);
    }
}
//# sourceMappingURL=salespersonStock.controller.js.map