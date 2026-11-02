import { Request, Response, NextFunction } from 'express';
import prisma from '../../configs/prisma.client';
import { isHiddenUser } from '../../configs/hiddenUsers.config';
import { getDepotStaffLookup } from '../../utils/depotStaff.util';

/**
 * Escapes values for safe CSV formatting compliant with RFC 4180.
 *
 * @param {any} val Input value
 * @returns {string} Escaped CSV cell value
 */
const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Formats date into DD/MM/YYYY string to match Excel template.
 *
 * @param {Date | string | null | undefined} date Input date
 * @returns {string} Formatted date string
 */
const formatDateDMY = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats date into ISO string to match Excel template.
 *
 * @param {Date | string | null | undefined} date Input date
 * @returns {string} Formatted ISO date string
 */
const formatDateISO = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
};

/**
 * Controller for Excel Live Sync and Data Integration.
 * Exclusively serves flat CSV streams matching the Data Requirement Format template:
 * 1. Sales Data (/excel/sales-data)
 * 2. Outlet Master (/excel/outlet-master)
 * 3. Survey Data (/excel/survey-data)
 * 4. Van Load and Unload Detail (/excel/van-load-unload)
 */
export const excelSyncController = {
  /**
   * 1. Sales Data Endpoint (CSV Only)
   * Headers: EvDate, Depot, Coordinator, Supervisor, SellerCode, Salesman, Outlet Number,
   * Outlet Name, Zone, Route, Customer Channel, Customer Type, IDInv, Batch, Category, Flavour,
   * Volume, Brand, SKU Code, SKU, Pack, PhyCase, UnitCase, Turnover.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} _next Express next middleware
   */
  async getSalesData(req: Request, res: Response, _next: NextFunction) {
    try {
      const {
        start_date,
        end_date,
        from_date,
        to_date,
        status,
        customer_id,
        depot_id,
        zone_id,
        zones_id,
        route_id,
        salesperson_id,
        sales_person_id,
        brand_id,
      } = req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const BATCH_SIZE = 5000;

      const invoiceWhere: any = { is_active: 'Y' };
      if (status && status !== 'all') {
        invoiceWhere.status = status;
      }
      if (customer_id) {
        invoiceWhere.customer_id = Number(customer_id);
      }

      const spId = salesperson_id || sales_person_id;
      if (spId) {
        invoiceWhere.salesperson_id = Number(spId);
      }

      const targetDepotId = depot_id ? Number(depot_id) : undefined;
      const targetZoneId =
        zone_id || zones_id ? Number(zone_id || zones_id) : undefined;
      const targetRouteId = route_id ? Number(route_id) : undefined;

      if (targetDepotId || targetZoneId || targetRouteId) {
        invoiceWhere.invoices_customers = {
          ...(targetDepotId ? { depot_id: targetDepotId } : {}),
          ...(targetZoneId ? { zones_id: targetZoneId } : {}),
          ...(targetRouteId ? { route_id: targetRouteId } : {}),
        };
      }

      if (startDate || endDate) {
        invoiceWhere.invoice_date = {};
        if (startDate) invoiceWhere.invoice_date.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          invoiceWhere.invoice_date.lte = end;
        }
      }

      const itemWhere: any = { invoices: invoiceWhere };
      if (brand_id) {
        itemWhere.invoice_items_products = { brand_id: Number(brand_id) };
      }

      const headers = [
        'EvDate',
        'Depot',
        'Coordinator',
        'Supervisor',
        'SellerCode',
        'Salesman',
        'Outlet Number',
        'Outlet Name',
        'Zone',
        'Route',
        'Customer Channel',
        'Customer Type',
        'IDInv',
        'Batch',
        'Category',
        'Flavour',
        'Volume',
        'Brand',
        'SKU Code',
        'SKU',
        'Pack',
        'PhyCase',
        'UnitCase',
        'Turnover',
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=sales_data_${Date.now()}.csv`
      );
      res.write(headers.join(',') + '\r\n');

      const staffLookup = await getDepotStaffLookup();

      let hasLineItems = true;
      let lastItemId: number | null = null;
      let totalExported = 0;
      let hasMore = true;

      while (hasMore) {
        const batch: any[] = await prisma.invoice_items.findMany({
          where: itemWhere,
          take: BATCH_SIZE,
          ...(lastItemId !== null
            ? { skip: 1, cursor: { id: lastItemId } }
            : {}),
          orderBy: { id: 'desc' },
          include: {
            invoices: {
              include: {
                invoices_customers: {
                  include: {
                    customer_depot: true,
                    customer_zones: true,
                    customer_routes: true,
                    customer_channel_customer: true,
                    customer_type_customer: true,
                  },
                },
                invoices_salesperson: true,
              },
            },
            invoice_items_products: {
              include: {
                product_categories_products: true,
                product_flavours_products: true,
                product_volumes_products: true,
                product_brands: true,
                product_types_products: true,
                product_unit_of_measurement: true,
              },
            },
          },
        });

        if (!batch || batch.length === 0) {
          if (totalExported === 0) {
            hasLineItems = false;
          }
          break;
        }

        const lines: string[] = [];
        for (const item of batch) {
          const inv = item.invoices;
          const cust = inv?.invoices_customers;
          const sp = inv?.invoices_salesperson;
          if (isHiddenUser(sp)) continue;
          const prod = item.invoice_items_products;
          const depot = cust?.customer_depot;

          const staff = staffLookup.resolveStaff({
            customerDepot: depot,
            salesperson: sp,
            depotName: depot?.name,
          });

          const phyCase = Number(item.quantity) || 0;
          const conversionRate = Number(prod?.unit_case_conversion_rate) || 1;
          const unitCase = Number((phyCase * conversionRate).toFixed(3));
          const turnover = Number(item.total_amount) || 0;

          lines.push(
            [
              escapeCsv(formatDateDMY(inv?.invoice_date)),
              escapeCsv(staff.depotName || depot?.name || ''),
              escapeCsv(staff.coordinatorName || ''),
              escapeCsv(staff.supervisorName || ''),
              escapeCsv(sp?.employee_id || sp?.sap_code || ''),
              escapeCsv(sp?.name || ''),
              escapeCsv(cust?.code || ''),
              escapeCsv(cust?.name || ''),
              escapeCsv(cust?.customer_zones?.name || ''),
              escapeCsv(
                cust?.customer_routes?.code || cust?.customer_routes?.name || ''
              ),
              escapeCsv(cust?.customer_channel_customer?.channel_name || ''),
              escapeCsv(cust?.customer_type_customer?.type_name || ''),
              escapeCsv(inv?.invoice_number || ''),
              escapeCsv(item.notes || ''),
              escapeCsv(prod?.product_categories_products?.category_name || ''),
              escapeCsv(prod?.product_flavours_products?.name || ''),
              escapeCsv(prod?.product_volumes_products?.name || ''),
              escapeCsv(prod?.product_brands?.name || ''),
              escapeCsv(prod?.code || ''),
              escapeCsv(prod?.name || item.product_name || ''),
              escapeCsv(
                prod?.product_types_products?.name ||
                  prod?.product_unit_of_measurement?.name ||
                  item.unit ||
                  ''
              ),
              escapeCsv(phyCase),
              escapeCsv(unitCase),
              escapeCsv(turnover),
            ].join(',')
          );
        }

        if (lines.length > 0) {
          res.write(lines.join('\r\n') + '\r\n');
        }

        totalExported += batch.length;
        lastItemId = batch[batch.length - 1].id;
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      if (!hasLineItems) {
        /**
         * Fallback to invoice header level when line items are not populated
         */
        let lastInvId: number | null = null;
        let hasMoreInv = true;

        while (hasMoreInv) {
          const batchInvoices: any[] = await prisma.invoices.findMany({
            where: invoiceWhere,
            take: BATCH_SIZE,
            ...(lastInvId !== null
              ? { skip: 1, cursor: { id: lastInvId } }
              : {}),
            orderBy: { id: 'desc' },
            include: {
              invoices_customers: {
                include: {
                  customer_depot: true,
                  customer_zones: true,
                  customer_routes: true,
                  customer_channel_customer: true,
                  customer_type_customer: true,
                },
              },
              invoices_salesperson: true,
            },
          });

          if (!batchInvoices || batchInvoices.length === 0) break;

          const lines: string[] = [];
          for (const inv of batchInvoices) {
            const cust = inv.invoices_customers;
            const sp = inv.invoices_salesperson;
            if (isHiddenUser(sp)) continue;
            const depot = cust?.customer_depot;

            const staff = staffLookup.resolveStaff({
              customerDepot: depot,
              salesperson: sp,
              depotName: depot?.name,
            });

            lines.push(
              [
                escapeCsv(formatDateDMY(inv.invoice_date)),
                escapeCsv(staff.depotName || depot?.name || ''),
                escapeCsv(staff.coordinatorName || ''),
                escapeCsv(staff.supervisorName || ''),
                escapeCsv(sp?.employee_id || sp?.sap_code || ''),
                escapeCsv(sp?.name || ''),
                escapeCsv(cust?.code || ''),
                escapeCsv(cust?.name || ''),
                escapeCsv(cust?.customer_zones?.name || ''),
                escapeCsv(
                  cust?.customer_routes?.code ||
                    cust?.customer_routes?.name ||
                    ''
                ),
                escapeCsv(cust?.customer_channel_customer?.channel_name || ''),
                escapeCsv(cust?.customer_type_customer?.type_name || ''),
                escapeCsv(inv.invoice_number),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(''),
                escapeCsv(0),
                escapeCsv(0),
                escapeCsv(Number(inv.total_amount) || 0),
              ].join(',')
            );
          }

          if (lines.length > 0) {
            res.write(lines.join('\r\n') + '\r\n');
          }

          totalExported += batchInvoices.length;
          lastInvId = batchInvoices[batchInvoices.length - 1].id;
          if (batchInvoices.length < BATCH_SIZE) {
            hasMoreInv = false;
          }
        }
      }

      return res.end();
    } catch (error: any) {
      console.error('Excel Sales Data Export Error:', error);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res
          .status(500)
          .send(`Error: ${error.message || 'Failed to export sales data'}`);
      }
      return res.end();
    }
  },

  /**
   * 2. Outlet Master Endpoint (CSV Only)
   * Headers: Outlet Code, Outlet Name, Depot, Zone, Route, Outlet Type,
   * Outlet Channel, Outlet Category, Region, District, Contact Person, Phone Number, Latitude, Longitude.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} _next Express next middleware
   */
  async getOutletMaster(req: Request, res: Response, _next: NextFunction) {
    try {
      const { depot_id, zone_id, route_id, search } = req.query;

      const BATCH_SIZE = 5000;
      const where: any = { is_active: 'Y' };

      if (depot_id) where.depot_id = Number(depot_id);
      if (zone_id) where.zones_id = Number(zone_id);
      if (route_id) where.route_id = Number(route_id);

      if (search) {
        const searchStr = String(search).trim();
        where.OR = [
          { name: { contains: searchStr } },
          { code: { contains: searchStr } },
          { contact_person: { contains: searchStr } },
          { phone_number: { contains: searchStr } },
        ];
      }

      const headers = [
        'Outlet Code',
        'Outlet Name',
        'Depot',
        'Zone',
        'Route',
        'Outlet Type',
        'Outlet Channel',
        'Outlet Category',
        'Region',
        'District',
        'Contact Person',
        'Phone Number',
        'Latitude',
        'Longitude',
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=outlet_master_${Date.now()}.csv`
      );
      res.write(headers.join(',') + '\r\n');

      let lastCustId: number | null = null;
      let totalExported = 0;
      let hasMore = true;

      while (hasMore) {
        const customers: any[] = await prisma.customers.findMany({
          where,
          take: BATCH_SIZE,
          ...(lastCustId !== null
            ? { skip: 1, cursor: { id: lastCustId } }
            : {}),
          orderBy: { id: 'asc' },
          include: {
            customer_depot: true,
            customer_zones: true,
            customer_routes: true,
            customer_type_customer: true,
            customer_channel_customer: true,
            customer_category_customer: true,
            customers_regions: true,
            customers_districts: true,
          },
        });

        if (!customers || customers.length === 0) break;

        const lines: string[] = [];
        for (const c of customers) {
          lines.push(
            [
              escapeCsv(c.code || ''),
              escapeCsv(c.name || ''),
              escapeCsv(c.customer_depot?.name || ''),
              escapeCsv(c.customer_zones?.name || ''),
              escapeCsv(
                c.customer_routes?.code || c.customer_routes?.name || ''
              ),
              escapeCsv(c.customer_type_customer?.type_name || c.type || ''),
              escapeCsv(c.customer_channel_customer?.channel_name || ''),
              escapeCsv(c.customer_category_customer?.category_name || ''),
              escapeCsv(c.customers_regions?.name || ''),
              escapeCsv(c.customers_districts?.name || ''),
              escapeCsv(c.contact_person || ''),
              escapeCsv(c.phone_number || ''),
              escapeCsv(c.latitude ? String(c.latitude) : ''),
              escapeCsv(c.longitude ? String(c.longitude) : ''),
            ].join(',')
          );
        }

        if (lines.length > 0) {
          res.write(lines.join('\r\n') + '\r\n');
        }

        totalExported += customers.length;
        lastCustId = customers[customers.length - 1].id;
        if (customers.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      return res.end();
    } catch (error: any) {
      console.error('Excel Outlet Master Export Error:', error);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res
          .status(500)
          .send(`Error: ${error.message || 'Failed to export outlet master'}`);
      }
      return res.end();
    }
  },

  /**
   * 3. Survey Data Endpoint (CSV Only)
   * Headers: Response ID, Date, Salesperson, Route code, Customer, Customer code,
   * Customer type, Location, Product, Qty not available.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} _next Express next middleware
   */
  async getSurveyData(req: Request, res: Response, _next: NextFunction) {
    try {
      const { start_date, end_date, from_date, to_date } = req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const BATCH_SIZE = 5000;

      const where: any = {
        survey_answer_responses: {
          is_active: 'Y',
        },
      };

      if (startDate || endDate) {
        where.survey_answer_responses.submitted_at = {};
        if (startDate) {
          where.survey_answer_responses.submitted_at.gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.survey_answer_responses.submitted_at.lte = end;
        }
      }

      const headers = [
        'Response ID',
        'Date',
        'Salesperson',
        'Route code',
        'Customer',
        'Customer code',
        'Customer type',
        'Location',
        'Product',
        'Qty not available',
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=survey_data_${Date.now()}.csv`
      );
      res.write(headers.join(',') + '\r\n');

      let lastAnsId: number | null = null;
      let totalExported = 0;
      let hasMore = true;

      while (hasMore) {
        const surveyAnswers: any[] = await prisma.survey_answers.findMany({
          where,
          take: BATCH_SIZE,
          ...(lastAnsId !== null ? { skip: 1, cursor: { id: lastAnsId } } : {}),
          orderBy: { id: 'desc' },
          include: {
            survey_answer_responses: {
              include: {
                survey_responses_submitted_by_users: true,
                survey_response_customer: {
                  include: {
                    customer_routes: true,
                    customer_type_customer: true,
                  },
                },
              },
            },
            survey_answers_products: true,
            survey_fields: true,
          },
        });

        if (!surveyAnswers || surveyAnswers.length === 0) break;

        const lines: string[] = [];
        for (const ans of surveyAnswers) {
          const resp = ans.survey_answer_responses;
          const cust = resp?.survey_response_customer;
          const user = resp?.survey_responses_submitted_by_users;
          if (isHiddenUser(user)) continue;
          const prod = ans.survey_answers_products;

          lines.push(
            [
              escapeCsv(ans.parent_id),
              escapeCsv(formatDateISO(resp?.submitted_at || resp?.createdate)),
              escapeCsv(user?.name || ''),
              escapeCsv(
                cust?.customer_routes?.code || cust?.customer_routes?.name || ''
              ),
              escapeCsv(cust?.name || ''),
              escapeCsv(cust?.code || ''),
              escapeCsv(
                cust?.customer_type_customer?.type_name || cust?.type || ''
              ),
              escapeCsv(resp?.location || '–'),
              escapeCsv(prod?.name || ans.survey_fields?.label || ''),
              escapeCsv(ans.answer || '0'),
            ].join(',')
          );
        }

        if (lines.length > 0) {
          res.write(lines.join('\r\n') + '\r\n');
        }

        totalExported += surveyAnswers.length;
        lastAnsId = surveyAnswers[surveyAnswers.length - 1].id;
        if (surveyAnswers.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      return res.end();
    } catch (error: any) {
      console.error('Excel Survey Data Export Error:', error);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res
          .status(500)
          .send(`Error: ${error.message || 'Failed to export survey data'}`);
      }
      return res.end();
    }
  },

  /**
   * 4. Van Load and Unload Detail Endpoint (CSV Only)
   * Headers: Date, Type, Van Inventory No, User Name, Product, Tracking Type, Quantity, Batch / Serials.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} _next Express next middleware
   */
  async getVanLoadUnload(req: Request, res: Response, _next: NextFunction) {
    try {
      const { start_date, end_date, from_date, to_date, type, user_id } =
        req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const BATCH_SIZE = 5000;

      const where: any = {
        is_cancelled: 'N',
        van_inventory_items_inventory: {
          is_active: 'Y',
          is_cancelled: 'N',
        },
      };

      if (type) {
        const typeStr = String(type).trim().toUpperCase();
        if (typeStr === 'LOAD' || typeStr === 'L') {
          where.van_inventory_items_inventory.loading_type = 'L';
        } else if (typeStr === 'UNLOAD' || typeStr === 'U') {
          where.van_inventory_items_inventory.loading_type = 'U';
        }
      }

      if (user_id) {
        where.van_inventory_items_inventory.user_id = Number(user_id);
      }

      if (startDate || endDate) {
        where.van_inventory_items_inventory.document_date = {};
        if (startDate) {
          where.van_inventory_items_inventory.document_date.gte = new Date(
            startDate
          );
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.van_inventory_items_inventory.document_date.lte = end;
        }
      }

      const headers = [
        'Date',
        'Type',
        'Van Inventory No',
        'User Name',
        'Product',
        'Tracking Type',
        'Quantity',
        'Batch / Serials',
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=van_load_unload_${Date.now()}.csv`
      );
      res.write(headers.join(',') + '\r\n');

      let lastItemId: number | null = null;
      let totalExported = 0;
      let hasMore = true;

      while (hasMore) {
        const items: any[] = await prisma.van_inventory_items.findMany({
          where,
          take: BATCH_SIZE,
          ...(lastItemId !== null
            ? { skip: 1, cursor: { id: lastItemId } }
            : {}),
          orderBy: { id: 'desc' },
          include: {
            van_inventory_items_inventory: {
              include: {
                van_inventory_users: true,
              },
            },
            van_inventory_items_products: true,
            van_inventory_items_batch_lot: true,
            van_inventory_serial: true,
          },
        });

        if (!items || items.length === 0) break;

        const lines: string[] = [];
        for (const item of items) {
          const inv = item.van_inventory_items_inventory;
          const prod = item.van_inventory_items_products;
          const user = inv?.van_inventory_users;
          if (isHiddenUser(user)) continue;

          const dateVal = inv?.document_date || inv?.createdate;
          const typeVal =
            inv?.loading_type === 'L'
              ? 'Load'
              : inv?.loading_type === 'U'
                ? 'Unload'
                : inv?.loading_type || 'Load';

          const trackingType =
            prod?.tracking_type ||
            (item.batch_lot_id ? 'Batch' : item.serial_id ? 'Serial' : 'Batch');

          const batchOrSerial =
            item.van_inventory_items_batch_lot?.batch_number ||
            item.van_inventory_serial?.serial_number ||
            item.notes ||
            '';

          lines.push(
            [
              escapeCsv(formatDateISO(dateVal)),
              escapeCsv(typeVal),
              escapeCsv(inv?.id || item.parent_id),
              escapeCsv(user?.name || ''),
              escapeCsv(prod?.name || item.product_name || ''),
              escapeCsv(trackingType),
              escapeCsv(Number(item.quantity) || 0),
              escapeCsv(batchOrSerial),
            ].join(',')
          );
        }

        if (lines.length > 0) {
          res.write(lines.join('\r\n') + '\r\n');
        }

        totalExported += items.length;
        lastItemId = items[items.length - 1].id;
        if (items.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      return res.end();
    } catch (error: any) {
      console.error('Excel Van Load Unload Export Error:', error);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res
          .status(500)
          .send(
            `Error: ${error.message || 'Failed to export van load unload data'}`
          );
      }
      return res.end();
    }
  },
};
