import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import ExcelJS from 'exceljs';

const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000;

const invoiceSelect = {
  id: true,
  invoice_date: true,
  invoice_number: true,
  customer_id: true,
  invoice_items: {
    select: {
      quantity: true,
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
      const cacheKey = JSON.stringify(req.query);
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
          const dName =
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
          let cName = depotData?.depots_coodrinator?.name || '';
          let supName = depotData?.depots_supervisior?.name || '';

          if (depotData?.user_depots_depot_id) {
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
            const pc = Number(item.quantity) || 0;
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
      const visits = await prisma.visits.count({ where: visitWhere });
      if (visits > 0) {
        const productiveVisits = await prisma.visits.count({
          where: { ...visitWhere, status: 'productive' },
        });
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
      const mapCustomers = chunkResults.flat().slice(0, 500);
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

      /** Build the same invoice WHERE used by the dashboard */
      const where: any = { is_active: 'Y' };
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setUTCHours(23, 59, 59, 999);
        where.invoice_date = { gte: start, lte: end };
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
      if (coordinator_id) {
        const cid = parseInt(coordinator_id as string, 10);
        if (!custWhere.customer_depot) custWhere.customer_depot = {};
        if (!isNaN(cid)) custWhere.customer_depot.coordinator_id = cid;
        else
          custWhere.customer_depot.depots_coodrinator = {
            name: coordinator_id as string,
          };
      }
      if (supervisor_id) {
        const sid = parseInt(supervisor_id as string, 10);
        if (!custWhere.customer_depot) custWhere.customer_depot = {};
        if (!isNaN(sid)) custWhere.customer_depot.supervisor_id = sid;
        else
          custWhere.customer_depot.depots_supervisior = {
            name: supervisor_id as string,
          };
      }
      if (channel)
        custWhere.customer_category_customer = {
          category_name: channel as string,
        };
      if (Object.keys(custWhere).length > 1)
        where.invoices_customers = custWhere;

      /** Fetch invoices with full relations */
      const invoices = await prisma.invoices.findMany({
        where,
        select: invoiceSelect,
        orderBy: { invoice_date: 'asc' },
      });

      /** Build flat rows, one per invoice_item */
      const brandFilter = brand_id ? (brand_id as string) : null;
      const packFilter = pack ? (pack as string) : null;

      const flatRows: any[] = [];

      for (const inv of invoices) {
        const dateStr = inv.invoice_date
          ? new Date(inv.invoice_date).toLocaleDateString('en-GB')
          : '';
        const route =
          (inv as any).invoices_customers?.customer_routes?.name ||
          (inv as any).invoices_salesperson?.route_salespersons?.[0]?.route
            ?.name ||
          '';
        const routeSalesman = (inv as any).invoices_customers?.customer_routes
          ?.salespersons?.[0]?.user;
        const salesman =
          (inv as any).invoices_salesperson?.name || routeSalesman?.name || '';
        const sellerCode =
          (inv as any).invoices_salesperson?.sap_code ||
          routeSalesman?.sap_code ||
          '';
        const depotData =
          (inv as any).invoices_customers?.customer_depot ||
          (inv as any).invoices_customers?.customer_routes?.route_depots ||
          (inv as any).invoices_salesperson?.user_depot ||
          (inv as any).invoices_salesperson?.route_salespersons?.[0]?.route
            ?.route_depots;
        const depot = depotData?.name || '';

        let coordinator = depotData?.depots_coodrinator?.name || '';
        let supervisor = depotData?.depots_supervisior?.name || '';

        /** Check assigned users if they have the appropriate role */
        if (depotData?.user_depots_depot_id) {
          const assignedUsers = depotData.user_depots_depot_id
            .map((ud: any) => ud.users_depots_users)
            .filter(Boolean);

          const coordUser = assignedUsers.find(
            (u: any) => u.user_role?.name === 'Sales coordinator'
          );
          if (coordUser) coordinator = coordUser.name;

          const superUser = assignedUsers.find(
            (u: any) => u.user_role?.name === 'Area Sales Supervisor'
          );
          if (superUser) supervisor = superUser.name;
        }
        const outletCode = (inv as any).invoices_customers?.code || '';
        const outletName = (inv as any).invoices_customers?.name || '';
        const channel =
          (inv as any).invoices_customers?.customer_category_customer
            ?.category_name || '';
        const typeName =
          (inv as any).invoices_customers?.customer_type_customer?.type_name ||
          '';
        const zoneName =
          (inv as any).invoices_customers?.customer_zones?.name || '';
        const lat = (inv as any).invoices_customers?.latitude || '';
        const lng = (inv as any).invoices_customers?.longitude || '';

        for (const item of (inv as any).invoice_items) {
          const product = item.invoice_items_products;
          /** apply brand / pack filters if set */
          if (brandFilter) {
            const bid = parseInt(brandFilter, 10);
            if (!isNaN(bid) && product?.brand_id !== bid) continue;
            if (isNaN(bid) && product?.product_brands?.name !== brandFilter)
              continue;
          }
          if (
            packFilter &&
            product?.product_sub_categories_products?.sub_category_name !==
              packFilter
          )
            continue;

          flatRows.push({
            EvDate: dateStr,
            Depot: depot,
            Coordinator: coordinator,
            Supervisor: supervisor,
            SellerCode: sellerCode,
            Salesman: salesman,
            OutletNumber: outletCode,
            OutletName: outletName,
            Zone: zoneName,
            Route: route,
            CustomerChannel: channel,
            CustomerType: typeName,
            IDInv: (inv as any).invoice_number || inv.id,
            Longtitude: lng ? Number(lng) : '',
            Lattitude: lat ? Number(lat) : '',
            Category: product?.product_categories_products?.category_name || '',
            Flavour: product?.product_flavours_products?.name || '',
            Volume: product?.product_volumes_products?.name || '',
            Brand: product?.product_brands?.name || '',
            SKUCode: product?.sap_code || product?.code || '',
            SKU: product?.name || '',
            Pack:
              product?.product_sub_categories_products?.sub_category_name || '',
            PhyCase: Number(item.quantity) || 0,
            UnitCase:
              Number(item.quantity) *
              Number(product?.unit_case_conversion_rate || 1),
            Turnover:
              Number(item.total_amount) ||
              Number(item.quantity) * Number(item.unit_price || 0),
          });
        }
      }

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
