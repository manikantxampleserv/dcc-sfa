"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesControlTowerController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * Controller for Sales Control Tower dashboard.
 */
exports.salesControlTowerController = {
    /**
     * Fetches dashboard data including aggregated metrics, maps, and filters.
     * Accepts query parameters for date ranges, dimensions, and comparison mode.
     * @param req - Express Request object containing query filters
     * @param res - Express Response object for sending JSON payload
     */
    async getDashboardData(req, res) {
        try {
            const { startDate, endDate, depot_id, coordinator_id, supervisor_id, route_id, salesman_id, brand_id, pack, channel, cmpMode, } = req.query;
            let prevStartDate;
            let prevEndDate;
            if (startDate && endDate) {
                const s = new Date(startDate);
                const e = new Date(endDate);
                const ps = new Date(s);
                const pe = new Date(e);
                if (cmpMode === 'spm') {
                    ps.setFullYear(ps.getFullYear() - 1);
                    pe.setFullYear(pe.getFullYear() - 1);
                }
                else {
                    const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    ps.setDate(ps.getDate() - diffDays);
                    pe.setDate(pe.getDate() - diffDays);
                }
                prevStartDate = ps.toISOString().split('T')[0];
                prevEndDate = pe.toISOString().split('T')[0];
            }
            const buildInvoiceWhere = (sd, ed) => {
                const where = { is_active: 'Y' };
                if (sd && ed) {
                    const start = new Date(sd);
                    const end = new Date(ed);
                    end.setUTCHours(23, 59, 59, 999);
                    where.invoice_date = {
                        gte: start,
                        lte: end,
                    };
                }
                if (salesman_id) {
                    const sid = parseInt(salesman_id, 10);
                    where.salesperson_id = isNaN(sid) ? undefined : sid;
                    if (isNaN(sid))
                        where.invoices_salesperson = { name: salesman_id };
                }
                const custWhere = { is_active: 'Y' };
                if (depot_id) {
                    const did = parseInt(depot_id, 10);
                    if (!isNaN(did))
                        custWhere.depot_id = did;
                    else
                        custWhere.customer_depot = { name: depot_id };
                }
                if (route_id) {
                    const rid = parseInt(route_id, 10);
                    if (!isNaN(rid))
                        custWhere.route_id = rid;
                    else
                        custWhere.customer_routes = { name: route_id };
                }
                if (channel)
                    custWhere.customer_category_customer = {
                        category_name: channel,
                    };
                if (Object.keys(custWhere).length > 1) {
                    where.invoices_customers = custWhere;
                }
                return where;
            };
            const fetchInvoices = async (sd, ed) => {
                return prisma_client_1.default.invoices.findMany({
                    where: buildInvoiceWhere(sd, ed),
                    include: {
                        invoice_items: {
                            include: {
                                invoice_items_products: {
                                    include: {
                                        product_brands: true,
                                        product_sub_categories_products: true,
                                    },
                                },
                            },
                        },
                        invoices_customers: {
                            include: {
                                customer_depot: {
                                    include: {
                                        depots_coodrinator: true,
                                        depots_supervisior: true,
                                    },
                                },
                                customer_routes: true,
                                customer_category_customer: true,
                            },
                        },
                        invoices_salesperson: true,
                    },
                    orderBy: { invoice_date: 'asc' },
                });
            };
            const buildAggMaps = (invoices) => {
                const byDepot = {};
                const byCoord = {};
                const bySup = {};
                const byRoute = {};
                const bySal = {};
                const byBrand = {};
                const byPack = {};
                const bySKU = {};
                const byCh = {};
                const byDate = {};
                const acc = (map, key, vol, val, isInvoice) => {
                    if (!key || key === 'Unknown')
                        return;
                    if (!map[key])
                        map[key] = { UC: 0, PC: 0, TV: 0, count: 0 };
                    map[key].UC += vol;
                    map[key].TV += val;
                    if (isInvoice)
                        map[key].count += 1;
                };
                let totalUC = 0;
                let totalTV = 0;
                const uniqueCustomerIds = new Set();
                let processedInvoiceCount = 0;
                const rows = [];
                for (const inv of invoices) {
                    const brandFilter = brand_id ? brand_id : null;
                    const packFilter = pack ? pack : null;
                    const validItems = inv.invoice_items.filter((item) => {
                        if (brandFilter) {
                            const bid = parseInt(brandFilter, 10);
                            if (!isNaN(bid)) {
                                if (item.invoice_items_products.brand_id !== bid)
                                    return false;
                            }
                            else {
                                if (item.invoice_items_products.product_brands?.name !==
                                    brandFilter)
                                    return false;
                            }
                        }
                        if (packFilter &&
                            item.invoice_items_products.product_sub_categories_products
                                ?.sub_category_name !== packFilter)
                            return false;
                        return true;
                    });
                    if (validItems.length === 0 && (brand_id || pack))
                        continue;
                    processedInvoiceCount++;
                    uniqueCustomerIds.add(inv.customer_id);
                    const dKey = inv.invoice_date
                        ? inv.invoice_date.toISOString().split('T')[0]
                        : 'Unknown';
                    const sName = inv.invoices_salesperson?.name || 'Unassigned';
                    const dName = inv.invoices_customers?.customer_depot?.name || 'Unassigned';
                    const rName = inv.invoices_customers?.customer_routes?.name || 'Unassigned';
                    const chName = inv.invoices_customers?.customer_category_customer?.name ||
                        'Unassigned';
                    const cName = inv.invoices_customers?.customer_depot?.depots_coodrinator?.name ||
                        'Unassigned';
                    const supName = inv.invoices_customers?.customer_depot?.depots_supervisior?.name ||
                        'Unassigned';
                    const outletCode = inv.invoices_customers?.code || 'N/A';
                    const outletName = inv.invoices_customers?.name || 'N/A';
                    let invVolume = 0;
                    let invValue = 0;
                    for (const item of validItems) {
                        const qty = item.quantity;
                        const tv = Number(item.unit_price) * qty;
                        invVolume += qty;
                        invValue += tv;
                        const bName = item.invoice_items_products.product_brands?.name || 'Unknown';
                        const pName = item.invoice_items_products.product_sub_categories_products
                            ?.sub_category_name || 'Unknown';
                        const skuName = item.invoice_items_products.name || 'Unknown';
                        acc(byBrand, bName, qty, tv, false);
                        acc(byPack, pName, qty, tv, false);
                        acc(bySKU, skuName, qty, tv, false);
                    }
                    totalUC += invVolume;
                    totalTV += invValue;
                    acc(byDate, dKey, invVolume, invValue, true);
                    acc(bySal, sName, invVolume, invValue, true);
                    acc(byDepot, dName, invVolume, invValue, true);
                    acc(byCh, chName, invVolume, invValue, true);
                    acc(byRoute, rName, invVolume, invValue, true);
                    acc(byCoord, cName, invVolume, invValue, true);
                    acc(bySup, supName, invVolume, invValue, true);
                    if (rows.length < 500) {
                        rows.push({
                            id: inv.id,
                            Date: dKey,
                            Depot: dName,
                            Coordinator: cName,
                            Supervisor: supName,
                            Route: rName,
                            Salesman: sName,
                            OutletCode: outletCode,
                            OutletName: outletName,
                            CustomerChannel: chName,
                            Brand: validItems[0]?.invoice_items_products?.product_brands?.name ||
                                'Mixed',
                            Pack: validItems[0]?.invoice_items_products
                                ?.product_sub_categories_products?.sub_category_name ||
                                'Mixed',
                            SKU: validItems[0]?.invoice_items_products?.name || 'Mixed',
                            UC: invVolume,
                            PC: invVolume,
                            TV: invValue,
                            StrikeRate: 100,
                            IsNew: false,
                        });
                    }
                }
                return {
                    byDepot,
                    byCoord,
                    bySup,
                    byRoute,
                    bySal,
                    byBrand,
                    byPack,
                    bySKU,
                    byCh,
                    byDate,
                    totalUC,
                    totalPC: totalUC,
                    totalTV,
                    newOutlets: 0,
                    avgStrike: 0,
                    rows,
                    _uniqueCustomerIds: uniqueCustomerIds,
                    _processedInvoiceCount: processedInvoiceCount,
                };
            };
            const [currentInvoices, prevInvoices] = await Promise.all([
                fetchInvoices(startDate, endDate),
                prevStartDate && prevEndDate
                    ? fetchInvoices(prevStartDate, prevEndDate)
                    : Promise.resolve([]),
            ]);
            const mayAggRaw = buildAggMaps(currentInvoices);
            const aprAggRaw = buildAggMaps(prevInvoices);
            const uniqueCustomerIds = mayAggRaw._uniqueCustomerIds;
            let strikeRate = 0;
            const visitWhere = { is_active: 'Y' };
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                visitWhere.visit_date = {
                    gte: start,
                    lte: end,
                };
            }
            if (salesman_id)
                visitWhere.user_id = parseInt(salesman_id, 10);
            const visits = await prisma_client_1.default.visits.count({ where: visitWhere });
            if (visits > 0) {
                const productiveVisits = await prisma_client_1.default.visits.count({
                    where: { ...visitWhere, status: 'productive' },
                });
                strikeRate = (productiveVisits / visits) * 100;
            }
            const [depotsList, salespersonsList, routesList, brandsList, packsList, channelsList,] = await Promise.all([
                prisma_client_1.default.depots.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                }),
                prisma_client_1.default.users.findMany({
                    where: {
                        is_active: 'Y',
                        OR: [
                            { invoices: { some: {} } },
                            { route_salespersons: { some: {} } },
                        ],
                    },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                }),
                prisma_client_1.default.routes.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                }),
                prisma_client_1.default.brands.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                }),
                prisma_client_1.default.product_sub_categories.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, sub_category_name: true },
                    orderBy: { sub_category_name: 'asc' },
                }),
                prisma_client_1.default.customer_category.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, category_name: true },
                    orderBy: { category_name: 'asc' },
                }),
            ]);
            const mapCustomers = await prisma_client_1.default.customers.findMany({
                where: {
                    id: { in: Array.from(uniqueCustomerIds) },
                    latitude: { not: null },
                    longitude: { not: null },
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    latitude: true,
                    longitude: true,
                },
                take: 500,
            });
            const { _uniqueCustomerIds: _m, _processedInvoiceCount: _mp, ...mayAgg } = mayAggRaw;
            const { _uniqueCustomerIds: _a, _processedInvoiceCount: _ap, ...aprAgg } = aprAggRaw;
            mayAgg.avgStrike = Number(strikeRate.toFixed(1));
            return res.status(200).json({
                success: true,
                data: {
                    mayAgg,
                    aprAgg,
                    mapData: mapCustomers,
                    filters: {
                        depots: depotsList,
                        salespersons: salespersonsList,
                        routes: routesList,
                        brands: brandsList,
                        packs: packsList.map(p => ({
                            id: p.id,
                            name: p.sub_category_name,
                        })),
                        channels: channelsList.map((c) => ({
                            id: c.id,
                            name: c.category_name,
                        })),
                    },
                },
            });
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: String(error),
            });
        }
    },
};
//# sourceMappingURL=salesControlTower.controller.js.map