import { Request, Response, NextFunction } from 'express';
import prisma from '../../configs/prisma.client';

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
   * @param {NextFunction} next Express next middleware
   */
  async getSalesData(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        start_date,
        end_date,
        from_date,
        to_date,
        status,
        customer_id,
        limit,
      } = req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const take = limit ? Math.min(Number(limit), 50000) : 25000;

      const invoiceWhere: any = { is_active: 'Y' };
      if (status && status !== 'all') {
        invoiceWhere.status = status;
      }
      if (customer_id) {
        invoiceWhere.customer_id = Number(customer_id);
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

      /**
       * First attempt line-item level export through invoice_items
       */
      const invoiceItems = await prisma.invoice_items.findMany({
        where: { invoices: invoiceWhere },
        take,
        orderBy: { id: 'desc' },
        include: {
          invoices: {
            include: {
              invoices_customers: {
                include: {
                  customer_depot: {
                    include: {
                      depots_coodrinator: true,
                      depots_supervisior: true,
                    },
                  },
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

      const csvLines: string[] = [headers.join(',')];

      if (invoiceItems && invoiceItems.length > 0) {
        for (const item of invoiceItems) {
          const inv = item.invoices;
          const cust = inv?.invoices_customers;
          const sp = inv?.invoices_salesperson;
          const prod = item.invoice_items_products;
          const depot = cust?.customer_depot;

          const phyCase = Number(item.quantity) || 0;
          const conversionRate = Number(prod?.unit_case_conversion_rate) || 1;
          const unitCase = Number((phyCase * conversionRate).toFixed(3));
          const turnover = Number(item.total_amount) || 0;

          csvLines.push(
            [
              escapeCsv(formatDateDMY(inv?.invoice_date)),
              escapeCsv(depot?.name || ''),
              escapeCsv(depot?.depots_coodrinator?.name || ''),
              escapeCsv(depot?.depots_supervisior?.name || ''),
              escapeCsv(sp?.employee_id || sp?.sap_code || ''),
              escapeCsv(sp?.name || ''),
              escapeCsv(cust?.code || ''),
              escapeCsv(cust?.name || ''),
              escapeCsv(cust?.customer_zones?.name || ''),
              escapeCsv(cust?.customer_routes?.code || cust?.customer_routes?.name || ''),
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
      } else {
        /**
         * Fallback to invoice header level when line items are not populated
         */
        const invoices = await prisma.invoices.findMany({
          where: invoiceWhere,
          take,
          orderBy: { invoice_date: 'desc' },
          include: {
            invoices_customers: {
              include: {
                customer_depot: {
                  include: {
                    depots_coodrinator: true,
                    depots_supervisior: true,
                  },
                },
                customer_zones: true,
                customer_routes: true,
                customer_channel_customer: true,
                customer_type_customer: true,
              },
            },
            invoices_salesperson: true,
          },
        });

        for (const inv of invoices) {
          const cust = inv.invoices_customers;
          const sp = inv.invoices_salesperson;
          const depot = cust?.customer_depot;

          csvLines.push(
            [
              escapeCsv(formatDateDMY(inv.invoice_date)),
              escapeCsv(depot?.name || ''),
              escapeCsv(depot?.depots_coodrinator?.name || ''),
              escapeCsv(depot?.depots_supervisior?.name || ''),
              escapeCsv(sp?.employee_id || sp?.sap_code || ''),
              escapeCsv(sp?.name || ''),
              escapeCsv(cust?.code || ''),
              escapeCsv(cust?.name || ''),
              escapeCsv(cust?.customer_zones?.name || ''),
              escapeCsv(cust?.customer_routes?.code || cust?.customer_routes?.name || ''),
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
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=sales_data_${Date.now()}.csv`
      );
      return res.status(200).send(csvLines.join('\r\n'));
    } catch (error: any) {
      console.error('Excel Sales Data Export Error:', error);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.status(500).send(`Error: ${error.message || 'Failed to export sales data'}`);
    }
  },

  /**
   * 2. Outlet Master Endpoint (CSV Only)
   * Headers: Outlet Code, Outlet Name, Depot, Zone, Route, Outlet Type,
   * Outlet Channel, Outlet Category, Region, District, Contact Person, Phone Number, Latitude, Longitude.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next middleware
   */
  async getOutletMaster(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        depot_id,
        zone_id,
        route_id,
        search,
        limit,
      } = req.query;

      const take = limit ? Math.min(Number(limit), 50000) : 25000;
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

      const customers = await prisma.customers.findMany({
        where,
        take,
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

      const csvLines: string[] = [headers.join(',')];
      for (const c of customers) {
        csvLines.push(
          [
            escapeCsv(c.code || ''),
            escapeCsv(c.name || ''),
            escapeCsv(c.customer_depot?.name || ''),
            escapeCsv(c.customer_zones?.name || ''),
            escapeCsv(c.customer_routes?.code || c.customer_routes?.name || ''),
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

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=outlet_master_${Date.now()}.csv`
      );
      return res.status(200).send(csvLines.join('\r\n'));
    } catch (error: any) {
      console.error('Excel Outlet Master Export Error:', error);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.status(500).send(`Error: ${error.message || 'Failed to export outlet master'}`);
    }
  },

  /**
   * 3. Survey Data Endpoint (CSV Only)
   * Headers: Response ID, Date, Salesperson, Route code, Customer, Customer code,
   * Customer type, Location, Product, Qty not available.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next middleware
   */
  async getSurveyData(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        start_date,
        end_date,
        from_date,
        to_date,
        limit,
      } = req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const take = limit ? Math.min(Number(limit), 50000) : 25000;

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

      const surveyAnswers = await prisma.survey_answers.findMany({
        where,
        take,
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

      const csvLines: string[] = [headers.join(',')];
      for (const ans of surveyAnswers) {
        const resp = ans.survey_answer_responses;
        const cust = resp?.survey_response_customer;
        const user = resp?.survey_responses_submitted_by_users;
        const prod = ans.survey_answers_products;

        csvLines.push(
          [
            escapeCsv(ans.parent_id),
            escapeCsv(formatDateISO(resp?.submitted_at || resp?.createdate)),
            escapeCsv(user?.name || ''),
            escapeCsv(cust?.customer_routes?.code || cust?.customer_routes?.name || ''),
            escapeCsv(cust?.name || ''),
            escapeCsv(cust?.code || ''),
            escapeCsv(cust?.customer_type_customer?.type_name || cust?.type || ''),
            escapeCsv(resp?.location || '–'),
            escapeCsv(prod?.name || ans.survey_fields?.label || ''),
            escapeCsv(ans.answer || '0'),
          ].join(',')
        );
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=survey_data_${Date.now()}.csv`
      );
      return res.status(200).send(csvLines.join('\r\n'));
    } catch (error: any) {
      console.error('Excel Survey Data Export Error:', error);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.status(500).send(`Error: ${error.message || 'Failed to export survey data'}`);
    }
  },

  /**
   * 4. Van Load and Unload Detail Endpoint (CSV Only)
   * Headers: Date, Type, Van Inventory No, User Name, Product, Tracking Type, Quantity, Batch / Serials.
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next middleware
   */
  async getVanLoadUnload(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        start_date,
        end_date,
        from_date,
        to_date,
        type,
        user_id,
        limit,
      } = req.query;

      const startDate = (start_date || from_date) as string | undefined;
      const endDate = (end_date || to_date) as string | undefined;
      const take = limit ? Math.min(Number(limit), 50000) : 25000;

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

      const items = await prisma.van_inventory_items.findMany({
        where,
        take,
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

      const csvLines: string[] = [headers.join(',')];

      for (const item of items) {
        const inv = item.van_inventory_items_inventory;
        const prod = item.van_inventory_items_products;
        const user = inv?.van_inventory_users;

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

        csvLines.push(
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

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=van_load_unload_${Date.now()}.csv`
      );
      return res.status(200).send(csvLines.join('\r\n'));
    } catch (error: any) {
      console.error('Excel Van Load Unload Export Error:', error);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.status(500).send(`Error: ${error.message || 'Failed to export van load unload data'}`);
    }
  },
};
