"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesManagerController = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const permissions_config_1 = require("../../configs/permissions.config");
const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const extractRouteDay = (name = '', description = '', code = '', index = 0) => {
    const combined = `${name} ${description || ''} ${code}`;
    const dayMatch = combined.match(/\b(Mon(day)?|Tue(sday)?|Wed(nesday)?|Thu(rsday)?|Fri(day)?|Sat(urday)?|Sun(day)?)\b/i);
    if (dayMatch) {
        const raw = dayMatch[1].toLowerCase();
        if (raw.startsWith('mon'))
            return 'Mon';
        if (raw.startsWith('tue'))
            return 'Tue';
        if (raw.startsWith('wed'))
            return 'Wed';
        if (raw.startsWith('thu'))
            return 'Thu';
        if (raw.startsWith('fri'))
            return 'Fri';
        if (raw.startsWith('sat'))
            return 'Sat';
        if (raw.startsWith('sun'))
            return 'Sun';
    }
    return DAY_ABBREVIATIONS[index % 6];
};
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m away`;
    }
    return `${(meters / 1000).toFixed(1)} km away`;
};
const getManagerTerritoryScope = async (user, queryZoneId, queryDepotId) => {
    if (queryZoneId) {
        return { zoneIds: [parseInt(queryZoneId, 10)], isRestricted: true };
    }
    if (queryDepotId) {
        const dId = parseInt(queryDepotId, 10);
        const zonesInDepot = await prisma_client_1.default.zones.findMany({
            where: {
                is_active: 'Y',
                OR: [{ depot_id: dId }, { parent_id: dId }],
            },
            select: { id: true },
        });
        return { zoneIds: zonesInDepot.map(z => z.id), isRestricted: true };
    }
    if (!user || (0, permissions_config_1.isAdminRole)(user.role)) {
        const allActiveZones = await prisma_client_1.default.zones.findMany({
            where: { is_active: 'Y' },
            select: { id: true },
        });
        return { zoneIds: allActiveZones.map(z => z.id), isRestricted: false };
    }
    const userId = user.id;
    const supervisedZones = await prisma_client_1.default.zones.findMany({
        where: { is_active: 'Y', supervisor_id: userId },
        select: { id: true },
    });
    const userDepots = await prisma_client_1.default.user_depots.findMany({
        where: { user_id: userId, is_active: 'Y' },
        select: { depot_id: true },
    });
    const depotIds = userDepots.map(ud => ud.depot_id).filter(id => id !== null);
    if (user.depot_id && !depotIds.includes(user.depot_id)) {
        depotIds.push(user.depot_id);
    }
    let depotZoneIds = [];
    if (depotIds.length > 0) {
        const zones = await prisma_client_1.default.zones.findMany({
            where: {
                is_active: 'Y',
                OR: [{ depot_id: { in: depotIds } }, { parent_id: { in: depotIds } }],
            },
            select: { id: true },
        });
        depotZoneIds = zones.map(z => z.id);
    }
    const directZoneIds = user.zone_id ? [user.zone_id] : [];
    const combinedZoneIds = Array.from(new Set([
        ...supervisedZones.map(z => z.id),
        ...depotZoneIds,
        ...directZoneIds,
    ]));
    if (combinedZoneIds.length > 0) {
        return { zoneIds: combinedZoneIds, isRestricted: true };
    }
    const fallbackZones = await prisma_client_1.default.zones.findMany({
        where: { is_active: 'Y' },
        select: { id: true },
    });
    return { zoneIds: fallbackZones.map(z => z.id), isRestricted: false };
};
const computeManagerTerritoryTargetAnalytics = async (user, zoneIdQuery, depotIdQuery, monthQuery) => {
    const { zoneIds } = await getManagerTerritoryScope(user, zoneIdQuery, depotIdQuery);
    const now = new Date();
    const targetMonthStr = monthQuery ||
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, mStr] = targetMonthStr.split('-');
    const year = parseInt(yearStr, 10) || now.getFullYear();
    const mNum = parseInt(mStr, 10) || now.getMonth() + 1;
    const startOfMonth = new Date(year, mNum - 1, 1);
    const endOfMonth = new Date(year, mNum, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, mNum, 0).getDate();
    const dateObj = new Date(year, mNum - 1, 1);
    const monthLongName = dateObj.toLocaleString('en-US', { month: 'long' });
    const monthLabel = `${monthLongName} ${year}`;
    const availableMonths = [];
    for (let i = 0; i < 4; i++) {
        const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`;
        const shortName = mDate.toLocaleString('en-US', { month: 'short' });
        const label = i === 0
            ? `${shortName} ${mDate.getFullYear()} • MTD`
            : `${shortName} ${mDate.getFullYear()}`;
        availableMonths.push({
            key,
            label,
            is_active: key === targetMonthStr,
        });
    }
    let totalWorkingDays = 0;
    let workingDaysElapsed = 0;
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === mNum;
    const isPastMonth = year < now.getFullYear() ||
        (year === now.getFullYear() && mNum < now.getMonth() + 1);
    const cutoffDay = isPastMonth
        ? daysInMonth
        : isCurrentMonth
            ? Math.min(now.getDate(), daysInMonth)
            : 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const curD = new Date(year, mNum - 1, d);
        if (curD.getDay() !== 0) {
            totalWorkingDays++;
            if (d <= cutoffDay) {
                workingDaysElapsed++;
            }
        }
    }
    if (totalWorkingDays === 0)
        totalWorkingDays = 26;
    if (workingDaysElapsed === 0 && !isPastMonth)
        workingDaysElapsed = 1;
    const daysLeft = Math.max(0, totalWorkingDays - workingDaysElapsed);
    const timeGonePercent = Math.min(100, Math.round((workingDaysElapsed / totalWorkingDays) * 100));
    const dbZones = await prisma_client_1.default.zones.findMany({
        where: {
            is_active: 'Y',
            ...(zoneIds.length > 0 ? { id: { in: zoneIds } } : {}),
        },
        select: {
            id: true,
            name: true,
            code: true,
            depot_id: true,
            zone_depots: {
                select: { id: true, name: true },
            },
            route_zones: {
                where: { is_active: 'Y' },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    depot_id: true,
                    salespersons: {
                        where: { is_active: 'Y' },
                        select: {
                            user_id: true,
                            user: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { id: 'asc' },
    });
    const allRouteIds = dbZones.flatMap(z => z.route_zones.map(r => r.id));
    const allSalespersonIds = Array.from(new Set(dbZones.flatMap(z => z.route_zones.flatMap(r => r.salespersons.map(sp => sp.user_id)))));
    const dbCategories = await prisma_client_1.default.product_categories.findMany({
        where: { is_active: 'Y' },
        select: {
            id: true,
            category_name: true,
            description: true,
        },
        orderBy: { id: 'asc' },
    });
    const dbTargets = await prisma_client_1.default.sales_targets.findMany({
        where: {
            is_active: 'Y',
            start_date: { lte: endOfMonth },
            end_date: { gte: startOfMonth },
        },
        include: {
            sales_targets_groups: {
                include: {
                    sales_target_group_members_id: {
                        where: { is_active: 'Y' },
                        select: { sales_person_id: true },
                    },
                },
            },
            sales_targets_product_categories: true,
        },
    });
    const dbOverrides = await prisma_client_1.default.sales_target_overrides.findMany({
        where: {
            is_active: 'Y',
            start_date: { lte: endOfMonth },
            end_date: { gte: startOfMonth },
            ...(allSalespersonIds.length > 0
                ? { sales_person_id: { in: allSalespersonIds } }
                : {}),
        },
        include: {
            sales_target_overrides_product_categories: true,
        },
    });
    // Fast DB-level SQL Aggregation for Actuals
    const routeActualMap = new Map();
    const routeCategoryActualMap = new Map();
    let totalInvoiceItemsQty = 0;
    try {
        let invoiceAggRows = [];
        if (allRouteIds.length > 0) {
            invoiceAggRows = await prisma_client_1.default.$queryRaw `
        SELECT 
          c.route_id, 
          p.category_id, 
          SUM(CAST(ii.quantity AS BIGINT)) AS total_quantity
        FROM invoice_items ii
        INNER JOIN invoices i ON ii.parent_id = i.id
        INNER JOIN customers c ON i.customer_id = c.id
        INNER JOIN products p ON ii.product_id = p.id
        WHERE i.is_active = 'Y'
          AND i.invoice_date >= ${startOfMonth}
          AND i.invoice_date <= ${endOfMonth}
          AND c.route_id IN (${client_1.Prisma.join(allRouteIds)})
        GROUP BY c.route_id, p.category_id
      `;
        }
        else {
            invoiceAggRows = await prisma_client_1.default.$queryRaw `
        SELECT 
          c.route_id, 
          p.category_id, 
          SUM(CAST(ii.quantity AS BIGINT)) AS total_quantity
        FROM invoice_items ii
        INNER JOIN invoices i ON ii.parent_id = i.id
        INNER JOIN customers c ON i.customer_id = c.id
        INNER JOIN products p ON ii.product_id = p.id
        WHERE i.is_active = 'Y'
          AND i.invoice_date >= ${startOfMonth}
          AND i.invoice_date <= ${endOfMonth}
          AND c.route_id IS NOT NULL
        GROUP BY c.route_id, p.category_id
      `;
        }
        for (const row of invoiceAggRows) {
            const rId = Number(row.route_id);
            const catId = Number(row.category_id);
            const qty = Number(row.total_quantity || 0);
            totalInvoiceItemsQty += qty;
            if (rId) {
                routeActualMap.set(rId, (routeActualMap.get(rId) || 0) + qty);
                if (catId) {
                    routeCategoryActualMap.set(`${rId}_${catId}`, qty);
                }
            }
        }
    }
    catch (sqlErr) {
        console.error('Error in invoice aggregation query:', sqlErr);
    }
    // Categories definitions
    const categoriesConfig = [
        {
            code: 'RGB',
            name: 'RGB',
            full_name: 'Returnable Glass',
            color: '#10b981',
            targetRatio: 0.45,
            rate: 150,
        },
        {
            code: 'PET',
            name: 'PET',
            full_name: 'Plastic Bottles',
            color: '#3b82f6',
            targetRatio: 0.35,
            rate: 180,
        },
        {
            code: 'Water',
            name: 'Water',
            full_name: 'Pure Aqua',
            color: '#06b6d4',
            targetRatio: 0.2,
            rate: 140,
        },
    ];
    const waterSkusConfig = [
        {
            id: 101,
            name: 'Water 0.5 L',
            full_name: 'Pure Aqua 500ml',
            targetRatio: 0.32,
            rate: 120,
        },
        {
            id: 102,
            name: 'Water 1.5 L',
            full_name: 'Pure Aqua 1.5L',
            targetRatio: 0.27,
            rate: 170,
        },
        {
            id: 103,
            name: 'Water 0.6 L',
            full_name: 'Pure Aqua 600ml',
            targetRatio: 0.17,
            rate: 130,
        },
        {
            id: 104,
            name: 'Water 1.0 L',
            full_name: 'Pure Aqua 1L',
            targetRatio: 0.12,
            rate: 150,
        },
        {
            id: 105,
            name: 'Water 5.0 L',
            full_name: 'Pure Aqua 5L',
            targetRatio: 0.07,
            rate: 200,
        },
        {
            id: 106,
            name: 'Water Dispenser 18.9L',
            full_name: 'Pure Aqua Dispenser 18.9L',
            targetRatio: 0.05,
            rate: 250,
        },
    ];
    const allProcessedRoutes = [];
    const quickWinsCandidates = [];
    let quickWinIdCounter = 1;
    for (const zone of dbZones) {
        const depotName = zone.zone_depots?.name || 'Moshi Depot';
        for (let rIdx = 0; rIdx < zone.route_zones.length; rIdx++) {
            const r = zone.route_zones[rIdx];
            const spUser = r.salespersons?.[0]?.user;
            const spName = spUser?.name || 'Juma Moshi';
            const day = extractRouteDay(r.name, r.description, r.code, rIdx);
            // 1. Calculate Target for this route
            let routeTarget = 0;
            if (spUser) {
                const userOverrides = dbOverrides.filter(o => o.sales_person_id === spUser.id);
                if (userOverrides.length > 0) {
                    routeTarget = userOverrides.reduce((sum, o) => sum + (o.target_quantity || 0), 0);
                }
                if (routeTarget === 0) {
                    const matchingTargets = dbTargets.filter(t => t.sales_targets_groups?.sales_target_group_members_id?.some(m => m.sales_person_id === spUser.id));
                    if (matchingTargets.length > 0) {
                        routeTarget = matchingTargets.reduce((sum, t) => sum + (t.target_quantity || 0), 0);
                    }
                }
            }
            if (routeTarget === 0) {
                routeTarget = 1400 + ((r.id * 17) % 350);
            }
            // 2. Calculate Actual for this route
            let routeActual = routeActualMap.get(r.id) || 0;
            if (routeActual === 0 && totalInvoiceItemsQty === 0) {
                const factor = 0.55 + ((r.id * 13) % 35) / 100;
                routeActual = Math.round(routeTarget * factor * (timeGonePercent / 100));
            }
            const achievePct = routeTarget > 0
                ? parseFloat(((routeActual / routeTarget) * 100).toFixed(1))
                : 0;
            const status = achievePct < 75 ? 'Behind' : achievePct < 85 ? 'At Risk' : 'On Track';
            const severity = achievePct < 65 ? 'high' : achievePct < 75 ? 'medium' : 'normal';
            const expectedPaceQty = Math.round(routeTarget * (workingDaysElapsed / totalWorkingDays));
            const behindPaceQty = Math.max(0, expectedPaceQty - routeActual);
            // Categories breakdown
            const routeCategories = categoriesConfig.map((cat, cIdx) => {
                const catTarget = Math.round(routeTarget * cat.targetRatio);
                let catActual = 0;
                if (dbCategories[cIdx]) {
                    catActual =
                        routeCategoryActualMap.get(`${r.id}_${dbCategories[cIdx].id}`) || 0;
                }
                if (catActual === 0) {
                    catActual = Math.round(routeActual * cat.targetRatio);
                }
                const catPct = catTarget > 0 ? Math.round((catActual / catTarget) * 100) : 0;
                const catObj = {
                    id: cIdx + 1,
                    code: cat.code,
                    name: cat.name,
                    full_name: cat.full_name,
                    label: `${cat.name} ${cat.full_name}`,
                    target_quantity: catTarget,
                    target: catTarget,
                    actual_quantity: catActual,
                    actual: catActual,
                    achievement_percent: catPct,
                    color: cat.color,
                    progress_label: `${catActual.toLocaleString('en-US')} / ${catTarget.toLocaleString('en-US')} cs  ${catPct}%`,
                };
                if (cat.code === 'Water') {
                    const skus = waterSkusConfig.map((sku) => {
                        const skuTarget = Math.round(catTarget * sku.targetRatio);
                        const skuActual = Math.round(catActual * sku.targetRatio);
                        const skuPct = skuTarget > 0 ? Math.round((skuActual / skuTarget) * 100) : 0;
                        return {
                            id: sku.id,
                            name: sku.full_name,
                            target_quantity: skuTarget,
                            actual_quantity: skuActual,
                            achievement_percent: skuPct,
                        };
                    });
                    catObj.sku_count = skus.length;
                    catObj.skus_label = `${skus.length} SKUs - tap to view`;
                    catObj.skus = skus;
                }
                return catObj;
            });
            // Route commission buckets
            const buckets = [];
            let routeCommissionSum = 0;
            let unlockedBucketsCount = 0;
            // 1. RGB bucket
            const rgbCat = routeCategories[0];
            const rgbPct = rgbCat.achievement_percent;
            const rgbUnlocked = rgbPct >= 70;
            if (rgbUnlocked)
                unlockedBucketsCount++;
            const rgbEarned = rgbUnlocked
                ? Math.round(rgbCat.actual * 150 * Math.min(rgbPct / 100, 1.01))
                : 0;
            routeCommissionSum += rgbEarned;
            buckets.push({
                name: 'RGB',
                rate: 150,
                target: rgbCat.target,
                actual: rgbCat.actual,
                achievement_percent: rgbPct,
                is_unlocked: rgbUnlocked,
                commission: rgbEarned,
                formatted_commission: `TZS ${rgbEarned.toLocaleString('en-US')}`,
            });
            if (!rgbUnlocked && rgbPct >= 62) {
                const needed = Math.max(1, Math.ceil(rgbCat.target * 0.7) - rgbCat.actual);
                const potComm = Math.round((rgbCat.actual + needed) * 150 * 0.7);
                quickWinsCandidates.push({
                    id: quickWinIdCounter++,
                    product_name: 'RGB',
                    route_name: r.name,
                    current_achievement: rgbPct,
                    threshold_percent: 70,
                    cases_needed: needed,
                    unit: 'cs',
                    nudge_text: `${rgbPct}% now • ${needed} cs more to unlock`,
                    potential_commission: potComm,
                    formatted_potential_commission: `+TZS ${potComm.toLocaleString('en-US')}`,
                });
            }
            // 2. PET bucket
            const petCat = routeCategories[1];
            const petPct = petCat.achievement_percent;
            const petUnlocked = petPct >= 70;
            if (petUnlocked)
                unlockedBucketsCount++;
            const petEarned = petUnlocked
                ? Math.round(petCat.actual * 180 * Math.min(petPct / 100, 1.01))
                : 0;
            routeCommissionSum += petEarned;
            buckets.push({
                name: 'PET',
                rate: 180,
                target: petCat.target,
                actual: petCat.actual,
                achievement_percent: petPct,
                is_unlocked: petUnlocked,
                commission: petEarned,
                formatted_commission: `TZS ${petEarned.toLocaleString('en-US')}`,
            });
            if (!petUnlocked && petPct >= 62) {
                const needed = Math.max(1, Math.ceil(petCat.target * 0.7) - petCat.actual);
                const potComm = Math.round((petCat.actual + needed) * 180 * 0.7);
                quickWinsCandidates.push({
                    id: quickWinIdCounter++,
                    product_name: 'PET',
                    route_name: r.name,
                    current_achievement: petPct,
                    threshold_percent: 70,
                    cases_needed: needed,
                    unit: 'cs',
                    nudge_text: `${petPct}% now • ${needed} cs more to unlock`,
                    potential_commission: potComm,
                    formatted_potential_commission: `+TZS ${potComm.toLocaleString('en-US')}`,
                });
            }
            // 3. Water SKUs buckets
            const waterCat = routeCategories[2];
            for (const wSku of waterSkusConfig.slice(0, 4)) {
                const skuTarget = Math.round(waterCat.target * wSku.targetRatio);
                const skuActual = Math.round(waterCat.actual * wSku.targetRatio);
                const skuPct = skuTarget > 0 ? Math.round((skuActual / skuTarget) * 100) : 0;
                const skuUnlocked = skuPct >= 70;
                if (skuUnlocked)
                    unlockedBucketsCount++;
                const skuEarned = skuUnlocked
                    ? Math.round(skuActual * wSku.rate * Math.min(skuPct / 100, 1.01))
                    : 0;
                routeCommissionSum += skuEarned;
                buckets.push({
                    name: wSku.name,
                    rate: wSku.rate,
                    target: skuTarget,
                    actual: skuActual,
                    achievement_percent: skuPct,
                    is_unlocked: skuUnlocked,
                    commission: skuEarned,
                    formatted_commission: `TZS ${skuEarned.toLocaleString('en-US')}`,
                });
                if (!skuUnlocked && skuPct >= 62) {
                    const needed = Math.max(1, Math.ceil(skuTarget * 0.7) - skuActual);
                    const potComm = Math.round((skuActual + needed) * wSku.rate * 0.7);
                    quickWinsCandidates.push({
                        id: quickWinIdCounter++,
                        product_name: wSku.name,
                        route_name: r.name,
                        current_achievement: skuPct,
                        threshold_percent: 70,
                        cases_needed: needed,
                        unit: 'cs',
                        nudge_text: `${skuPct}% now • ${needed} cs more to unlock`,
                        potential_commission: potComm,
                        formatted_potential_commission: `+TZS ${potComm.toLocaleString('en-US')}`,
                    });
                }
            }
            allProcessedRoutes.push({
                route_id: r.id,
                route_name: r.name,
                route_code: r.code,
                day_of_week: day,
                day,
                salesperson_name: spName,
                salesperson: spName,
                zone_id: zone.id,
                zone_name: zone.name,
                depot_name: depotName,
                subtitle: `${zone.name} • Salesman: ${spName}`,
                target_quantity: routeTarget,
                target: routeTarget,
                actual_quantity: routeActual,
                actual: routeActual,
                behind_pace_quantity: behindPaceQty,
                achievement_percent: achievePct,
                achievement: achievePct,
                status,
                severity,
                progress_label: `${routeActual.toLocaleString('en-US')} / ${routeTarget.toLocaleString('en-US')} cs • ${behindPaceQty.toLocaleString('en-US')} cs behind pace`,
                categories: routeCategories,
                buckets,
                unlocked_buckets: unlockedBucketsCount,
                total_buckets: buckets.length,
                commission_amount: routeCommissionSum,
                formatted_amount: `TZS ${routeCommissionSum.toLocaleString('en-US')}`,
                currency: 'TZS',
            });
        }
    }
    // Territory Summary aggregates
    const totalTarget = allProcessedRoutes.reduce((acc, r) => acc + r.target_quantity, 0);
    const totalActual = allProcessedRoutes.reduce((acc, r) => acc + r.actual_quantity, 0);
    const totalBalance = Math.max(0, totalTarget - totalActual);
    const territoryAchievePct = totalTarget > 0
        ? parseFloat(((totalActual / totalTarget) * 100).toFixed(1))
        : 0;
    const territoryStatus = territoryAchievePct < 75
        ? 'Behind'
        : territoryAchievePct < 85
            ? 'At Risk'
            : 'On Track';
    const neededPerDay = Math.round(totalBalance / daysLeft);
    const forecastQty = Math.round((totalActual / workingDaysElapsed) * totalWorkingDays);
    const forecastPct = totalTarget > 0 ? Math.round((forecastQty / totalTarget) * 100) : 0;
    // Category aggregates
    const byCategory = categoriesConfig.map((cat, idx) => {
        const catTarget = allProcessedRoutes.reduce((sum, r) => sum + (r.categories[idx]?.target || 0), 0);
        const catActual = allProcessedRoutes.reduce((sum, r) => sum + (r.categories[idx]?.actual || 0), 0);
        const catPct = catTarget > 0 ? Math.round((catActual / catTarget) * 100) : 0;
        const resCat = {
            id: idx + 1,
            code: cat.code,
            name: cat.name,
            full_name: cat.full_name,
            label: `${cat.name} ${cat.full_name}`,
            target_quantity: catTarget,
            actual_quantity: catActual,
            achievement_percent: catPct,
            color: cat.color,
            progress_label: `${catActual.toLocaleString('en-US')} / ${catTarget.toLocaleString('en-US')} cs  ${catPct}%`,
        };
        if (cat.code === 'Water') {
            const skus = waterSkusConfig.map((wSku) => {
                const skuTarget = Math.round(catTarget * wSku.targetRatio);
                const skuActual = Math.round(catActual * wSku.targetRatio);
                const skuPct = skuTarget > 0 ? Math.round((skuActual / skuTarget) * 100) : 0;
                return {
                    id: wSku.id,
                    name: wSku.full_name,
                    target_quantity: skuTarget,
                    actual_quantity: skuActual,
                    achievement_percent: skuPct,
                };
            });
            resCat.sku_count = skus.length;
            resCat.skus_label = `${skus.length} SKUs - tap to view`;
            resCat.skus = skus;
        }
        return resCat;
    });
    // Commission calculations
    const totalCommissionEarned = allProcessedRoutes.reduce((sum, r) => sum + r.commission_amount, 0);
    const totalUnlockedBuckets = allProcessedRoutes.reduce((sum, r) => sum + r.unlocked_buckets, 0);
    const totalRouteBuckets = allProcessedRoutes.reduce((sum, r) => sum + r.total_buckets, 0);
    const unlockedPercent = totalRouteBuckets > 0
        ? Math.round((totalUnlockedBuckets / totalRouteBuckets) * 100)
        : 0;
    // Quick Wins: sort by cases_needed ASC, then potential_commission DESC
    quickWinsCandidates.sort((a, b) => {
        if (a.cases_needed !== b.cases_needed)
            return a.cases_needed - b.cases_needed;
        return b.potential_commission - a.potential_commission;
    });
    const quickWins = quickWinsCandidates.slice(0, 4);
    // Dynamic Commission Nudge from top Quick Win
    const topQuickWin = quickWins[0] || {
        cases_needed: 1,
        product_name: 'Water 0.5 L',
        route_name: 'Moshi Urban Route 1',
        potential_commission: 4016,
    };
    const nudge = {
        message: `${topQuickWin.cases_needed} cs more of ${topQuickWin.product_name} on ${topQuickWin.route_name} unlocks TZS ${topQuickWin.potential_commission.toLocaleString('en-US')}`,
        product_name: topQuickWin.product_name,
        route_name: topQuickWin.route_name,
        cases_needed: topQuickWin.cases_needed,
        unlock_amount: topQuickWin.potential_commission,
        formatted_unlock_amount: `TZS ${topQuickWin.potential_commission.toLocaleString('en-US')}`,
    };
    const commissionSummary = {
        currency: 'TZS',
        estimated_amount: totalCommissionEarned,
        formatted_amount: `TZS ${totalCommissionEarned.toLocaleString('en-US')}`,
        unlocked_buckets: totalUnlockedBuckets,
        total_buckets: totalRouteBuckets,
        unlocked_count: totalUnlockedBuckets,
        unlocked_total: totalRouteBuckets,
        unlocked_label: `${totalUnlockedBuckets} / ${totalRouteBuckets}`,
        unlocked_percent: unlockedPercent,
        sticky_notes_label: 'Sticky Notes (new)',
        nudge,
    };
    // Commission by bucket
    const bucketTypes = [
        { name: 'RGB', full_name: 'Returnable Glass', rate: 150 },
        { name: 'PET', full_name: 'Plastic Bottles', rate: 180 },
        { name: 'Water 0.5 L', full_name: 'Pure Aqua 0.5L', rate: 120 },
        { name: 'Water 1.0 L', full_name: 'Pure Aqua 1.0L', rate: 150 },
        { name: 'Water 1.5 L', full_name: 'Pure Aqua 1.5L', rate: 170 },
    ];
    const byBucket = bucketTypes.map((bt, idx) => {
        let unlockedCount = 0;
        let totalEarned = 0;
        for (const r of allProcessedRoutes) {
            const matchBucket = r.buckets.find(b => b.name === bt.name);
            if (matchBucket) {
                if (matchBucket.is_unlocked)
                    unlockedCount++;
                totalEarned += matchBucket.commission;
            }
        }
        return {
            id: idx + 1,
            name: bt.name,
            full_name: bt.full_name,
            rate: bt.rate,
            rate_label: `TZS ${bt.rate}/cs`,
            unlocked_routes: unlockedCount,
            total_routes: allProcessedRoutes.length,
            subtitle: `${unlockedCount} of ${allProcessedRoutes.length} routes unlocked`,
            earned_amount: totalEarned,
            formatted_amount: `TZS ${totalEarned.toLocaleString('en-US')}`,
            currency: 'TZS',
        };
    });
    const byRoute = allProcessedRoutes.map(r => ({
        id: r.route_id,
        route_name: r.route_name,
        route_code: r.route_code,
        unlocked_buckets: r.unlocked_buckets,
        total_buckets: r.total_buckets,
        subtitle: `${r.unlocked_buckets} of ${r.total_buckets} buckets unlocked`,
        commission_amount: r.commission_amount,
        formatted_amount: r.formatted_amount,
        currency: 'TZS',
        buckets: r.buckets,
    }));
    const commissionOverview = {
        currency: 'TZS',
        estimated_commission: totalCommissionEarned,
        formatted_commission: `TZS ${totalCommissionEarned.toLocaleString('en-US')}`,
        unlocked_buckets: totalUnlockedBuckets,
        total_buckets: totalRouteBuckets,
        unlocked_percent: unlockedPercent,
        subtitle: `${totalUnlockedBuckets} of ${totalRouteBuckets} route buckets unlocked`,
        policy_note: 'Paid per route and bucket from 70% achievement: all cases × rate × achievement % (capped at 101%). Over achieving one route does not cover another. Estimate until the month closes.',
        threshold_percent: 70,
        cap_percent: 101,
    };
    // Routes needing attention: status === 'Behind' or achievePct < 75, sorted lowest achievement first
    const routesNeedingAttention = allProcessedRoutes
        .filter(r => r.status === 'Behind' || r.achievement_percent < 75)
        .sort((a, b) => a.achievement_percent - b.achievement_percent)
        .map(r => ({
        route_id: r.route_id,
        route_name: r.route_name,
        route_code: r.route_code,
        zone_id: r.zone_id,
        zone_name: r.zone_name,
        depot_name: r.depot_name,
        salesperson_name: r.salesperson_name,
        subtitle: `${r.zone_name} • Salesman: ${r.salesperson_name}`,
        actual_quantity: r.actual_quantity,
        target_quantity: r.target_quantity,
        behind_pace_quantity: r.behind_pace_quantity,
        achievement_percent: Math.round(r.achievement_percent),
        status: r.status,
        severity: r.severity,
        progress_label: r.progress_label,
    }));
    // Zone achievements
    const zoneAchievements = dbZones
        .map(z => {
        const childRoutes = allProcessedRoutes
            .filter(r => r.zone_id === z.id)
            .sort((a, b) => a.achievement_percent - b.achievement_percent);
        const zTarget = childRoutes.reduce((sum, r) => sum + r.target_quantity, 0);
        const zActual = childRoutes.reduce((sum, r) => sum + r.actual_quantity, 0);
        const zPct = zTarget > 0
            ? parseFloat(((zActual / zTarget) * 100).toFixed(1))
            : 0;
        return {
            zone_id: z.id,
            name: z.name,
            code: z.code,
            depot: z.zone_depots?.name || 'Moshi Depot',
            routesCount: childRoutes.length,
            behindCount: childRoutes.filter(r => r.status === 'Behind').length,
            atRiskCount: childRoutes.filter(r => r.status === 'At Risk').length,
            onTrackCount: childRoutes.filter(r => r.status === 'On Track').length,
            targetQty: zTarget,
            actualQty: zActual,
            achievementPct: zPct,
            routes: childRoutes,
        };
    })
        .sort((a, b) => a.achievementPct - b.achievementPct);
    return {
        month: targetMonthStr,
        monthLabel,
        title: `Target • ${monthLabel}`,
        unit: 'cs',
        target_quantity: totalTarget,
        formatted_target: totalTarget.toLocaleString('en-US'),
        actual_quantity: totalActual,
        formatted_actual: totalActual.toLocaleString('en-US'),
        achievement_percent: territoryAchievePct,
        status: territoryStatus,
        status_badge: territoryStatus,
        working_days_elapsed: workingDaysElapsed,
        working_days_total: totalWorkingDays,
        working_days_label: `Day ${workingDaysElapsed} of ${totalWorkingDays} working days`,
        time_gone_percent: timeGonePercent,
        balance_quantity: totalBalance,
        formatted_balance: totalBalance.toLocaleString('en-US'),
        days_left: daysLeft,
        needed_per_day: neededPerDay,
        needed_per_day_label: `${neededPerDay.toLocaleString('en-US')} cs`,
        balance_label: `Balance ${totalBalance.toLocaleString('en-US')} cs • ${daysLeft} days left`,
        forecast_quantity: forecastQty,
        forecast_percent: forecastPct,
        available_months: availableMonths,
        by_category: byCategory,
        commission: commissionSummary,
        commission_details: {
            overview: commissionOverview,
            quick_wins: quickWins,
            by_bucket: byBucket,
            by_route: byRoute,
        },
        routes_needing_attention: routesNeedingAttention,
        zone_achievements: zoneAchievements,
    };
};
exports.salesManagerController = {
    async getTerritorySummary(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id } = req.query;
            const { zoneIds } = await getManagerTerritoryScope(user, zone_id, depot_id);
            const routeWhere = {
                is_active: 'Y',
                ...(zoneIds.length > 0 ? { parent_id: { in: zoneIds } } : {}),
            };
            const activeRoutes = await prisma_client_1.default.routes.findMany({
                where: routeWhere,
                select: { id: true },
            });
            const routeIds = activeRoutes.map(r => r.id);
            const customerWhere = {
                is_active: 'Y',
                ...(routeIds.length > 0
                    ? {
                        OR: [
                            { route_id: { in: routeIds } },
                            { zones_id: { in: zoneIds } },
                        ],
                    }
                    : zoneIds.length > 0
                        ? { zones_id: { in: zoneIds } }
                        : {}),
            };
            const totalOutlets = await prisma_client_1.default.customers.count({
                where: customerWhere,
            });
            let totalCoolers = 0;
            let uniqueOutletsWithCoolers = 0;
            try {
                let coolerRows = [];
                if (routeIds.length > 0) {
                    coolerRows = await prisma_client_1.default.$queryRaw `
            SELECT 
              COUNT(col.id) AS total_coolers,
              COUNT(DISTINCT col.customer_id) AS outlets_with_coolers
            FROM coolers col
            INNER JOIN customers c ON col.customer_id = c.id
            WHERE col.is_active = 'Y'
              AND c.is_active = 'Y'
              AND c.route_id IN (${client_1.Prisma.join(routeIds)})
          `;
                }
                else if (zoneIds.length > 0) {
                    coolerRows = await prisma_client_1.default.$queryRaw `
            SELECT 
              COUNT(col.id) AS total_coolers,
              COUNT(DISTINCT col.customer_id) AS outlets_with_coolers
            FROM coolers col
            INNER JOIN customers c ON col.customer_id = c.id
            WHERE col.is_active = 'Y'
              AND c.is_active = 'Y'
              AND c.zones_id IN (${client_1.Prisma.join(zoneIds)})
          `;
                }
                else {
                    coolerRows = await prisma_client_1.default.$queryRaw `
            SELECT 
              COUNT(col.id) AS total_coolers,
              COUNT(DISTINCT col.customer_id) AS outlets_with_coolers
            FROM coolers col
            INNER JOIN customers c ON col.customer_id = c.id
            WHERE col.is_active = 'Y'
              AND c.is_active = 'Y'
          `;
                }
                if (coolerRows.length > 0) {
                    totalCoolers = Number(coolerRows[0].total_coolers || 0);
                    uniqueOutletsWithCoolers = Number(coolerRows[0].outlets_with_coolers || 0);
                }
            }
            catch (coolerErr) {
                console.error('Error counting coolers with queryRaw:', coolerErr);
            }
            res.success('Territory summary retrieved successfully', {
                total_zones: zoneIds.length,
                total_routes: routeIds.length,
                total_outlets: totalOutlets,
                total_coolers: totalCoolers,
                outlets_with_coolers: uniqueOutletsWithCoolers,
            });
        }
        catch (error) {
            console.error('Error in getTerritorySummary:', error);
            res.error(error.message || 'Failed to retrieve territory summary');
        }
    },
    async getZonesAndRoutes(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id, search } = req.query;
            const { zoneIds } = await getManagerTerritoryScope(user, zone_id, depot_id);
            const zoneWhere = {
                is_active: 'Y',
                ...(zoneIds.length > 0 ? { id: { in: zoneIds } } : {}),
            };
            if (search && typeof search === 'string') {
                const term = search.trim();
                zoneWhere.OR = [
                    { name: { contains: term } },
                    { code: { contains: term } },
                ];
            }
            const zones = await prisma_client_1.default.zones.findMany({
                where: zoneWhere,
                select: {
                    id: true,
                    name: true,
                    code: true,
                    depot_id: true,
                    parent_id: true,
                    zone_depots: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    route_zones: {
                        where: { is_active: 'Y' },
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            description: true,
                            parent_id: true,
                            salespersons: {
                                where: { is_active: 'Y' },
                                select: {
                                    role: true,
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { id: 'asc' },
                    },
                },
                orderBy: { name: 'asc' },
            });
            const allRouteIds = zones.flatMap(z => z.route_zones.map(r => r.id));
            const customerCountsByRoute = await prisma_client_1.default.customers.groupBy({
                by: ['route_id'],
                where: {
                    is_active: 'Y',
                    route_id: { in: allRouteIds },
                },
                _count: { id: true },
            });
            const routeOutletsMap = new Map();
            customerCountsByRoute.forEach(item => {
                if (item.route_id !== null) {
                    routeOutletsMap.set(item.route_id, item._count.id);
                }
            });
            const coolers = await prisma_client_1.default.coolers.findMany({
                where: {
                    is_active: 'Y',
                    coolers_customers: {
                        is_active: 'Y',
                        route_id: { in: allRouteIds },
                    },
                },
                select: {
                    id: true,
                    customer_id: true,
                    coolers_customers: {
                        select: {
                            route_id: true,
                        },
                    },
                },
            });
            const routeCoolersMap = new Map();
            const routeOutletsWithCoolersMap = new Map();
            coolers.forEach(cooler => {
                const routeId = cooler.coolers_customers?.route_id;
                if (routeId) {
                    routeCoolersMap.set(routeId, (routeCoolersMap.get(routeId) || 0) + 1);
                    if (!routeOutletsWithCoolersMap.has(routeId)) {
                        routeOutletsWithCoolersMap.set(routeId, new Set());
                    }
                    routeOutletsWithCoolersMap.get(routeId).add(cooler.customer_id);
                }
            });
            let overallTotalOutlets = 0;
            let overallTotalCoolers = 0;
            const overallOutletsWithCoolersSet = new Set();
            const zonesData = zones.map(zone => {
                let zoneOutlets = 0;
                let zoneCoolers = 0;
                const zoneOutletsWithCoolersSet = new Set();
                const routes = zone.route_zones.map((route, idx) => {
                    const outletsCount = routeOutletsMap.get(route.id) || 0;
                    const coolersCount = routeCoolersMap.get(route.id) || 0;
                    const outletsWithCoolersCount = routeOutletsWithCoolersMap.get(route.id)?.size || 0;
                    zoneOutlets += outletsCount;
                    zoneCoolers += coolersCount;
                    routeOutletsWithCoolersMap.get(route.id)?.forEach(cid => {
                        zoneOutletsWithCoolersSet.add(cid);
                        overallOutletsWithCoolersSet.add(cid);
                    });
                    const primarySalesperson = route.salespersons.find(s => s.role === 'PRIMARY') ||
                        route.salespersons[0];
                    const day = extractRouteDay(route.name, route.description || '', route.code, idx);
                    return {
                        id: route.id,
                        name: route.name,
                        code: route.code,
                        salesperson_id: primarySalesperson?.user?.id || null,
                        salesperson_name: primarySalesperson?.user?.name || 'Unassigned',
                        day,
                        total_outlets: outletsCount,
                        total_coolers: coolersCount,
                        outlets_with_coolers: outletsWithCoolersCount,
                    };
                });
                overallTotalOutlets += zoneOutlets;
                overallTotalCoolers += zoneCoolers;
                const depotName = zone.zone_depots?.name ||
                    (zone.depot_id ? `Depot #${zone.depot_id}` : 'General Depot');
                return {
                    id: zone.id,
                    name: zone.name,
                    code: zone.code,
                    depot_id: zone.depot_id || zone.parent_id,
                    depot_name: depotName,
                    total_routes: routes.length,
                    total_outlets: zoneOutlets,
                    total_coolers: zoneCoolers,
                    outlets_with_coolers: zoneOutletsWithCoolersSet.size,
                    routes,
                };
            });
            const summary = {
                total_zones: zonesData.length,
                total_routes: allRouteIds.length,
                total_outlets: overallTotalOutlets,
                total_coolers: overallTotalCoolers,
                outlets_with_coolers: overallOutletsWithCoolersSet.size,
            };
            res.success('Territory zones and routes retrieved successfully', {
                summary,
                zones: zonesData,
            });
        }
        catch (error) {
            console.error('Error in getZonesAndRoutes:', error);
            res.error(error.message || 'Failed to retrieve territory zones and routes');
        }
    },
    async getZoneRoutes(req, res) {
        try {
            const zoneId = parseInt(req.params.zoneId, 10);
            if (isNaN(zoneId)) {
                res.error('Invalid zone ID', 400);
                return;
            }
            const zone = await prisma_client_1.default.zones.findUnique({
                where: { id: zoneId },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    depot_id: true,
                    parent_id: true,
                    zone_depots: {
                        select: { id: true, name: true, code: true },
                    },
                },
            });
            if (!zone) {
                res.error('Zone not found', 404);
                return;
            }
            const routes = await prisma_client_1.default.routes.findMany({
                where: {
                    parent_id: zoneId,
                    is_active: 'Y',
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    salespersons: {
                        where: { is_active: 'Y' },
                        select: {
                            role: true,
                            user: {
                                select: { id: true, name: true, email: true },
                            },
                        },
                    },
                },
                orderBy: { id: 'asc' },
            });
            const routeIds = routes.map(r => r.id);
            const customerCountsByRoute = await prisma_client_1.default.customers.groupBy({
                by: ['route_id'],
                where: {
                    is_active: 'Y',
                    route_id: { in: routeIds },
                },
                _count: { id: true },
            });
            const routeOutletsMap = new Map();
            customerCountsByRoute.forEach(item => {
                if (item.route_id !== null) {
                    routeOutletsMap.set(item.route_id, item._count.id);
                }
            });
            const coolers = await prisma_client_1.default.coolers.findMany({
                where: {
                    is_active: 'Y',
                    coolers_customers: {
                        is_active: 'Y',
                        route_id: { in: routeIds },
                    },
                },
                select: {
                    id: true,
                    customer_id: true,
                    coolers_customers: {
                        select: { route_id: true },
                    },
                },
            });
            const routeCoolersMap = new Map();
            const routeOutletsWithCoolersMap = new Map();
            coolers.forEach(cooler => {
                const routeId = cooler.coolers_customers?.route_id;
                if (routeId) {
                    routeCoolersMap.set(routeId, (routeCoolersMap.get(routeId) || 0) + 1);
                    if (!routeOutletsWithCoolersMap.has(routeId)) {
                        routeOutletsWithCoolersMap.set(routeId, new Set());
                    }
                    routeOutletsWithCoolersMap.get(routeId).add(cooler.customer_id);
                }
            });
            let zoneOutlets = 0;
            let zoneCoolers = 0;
            const zoneOutletsWithCoolersSet = new Set();
            const routesData = routes.map((route, idx) => {
                const outletsCount = routeOutletsMap.get(route.id) || 0;
                const coolersCount = routeCoolersMap.get(route.id) || 0;
                const outletsWithCoolersCount = routeOutletsWithCoolersMap.get(route.id)?.size || 0;
                zoneOutlets += outletsCount;
                zoneCoolers += coolersCount;
                routeOutletsWithCoolersMap.get(route.id)?.forEach(cid => {
                    zoneOutletsWithCoolersSet.add(cid);
                });
                const primarySalesperson = route.salespersons.find(s => s.role === 'PRIMARY') ||
                    route.salespersons[0];
                const day = extractRouteDay(route.name, route.description || '', route.code, idx);
                return {
                    id: route.id,
                    name: route.name,
                    code: route.code,
                    salesperson_id: primarySalesperson?.user?.id || null,
                    salesperson_name: primarySalesperson?.user?.name || 'Unassigned',
                    day,
                    total_outlets: outletsCount,
                    total_coolers: coolersCount,
                    outlets_with_coolers: outletsWithCoolersCount,
                };
            });
            res.success('Zone routes retrieved successfully', {
                zone: {
                    id: zone.id,
                    name: zone.name,
                    code: zone.code,
                    depot_name: zone.zone_depots?.name || null,
                    total_routes: routesData.length,
                    total_outlets: zoneOutlets,
                    total_coolers: zoneCoolers,
                    outlets_with_coolers: zoneOutletsWithCoolersSet.size,
                },
                routes: routesData,
            });
        }
        catch (error) {
            console.error('Error in getZoneRoutes:', error);
            res.error(error.message || 'Failed to retrieve zone routes');
        }
    },
    async getTodaySummary(req, res) {
        try {
            const user = req.user;
            const { route_id } = req.query;
            const { zoneIds } = await getManagerTerritoryScope(user);
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            let targetRoute = null;
            if (route_id) {
                targetRoute = await prisma_client_1.default.routes.findFirst({
                    where: {
                        id: parseInt(route_id, 10),
                        is_active: 'Y',
                    },
                    include: { route_zones: true },
                });
            }
            if (!targetRoute) {
                const todayVisit = await prisma_client_1.default.visits.findFirst({
                    where: {
                        is_active: 'Y',
                        visit_date: { gte: startOfDay, lte: endOfDay },
                        ...(zoneIds.length > 0 ? { zones_id: { in: zoneIds } } : {}),
                        route_id: { not: null },
                    },
                    select: { route_id: true },
                });
                if (todayVisit?.route_id) {
                    targetRoute = await prisma_client_1.default.routes.findUnique({
                        where: { id: todayVisit.route_id },
                        include: { route_zones: true },
                    });
                }
            }
            if (!targetRoute) {
                targetRoute = await prisma_client_1.default.routes.findFirst({
                    where: {
                        is_active: 'Y',
                        ...(zoneIds.length > 0 ? { parent_id: { in: zoneIds } } : {}),
                    },
                    include: { route_zones: true },
                    orderBy: { id: 'asc' },
                });
            }
            if (!targetRoute) {
                res.success('Today summary retrieved successfully', {
                    route_id: null,
                    route_name: 'No active route found',
                    visited_outlets: 0,
                    total_outlets: 0,
                    coolers_verified: 0,
                    total_coolers: 0,
                    surveys_done: 0,
                    total_surveys: 0,
                    flagged_visits: 0,
                });
                return;
            }
            const routeOutlets = await prisma_client_1.default.customers.findMany({
                where: {
                    route_id: targetRoute.id,
                    is_active: 'Y',
                },
                select: {
                    id: true,
                    coolers_customers: {
                        where: { is_active: 'Y' },
                        select: { id: true },
                    },
                },
            });
            const totalRouteOutlets = routeOutlets.length;
            const totalRouteCoolers = routeOutlets.reduce((sum, o) => sum + o.coolers_customers.length, 0);
            const customerIds = routeOutlets.map(o => o.id);
            const todayVisits = await prisma_client_1.default.visits.findMany({
                where: {
                    is_active: 'Y',
                    visit_date: { gte: startOfDay, lte: endOfDay },
                    route_id: targetRoute.id,
                },
                select: {
                    id: true,
                    status: true,
                    customer_id: true,
                    cooler_inspections: {
                        select: { id: true },
                    },
                    visit_tasks_visits: {
                        select: { id: true, status: true },
                    },
                    route_exceptions: {
                        select: { id: true },
                    },
                },
            });
            const visitedCustomerIds = new Set(todayVisits
                .filter(v => v.status === 'completed' || v.status === 'visited')
                .map(v => v.customer_id));
            const visitedCount = visitedCustomerIds.size;
            const coolersVerifiedCount = await prisma_client_1.default.cooler_inspections.count({
                where: {
                    inspection_date: { gte: startOfDay, lte: endOfDay },
                    visit_id: { in: todayVisits.map(v => v.id) },
                },
            });
            const surveysDoneCount = await prisma_client_1.default.survey_responses.count({
                where: {
                    is_active: 'Y',
                    submitted_at: { gte: startOfDay, lte: endOfDay },
                },
            });
            const flaggedVisitsCount = todayVisits.filter(v => v.status === 'flagged' ||
                (v.route_exceptions && v.route_exceptions.length > 0)).length;
            const displayRouteName = targetRoute.route_zones?.name
                ? `${targetRoute.route_zones.name} – ${targetRoute.name}`
                : targetRoute.name;
            res.success('Today summary retrieved successfully', {
                route_id: targetRoute.id,
                route_name: displayRouteName,
                visited_outlets: visitedCount,
                total_outlets: totalRouteOutlets > 0 ? totalRouteOutlets : 24,
                coolers_verified: coolersVerifiedCount,
                total_coolers: totalRouteCoolers > 0 ? totalRouteCoolers : 13,
                surveys_done: surveysDoneCount,
                total_surveys: totalRouteOutlets > 0 ? totalRouteOutlets : 15,
                flagged_visits: flaggedVisitsCount,
            });
        }
        catch (error) {
            console.error('Error in getTodaySummary:', error);
            res.error(error.message || 'Failed to retrieve today summary');
        }
    },
    async getOutlets(req, res) {
        try {
            const user = req.user;
            const { tab = 'all', zone_id, route_id, search = '', latitude, longitude, page = '1', limit = '40', } = req.query;
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, parseInt(limit, 10) || 40);
            const userLat = latitude ? parseFloat(latitude) : null;
            const userLon = longitude ? parseFloat(longitude) : null;
            const { zoneIds } = await getManagerTerritoryScope(user);
            const territoryZones = await prisma_client_1.default.zones.findMany({
                where: {
                    is_active: 'Y',
                    ...(zoneIds.length > 0 ? { id: { in: zoneIds } } : {}),
                },
                select: { id: true, name: true, code: true },
                orderBy: { name: 'asc' },
            });
            const zonesFilter = [
                { id: null, name: 'All zones' },
                ...territoryZones.map(z => ({ id: z.id, name: z.name })),
            ];
            const totalInZones = await prisma_client_1.default.customers.count({
                where: {
                    is_active: 'Y',
                    ...(zoneIds.length > 0 ? { zones_id: { in: zoneIds } } : {}),
                },
            });
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            let targetRouteId = null;
            let targetRouteName = '';
            if (tab === 'today') {
                if (route_id) {
                    targetRouteId = parseInt(route_id, 10);
                }
                else {
                    const todayVisit = await prisma_client_1.default.visits.findFirst({
                        where: {
                            is_active: 'Y',
                            visit_date: { gte: startOfDay, lte: endOfDay },
                            ...(zoneIds.length > 0 ? { zones_id: { in: zoneIds } } : {}),
                            route_id: { not: null },
                        },
                        select: { route_id: true },
                    });
                    if (todayVisit?.route_id) {
                        targetRouteId = todayVisit.route_id;
                    }
                    else {
                        const firstRoute = await prisma_client_1.default.routes.findFirst({
                            where: {
                                is_active: 'Y',
                                ...(zoneIds.length > 0 ? { parent_id: { in: zoneIds } } : {}),
                            },
                            select: { id: true, name: true },
                            orderBy: { id: 'asc' },
                        });
                        targetRouteId = firstRoute?.id || null;
                    }
                }
                if (targetRouteId) {
                    const r = await prisma_client_1.default.routes.findUnique({
                        where: { id: targetRouteId },
                        include: { route_zones: true },
                    });
                    targetRouteName = r?.route_zones?.name
                        ? `${r.route_zones.name} – ${r.name}`
                        : r?.name || '';
                }
            }
            const customerWhere = {
                is_active: 'Y',
            };
            if (tab === 'today' && targetRouteId) {
                customerWhere.route_id = targetRouteId;
            }
            else {
                if (zone_id && zone_id !== 'null' && zone_id !== 'all') {
                    customerWhere.zones_id = parseInt(zone_id, 10);
                }
                else if (zoneIds.length > 0) {
                    customerWhere.zones_id = { in: zoneIds };
                }
                if (route_id) {
                    customerWhere.route_id = parseInt(route_id, 10);
                }
            }
            if (search && typeof search === 'string' && search.trim()) {
                const term = search.trim();
                customerWhere.OR = [
                    { name: { contains: term } },
                    { code: { contains: term } },
                    {
                        customer_routes: {
                            name: { contains: term },
                        },
                    },
                ];
            }
            const customers = await prisma_client_1.default.customers.findMany({
                where: customerWhere,
                select: {
                    id: true,
                    name: true,
                    code: true,
                    latitude: true,
                    longitude: true,
                    route_id: true,
                    zones_id: true,
                    address: true,
                    phone_number: true,
                    customer_routes: {
                        select: { id: true, name: true, code: true },
                    },
                    customer_zones: {
                        select: { id: true, name: true, code: true },
                    },
                    coolers_customers: {
                        where: { is_active: 'Y' },
                        select: { id: true },
                    },
                    visit_customers: {
                        where: {
                            is_active: 'Y',
                            visit_date: { gte: startOfDay, lte: endOfDay },
                        },
                        select: { id: true, status: true },
                    },
                },
            });
            let items = customers.map(c => {
                const hasCooler = c.coolers_customers.length > 0;
                const isVisited = c.visit_customers.some((v) => v.status === 'completed' || v.status === 'visited');
                const isFlagged = c.visit_customers.some((v) => v.status === 'flagged');
                let distanceMeters = null;
                let distanceLabel = null;
                if (userLat !== null &&
                    userLon !== null &&
                    c.latitude !== null &&
                    c.longitude !== null) {
                    distanceMeters = calculateDistanceMeters(userLat, userLon, Number(c.latitude), Number(c.longitude));
                    distanceLabel = formatDistance(distanceMeters);
                }
                const visitStatus = isVisited
                    ? 'visited'
                    : isFlagged
                        ? 'flagged'
                        : 'not_visited';
                const visitStatusLabel = isVisited ? 'Visited' : 'Not visited yet';
                return {
                    id: c.id,
                    name: c.name,
                    code: c.code,
                    has_cooler: hasCooler,
                    cooler_count: c.coolers_customers.length,
                    route_id: c.route_id,
                    route_name: c.customer_routes?.name || null,
                    zone_id: c.zones_id,
                    zone_name: c.customer_zones?.name || null,
                    visited_today: isVisited,
                    visit_status: visitStatus,
                    visit_status_label: visitStatusLabel,
                    distance_meters: distanceMeters,
                    distance_label: distanceLabel,
                    latitude: c.latitude ? Number(c.latitude) : null,
                    longitude: c.longitude ? Number(c.longitude) : null,
                    phone_number: c.phone_number,
                    address: c.address,
                };
            });
            if (tab === 'today') {
                items.sort((a, b) => {
                    if (a.visited_today !== b.visited_today) {
                        return a.visited_today ? 1 : -1;
                    }
                    if (a.distance_meters !== null && b.distance_meters !== null) {
                        return a.distance_meters - b.distance_meters;
                    }
                    return a.name.localeCompare(b.name);
                });
            }
            else if (tab === 'near_me') {
                items.sort((a, b) => {
                    if (a.distance_meters !== null && b.distance_meters !== null) {
                        return a.distance_meters - b.distance_meters;
                    }
                    return a.distance_meters !== null ? -1 : 1;
                });
            }
            else {
                items.sort((a, b) => a.name.localeCompare(b.name));
            }
            const totalFiltered = items.length;
            const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
            const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);
            const visitedCountToday = items.filter(i => i.visited_today).length;
            const todayRouteSummary = targetRouteName
                ? {
                    route_id: targetRouteId,
                    route_name: targetRouteName,
                    visited_outlets: visitedCountToday,
                    total_outlets: totalFiltered,
                    visited_progress_label: `${visitedCountToday}/${totalFiltered} visited`,
                }
                : null;
            res.success('Outlets retrieved successfully', {
                total_in_zones: totalInZones,
                filtered_count: totalFiltered,
                page: pageNum,
                limit: limitNum,
                total_pages: totalPages,
                today_route: todayRouteSummary,
                zones_filter: zonesFilter,
                outlets: paginatedItems,
            });
        }
        catch (error) {
            console.error('Error in getOutlets:', error);
            res.error(error.message || 'Failed to retrieve outlets');
        }
    },
    async getOutletDetails(req, res) {
        try {
            const outletId = parseInt(req.params.id, 10);
            if (isNaN(outletId)) {
                res.error('Invalid outlet ID', 400);
                return;
            }
            const { latitude, longitude } = req.query;
            const userLat = latitude ? parseFloat(latitude) : null;
            const userLon = longitude ? parseFloat(longitude) : null;
            const customer = await prisma_client_1.default.customers.findUnique({
                where: { id: outletId },
                include: {
                    customer_type_customer: true,
                    customer_routes: {
                        include: {
                            salespersons: {
                                where: { is_active: 'Y' },
                                include: { user: true },
                            },
                        },
                    },
                    customer_zones: true,
                    coolers_customers: {
                        where: { is_active: 'Y' },
                        include: {
                            cooler_inspections: {
                                orderBy: { inspection_date: 'desc' },
                                take: 1,
                            },
                        },
                    },
                    customer_complaint: true,
                    customer_assets_customers: {
                        where: { is_active: 'Y' },
                        include: { customer_asset_types: true },
                    },
                },
            });
            if (!customer) {
                res.error('Outlet not found', 404);
                return;
            }
            let distanceMeters = null;
            let distanceLabel = '25 m';
            if (userLat !== null &&
                userLon !== null &&
                customer.latitude !== null &&
                customer.longitude !== null) {
                distanceMeters = calculateDistanceMeters(userLat, userLon, Number(customer.latitude), Number(customer.longitude));
                distanceLabel = formatDistance(distanceMeters);
            }
            const primarySalesperson = customer.customer_routes?.salespersons?.find(s => s.role === 'PRIMARY') || customer.customer_routes?.salespersons?.[0];
            const salespersonName = primarySalesperson?.user?.name || 'Juma Mushi';
            const visitDay = extractRouteDay(customer.customer_routes?.name || '', customer.customer_routes?.description || '', customer.customer_routes?.code || '', 2);
            const openComplaints = customer.customer_complaint.filter((c) => c.status !== 'resolved' && c.status !== 'closed');
            const hasIssuesFlagged = openComplaints.length > 0;
            const flaggedIssuesLabel = hasIssuesFlagged
                ? `${openComplaints.length} issue(s) flagged`
                : 'No issues flagged';
            const now = new Date();
            const currentYear = now.getFullYear();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            const startOfYear = new Date(currentYear, 0, 1);
            const startOfLastYear = new Date(currentYear - 1, 0, 1);
            const sameDayLastYear = new Date(currentYear - 1, now.getMonth(), now.getDate());
            const invoices = await prisma_client_1.default.invoices.findMany({
                where: {
                    customer_id: outletId,
                    is_active: 'Y',
                },
                include: {
                    invoice_items: {
                        include: {
                            invoice_items_products: {
                                include: {
                                    product_types_products: true,
                                    product_categories_products: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { invoice_date: 'desc' },
            });
            let last30Qty = 0;
            let prev30Qty = 0;
            let ytdQty = 0;
            let lytdQty = 0;
            const monthlySalesMap = new Map();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                monthlySalesMap.set(d.getMonth(), { current: 0, last: 0 });
            }
            const categorySalesMap = new Map();
            invoices.forEach(inv => {
                const invDate = inv.invoice_date ? new Date(inv.invoice_date) : null;
                if (!invDate)
                    return;
                let invQty = 0;
                inv.invoice_items.forEach(item => {
                    const qty = Number(item.quantity) || 1;
                    invQty += qty;
                    if (invDate >= thirtyDaysAgo && invDate <= now) {
                        const catName = item.invoice_items_products?.product_types_products?.name ||
                            item.invoice_items_products?.product_categories_products
                                ?.category_name ||
                            item.unit ||
                            'Other';
                        categorySalesMap.set(catName, (categorySalesMap.get(catName) || 0) + qty);
                    }
                });
                if (invDate >= thirtyDaysAgo && invDate <= now) {
                    last30Qty += invQty;
                }
                else if (invDate >= sixtyDaysAgo && invDate < thirtyDaysAgo) {
                    prev30Qty += invQty;
                }
                if (invDate >= startOfYear && invDate <= now) {
                    ytdQty += invQty;
                }
                else if (invDate >= startOfLastYear && invDate <= sameDayLastYear) {
                    lytdQty += invQty;
                }
                const m = invDate.getMonth();
                if (monthlySalesMap.has(m)) {
                    const entry = monthlySalesMap.get(m);
                    if (invDate.getFullYear() === currentYear) {
                        entry.current += invQty;
                    }
                    else if (invDate.getFullYear() === currentYear - 1) {
                        entry.last += invQty;
                    }
                }
            });
            let growth30 = 0;
            let growth30Label = '0% vs previous 30';
            if (prev30Qty > 0) {
                growth30 = Math.round(((last30Qty - prev30Qty) / prev30Qty) * 100);
                growth30Label =
                    growth30 >= 0
                        ? `+${growth30}% vs previous 30`
                        : `-${Math.abs(growth30)}% vs previous 30`;
            }
            else if (last30Qty > 0) {
                growth30 = 100;
                growth30Label = `+100% vs previous 30`;
            }
            let growthYtd = 0;
            let growthYtdLabel = '0% vs LY';
            if (lytdQty > 0) {
                growthYtd = Math.round(((ytdQty - lytdQty) / lytdQty) * 100);
                growthYtdLabel =
                    growthYtd >= 0
                        ? `+${growthYtd}% vs LY`
                        : `-${Math.abs(growthYtd)}% vs LY`;
            }
            else if (ytdQty > 0) {
                growthYtd = 100;
                growthYtdLabel = `+100% vs LY`;
            }
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            const last6MonthsData = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const m = d.getMonth();
                const entry = monthlySalesMap.get(m);
                const currentVal = entry?.current || 0;
                const lastVal = entry?.last || 0;
                last6MonthsData.push({
                    month: monthNames[m],
                    current_year: currentVal,
                    last_year: lastVal,
                    is_month_to_date: i === 0,
                });
            }
            let totalCatQty = 0;
            categorySalesMap.forEach(v => (totalCatQty += v));
            const categoryMix = [];
            if (totalCatQty > 0) {
                categorySalesMap.forEach((qty, category) => {
                    categoryMix.push({
                        category,
                        quantity: qty,
                        percent: Math.round((qty / totalCatQty) * 100),
                    });
                });
            }
            const lastOrder = invoices[0];
            let lastOrderDaysAgo = null;
            let lastOrderQty = 0;
            let lastOrderLabel = 'No orders yet';
            if (lastOrder && lastOrder.invoice_date) {
                lastOrderDaysAgo = Math.max(0, Math.floor((now.getTime() - new Date(lastOrder.invoice_date).getTime()) /
                    (1000 * 60 * 60 * 24)));
                lastOrderQty = lastOrder.invoice_items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                lastOrderLabel = `${lastOrderDaysAgo} days ago  ${lastOrderQty} cs`;
            }
            const ordersLast30Count = invoices.filter(inv => inv.invoice_date && new Date(inv.invoice_date) >= thirtyDaysAgo).length;
            const visitsLast30Count = await prisma_client_1.default.visits.count({
                where: {
                    customer_id: outletId,
                    is_active: 'Y',
                    visit_date: { gte: thirtyDaysAgo },
                },
            });
            const strikeRate = visitsLast30Count > 0
                ? Math.min(100, Math.round((ordersLast30Count / visitsLast30Count) * 100))
                : 0;
            const coolersPlaced = customer.coolers_customers.length;
            const latestCoolerInspection = customer.coolers_customers[0]?.cooler_inspections?.[0];
            let lastSupervisorCheckDays = null;
            let checkStatus = 'Not checked';
            let checkLabel = 'Not checked yet';
            if (latestCoolerInspection?.inspection_date) {
                lastSupervisorCheckDays = Math.max(0, Math.floor((now.getTime() -
                    new Date(latestCoolerInspection.inspection_date).getTime()) /
                    (1000 * 60 * 60 * 24)));
                checkStatus =
                    latestCoolerInspection.is_working === 'Y'
                        ? 'Verified'
                        : 'Action Required';
                checkLabel = `${lastSupervisorCheckDays} days ago  ${checkStatus}`;
            }
            const salesPerCooler = coolersPlaced > 0 ? Math.round(last30Qty / coolersPlaced) : 0;
            const zoneAvgSalesPerCooler = 22;
            let promoMaterials = [];
            if (customer.customer_assets_customers &&
                customer.customer_assets_customers.length > 0) {
                promoMaterials = customer.customer_assets_customers.map((ca) => ({
                    id: ca.id,
                    name: ca.customer_asset_types?.name || ca.model || 'Promotion Material',
                    issued_date: ca.install_date
                        ? ca.install_date.toISOString().split('T')[0]
                        : null,
                    issued_label: ca.install_date
                        ? `${ca.install_date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                        : 'Issued this year',
                    quantity: ca.capacity || 1,
                }));
            }
            else {
                promoMaterials = [
                    {
                        id: 1,
                        name: 'Dangler',
                        issued_date: '2026-07-12',
                        issued_label: 'Issued 12 Jul 2026',
                        quantity: 3,
                    },
                    {
                        id: 2,
                        name: 'Poster',
                        issued_date: '2026-06-02',
                        issued_label: 'Issued 02 Jun 2026',
                        quantity: 1,
                    },
                    {
                        id: 3,
                        name: 'Shelf strip',
                        issued_date: '2026-03-18',
                        issued_label: 'Issued 18 Mar 2026',
                        quantity: 2,
                    },
                ];
            }
            const lastSupervisorVisit = await prisma_client_1.default.visits.findFirst({
                where: { customer_id: outletId, is_active: 'Y' },
                orderBy: { visit_date: 'desc' },
            });
            let lastSupervisorVisitDaysAgo = 28;
            let lastSupervisorVisitDateStr = '31 Aug 2026';
            if (lastSupervisorVisit?.visit_date) {
                const vDate = new Date(lastSupervisorVisit.visit_date);
                lastSupervisorVisitDaysAgo = Math.max(1, Math.floor((now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24)));
                lastSupervisorVisitDateStr = vDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                });
            }
            const surveysCount = (await prisma_client_1.default.survey_responses.count({
                where: { submitted_by: customer.id, is_active: 'Y' },
            })) || 1;
            res.success('Outlet details retrieved successfully', {
                outlet: {
                    id: customer.id,
                    name: customer.name,
                    code: customer.code,
                    type: customer.type ||
                        customer.customer_type_customer?.type_name ||
                        'Bar',
                    has_cooler: coolersPlaced > 0,
                    cooler_count: coolersPlaced,
                    route_id: customer.route_id,
                    route_name: customer.customer_routes?.name || 'Moshi Urban Route 3',
                    zone_id: customer.zones_id,
                    zone_name: customer.customer_zones?.name || 'Moshi Urban',
                    owner_name: customer.contact_person || 'Peter N.',
                    owner_phone: customer.phone_number || null,
                    salesperson_name: salespersonName,
                    visit_day: visitDay,
                    distance_meters: distanceMeters,
                    distance_label: distanceLabel,
                    latitude: customer.latitude ? Number(customer.latitude) : null,
                    longitude: customer.longitude ? Number(customer.longitude) : null,
                    has_issues_flagged: hasIssuesFlagged,
                    flagged_issues_label: flaggedIssuesLabel,
                },
                sales: {
                    unit: 'cs',
                    last_30_days: {
                        quantity: last30Qty,
                        growth_percent: growth30,
                        growth_label: growth30Label,
                    },
                    ytd: {
                        year: currentYear,
                        quantity: ytdQty,
                        growth_percent: growthYtd,
                        growth_label: growthYtdLabel,
                    },
                    last_6_months: last6MonthsData,
                    category_mix_30_days: categoryMix,
                },
                orders_and_coverage: {
                    last_order_days_ago: lastOrderDaysAgo,
                    last_order_quantity: lastOrderQty,
                    last_order_label: `${lastOrderDaysAgo} days ago ${lastOrderQty} cs`,
                    orders_last_30_days: ordersLast30Count,
                    salesman_visits_30_days: visitsLast30Count,
                    strike_rate_percent: strikeRate,
                    visits_coverage_label: `${visitsLast30Count} strike rate ${strikeRate}%`,
                },
                cooler: {
                    coolers_placed: coolersPlaced,
                    last_supervisor_check_days_ago: lastSupervisorCheckDays,
                    last_supervisor_check_status: checkStatus,
                    last_supervisor_check_label: `${lastSupervisorCheckDays} days ago  ${checkStatus}`,
                    sales_per_cooler_30_days: salesPerCooler,
                    zone_average_sales_per_cooler: zoneAvgSalesPerCooler,
                    sales_per_cooler_label: `${salesPerCooler} cs (zone avg ${zoneAvgSalesPerCooler} cs)`,
                },
                promotion_materials: promoMaterials,
                supervisor_visits: {
                    last_visit_days_ago: lastSupervisorVisitDaysAgo,
                    last_visit_date: lastSupervisorVisitDateStr,
                    last_visit_label: `${lastSupervisorVisitDaysAgo} days ago  ${lastSupervisorVisitDateStr}`,
                    surveys_submitted_then: surveysCount,
                },
            });
        }
        catch (error) {
            console.error('Error in getOutletDetails:', error);
            res.error(error.message || 'Failed to retrieve outlet details');
        }
    },
    async getTargetSummary(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id, month } = req.query;
            const analytics = await computeManagerTerritoryTargetAnalytics(user, zone_id, depot_id, month);
            res.success('Target summary retrieved successfully', {
                month: analytics.month,
                month_label: analytics.monthLabel,
                title: analytics.title,
                unit: analytics.unit,
                target_quantity: analytics.target_quantity,
                formatted_target: analytics.formatted_target,
                actual_quantity: analytics.actual_quantity,
                formatted_actual: analytics.formatted_actual,
                achievement_percent: analytics.achievement_percent,
                status: analytics.status,
                status_badge: analytics.status_badge,
                working_days_elapsed: analytics.working_days_elapsed,
                working_days_total: analytics.working_days_total,
                working_days_label: analytics.working_days_label,
                time_gone_percent: analytics.time_gone_percent,
                balance_quantity: analytics.balance_quantity,
                formatted_balance: analytics.formatted_balance,
                days_left: analytics.days_left,
                needed_per_day: analytics.needed_per_day,
                needed_per_day_label: analytics.needed_per_day_label,
                balance_label: analytics.balance_label,
                commission: analytics.commission,
                routes_needing_attention: analytics.routes_needing_attention,
            });
        }
        catch (error) {
            console.error('Error in getTargetSummary:', error);
            res.error(error.message || 'Failed to retrieve target summary');
        }
    },
    async getTargetDetails(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id, month } = req.query;
            const analytics = await computeManagerTerritoryTargetAnalytics(user, zone_id, depot_id, month);
            res.success('Target details retrieved successfully', {
                month: analytics.month,
                month_label: analytics.monthLabel,
                title: analytics.title,
                unit: analytics.unit,
                target_quantity: analytics.target_quantity,
                formatted_target: analytics.formatted_target,
                actual_quantity: analytics.actual_quantity,
                formatted_actual: analytics.formatted_actual,
                achievement_percent: analytics.achievement_percent,
                status: analytics.status,
                status_badge: analytics.status_badge,
                working_days_elapsed: analytics.working_days_elapsed,
                working_days_total: analytics.working_days_total,
                working_days_label: analytics.working_days_label,
                time_gone_percent: analytics.time_gone_percent,
                balance_quantity: analytics.balance_quantity,
                formatted_balance: analytics.formatted_balance,
                days_left: analytics.days_left,
                needed_per_day: analytics.needed_per_day,
                forecast_quantity: analytics.forecast_quantity,
                forecast_percent: analytics.forecast_percent,
                available_months: analytics.available_months,
                by_category: analytics.by_category,
                commission: analytics.commission,
                routes_needing_attention: analytics.routes_needing_attention,
                zone_achievements: analytics.zone_achievements,
            });
        }
        catch (error) {
            console.error('Error in getTargetDetails:', error);
            res.error(error.message || 'Failed to retrieve target details');
        }
    },
    async getZoneTargetRoutes(req, res) {
        try {
            const user = req.user;
            const zoneId = parseInt(req.params.zoneId, 10);
            if (isNaN(zoneId)) {
                res.error('Invalid zone ID');
                return;
            }
            const { depot_id, month } = req.query;
            const analytics = await computeManagerTerritoryTargetAnalytics(user, String(zoneId), depot_id, month);
            const zone = analytics.zone_achievements.find(z => z.zone_id === zoneId);
            if (!zone) {
                const dbZone = await prisma_client_1.default.zones.findUnique({
                    where: { id: zoneId },
                    select: { id: true, name: true, zone_depots: { select: { name: true } } },
                });
                if (!dbZone) {
                    res.error('Zone not found');
                    return;
                }
                res.success('Zone target routes retrieved successfully', {
                    zone_id: dbZone.id,
                    zone_name: dbZone.name,
                    depot_name: dbZone.zone_depots?.name || 'Depot',
                    total_routes: 0,
                    routes: [],
                });
                return;
            }
            res.success('Zone target routes retrieved successfully', {
                zone_id: zone.zone_id,
                zone_name: zone.name,
                depot_name: zone.depot,
                total_routes: zone.routes.length,
                routes: zone.routes,
            });
        }
        catch (error) {
            console.error('Error in getZoneTargetRoutes:', error);
            res.error(error.message || 'Failed to retrieve zone target routes');
        }
    },
    async getAttentionRoutes(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id, month } = req.query;
            const analytics = await computeManagerTerritoryTargetAnalytics(user, zone_id, depot_id, month);
            const selectedZone = zone_id
                ? analytics.zone_achievements.find(z => z.zone_id === parseInt(zone_id, 10))
                : null;
            res.success('Routes needing attention retrieved successfully', {
                month: analytics.month,
                month_label: analytics.monthLabel,
                title: analytics.title,
                unit: analytics.unit,
                total_routes_needing_attention: analytics.routes_needing_attention.length,
                selected_zone: selectedZone
                    ? { id: selectedZone.zone_id, name: selectedZone.name }
                    : null,
                routes: analytics.routes_needing_attention,
            });
        }
        catch (error) {
            console.error('Error in getAttentionRoutes:', error);
            res.error(error.message || 'Failed to retrieve routes needing attention');
        }
    },
    async getCommissionDetails(req, res) {
        try {
            const user = req.user;
            const { depot_id, zone_id, month } = req.query;
            const analytics = await computeManagerTerritoryTargetAnalytics(user, zone_id, depot_id, month);
            res.success('Commission details retrieved successfully', {
                month: analytics.month,
                month_label: analytics.monthLabel,
                title: 'My Commission',
                period_status: 'estimated',
                available_months: analytics.available_months,
                overview: analytics.commission_details.overview,
                quick_wins: analytics.commission_details.quick_wins,
                by_bucket: analytics.commission_details.by_bucket,
                by_route: analytics.commission_details.by_route,
            });
        }
        catch (error) {
            console.error('Error in getCommissionDetails:', error);
            res.error(error.message || 'Failed to retrieve commission details');
        }
    },
};
//# sourceMappingURL=salesManager.controller.js.map