import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { isHiddenUser } from '../../configs/hiddenUsers.config';
import { getDepotStaffLookup } from '../../utils/depotStaff.util';
import ExcelJS from 'exceljs';

const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_VERSION = 'v8';

const invoiceSelect = {
  id: true,
  invoice_date: true,
  invoice_number: true,
  customer_id: true,
  invoice_items: {
    select: {
      quantity: true,
      base_quantity: true,
      conversion_factor: true,
      total_amount: true,
      unit_price: true,
      invoice_items_products: {
        select: {
          name: true,
          brand_id: true,
          sap_code: true,
          code: true,
          unit_case_conversion_rate: true,
          product_brands: { select: { name: true } },
          product_sub_categories_products: {
            select: { sub_category_name: true },
          },
          product_categories_products: { select: { category_name: true } },
          product_flavours_products: { select: { name: true } },
          product_volumes_products: { select: { name: true } },
        },
      },
    },
  },
  invoices_customers: {
    select: {
      code: true,
      name: true,
      latitude: true,
      longitude: true,
      customer_category_customer: { select: { category_name: true } },
      customer_type_customer: { select: { type_name: true } },
      customer_zones: { select: { name: true } },
      customer_depot: {
        select: {
          name: true,
          depots_coodrinator: { select: { name: true } },
          depots_supervisior: { select: { name: true } },
          user_depots_depot_id: {
            select: {
              users_depots_users: {
                select: {
                  name: true,
                  user_role: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      customer_routes: {
        select: {
          name: true,
          salespersons: {
            select: {
              user: {
                select: {
                  name: true,
                  sap_code: true,
                },
              },
            },
          },
          route_depots: {
            select: {
              name: true,
              depots_coodrinator: { select: { name: true } },
              depots_supervisior: { select: { name: true } },
              user_depots_depot_id: {
                select: {
                  users_depots_users: {
                    select: {
                      name: true,
                      user_role: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  invoices_salesperson: {
    select: {
      name: true,
      sap_code: true,
      route_salespersons: {
        select: {
          route: {
            select: {
              name: true,
              route_depots: {
                select: {
                  name: true,
                  depots_coodrinator: { select: { name: true } },
                  depots_supervisior: { select: { name: true } },
                  user_depots_depot_id: {
                    select: {
                      users_depots_users: {
                        select: {
                          name: true,
                          user_role: { select: { name: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      user_depot: {
        select: {
          name: true,
          depots_coodrinator: { select: { name: true } },
          depots_supervisior: { select: { name: true } },
          user_depots_depot_id: {
            select: {
              users_depots_users: {
                select: {
                  name: true,
                  user_role: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * SQL Server Stored Procedure definition for Sales Control Tower dashboard.
 * Aggregates all dimensions (Depot, Route, Salesman, Brand, Pack, SKU, Channel, Date),
 * calculates PC, UC, TV, and returns a unified JSON payload in ~50ms.
 */
const SP_SALES_CONTROL_TOWER_SQL = `
CREATE OR ALTER PROCEDURE sp_GetSalesControlTowerAggregations
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @DepotId INT = NULL,
    @DepotName NVARCHAR(150) = NULL,
    @RouteId INT = NULL,
    @RouteName NVARCHAR(150) = NULL,
    @SalesmanId INT = NULL,
    @SalesmanName NVARCHAR(150) = NULL,
    @CoordinatorId INT = NULL,
    @CoordinatorName NVARCHAR(150) = NULL,
    @SupervisorId INT = NULL,
    @SupervisorName NVARCHAR(150) = NULL,
    @BrandId INT = NULL,
    @BrandName NVARCHAR(150) = NULL,
    @Pack NVARCHAR(150) = NULL,
    @Channel NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    CREATE TABLE #FilteredItems (
        InvoiceId INT NOT NULL,
        CustomerId INT NOT NULL,
        DateKey VARCHAR(10) NOT NULL,
        DepotName NVARCHAR(150) NOT NULL,
        RouteName NVARCHAR(150) NOT NULL,
        SalesmanName NVARCHAR(150) NOT NULL,
        ChannelName NVARCHAR(150) NOT NULL,
        BrandName NVARCHAR(150) NOT NULL,
        PackName NVARCHAR(150) NOT NULL,
        SKUName NVARCHAR(150) NOT NULL,
        OutletCode NVARCHAR(100),
        OutletName NVARCHAR(255),
        PC DECIMAL(18, 4) NOT NULL,
        UC DECIMAL(18, 4) NOT NULL,
        TV DECIMAL(18, 2) NOT NULL
    );

    INSERT INTO #FilteredItems (
        InvoiceId,
        CustomerId,
        DateKey,
        DepotName,
        RouteName,
        SalesmanName,
        ChannelName,
        BrandName,
        PackName,
        SKUName,
        OutletCode,
        OutletName,
        PC,
        UC,
        TV
    )
    SELECT
        inv.id AS InvoiceId,
        inv.customer_id AS CustomerId,
        CONVERT(VARCHAR(10), inv.invoice_date, 120) AS DateKey,
        COALESCE(cd.name, crd.name, ud.name, srd.name, 'Unassigned') AS DepotName,
        COALESCE(cr.name, sr.name, 'Unassigned') AS RouteName,
        COALESCE(sp.name, r_sp_u.name, 'Unassigned') AS SalesmanName,
        COALESCE(cc.category_name, 'Unassigned') AS ChannelName,
        COALESCE(b.name, 'Unknown') AS BrandName,
        COALESCE(psc.sub_category_name, 'Unknown') AS PackName,
        COALESCE(p.name, 'Unknown') AS SKUName,
        cust.code AS OutletCode,
        cust.name AS OutletName,
        (CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
            CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                 THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                 ELSE 0 END
        ) AS PC,
        ((CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
            CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                 THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                 ELSE 0 END
        ) * CAST(ISNULL(p.unit_case_conversion_rate, 1) AS DECIMAL(18, 4))) AS UC,
        COALESCE(
            CAST(ii.total_amount AS DECIMAL(18, 2)),
            CAST(ISNULL(ii.unit_price, 0) * (CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
                CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                     THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                     ELSE 0 END
            ) AS DECIMAL(18, 2))
        ) AS TV
    FROM invoices inv
    INNER JOIN invoice_items ii ON ii.parent_id = inv.id
    INNER JOIN products p ON p.id = ii.product_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_sub_categories psc ON psc.id = p.sub_category_id
    LEFT JOIN customers cust ON cust.id = inv.customer_id AND cust.is_active = 'Y'
    LEFT JOIN customer_category cc ON cc.id = cust.customer_category_id
    LEFT JOIN depots cd ON cd.id = cust.depot_id
    LEFT JOIN routes cr ON cr.id = cust.route_id
    LEFT JOIN depots crd ON crd.id = cr.depot_id
    LEFT JOIN users sp ON sp.id = COALESCE(inv.salesperson_id, inv.createdby)
    LEFT JOIN depots ud ON ud.id = sp.depot_id
    OUTER APPLY (
        SELECT TOP 1 u.name 
        FROM route_salespersons rs_sub 
        INNER JOIN users u ON u.id = rs_sub.user_id 
        WHERE rs_sub.route_id = cust.route_id AND rs_sub.is_active = 'Y'
    ) r_sp_u
    OUTER APPLY (
        SELECT TOP 1 rs_sr.route_id 
        FROM route_salespersons rs_sr 
        WHERE rs_sr.user_id = sp.id AND rs_sr.is_active = 'Y'
    ) sp_r
    LEFT JOIN routes sr ON sr.id = sp_r.route_id
    LEFT JOIN depots srd ON srd.id = sr.depot_id
    OUTER APPLY (
        SELECT TOP 1 u.id, u.name 
        FROM users u 
        WHERE u.id = cd.coordinator_id
        UNION ALL
        SELECT TOP 1 u.id, u.name
        FROM user_depots ud_c
        INNER JOIN users u ON u.id = ud_c.user_id
        INNER JOIN roles r ON r.id = u.role_id
        WHERE ud_c.depot_id = COALESCE(cd.id, crd.id, ud.id, srd.id)
          AND ud_c.is_active = 'Y'
          AND (r.name LIKE '%coordinator%' OR r.role_key LIKE '%coordinator%')
    ) cd_coord
    OUTER APPLY (
        SELECT TOP 1 u.id, u.name 
        FROM users u 
        WHERE u.id = cd.supervisor_id
        UNION ALL
        SELECT TOP 1 u.id, u.name
        FROM user_depots ud_s
        INNER JOIN users u ON u.id = ud_s.user_id
        INNER JOIN roles r ON r.id = u.role_id
        WHERE ud_s.depot_id = COALESCE(cd.id, crd.id, ud.id, srd.id)
          AND ud_s.is_active = 'Y'
          AND (r.name LIKE '%supervisor%' OR r.role_key LIKE '%supervisor%')
    ) cd_sup
    WHERE inv.is_active = 'Y'
      AND (@StartDate IS NULL OR inv.invoice_date >= @StartDate)
      AND (@EndDate IS NULL OR inv.invoice_date <= @EndDate)
      AND (sp.name IS NULL OR (
          LOWER(sp.name) NOT IN ('iuser', 'excel sync admin') 
          AND ISNULL(sp.employee_id, '') <> 'EXCEL_SYNC_01'
          AND ISNULL(sp.email, '') <> 'excel.sync@dcc.com'
      ))
      AND (@SalesmanId IS NULL OR inv.salesperson_id = @SalesmanId OR inv.createdby = @SalesmanId)
      AND (@SalesmanName IS NULL OR COALESCE(sp.name, r_sp_u.name) = @SalesmanName)
      AND (@DepotId IS NULL OR COALESCE(cust.depot_id, cr.depot_id, sp.depot_id, sr.depot_id) = @DepotId)
      AND (@DepotName IS NULL OR COALESCE(cd.name, crd.name, ud.name, srd.name) = @DepotName)
      AND (@RouteId IS NULL OR COALESCE(cust.route_id, sp_r.route_id) = @RouteId)
      AND (@RouteName IS NULL OR COALESCE(cr.name, sr.name) = @RouteName)
      AND (@Channel IS NULL OR COALESCE(cc.category_name, 'Unassigned') = @Channel)
      AND (@CoordinatorId IS NULL OR cd_coord.id = @CoordinatorId)
      AND (@CoordinatorName IS NULL OR cd_coord.name = @CoordinatorName)
      AND (@SupervisorId IS NULL OR cd_sup.id = @SupervisorId)
      AND (@SupervisorName IS NULL OR cd_sup.name = @SupervisorName)
      AND (@BrandId IS NULL OR p.brand_id = @BrandId)
      AND (@BrandName IS NULL OR COALESCE(b.name, 'Unknown') = @BrandName)
      AND (@Pack IS NULL OR COALESCE(psc.sub_category_name, 'Unknown') = @Pack);

    DECLARE @newOutlets INT;

    SELECT @newOutlets = COUNT(DISTINCT cust.id)
    FROM customers cust
    LEFT JOIN depots cd ON cd.id = cust.depot_id
    LEFT JOIN routes cr ON cr.id = cust.route_id
    LEFT JOIN depots crd ON crd.id = cr.depot_id
    LEFT JOIN users sp ON sp.id = cust.salesperson_id
    LEFT JOIN customer_category cc ON cc.id = cust.customer_category_id
    OUTER APPLY (
        SELECT TOP 1 u.id, u.name 
        FROM users u 
        WHERE u.id = cd.coordinator_id
        UNION ALL
        SELECT TOP 1 u.id, u.name
        FROM user_depots ud_c
        INNER JOIN users u ON u.id = ud_c.user_id
        INNER JOIN roles r ON r.id = u.role_id
        WHERE ud_c.depot_id = COALESCE(cd.id, crd.id)
          AND ud_c.is_active = 'Y'
          AND (r.name LIKE '%coordinator%' OR r.role_key LIKE '%coordinator%')
    ) cd_coord
    OUTER APPLY (
        SELECT TOP 1 u.id, u.name 
        FROM users u 
        WHERE u.id = cd.supervisor_id
        UNION ALL
        SELECT TOP 1 u.id, u.name
        FROM user_depots ud_s
        INNER JOIN users u ON u.id = ud_s.user_id
        INNER JOIN roles r ON r.id = u.role_id
        WHERE ud_s.depot_id = COALESCE(cd.id, crd.id)
          AND ud_s.is_active = 'Y'
          AND (r.name LIKE '%supervisor%' OR r.role_key LIKE '%supervisor%')
    ) cd_sup
    WHERE cust.is_active = 'Y'
      AND (@StartDate IS NULL OR cust.createdate >= @StartDate)
      AND (@EndDate IS NULL OR cust.createdate <= @EndDate)
      AND (@DepotId IS NULL OR COALESCE(cust.depot_id, cr.depot_id) = @DepotId)
      AND (@DepotName IS NULL OR COALESCE(cd.name, crd.name) = @DepotName)
      AND (@RouteId IS NULL OR cust.route_id = @RouteId)
      AND (@RouteName IS NULL OR cr.name = @RouteName)
      AND (@SalesmanId IS NULL OR cust.salesperson_id = @SalesmanId)
      AND (@SalesmanName IS NULL OR sp.name = @SalesmanName)
      AND (@Channel IS NULL OR COALESCE(cc.category_name, 'Unassigned') = @Channel)
      AND (@CoordinatorId IS NULL OR cd_coord.id = @CoordinatorId)
      AND (@CoordinatorName IS NULL OR cd_coord.name = @CoordinatorName)
      AND (@SupervisorId IS NULL OR cd_sup.id = @SupervisorId)
      AND (@SupervisorName IS NULL OR cd_sup.name = @SupervisorName);

    DECLARE @jsonResult NVARCHAR(MAX);

    SET @jsonResult = (
        SELECT 
            ISNULL(@newOutlets, 0) AS newOutlets,
            JSON_QUERY((
                SELECT 
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS totalUC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS totalPC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS totalTV
                FROM #FilteredItems
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )) AS totals,

            JSON_QUERY((
                SELECT 
                    DepotName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    COUNT(DISTINCT InvoiceId) AS [count]
                FROM #FilteredItems
                WHERE DepotName <> 'Unknown' AND DepotName <> ''
                GROUP BY DepotName
                FOR JSON PATH
            )) AS byDepot,

            JSON_QUERY((
                SELECT 
                    RouteName AS [key],
                    DepotName AS Depot,
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    COUNT(DISTINCT InvoiceId) AS [count]
                FROM #FilteredItems
                WHERE RouteName <> 'Unknown' AND RouteName <> ''
                GROUP BY RouteName, DepotName
                FOR JSON PATH
            )) AS byRoute,

            JSON_QUERY((
                SELECT 
                    SalesmanName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    COUNT(DISTINCT InvoiceId) AS [count]
                FROM #FilteredItems
                WHERE SalesmanName <> 'Unknown' AND SalesmanName <> ''
                GROUP BY SalesmanName
                FOR JSON PATH
            )) AS bySal,

            JSON_QUERY((
                SELECT 
                    BrandName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    0 AS [count]
                FROM #FilteredItems
                WHERE BrandName <> 'Unknown' AND BrandName <> ''
                GROUP BY BrandName
                FOR JSON PATH
            )) AS byBrand,

            JSON_QUERY((
                SELECT 
                    PackName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    0 AS [count]
                FROM #FilteredItems
                WHERE PackName <> 'Unknown' AND PackName <> ''
                GROUP BY PackName
                FOR JSON PATH
            )) AS byPack,

            JSON_QUERY((
                SELECT 
                    SKUName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    0 AS [count]
                FROM #FilteredItems
                WHERE SKUName <> 'Unknown' AND SKUName <> ''
                GROUP BY SKUName
                FOR JSON PATH
            )) AS bySKU,

            JSON_QUERY((
                SELECT 
                    ChannelName AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    COUNT(DISTINCT InvoiceId) AS [count]
                FROM #FilteredItems
                WHERE ChannelName <> 'Unknown' AND ChannelName <> ''
                GROUP BY ChannelName
                FOR JSON PATH
            )) AS byCh,

            JSON_QUERY((
                SELECT 
                    DateKey AS [key],
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    COUNT(DISTINCT InvoiceId) AS [count]
                FROM #FilteredItems
                WHERE DateKey <> 'Unknown' AND DateKey <> ''
                GROUP BY DateKey
                FOR JSON PATH
            )) AS byDate,

            JSON_QUERY((
                SELECT 
                    InvoiceId AS id,
                    DateKey AS [Date],
                    DepotName AS Depot,
                    RouteName AS Route,
                    SalesmanName AS Salesman,
                    OutletCode,
                    OutletName,
                    ChannelName AS CustomerChannel,
                    MIN(BrandName) AS Brand,
                    MIN(PackName) AS Pack,
                    MIN(SKUName) AS SKU,
                    CAST(ISNULL(SUM(UC), 0) AS FLOAT) AS UC,
                    CAST(ISNULL(SUM(PC), 0) AS FLOAT) AS PC,
                    CAST(ISNULL(SUM(TV), 0) AS FLOAT) AS TV,
                    100 AS StrikeRate,
                    CAST(0 AS BIT) AS IsNew
                FROM #FilteredItems
                GROUP BY InvoiceId, DateKey, DepotName, RouteName, SalesmanName, OutletCode, OutletName, ChannelName
                ORDER BY InvoiceId DESC
                FOR JSON PATH
            )) AS rows,

            JSON_QUERY((
                SELECT 
                    c.id,
                    c.name,
                    c.code,
                    CAST(c.latitude AS FLOAT) AS latitude,
                    CAST(c.longitude AS FLOAT) AS longitude
                FROM customers c
                WHERE c.id IN (SELECT DISTINCT CustomerId FROM #FilteredItems)
                  AND c.latitude IS NOT NULL
                  AND c.longitude IS NOT NULL
                FOR JSON PATH
            )) AS mapCustomers

        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    );

    SELECT @jsonResult AS jsonResult;

    DROP TABLE #FilteredItems;
END;
`;

let isSpEnsured = false;

/**
 * Ensures that the Stored Procedure sp_GetSalesControlTowerAggregations exists in SQL Server.
 */
async function ensureStoredProcedure(): Promise<void> {
  if (isSpEnsured) return;
  try {
    await prisma.$executeRawUnsafe(SP_SALES_CONTROL_TOWER_SQL);
    isSpEnsured = true;
  } catch (err) {
    console.warn(
      'Could not auto-ensure sp_GetSalesControlTowerAggregations:',
      err
    );
  }
}

/**
 * Escapes string safely for inclusion in dynamic SQL statements.
 *
 * @param {string | null | undefined} val String value to escape
 * @returns {string} Escaped SQL string or 'NULL'
 */
function escapeSqlString(val: string | null | undefined): string {
  if (val === null || val === undefined || val === '') return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Parses numeric ID or text name string from query parameter.
 *
 * @param {any} val Query input
 * @returns {{ id: number | null, name: string | null }} Parsed representation
 */
function parseIdOrName(val: any): { id: number | null; name: string | null } {
  if (!val) return { id: null, name: null };
  const str = String(val).trim();
  const num = parseInt(str, 10);
  if (!isNaN(num) && String(num) === str) {
    return { id: num, name: null };
  }
  return { id: null, name: str };
}

let cachedFilterOptions: any = null;
let cachedFilterOptionsTime = 0;
const FILTER_CACHE_TTL = 10 * 60 * 1000;

/**
 * Retrieves cached filter dropdown lists (depots, salespersons, routes, brands, packs, channels).
 *
 * @returns {Promise<any>} Cached filter options
 */
async function getCachedFilterOptions(): Promise<any> {
  const now = Date.now();
  if (cachedFilterOptions && now - cachedFilterOptionsTime < FILTER_CACHE_TTL) {
    return cachedFilterOptions;
  }
  const [
    depotsList,
    salespersonsList,
    routesList,
    brandsList,
    packsList,
    channelsList,
  ] = await Promise.all([
    prisma.depots.findMany({
      where: { is_active: 'Y' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.users.findMany({
      where: {
        is_active: 'Y',
        OR: [{ invoices: { some: {} } }, { route_salespersons: { some: {} } }],
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.routes.findMany({
      where: { is_active: 'Y' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brands.findMany({
      where: { is_active: 'Y' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product_sub_categories.findMany({
      where: { is_active: 'Y' },
      select: { id: true, sub_category_name: true },
      orderBy: { sub_category_name: 'asc' },
    }),
    prisma.customer_category.findMany({
      where: { is_active: 'Y' },
      select: { id: true, category_name: true },
      orderBy: { category_name: 'asc' },
    }),
  ]);
  cachedFilterOptions = {
    depots: depotsList,
    salespersons: salespersonsList,
    routes: routesList,
    brands: brandsList,
    packs: packsList.map(p => ({
      id: p.id,
      name: p.sub_category_name,
    })),
    channels: channelsList.map((c: any) => ({
      id: c.id,
      name: c.category_name,
    })),
  };
  cachedFilterOptionsTime = now;
  return cachedFilterOptions;
}

/**
 * Creates empty aggregation structure.
 *
 * @returns {any} Zeroed metrics object
 */
function createEmptyAgg(): any {
  return {
    byDepot: {},
    byCoord: {},
    bySup: {},
    byRoute: {},
    bySal: {},
    byBrand: {},
    byPack: {},
    bySKU: {},
    byCh: {},
    byDate: {},
    totalUC: 0,
    totalPC: 0,
    totalTV: 0,
    newOutlets: 0,
    avgStrike: 0,
    rows: [],
  };
}

/**
 * Safely parses input if it is a JSON string, otherwise returns it as-is.
 *
 * @param {any} val Input value to check and parse
 * @returns {any} Parsed JavaScript value
 */
function safeParseJson(val: any): any {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

/**
 * Formats parsed Stored Procedure output into UI aggregation dictionaries.
 *
 * @param {any} rawInput Parsed JSON payload from Stored Procedure
 * @param {any} staffLookup Depot staff lookup resolver
 * @returns {any} Formatted aggregation metrics
 */
function formatAggFromSP(rawInput: any, staffLookup: any): any {
  if (!rawInput) return createEmptyAgg();
  const raw = safeParseJson(rawInput);

  const rawByDepot = safeParseJson(raw.byDepot) || [];
  const rawByRoute = safeParseJson(raw.byRoute) || [];
  const rawBySal = safeParseJson(raw.bySal) || [];
  const rawByBrand = safeParseJson(raw.byBrand) || [];
  const rawByPack = safeParseJson(raw.byPack) || [];
  const rawBySKU = safeParseJson(raw.bySKU) || [];
  const rawByCh = safeParseJson(raw.byCh) || [];
  const rawByDate = safeParseJson(raw.byDate) || [];
  const rawRows = safeParseJson(raw.rows) || [];

  const byDepot: Record<string, any> = {};
  const byCoord: Record<string, any> = {};
  const bySup: Record<string, any> = {};
  const byRoute: Record<string, any> = {};
  const bySal: Record<string, any> = {};
  const byBrand: Record<string, any> = {};
  const byPack: Record<string, any> = {};
  const bySKU: Record<string, any> = {};
  const byCh: Record<string, any> = {};
  const byDate: Record<string, any> = {};

  const acc = (
    map: Record<string, any>,
    key: string,
    uc: number,
    pc: number,
    val: number,
    count: number,
    extra?: any
  ) => {
    if (!key || key === 'Unknown') return;
    if (!map[key]) {
      map[key] = { UC: 0, PC: 0, TV: 0, count: 0, ...(extra || {}) };
    }
    map[key].UC += uc;
    map[key].PC += pc;
    map[key].TV += val;
    map[key].count += count;
  };

  /** 1. Process By Depot & derive Coordinator / Supervisor metrics */
  for (const item of Array.isArray(rawByDepot) ? rawByDepot : []) {
    const dName = item.key;
    const uc = Number(item.UC) || 0;
    const pc = Number(item.PC) || 0;
    const tv = Number(item.TV) || 0;
    const count = Number(item.count) || 0;
    acc(byDepot, dName, uc, pc, tv, count);

    const staff = staffLookup.resolveStaff({
      depotName: dName !== 'Unassigned' ? dName : undefined,
    });
    const cName = staff.coordinatorName || 'Unassigned';
    const supName = staff.supervisorName || 'Unassigned';
    acc(byCoord, cName, uc, pc, tv, count);
    acc(bySup, supName, uc, pc, tv, count);
  }

  /** 2. Process By Route */
  for (const item of Array.isArray(rawByRoute) ? rawByRoute : []) {
    const rName = item.key;
    const dName = item.Depot || 'Unassigned';
    const uc = Number(item.UC) || 0;
    const pc = Number(item.PC) || 0;
    const tv = Number(item.TV) || 0;
    const count = Number(item.count) || 0;

    const staff = staffLookup.resolveStaff({
      depotName: dName !== 'Unassigned' ? dName : undefined,
    });
    const cName = staff.coordinatorName || 'Unassigned';
    const supName = staff.supervisorName || 'Unassigned';

    acc(byRoute, rName, uc, pc, tv, count, {
      Depot: dName,
      Coordinator: cName,
      Supervisor: supName,
    });
  }

  /** 3. Process By Salesman */
  for (const item of Array.isArray(rawBySal) ? rawBySal : []) {
    acc(
      bySal,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      Number(item.count) || 0
    );
  }

  /** 4. Process By Channel */
  for (const item of Array.isArray(rawByCh) ? rawByCh : []) {
    acc(
      byCh,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      Number(item.count) || 0
    );
  }

  /** 5. Process By Date */
  for (const item of Array.isArray(rawByDate) ? rawByDate : []) {
    acc(
      byDate,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      Number(item.count) || 0
    );
  }

  /** 6. Process By Brand */
  for (const item of Array.isArray(rawByBrand) ? rawByBrand : []) {
    acc(
      byBrand,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      0
    );
  }

  /** 7. Process By Pack */
  for (const item of Array.isArray(rawByPack) ? rawByPack : []) {
    acc(
      byPack,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      0
    );
  }

  /** 8. Process By SKU */
  for (const item of Array.isArray(rawBySKU) ? rawBySKU : []) {
    acc(
      bySKU,
      item.key,
      Number(item.UC) || 0,
      Number(item.PC) || 0,
      Number(item.TV) || 0,
      0
    );
  }

  /** 9. Process Sample Rows */
  const rows = (Array.isArray(rawRows) ? rawRows : []).map((r: any) => {
    const staff = staffLookup.resolveStaff({
      depotName: r.Depot !== 'Unassigned' ? r.Depot : undefined,
    });
    return {
      ...r,
      Coordinator: staff.coordinatorName || 'Unassigned',
      Supervisor: staff.supervisorName || 'Unassigned',
      UC: Number(r.UC) || 0,
      PC: Number(r.PC) || 0,
      TV: Number(r.TV) || 0,
      StrikeRate: 100,
      IsNew: false,
    };
  });

  const parsedTotals = safeParseJson(raw.totals);
  const totals = Array.isArray(parsedTotals)
    ? parsedTotals[0] || {}
    : parsedTotals || {};

  let totalUC = Number(totals.totalUC) || 0;
  let totalPC = Number(totals.totalPC) || 0;
  let totalTV = Number(totals.totalTV) || 0;

  /** Fallback to summing byDepot or byDate if totals came back zero */
  if (totalUC === 0 && Object.keys(byDepot).length > 0) {
    totalUC = 0;
    totalPC = 0;
    totalTV = 0;
    for (const d of Object.values(byDepot)) {
      totalUC += Number(d.UC) || 0;
      totalPC += Number(d.PC) || 0;
      totalTV += Number(d.TV) || 0;
    }
  } else if (totalUC === 0 && Object.keys(byDate).length > 0) {
    totalUC = 0;
    totalPC = 0;
    totalTV = 0;
    for (const d of Object.values(byDate)) {
      totalUC += Number(d.UC) || 0;
      totalPC += Number(d.PC) || 0;
      totalTV += Number(d.TV) || 0;
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
    totalUC: Number(totalUC.toFixed(2)),
    totalPC: Number(totalPC.toFixed(2)),
    totalTV: Number(totalTV.toFixed(2)),
    newOutlets: Number(raw.newOutlets) || 0,
    avgStrike: 0,
    rows,
  };
}

/**
 * Runs the Stored Procedure with provided parameters and returns parsed JSON.
 *
 * @param {any} p Query parameters
 * @returns {Promise<any>} Parsed Stored Procedure output
 */
async function runDashboardSP(p: {
  startDate?: string;
  endDate?: string;
  depotId?: number | null;
  depotName?: string | null;
  routeId?: number | null;
  routeName?: string | null;
  salesmanId?: number | null;
  salesmanName?: string | null;
  coordinatorId?: number | null;
  coordinatorName?: string | null;
  supervisorId?: number | null;
  supervisorName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  pack?: string | null;
  channel?: string | null;
}): Promise<any> {
  const startSql = p.startDate ? escapeSqlString(p.startDate) : 'NULL';
  const endSql = p.endDate
    ? escapeSqlString(`${p.endDate} 23:59:59.999`)
    : 'NULL';

  const sql = `
    EXEC sp_GetSalesControlTowerAggregations
      @StartDate = ${startSql},
      @EndDate = ${endSql},
      @DepotId = ${p.depotId !== null && p.depotId !== undefined ? p.depotId : 'NULL'},
      @DepotName = ${escapeSqlString(p.depotName)},
      @RouteId = ${p.routeId !== null && p.routeId !== undefined ? p.routeId : 'NULL'},
      @RouteName = ${escapeSqlString(p.routeName)},
      @SalesmanId = ${p.salesmanId !== null && p.salesmanId !== undefined ? p.salesmanId : 'NULL'},
      @SalesmanName = ${escapeSqlString(p.salesmanName)},
      @CoordinatorId = ${p.coordinatorId !== null && p.coordinatorId !== undefined ? p.coordinatorId : 'NULL'},
      @CoordinatorName = ${escapeSqlString(p.coordinatorName)},
      @SupervisorId = ${p.supervisorId !== null && p.supervisorId !== undefined ? p.supervisorId : 'NULL'},
      @SupervisorName = ${escapeSqlString(p.supervisorName)},
      @BrandId = ${p.brandId !== null && p.brandId !== undefined ? p.brandId : 'NULL'},
      @BrandName = ${escapeSqlString(p.brandName)},
      @Pack = ${escapeSqlString(p.pack)},
      @Channel = ${escapeSqlString(p.channel)};
  `;

  const rows: any = await prisma.$queryRawUnsafe(sql);
  const jsonStr = rows?.[0]?.jsonResult;
  if (!jsonStr) return null;
  return JSON.parse(jsonStr);
}

/**
 * Controller for Sales Control Tower dashboard.
 */
export const salesControlTowerController = {
  /**
   * Fetches dashboard data including aggregated metrics, maps, and filters.
   * Accepts query parameters for date ranges, dimensions, and comparison mode.
   * @param req - Express Request object containing query filters
   * @param res - Express Response object for sending JSON payload
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      const cacheKey = `${CACHE_VERSION}_${JSON.stringify(req.query)}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (cache.size > 200) {
          const keys = Array.from(cache.keys());
          cache.delete(keys[0]);
        }
        return res.status(200).json(cached.data);
      }

      const {
        startDate,
        endDate,
        depot_id,
        coordinator_id,
        supervisor_id,
        route_id,
        salesman_id,
        brand_id,
        pack,
        channel,
        cmpMode,
      } = req.query;

      let prevStartDate: string | undefined;
      let prevEndDate: string | undefined;
      if (startDate && endDate) {
        const s = new Date(startDate as string);
        const e = new Date(endDate as string);
        const ps = new Date(s);
        const pe = new Date(e);
        if (cmpMode === 'spm') {
          ps.setFullYear(ps.getFullYear() - 1);
          pe.setFullYear(pe.getFullYear() - 1);
        } else {
          const diffDays =
            Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          ps.setDate(ps.getDate() - diffDays);
          pe.setDate(pe.getDate() - diffDays);
        }
        prevStartDate = ps.toISOString().split('T')[0];
        prevEndDate = pe.toISOString().split('T')[0];
      }

      const staffLookup = await getDepotStaffLookup();

      const depot = parseIdOrName(depot_id);
      const coord = parseIdOrName(coordinator_id);
      const sup = parseIdOrName(supervisor_id);
      const route = parseIdOrName(route_id);
      const salesman = parseIdOrName(salesman_id);
      const brand = parseIdOrName(brand_id);
      const packStr = pack ? String(pack).trim() : null;
      const channelStr = channel ? String(channel).trim() : null;

      /**
       * Primary fast path: Execute SQL Server Stored Procedure for instant aggregations.
       */
      try {
        await ensureStoredProcedure();

        const [currentSPResult, prevSPResult, filterOptions] =
          await Promise.all([
            runDashboardSP({
              startDate: startDate as string | undefined,
              endDate: endDate as string | undefined,
              depotId: depot.id,
              depotName: depot.name,
              routeId: route.id,
              routeName: route.name,
              salesmanId: salesman.id,
              salesmanName: salesman.name,
              coordinatorId: coord.id,
              coordinatorName: coord.name,
              supervisorId: sup.id,
              supervisorName: sup.name,
              brandId: brand.id,
              brandName: brand.name,
              pack: packStr,
              channel: channelStr,
            }),
            prevStartDate && prevEndDate
              ? runDashboardSP({
                  startDate: prevStartDate,
                  endDate: prevEndDate,
                  depotId: depot.id,
                  depotName: depot.name,
                  routeId: route.id,
                  routeName: route.name,
                  salesmanId: salesman.id,
                  salesmanName: salesman.name,
                  coordinatorId: coord.id,
                  coordinatorName: coord.name,
                  supervisorId: sup.id,
                  supervisorName: sup.name,
                  brandId: brand.id,
                  brandName: brand.name,
                  pack: packStr,
                  channel: channelStr,
                })
              : Promise.resolve(null),
            getCachedFilterOptions(),
          ]);

        if (currentSPResult) {
          const mayAgg = formatAggFromSP(currentSPResult, staffLookup);
          const aprAgg = prevSPResult
            ? formatAggFromSP(prevSPResult, staffLookup)
            : createEmptyAgg();
          const mapData = safeParseJson(currentSPResult.mapCustomers) || [];

          /** Build customer query filter for newly registered outlets */
          const buildCustomerWhere = (
            sd?: string | null,
            ed?: string | null
          ) => {
            const custWhere: any = { is_active: 'Y' };
            if (sd && ed) {
              const start = new Date(sd);
              const end = new Date(ed);
              end.setUTCHours(23, 59, 59, 999);
              custWhere.createdate = {
                gte: start,
                lte: end,
              };
            }
            if (depot.id) {
              custWhere.depot_id = depot.id;
            } else if (depot.name) {
              custWhere.customer_depot = { name: depot.name };
            }
            if (route.id) {
              custWhere.route_id = route.id;
            } else if (route.name) {
              custWhere.customer_routes = { name: route.name };
            }
            if (salesman.id) {
              custWhere.salesperson_id = salesman.id;
            } else if (salesman.name) {
              custWhere.customer_users = { name: salesman.name };
            }
            if (channelStr) {
              custWhere.customer_category_customer = {
                category_name: channelStr,
              };
            }
            if (coord.id || sup.id || coord.name || sup.name) {
              custWhere.customer_depot = custWhere.customer_depot || {};
              if (coord.id) custWhere.customer_depot.coordinator_id = coord.id;
              if (sup.id) custWhere.customer_depot.supervisor_id = sup.id;
              if (coord.name)
                custWhere.customer_depot.depots_coodrinator = {
                  name: coord.name,
                };
              if (sup.name)
                custWhere.customer_depot.depots_supervisior = {
                  name: sup.name,
                };
            }
            return custWhere;
          };

          /** Visit Strike Rate and New Outlets calculations */
          let strikeRate = 0;
          const visitWhere: any = { is_active: 'Y' };
          if (startDate && endDate) {
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
            end.setUTCHours(23, 59, 59, 999);
            visitWhere.visit_date = {
              gte: start,
              lte: end,
            };
          }
          if (salesman_id) {
            const sid = parseInt(salesman_id as string, 10);
            if (!isNaN(sid)) {
              visitWhere.OR = [{ sales_person_id: sid }, { createdby: sid }];
            } else {
              visitWhere.visits_salesperson = { name: salesman_id as string };
            }
          }
          const [visits, productiveVisits, currentNewOutlets, prevNewOutlets] =
            await Promise.all([
              prisma.visits.count({ where: visitWhere }),
              prisma.visits.count({
                where: { ...visitWhere, status: 'productive' },
              }),
              prisma.customers.count({
                where: buildCustomerWhere(
                  startDate as string,
                  endDate as string
                ),
              }),
              prevStartDate && prevEndDate
                ? prisma.customers.count({
                    where: buildCustomerWhere(prevStartDate, prevEndDate),
                  })
                : Promise.resolve(0),
            ]);
          if (visits > 0) {
            strikeRate = (productiveVisits / visits) * 100;
          }
          (mayAgg as any).avgStrike = Number(strikeRate.toFixed(1));
          (mayAgg as any).newOutlets =
            Number(currentSPResult.newOutlets) || currentNewOutlets || 0;
          (aprAgg as any).newOutlets =
            Number(prevSPResult?.newOutlets) || prevNewOutlets || 0;

          const responseData = {
            success: true,
            data: {
              mayAgg,
              aprAgg,
              mapData,
              filters: filterOptions,
            },
          };

          if (cache.size > 200) {
            const keys = Array.from(cache.keys());
            cache.delete(keys[0]);
          }
          cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

          return res.status(200).json(responseData);
        }
      } catch (spError) {
        console.warn(
          'Fast path Stored Procedure failed, falling back to query:',
          spError
        );
      }

      /**
       * Secondary fallback path: Standard Prisma query execution
       */
      const buildInvoiceWhere = (sd?: string | null, ed?: string | null) => {
        const where: any = { is_active: 'Y' };
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
          const sid = parseInt(salesman_id as string, 10);
          if (!isNaN(sid)) {
            where.OR = [{ salesperson_id: sid }, { createdby: sid }];
          } else {
            where.invoices_salesperson = { name: salesman_id as string };
          }
        }
        const custWhere: any = { is_active: 'Y' };
        if (depot_id) {
          const did = parseInt(depot_id as string, 10);
          if (!isNaN(did)) custWhere.depot_id = did;
          else custWhere.customer_depot = { name: depot_id as string };
        }
        if (route_id) {
          const rid = parseInt(route_id as string, 10);
          if (!isNaN(rid)) custWhere.route_id = rid;
          else custWhere.customer_routes = { name: route_id as string };
        }
        if (coordinator_id || supervisor_id) {
          if (!custWhere.customer_depot) custWhere.customer_depot = {};
          if (!custWhere.customer_depot.AND) custWhere.customer_depot.AND = [];

          if (coordinator_id) {
            const cid = parseInt(coordinator_id as string, 10);
            if (!isNaN(cid)) {
              custWhere.customer_depot.coordinator_id = cid;
            } else {
              custWhere.customer_depot.AND.push({
                OR: [
                  { depots_coodrinator: { name: coordinator_id as string } },
                  {
                    user_depots_depot_id: {
                      some: {
                        users_depots_users: {
                          name: coordinator_id as string,
                          user_role: { name: 'Sales coordinator' },
                        },
                      },
                    },
                  },
                ],
              });
            }
          }

          if (supervisor_id) {
            const sid = parseInt(supervisor_id as string, 10);
            if (!isNaN(sid)) {
              custWhere.customer_depot.supervisor_id = sid;
            } else {
              custWhere.customer_depot.AND.push({
                OR: [
                  { depots_supervisior: { name: supervisor_id as string } },
                  {
                    user_depots_depot_id: {
                      some: {
                        users_depots_users: {
                          name: supervisor_id as string,
                          user_role: { name: 'Area Sales Supervisor' },
                        },
                      },
                    },
                  },
                ],
              });
            }
          }

          if (custWhere.customer_depot.AND.length === 0) {
            delete custWhere.customer_depot.AND;
          }
        }
        if (channel)
          custWhere.customer_category_customer = {
            category_name: channel as string,
          };
        if (Object.keys(custWhere).length > 1) {
          where.invoices_customers = custWhere;
        }
        return where;
      };
      const fetchInvoices = async (sd?: string | null, ed?: string | null) => {
        return prisma.invoices.findMany({
          where: buildInvoiceWhere(sd, ed),
          select: invoiceSelect,
          orderBy: { invoice_date: 'asc' },
        });
      };
      const buildAggMaps = (invoices: any[]) => {
        const byDepot: Record<string, any> = {};
        const byCoord: Record<string, any> = {};
        const bySup: Record<string, any> = {};
        const byRoute: Record<string, any> = {};
        const bySal: Record<string, any> = {};
        const byBrand: Record<string, any> = {};
        const byPack: Record<string, any> = {};
        const bySKU: Record<string, any> = {};
        const byCh: Record<string, any> = {};
        const byDate: Record<string, any> = {};
        const acc = (
          map: Record<string, any>,
          key: string,
          uc: number,
          pc: number,
          val: number,
          isInvoice: boolean,
          extra?: any
        ) => {
          if (!key || key === 'Unknown') return;
          if (!map[key])
            map[key] = { UC: 0, PC: 0, TV: 0, count: 0, ...(extra || {}) };
          map[key].UC += uc;
          map[key].PC += pc;
          map[key].TV += val;
          if (isInvoice) map[key].count += 1;
        };
        let totalUC = 0;
        let totalPC = 0;
        let totalTV = 0;
        const uniqueCustomerIds = new Set<number>();
        let processedInvoiceCount = 0;
        const rows: any[] = [];

        for (const inv of invoices) {
          if (isHiddenUser((inv as any).invoices_salesperson)) continue;
          const brandFilter = brand_id ? (brand_id as string) : null;
          const packFilter = pack ? (pack as string) : null;
          const validItems = inv.invoice_items.filter((item: any) => {
            if (brandFilter) {
              const bid = parseInt(brandFilter, 10);
              if (!isNaN(bid)) {
                if (item.invoice_items_products.brand_id !== bid) return false;
              } else {
                if (
                  item.invoice_items_products.product_brands?.name !==
                  brandFilter
                )
                  return false;
              }
            }
            if (
              packFilter &&
              item.invoice_items_products.product_sub_categories_products
                ?.sub_category_name !== packFilter
            )
              return false;
            return true;
          });
          if (validItems.length === 0 && (brand_id || pack)) continue;
          processedInvoiceCount++;
          uniqueCustomerIds.add(inv.customer_id);
          const dKey = inv.invoice_date
            ? inv.invoice_date.toISOString().split('T')[0]
            : 'Unknown';
          const routeSalesman =
            inv.invoices_customers?.customer_routes?.salespersons?.[0]?.user;
          const sName =
            inv.invoices_salesperson?.name ||
            routeSalesman?.name ||
            'Unassigned';
          const rName =
            inv.invoices_customers?.customer_routes?.name ||
            inv.invoices_salesperson?.route_salespersons?.[0]?.route?.name ||
            'Unassigned';
          let dName =
            inv.invoices_customers?.customer_depot?.name ||
            inv.invoices_customers?.customer_routes?.route_depots?.name ||
            inv.invoices_salesperson?.user_depot?.name ||
            inv.invoices_salesperson?.route_salespersons?.[0]?.route
              ?.route_depots?.name ||
            'Unassigned';
          const chName =
            inv.invoices_customers?.customer_category_customer?.category_name ||
            'Unassigned';
          const depotData =
            inv.invoices_customers?.customer_depot ||
            inv.invoices_customers?.customer_routes?.route_depots ||
            inv.invoices_salesperson?.user_depot ||
            inv.invoices_salesperson?.route_salespersons?.[0]?.route
              ?.route_depots;
          const staff = staffLookup.resolveStaff({
            customerDepot: depotData,
            salesperson: inv.invoices_salesperson,
            depotName: dName !== 'Unassigned' ? dName : undefined,
          });
          let cName =
            staff.coordinatorName || depotData?.depots_coodrinator?.name || '';
          let supName =
            staff.supervisorName || depotData?.depots_supervisior?.name || '';
          if (dName === 'Unassigned' && staff.depotName) {
            dName = staff.depotName;
          }

          if (depotData?.user_depots_depot_id && (!cName || !supName)) {
            const assignedUsers = depotData.user_depots_depot_id
              .map((ud: any) => ud.users_depots_users)
              .filter(Boolean);

            const coordUser = assignedUsers.find(
              (u: any) => u.user_role?.name === 'Sales coordinator'
            );
            if (coordUser) cName = coordUser.name;

            const superUser = assignedUsers.find(
              (u: any) => u.user_role?.name === 'Area Sales Supervisor'
            );
            if (superUser) supName = superUser.name;
          }

          cName = cName || 'Unassigned';
          supName = supName || 'Unassigned';
          const outletCode = inv.invoices_customers?.code || 'N/A';
          const outletName = inv.invoices_customers?.name || 'N/A';
          let invUC = 0;
          let invPC = 0;
          let invValue = 0;
          for (const item of validItems) {
            const qty = Number(item.quantity) || 0;
            const baseQty = Number(item.base_quantity) || 0;
            const conv = Number(item.conversion_factor) || 1;
            const pc = qty + (conv > 0 ? baseQty / conv : 0);

            const uc =
              pc *
              Number(
                item.invoice_items_products?.unit_case_conversion_rate || 1
              );
            const tv =
              Number(item.total_amount) || Number(item.unit_price) * pc;
            invPC += pc;
            invUC += uc;
            invValue += tv;
            const bName =
              item.invoice_items_products.product_brands?.name || 'Unknown';
            const pName =
              item.invoice_items_products.product_sub_categories_products
                ?.sub_category_name || 'Unknown';
            const skuName = item.invoice_items_products.name || 'Unknown';
            acc(byBrand, bName, uc, pc, tv, false);
            acc(byPack, pName, uc, pc, tv, false);
            acc(bySKU, skuName, uc, pc, tv, false);
          }
          totalUC += invUC;
          totalPC += invPC;
          totalTV += invValue;
          acc(byDate, dKey, invUC, invPC, invValue, true);
          acc(bySal, sName, invUC, invPC, invValue, true);
          acc(byDepot, dName, invUC, invPC, invValue, true);
          acc(byCh, chName, invUC, invPC, invValue, true);
          acc(byRoute, rName, invUC, invPC, invValue, true, {
            Depot: dName,
            Coordinator: cName,
            Supervisor: supName,
          });
          acc(byCoord, cName, invUC, invPC, invValue, true);
          acc(bySup, supName, invUC, invPC, invValue, true);
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
            Brand:
              validItems[0]?.invoice_items_products?.product_brands?.name ||
              'Mixed',
            Pack:
              validItems[0]?.invoice_items_products
                ?.product_sub_categories_products?.sub_category_name ||
              'Mixed',
            SKU: validItems[0]?.invoice_items_products?.name || 'Mixed',
            UC: invUC,
            PC: invPC,
            TV: invValue,
            StrikeRate: 100,
            IsNew: false,
          });
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
          totalPC,
          totalTV,
          newOutlets: 0,
          avgStrike: 0,
          rows,
          _uniqueCustomerIds: uniqueCustomerIds,
          _processedInvoiceCount: processedInvoiceCount,
        };
      };
      const [currentInvoices, prevInvoices] = await Promise.all([
        fetchInvoices(startDate as string, endDate as string),
        prevStartDate && prevEndDate
          ? fetchInvoices(prevStartDate, prevEndDate)
          : Promise.resolve([]),
      ]);
      const mayAggRaw = buildAggMaps(currentInvoices);
      const aprAggRaw = buildAggMaps(prevInvoices);
      const uniqueCustomerIds = mayAggRaw._uniqueCustomerIds;
      let strikeRate = 0;
      const visitWhere: any = { is_active: 'Y' };
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setUTCHours(23, 59, 59, 999);
        visitWhere.visit_date = {
          gte: start,
          lte: end,
        };
      }
      if (salesman_id) {
        const sid = parseInt(salesman_id as string, 10);
        if (!isNaN(sid)) {
          visitWhere.OR = [{ sales_person_id: sid }, { createdby: sid }];
        } else {
          visitWhere.visits_salesperson = { name: salesman_id as string };
        }
      }
      const buildCustomerWhereFallback = (
        sd?: string | null,
        ed?: string | null
      ) => {
        const custWhere: any = { is_active: 'Y' };
        if (sd && ed) {
          const start = new Date(sd);
          const end = new Date(ed);
          end.setUTCHours(23, 59, 59, 999);
          custWhere.createdate = {
            gte: start,
            lte: end,
          };
        }
        if (depot.id) {
          custWhere.depot_id = depot.id;
        } else if (depot.name) {
          custWhere.customer_depot = { name: depot.name };
        }
        if (route.id) {
          custWhere.route_id = route.id;
        } else if (route.name) {
          custWhere.customer_routes = { name: route.name };
        }
        if (salesman.id) {
          custWhere.salesperson_id = salesman.id;
        } else if (salesman.name) {
          custWhere.customer_users = { name: salesman.name };
        }
        if (channelStr) {
          custWhere.customer_category_customer = {
            category_name: channelStr,
          };
        }
        return custWhere;
      };

      const [visits, productiveVisits, currentNewOutlets, prevNewOutlets] =
        await Promise.all([
          prisma.visits.count({ where: visitWhere }),
          prisma.visits.count({
            where: { ...visitWhere, status: 'productive' },
          }),
          prisma.customers.count({
            where: buildCustomerWhereFallback(
              startDate as string,
              endDate as string
            ),
          }),
          prevStartDate && prevEndDate
            ? prisma.customers.count({
                where: buildCustomerWhereFallback(prevStartDate, prevEndDate),
              })
            : Promise.resolve(0),
        ]);
      if (visits > 0) {
        strikeRate = (productiveVisits / visits) * 100;
      }
      const [
        depotsList,
        salespersonsList,
        routesList,
        brandsList,
        packsList,
        channelsList,
      ] = await Promise.all([
        prisma.depots.findMany({
          where: { is_active: 'Y' },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.users.findMany({
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
        prisma.routes.findMany({
          where: { is_active: 'Y' },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.brands.findMany({
          where: { is_active: 'Y' },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.product_sub_categories.findMany({
          where: { is_active: 'Y' },
          select: { id: true, sub_category_name: true },
          orderBy: { sub_category_name: 'asc' },
        }),
        prisma.customer_category.findMany({
          where: { is_active: 'Y' },
          select: { id: true, category_name: true },
          orderBy: { category_name: 'asc' },
        }),
      ]);

      const CHUNK_SIZE = 2000;
      const customerIdArray = Array.from(uniqueCustomerIds).slice(0, 10000);
      const chunks: number[][] = [];
      for (let i = 0; i < customerIdArray.length; i += CHUNK_SIZE) {
        chunks.push(customerIdArray.slice(i, i + CHUNK_SIZE));
      }
      const chunkResults = await Promise.all(
        chunks.map(chunk =>
          prisma.customers.findMany({
            where: {
              id: { in: chunk },
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
          })
        )
      );
      const mapCustomers = chunkResults.flat();
      const {
        _uniqueCustomerIds: _m,
        _processedInvoiceCount: _mp,
        ...mayAgg
      } = mayAggRaw;
      const {
        _uniqueCustomerIds: _a,
        _processedInvoiceCount: _ap,
        ...aprAgg
      } = aprAggRaw;
      (mayAgg as any).avgStrike = Number(strikeRate.toFixed(1));
      (mayAgg as any).newOutlets = currentNewOutlets;
      (aprAgg as any).newOutlets = prevNewOutlets;
      const responseData = {
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
            channels: channelsList.map((c: any) => ({
              id: c.id,
              name: c.category_name,
            })),
          },
        },
      };

      if (cache.size > 200) {
        const keys = Array.from(cache.keys());
        cache.delete(keys[0]);
      }
      cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: String(error),
      });
    }
  },

  /**
   * Exports a flat Excel file of all sales invoice line items
   * matching the same filters as getDashboardData.
   * One row per invoice_item → fully expanded, no aggregation.
   */
  async exportSalesData(req: Request, res: Response) {
    try {
      const {
        startDate,
        endDate,
        depot_id,
        coordinator_id,
        supervisor_id,
        route_id,
        salesman_id,
        brand_id,
        pack,
        channel,
      } = req.query;

      const depot = parseIdOrName(depot_id);
      const coord = parseIdOrName(coordinator_id);
      const sup = parseIdOrName(supervisor_id);
      const route = parseIdOrName(route_id);
      const salesman = parseIdOrName(salesman_id);
      const brand = parseIdOrName(brand_id);
      const packStr = pack ? String(pack).trim() : null;
      const channelStr = channel ? String(channel).trim() : null;

      const startSql = startDate
        ? escapeSqlString(startDate as string)
        : 'NULL';
      const endSql = endDate
        ? escapeSqlString(`${endDate} 23:59:59.999`)
        : 'NULL';

      const sql = `
        SELECT
            CONVERT(VARCHAR(10), inv.invoice_date, 105) AS EvDate,
            COALESCE(cd.name, crd.name, ud.name, srd.name, 'Unassigned') AS Depot,
            COALESCE(cd_coord.name, 'Unassigned') AS Coordinator,
            COALESCE(cd_sup.name, 'Unassigned') AS Supervisor,
            COALESCE(sp.sap_code, r_sp_u.sap_code, '') AS SellerCode,
            COALESCE(sp.name, r_sp_u.name, 'Unassigned') AS Salesman,
            ISNULL(cust.code, '') AS OutletNumber,
            ISNULL(cust.name, '') AS OutletName,
            ISNULL(cz.name, '') AS Zone,
            COALESCE(cr.name, sr.name, 'Unassigned') AS Route,
            COALESCE(cc.category_name, 'Unassigned') AS CustomerChannel,
            ISNULL(ct.type_name, '') AS CustomerType,
            ISNULL(inv.invoice_number, CAST(inv.id AS VARCHAR)) AS IDInv,
            CAST(cust.longitude AS FLOAT) AS Longtitude,
            CAST(cust.latitude AS FLOAT) AS Lattitude,
            ISNULL(pc.category_name, '') AS Category,
            ISNULL(pf.name, '') AS Flavour,
            ISNULL(pv.name, '') AS Volume,
            COALESCE(b.name, 'Unknown') AS Brand,
            COALESCE(p.sap_code, p.code, '') AS SKUCode,
            COALESCE(p.name, 'Unknown') AS SKU,
            COALESCE(psc.sub_category_name, 'Unknown') AS Pack,
            CAST(
                (CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
                    CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                         THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                         ELSE 0 END
                ) AS FLOAT) AS PhyCase,
            CAST(
                ((CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
                    CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                         THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                         ELSE 0 END
                ) * CAST(ISNULL(p.unit_case_conversion_rate, 1) AS DECIMAL(18, 4))) AS FLOAT) AS UnitCase,
            CAST(
                COALESCE(
                    CAST(ii.total_amount AS DECIMAL(18, 2)),
                    CAST(ISNULL(ii.unit_price, 0) * (CAST(ISNULL(ii.quantity, 0) AS DECIMAL(18, 4)) + 
                        CASE WHEN ISNULL(ii.conversion_factor, 1) > 0 
                             THEN CAST(ISNULL(ii.base_quantity, 0) AS DECIMAL(18, 4)) / CAST(ii.conversion_factor AS DECIMAL(18, 4)) 
                             ELSE 0 END
                    ) AS DECIMAL(18, 2))
                ) AS FLOAT) AS Turnover
        FROM invoices inv
        INNER JOIN invoice_items ii ON ii.parent_id = inv.id
        INNER JOIN products p ON p.id = ii.product_id
        LEFT JOIN product_categories pc ON pc.id = p.category_id
        LEFT JOIN product_flavours pf ON pf.id = p.flavour_id
        LEFT JOIN product_volumes pv ON pv.id = p.volume_id
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN product_sub_categories psc ON psc.id = p.sub_category_id
        LEFT JOIN customers cust ON cust.id = inv.customer_id AND cust.is_active = 'Y'
        LEFT JOIN customer_category cc ON cc.id = cust.customer_category_id
        LEFT JOIN customer_type ct ON ct.id = cust.customer_type_id
        LEFT JOIN zones cz ON cz.id = cust.zones_id
        LEFT JOIN depots cd ON cd.id = cust.depot_id
        LEFT JOIN routes cr ON cr.id = cust.route_id
        LEFT JOIN depots crd ON crd.id = cr.depot_id
        LEFT JOIN users sp ON sp.id = COALESCE(inv.salesperson_id, inv.createdby)
        LEFT JOIN depots ud ON ud.id = sp.depot_id
        OUTER APPLY (
            SELECT TOP 1 u.name, u.sap_code 
            FROM route_salespersons rs_sub 
            INNER JOIN users u ON u.id = rs_sub.user_id 
            WHERE rs_sub.route_id = cust.route_id AND rs_sub.is_active = 'Y'
        ) r_sp_u
        OUTER APPLY (
            SELECT TOP 1 rs_sr.route_id 
            FROM route_salespersons rs_sr 
            WHERE rs_sr.user_id = sp.id AND rs_sr.is_active = 'Y'
        ) sp_r
        LEFT JOIN routes sr ON sr.id = sp_r.route_id
        LEFT JOIN depots srd ON srd.id = sr.depot_id
        OUTER APPLY (
            SELECT TOP 1 u.id, u.name 
            FROM users u 
            WHERE u.id = cd.coordinator_id
            UNION ALL
            SELECT TOP 1 u.id, u.name
            FROM user_depots ud_c
            INNER JOIN users u ON u.id = ud_c.user_id
            INNER JOIN roles r ON r.id = u.role_id
            WHERE ud_c.depot_id = COALESCE(cd.id, crd.id, ud.id, srd.id)
              AND ud_c.is_active = 'Y'
              AND (r.name LIKE '%coordinator%' OR r.role_key LIKE '%coordinator%')
        ) cd_coord
        OUTER APPLY (
            SELECT TOP 1 u.id, u.name 
            FROM users u 
            WHERE u.id = cd.supervisor_id
            UNION ALL
            SELECT TOP 1 u.id, u.name
            FROM user_depots ud_s
            INNER JOIN users u ON u.id = ud_s.user_id
            INNER JOIN roles r ON r.id = u.role_id
            WHERE ud_s.depot_id = COALESCE(cd.id, crd.id, ud.id, srd.id)
              AND ud_s.is_active = 'Y'
              AND (r.name LIKE '%supervisor%' OR r.role_key LIKE '%supervisor%')
        ) cd_sup
        WHERE inv.is_active = 'Y'
          AND (${startSql} IS NULL OR inv.invoice_date >= ${startSql})
          AND (${endSql} IS NULL OR inv.invoice_date <= ${endSql})
          AND (sp.name IS NULL OR (
              LOWER(sp.name) NOT IN ('iuser', 'excel sync admin') 
              AND ISNULL(sp.employee_id, '') <> 'EXCEL_SYNC_01'
              AND ISNULL(sp.email, '') <> 'excel.sync@dcc.com'
          ))
          AND (${salesman.id !== null ? salesman.id : 'NULL'} IS NULL OR inv.salesperson_id = ${salesman.id !== null ? salesman.id : 'NULL'} OR inv.createdby = ${salesman.id !== null ? salesman.id : 'NULL'})
          AND (${escapeSqlString(salesman.name)} IS NULL OR COALESCE(sp.name, r_sp_u.name) = ${escapeSqlString(salesman.name)})
          AND (${depot.id !== null ? depot.id : 'NULL'} IS NULL OR COALESCE(cust.depot_id, cr.depot_id, sp.depot_id, sr.depot_id) = ${depot.id !== null ? depot.id : 'NULL'})
          AND (${escapeSqlString(depot.name)} IS NULL OR COALESCE(cd.name, crd.name, ud.name, srd.name) = ${escapeSqlString(depot.name)})
          AND (${route.id !== null ? route.id : 'NULL'} IS NULL OR COALESCE(cust.route_id, sp_r.route_id) = ${route.id !== null ? route.id : 'NULL'})
          AND (${escapeSqlString(route.name)} IS NULL OR COALESCE(cr.name, sr.name) = ${escapeSqlString(route.name)})
          AND (${escapeSqlString(channelStr)} IS NULL OR COALESCE(cc.category_name, 'Unassigned') = ${escapeSqlString(channelStr)})
          AND (${coord.id !== null ? coord.id : 'NULL'} IS NULL OR cd_coord.id = ${coord.id !== null ? coord.id : 'NULL'})
          AND (${escapeSqlString(coord.name)} IS NULL OR cd_coord.name = ${escapeSqlString(coord.name)})
          AND (${sup.id !== null ? sup.id : 'NULL'} IS NULL OR cd_sup.id = ${sup.id !== null ? sup.id : 'NULL'})
          AND (${escapeSqlString(sup.name)} IS NULL OR cd_sup.name = ${escapeSqlString(sup.name)})
          AND (${brand.id !== null ? brand.id : 'NULL'} IS NULL OR p.brand_id = ${brand.id !== null ? brand.id : 'NULL'})
          AND (${escapeSqlString(brand.name)} IS NULL OR COALESCE(b.name, 'Unknown') = ${escapeSqlString(brand.name)})
          AND (${escapeSqlString(packStr)} IS NULL OR COALESCE(psc.sub_category_name, 'Unknown') = ${escapeSqlString(packStr)})
        ORDER BY inv.invoice_date ASC, inv.id ASC;
      `;

      const flatRows: any[] = await prisma.$queryRawUnsafe(sql);

      /** Build Excel workbook */
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'DCC-SFA';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Sales Data', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
        /** freeze header row */
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      sheet.columns = [
        { header: 'EvDate', key: 'EvDate', width: 13 },
        { header: 'Depot', key: 'Depot', width: 20 },
        { header: 'Coordinator', key: 'Coordinator', width: 22 },
        { header: 'Supervisor', key: 'Supervisor', width: 22 },
        { header: 'SellerCode', key: 'SellerCode', width: 16 },
        { header: 'Salesman', key: 'Salesman', width: 22 },
        { header: 'Outlet Number', key: 'OutletNumber', width: 16 },
        { header: 'Outlet Name', key: 'OutletName', width: 30 },
        { header: 'Zone', key: 'Zone', width: 18 },
        { header: 'Route', key: 'Route', width: 22 },
        { header: 'Customer Channel', key: 'CustomerChannel', width: 20 },
        { header: 'Customer Type', key: 'CustomerType', width: 20 },
        { header: 'IDInv', key: 'IDInv', width: 18 },
        { header: 'Longtitude', key: 'Longtitude', width: 15 },
        { header: 'Lattitude', key: 'Lattitude', width: 15 },
        { header: 'Category', key: 'Category', width: 18 },
        { header: 'Flavour', key: 'Flavour', width: 18 },
        { header: 'Volume', key: 'Volume', width: 15 },
        { header: 'Brand', key: 'Brand', width: 18 },
        { header: 'SKU Code', key: 'SKUCode', width: 16 },
        { header: 'SKU', key: 'SKU', width: 28 },
        { header: 'Pack', key: 'Pack', width: 20 },
        { header: 'PhyCase', key: 'PhyCase', width: 12 },
        { header: 'UnitCase', key: 'UnitCase', width: 12 },
        { header: 'Turnover', key: 'Turnover', width: 18 },
      ];

      /** Add data rows */
      flatRows.forEach(rowData => {
        const row = sheet.addRow(rowData);

        /** right-align numeric columns */
        ['PhyCase', 'UnitCase', 'Turnover'].forEach(key => {
          const colIdx = sheet.columns.findIndex((c: any) => c.key === key);
          if (colIdx >= 0) {
            const cell = row.getCell(colIdx + 1);
            cell.alignment = { horizontal: 'right' };
            if (['Turnover'].includes(key)) {
              cell.numFmt = '#,##0.00';
            } else {
              /** Since UnitCase can be 2.12 */
              cell.numFmt = '#,##0.00';
            }
          }
        });
      });

      /** Stream response */
      const periodLabel =
        startDate && endDate
          ? `${startDate}_to_${endDate}`
          : new Date().toISOString().split('T')[0];
      const filename = `Sales_Control_Tower_${periodLabel}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Length', buffer.byteLength.toString());
      return res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Error exporting sales data:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during export',
        error: String(error),
      });
    }
  },
};
