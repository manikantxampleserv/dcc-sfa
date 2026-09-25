"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coolerTrackingDashboardController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * @function daysBetween
 * Full days between two dates (a - b).
 */
function daysBetween(a, b) {
    return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}
/**
 * @function scanBucket
 * Classify days-since-last-scan into an ageing bucket label.
 */
function scanBucket(days) {
    if (days === null)
        return 'Never scanned';
    if (days <= 30)
        return '0-30 days';
    if (days <= 60)
        return '31-60 days';
    if (days <= 90)
        return '61-90 days';
    if (days <= 180)
        return '90-180 days';
    return 'Over 180 days';
}
/**
 * @function installDelayBucket
 * Bucket for newly-installed coolers that have never been scanned.
 */
function installDelayBucket(daysSinceInstall) {
    if (daysSinceInstall <= 30)
        return '0-30 days';
    if (daysSinceInstall <= 60)
        return '31-60 days';
    if (daysSinceInstall <= 90)
        return '61-90 days';
    return 'Over 90 days';
}
/**
 * @function verifyBucket
 * Classify days-since-physical-verification for depot stock.
 */
function verifyBucket(verifiedDate, today) {
    if (!verifiedDate)
        return 'Not physically verified';
    const d = daysBetween(today, verifiedDate);
    if (d <= 7)
        return '0-7 days';
    if (d <= 15)
        return '8-15 days';
    if (d <= 30)
        return '15-30 days';
    return 'Over 30 days';
}
exports.coolerTrackingDashboardController = {
    /**
     * @route GET /api/v1/reports/cooler-tracking-dashboard
     * @description Aggregated payload for the Cooler Tracking Dashboard.
     *
     * Design: ALL queries avoid IN/NOT IN with large arrays to stay under SQL
     * Server's 2100-parameter cap. Joins are done in memory using Maps.
     */
    async getDashboardData(_req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const coolerRows = await prisma_client_1.default.coolers.findMany({
                where: { approval_status: 'A', is_active: 'Y' },
                select: {
                    id: true,
                    customer_id: true,
                    asset_master_id: true,
                    cooler_sub_type_id: true,
                    brand: true,
                    model: true,
                    serial_number: true,
                    status: true,
                    install_date: true,
                    last_scanned_date: true,
                },
            });
            if (!coolerRows.length) {
                const emptyDate = today.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                });
                return res.json({
                    success: true,
                    data: {
                        outletMeta: {
                            reportDate: emptyDate,
                            total: 0,
                            zones: [],
                            routes: [],
                            supervisors: [],
                            depots: [],
                            categories: [],
                            custTypes: [],
                            channels: [],
                            brands: [],
                            staleCount: 0,
                            installTrend: [],
                            scanTrend: [],
                            supervisorZones: {},
                            zoneRoutes: {},
                        },
                        outletRecords: [],
                        denomMeta: {},
                        masterMeta: { depots: [], zones: [], zoneRoutes: {} },
                        masterRecords: [],
                        depotMeta: { total: 0, zones: [], brands: [] },
                        depotRecords: [],
                    },
                });
            }
            const latestInspectionsRaw = await prisma_client_1.default.$queryRaw `
        SELECT ci.cooler_id, ci.inspection_date, ci.is_working
        FROM cooler_inspections ci
        INNER JOIN (
          SELECT cooler_id, MAX(inspection_date) AS max_date
          FROM cooler_inspections
          GROUP BY cooler_id
        ) latest
          ON ci.cooler_id = latest.cooler_id
         AND ci.inspection_date = latest.max_date
      `;
            /** Map: cooler_id → latest inspection row */
            const latestInspectionMap = new Map();
            for (const ins of latestInspectionsRaw) {
                const coolerId = Number(ins.cooler_id);
                if (!latestInspectionMap.has(coolerId)) {
                    latestInspectionMap.set(coolerId, ins);
                }
            }
            const assetMasterRows = await prisma_client_1.default.asset_master.findMany({
                where: {
                    asset_master_asset_types: { name: 'Cooler' },
                    is_active: 'Y',
                },
                select: {
                    id: true,
                    barcode: true,
                    serial_number: true,
                    depot_id: true,
                    last_scanned_date: true,
                    current_status: true,
                    asset_master_brands: { select: { name: true } },
                    asset_master_asset_sub_types: { select: { name: true } },
                    asset_master_depot: { select: { name: true } },
                },
            });
            const assetMasterMap = new Map(assetMasterRows.map((a) => [a.id, a]));
            const subTypeRows = await prisma_client_1.default.cooler_sub_types.findMany({
                select: { id: true, name: true },
            });
            const subTypeMap = new Map(subTypeRows.map((s) => [s.id, s.name]));
            const allCustomerRows = await prisma_client_1.default.customers.findMany({
                where: { is_active: 'Y' },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    customer_depot: { select: { name: true } },
                    customer_category_customer: { select: { category_name: true } },
                    customer_type_customer: { select: { type_name: true } },
                    customer_channel_customer: { select: { channel_name: true } },
                    customer_routes: {
                        select: {
                            code: true,
                            name: true,
                            route_zones: {
                                select: {
                                    name: true,
                                    zone_supervisor: { select: { name: true } },
                                    zone_depots: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            });
            /** Map: customer_id → customer row */
            const customerMap = new Map(allCustomerRows.map((c) => [c.id, c]));
            const outletRecords = [];
            const zoneSet = new Set();
            const routeSet = new Set();
            const supervisorSet = new Set();
            const depotSet = new Set();
            const categorySet = new Set();
            const custTypeSet = new Set();
            const channelSet = new Set();
            const brandSet = new Set();
            const supervisorZonesMap = {};
            const zoneRoutesMap = {};
            const installTrendMap = {};
            let staleCount = 0;
            for (const c of coolerRows) {
                const customer = customerMap.get(c.customer_id);
                if (!customer)
                    continue;
                const route = customer.customer_routes;
                const zone = route?.route_zones;
                const category = customer.customer_category_customer?.category_name || 'General';
                const custType = customer.customer_type_customer?.type_name || 'Standard';
                const channel = customer.customer_channel_customer?.channel_name || null;
                const zoneName = zone?.name || 'Unassigned';
                const routeCode = route?.code || 'Unassigned';
                const routeName = route?.name || 'Unassigned';
                const supervisorName = zone?.zone_supervisor?.name || 'Unassigned';
                const depotName = zone?.zone_depots?.name ||
                    customer.customer_depot?.name ||
                    'Unassigned';
                const assetMaster = c.asset_master_id
                    ? assetMasterMap.get(c.asset_master_id)
                    : null;
                const brand = assetMaster?.asset_master_brands?.name || c.brand || 'Generic';
                const subtype = (c.cooler_sub_type_id
                    ? subTypeMap.get(c.cooler_sub_type_id)
                    : null) ||
                    assetMaster?.asset_master_asset_sub_types?.name ||
                    c.model ||
                    'Standard';
                const serial = assetMaster?.serial_number || c.serial_number || c.code || '—';
                const barcode = assetMaster?.barcode || c.code || '—';
                const outletName = customer.name || 'Unknown Outlet';
                const customerCode = customer.code || '—';
                if (zoneName)
                    zoneSet.add(zoneName);
                if (routeCode)
                    routeSet.add(routeCode);
                if (supervisorName)
                    supervisorSet.add(supervisorName);
                if (depotName)
                    depotSet.add(depotName);
                if (category)
                    categorySet.add(category);
                if (custType)
                    custTypeSet.add(custType);
                if (channel)
                    channelSet.add(channel);
                if (brand)
                    brandSet.add(brand);
                if (supervisorName && zoneName) {
                    (supervisorZonesMap[supervisorName] ||= new Set()).add(zoneName);
                }
                if (zoneName && routeCode) {
                    (zoneRoutesMap[zoneName] ||= new Set()).add(routeCode);
                }
                const latestInsp = latestInspectionMap.get(c.id) ?? null;
                const lastScanDate = latestInsp?.inspection_date
                    ? new Date(latestInsp.inspection_date)
                    : c.last_scanned_date
                        ? new Date(c.last_scanned_date)
                        : null;
                const days = lastScanDate
                    ? daysBetween(today, lastScanDate)
                    : null;
                const bucket = scanBucket(days);
                const danger = days !== null && days > 90;
                const lost = days !== null && days > 180;
                const stale = lastScanDate ? lastScanDate.getFullYear() < 2020 : false;
                if (stale)
                    staleCount++;
                const inspWorking = latestInsp?.is_working
                    ? String(latestInsp.is_working).trim().toUpperCase()
                    : null;
                const coolerStatusStr = String(c.status || '')
                    .toLowerCase()
                    .trim();
                const assetStatusStr = String(assetMaster?.current_status || '')
                    .toLowerCase()
                    .trim();
                const isNotWorking = inspWorking === 'N' ||
                    inspWorking === 'NO' ||
                    inspWorking === '0' ||
                    coolerStatusStr === 'removed' ||
                    coolerStatusStr === 'not_working' ||
                    coolerStatusStr === 'not working' ||
                    coolerStatusStr === 'broken' ||
                    coolerStatusStr === 'damaged' ||
                    coolerStatusStr === 'maintenance' ||
                    coolerStatusStr === 'faulty' ||
                    assetStatusStr === 'maintenance' ||
                    assetStatusStr === 'damaged' ||
                    assetStatusStr === 'broken' ||
                    assetStatusStr === 'faulty';
                const status = isNotWorking ? 'Not Working' : 'Working';
                const installDate = c.install_date
                    ? new Date(c.install_date)
                    : null;
                const installDateStr = installDate
                    ? installDate.toISOString().slice(0, 10)
                    : null;
                const daysSinceInstall = installDate
                    ? daysBetween(today, installDate)
                    : null;
                if (installDateStr) {
                    installTrendMap[installDateStr] =
                        (installTrendMap[installDateStr] ?? 0) + 1;
                }
                const lastScanFormatted = lastScanDate
                    ? lastScanDate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    })
                    : null;
                outletRecords.push({
                    zone: zoneName,
                    route: routeCode,
                    routeName: routeName,
                    supervisor: supervisorName,
                    depot: depotName,
                    category,
                    custType,
                    channel,
                    code: customerCode,
                    outlet: outletName,
                    barcode,
                    serial,
                    brand,
                    subtype,
                    status,
                    lastScan: lastScanFormatted,
                    lastScanDate: lastScanDate
                        ? lastScanDate.toISOString().slice(0, 10)
                        : null,
                    days,
                    bucket,
                    danger,
                    lost,
                    stale,
                    installDate: installDateStr,
                    daysSinceInstall,
                    installDelayBucket: days === null && daysSinceInstall !== null
                        ? installDelayBucket(daysSinceInstall)
                        : null,
                });
            }
            const installTrendArr = [];
            for (let i = 89; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const ds = d.toISOString().slice(0, 10);
                installTrendArr.push({ date: ds, count: installTrendMap[ds] ?? 0 });
            }
            const scanTrendMap = {};
            for (const ins of latestInspectionsRaw) {
                if (ins.inspection_date) {
                    const d = new Date(ins.inspection_date).toISOString().slice(0, 10);
                    scanTrendMap[d] = (scanTrendMap[d] ?? 0) + 1;
                }
            }
            const scanTrendArr = [];
            for (let i = 89; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const ds = d.toISOString().slice(0, 10);
                scanTrendArr.push({ date: ds, count: scanTrendMap[ds] ?? 0 });
            }
            const outletMeta = {
                reportDate: today.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }),
                total: outletRecords.length,
                zones: Array.from(zoneSet).sort(),
                routes: Array.from(routeSet).sort(),
                supervisors: Array.from(supervisorSet).sort(),
                depots: Array.from(depotSet).sort(),
                categories: Array.from(categorySet).sort(),
                custTypes: Array.from(custTypeSet).sort(),
                channels: Array.from(channelSet).sort(),
                brands: Array.from(brandSet).sort(),
                staleCount,
                installTrend: installTrendArr,
                scanTrend: scanTrendArr,
                supervisorZones: Object.fromEntries(Object.entries(supervisorZonesMap).map(([s, zs]) => [
                    s,
                    Array.from(zs).sort(),
                ])),
                zoneRoutes: Object.fromEntries(Object.entries(zoneRoutesMap).map(([z, rs]) => [
                    z,
                    Array.from(rs).sort(),
                ])),
            };
            const masterRecords = [];
            const masterDepotSet = new Set();
            const masterZoneSet = new Set();
            const masterZoneRoutesMap = {};
            for (const cust of allCustomerRows) {
                const route = cust.customer_routes;
                const zone = route?.route_zones;
                const depot = cust.customer_depot?.name || zone?.zone_depots?.name || 'Unassigned';
                const zoneName = zone?.name || 'Unassigned';
                const routeCode = route?.code || 'Unassigned';
                const routeName = route?.name || 'Unassigned';
                const category = cust.customer_category_customer?.category_name || 'General';
                const custType = cust.customer_type_customer?.type_name || 'Standard';
                const channel = cust.customer_channel_customer?.channel_name || null;
                if (depot)
                    masterDepotSet.add(depot);
                if (zoneName)
                    masterZoneSet.add(zoneName);
                if (zoneName && routeCode) {
                    (masterZoneRoutesMap[zoneName] ||= new Set()).add(routeCode);
                }
                masterRecords.push({
                    code: cust.code || '—',
                    name: cust.name || 'Unknown Outlet',
                    depot,
                    zone: zoneName,
                    route: routeCode,
                    routeName: routeName,
                    category,
                    custType,
                    channel,
                });
            }
            const masterMeta = {
                depots: Array.from(masterDepotSet).sort(),
                zones: Array.from(masterZoneSet).sort(),
                zoneRoutes: Object.fromEntries(Object.entries(masterZoneRoutesMap).map(([z, rs]) => [
                    z,
                    Array.from(rs).sort(),
                ])),
            };
            const deployedAssetIdSet = new Set(coolerRows
                .map((c) => c.asset_master_id)
                .filter((id) => id != null));
            const depotZoneSet = new Set();
            const depotBrandSet = new Set();
            const depotRecords = assetMasterRows
                .filter((a) => a.depot_id != null && !deployedAssetIdSet.has(a.id))
                .map((a) => {
                const depotName = a.asset_master_depot?.name || 'Unassigned';
                const brand = a.asset_master_brands?.name || 'Generic';
                const subtype = a.asset_master_asset_sub_types?.name || 'Standard';
                const vBucket = verifyBucket(a.last_scanned_date, today);
                if (depotName)
                    depotZoneSet.add(depotName);
                if (brand)
                    depotBrandSet.add(brand);
                return {
                    zone: depotName,
                    barcode: a.barcode || a.serial_number || '—',
                    serial: a.serial_number || a.barcode || '—',
                    brand,
                    subtype,
                    verifiedDate: a.last_scanned_date
                        ? new Date(a.last_scanned_date).toISOString()
                        : null,
                    verifyBucket: vBucket,
                };
            });
            const depotMeta = {
                total: depotRecords.length,
                zones: Array.from(depotZoneSet).sort(),
                brands: Array.from(depotBrandSet).sort(),
            };
            return res.json({
                success: true,
                data: {
                    outletMeta,
                    outletRecords,
                    denomMeta: {},
                    masterMeta,
                    masterRecords,
                    depotMeta,
                    depotRecords,
                },
            });
        }
        catch (error) {
            console.error('Cooler Tracking Dashboard Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message ?? 'Failed to retrieve dashboard data',
            });
        }
    },
};
//# sourceMappingURL=coolerTrackingDashboard.controller.js.map