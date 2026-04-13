import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

interface PriceListSerialized {
  id: number;
  name: string;
  description?: string | null;
  customer_id?: number | null;
  route_id?: number | null;
  depot_id?: number | null;
  customer_category_id?: number | null;
  is_default: string;
  priority: string;
  valid_from?: Date | null;
  valid_to?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  pricelist_item?: any[];
  pricelists_customer?: any;
  pricelists_route?: any;
  pricelists_depot?: any;
}

const serializePriceList = (pl: any): PriceListSerialized => ({
  id: pl.id,
  name: pl.name,
  description: pl.description,
  customer_id: pl.customer_id,
  route_id: pl.route_id,
  depot_id: pl.depot_id,
  customer_category_id: pl.customer_category_id,
  is_default: pl.is_default,
  priority: pl.priority,
  valid_from: pl.valid_from,
  valid_to: pl.valid_to,
  is_active: pl.is_active,
  createdate: pl.createdate,
  createdby: pl.createdby,
  updatedate: pl.updatedate,
  updatedby: pl.updatedby,
  log_inst: pl.log_inst,
  pricelist_item: (pl.pricelist_item || []).map((item: any) => ({
    ...item,
    product: item.pricelist_items_products
      ? {
          id: item.pricelist_items_products.id,
          name: item.pricelist_items_products.name,
          code: item.pricelist_items_products.code,
        }
      : null,
  })),
  pricelists_customer: pl.pricelists_customer,
  pricelists_route: pl.pricelists_route,
  pricelists_depot: pl.pricelists_depot,
});

export const priceListsController = {
  async upsertPriceList(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      if (!data.name || data.name.trim() === '') {
        return res.status(400).send({
          success: false,
          message: 'Price list name is required',
        });
      }

      if (data.is_default === 'Y') {
        const whereCondition = data.id
          ? { is_default: 'Y', is_active: 'Y', id: { not: data.id } }
          : { is_default: 'Y', is_active: 'Y' };

        const existingDefault = await prisma.pricelists.findFirst({
          where: whereCondition,
        });

        if (existingDefault) {
          return res.status(400).send({
            success: false,
            message: 'Only one default price list is allowed',
          });
        }
      }

      const assignments = [
        data.customer_id,
        data.route_id,
        data.depot_id,
        data.customer_category_id,
      ].filter(Boolean);

      if (assignments.length > 1) {
        return res.status(400).send({
          success: false,
          message:
            'Price list can be assigned to only one entity (customer, route, depot, or category)',
        });
      }

      let priceList;

      if (data.id) {
        priceList = await prisma.pricelists.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            customer_id: data.customer_id || null,
            route_id: data.route_id || null,
            depot_id: data.depot_id || null,
            customer_category_id: data.customer_category_id || null,
            is_default: data.is_default || 'N',
            priority: data.priority?.toString() || '1',
            valid_from: data.valid_from ? new Date(data.valid_from) : null,
            valid_to: data.valid_to ? new Date(data.valid_to) : null,
            is_active: data.is_active || 'Y',
            updatedate: new Date(),
            updatedby: userId,
            log_inst: { increment: 1 },
          },
        });
      } else {
        priceList = await prisma.pricelists.create({
          data: {
            name: data.name,
            description: data.description,
            customer_id: data.customer_id || null,
            route_id: data.route_id || null,
            depot_id: data.depot_id || null,
            customer_category_id: data.customer_category_id || null,
            is_default: data.is_default || 'N',
            priority: data.priority?.toString() || '1',
            valid_from: data.valid_from ? new Date(data.valid_from) : null,
            valid_to: data.valid_to ? new Date(data.valid_to) : null,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
          },
        });
      }

      const items = data.pricelist_item || data.priceListItems;
      if (Array.isArray(items)) {
        const existingItems = await prisma.pricelist_items.findMany({
          where: { pricelist_id: priceList.id },
        });

        const requestIds = items
          .map((i: any) => i.id)
          .filter((id: any) => id !== undefined && id !== null) as number[];

        console.log('Request item IDs:', requestIds);
        console.log(
          'Existing items:',
          existingItems.map(e => ({ id: e.id, product_id: e.product_id }))
        );

        if (requestIds.length > 0) {
          await prisma.pricelist_items.deleteMany({
            where: {
              pricelist_id: priceList.id,
              id: { notIn: requestIds },
            },
          });
        } else {
          await prisma.pricelist_items.deleteMany({
            where: { pricelist_id: priceList.id },
          });
        }

        for (const item of items) {
          const itemData = {
            product_id: item.product_id,
            unit_price: item.unit_price,
            discount_percent:
              item.discount_percent !== '' && item.discount_percent !== null
                ? Number(item.discount_percent)
                : null,
            tax_percent:
              item.tax_percent !== '' && item.tax_percent !== null
                ? Number(item.tax_percent)
                : null,
            sub_unit_price:
              item.sub_unit_price !== '' &&
              item.sub_unit_price !== null &&
              item.sub_unit_price !== undefined
                ? item.sub_unit_price
                : null,
            effective_from: item.effective_from
              ? new Date(item.effective_from)
              : null,
            effective_to: item.effective_to
              ? new Date(item.effective_to)
              : null,
            is_active: item.is_active || 'Y',
          };

          console.log('Processing item:', {
            id: item.id,
            product_id: item.product_id,
            data: itemData,
          });

          if (item.id && existingItems.find(e => e.id === item.id)) {
            console.log('Updating item:', item.id);
            await prisma.pricelist_items.update({
              where: { id: item.id },
              data: {
                ...itemData,
                updatedate: new Date(),
                updatedby: userId,
                log_inst: { increment: 1 },
              },
            });
          } else {
            console.log('Creating new item for product:', item.product_id);
            await prisma.pricelist_items.create({
              data: {
                ...itemData,
                pricelist_id: priceList.id,
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
          }
        }
      }

      const finalPriceList = await prisma.pricelists.findUnique({
        where: { id: priceList.id },
        include: {
          pricelist_item: {
            include: { pricelist_items_products: true },
          },
          pricelists_customer: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          pricelists_route: {
            select: {
              id: true,
              name: true,
            },
          },
          pricelists_depot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(200).json({
        message: 'Price list processed successfully',
        data: serializePriceList(finalPriceList),
      });
    } catch (error: any) {
      console.error('Error processing price list:', error);
      res.status(500).json({
        message: 'Error processing price list',
        error: error.message,
      });
    }
  },

  async getAllPriceLists(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        status,
        depot_id,
        route_id,
        customer_id,
        customer_category_id,
        from_date,
        to_date,
        include_items,
        is_default,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { description: { contains: searchLower } },
            {
              pricelist_item: {
                some: {
                  pricelist_items_products: {
                    OR: [
                      { name: { contains: searchLower } },
                      { code: { contains: searchLower } },
                    ],
                  },
                },
              },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(depot_id && { depot_id: Number(depot_id) }),
        ...(route_id && { route_id: Number(route_id) }),
        ...(customer_id && { customer_id: Number(customer_id) }),
        ...(customer_category_id && {
          customer_category_id: Number(customer_category_id),
        }),
        ...(is_default !== undefined && {
          is_default: is_default === 'true' ? 'Y' : 'N',
        }),
        ...(from_date && {
          valid_from: { gte: new Date(from_date as string) },
        }),
        ...(to_date && { valid_to: { lte: new Date(to_date as string) } }),
      };

      const include: any = {
        pricelists_customer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        pricelists_route: {
          select: {
            id: true,
            name: true,
          },
        },
        pricelists_depot: {
          select: {
            id: true,
            name: true,
          },
        },
      };

      if (include_items === 'true' || include_items === true) {
        include.pricelist_item = {
          include: { pricelist_items_products: true },
        };
      } else {
        include.pricelist_item = true;
      }

      const { data, pagination } = await paginate({
        model: prisma.pricelists,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include,
      });

      const totalPriceLists = await prisma.pricelists.count();
      const activePriceLists = await prisma.pricelists.count({
        where: { is_active: 'Y' },
      });
      const inactivePriceLists = await prisma.pricelists.count({
        where: { is_active: 'N' },
      });
      const defaultPriceLists = await prisma.pricelists.count({
        where: { is_default: 'Y' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newPriceListsThisMonth = await prisma.pricelists.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Price lists retrieved successfully',
        data.map((p: any) => serializePriceList(p)),
        200,
        pagination,
        {
          total_price_lists: totalPriceLists,
          active_price_lists: activePriceLists,
          inactive_price_lists: inactivePriceLists,
          default_price_lists: defaultPriceLists,
          new_price_lists_this_month: newPriceListsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get PriceLists Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPriceListsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const priceList = await prisma.pricelists.findUnique({
        where: { id: Number(id) },
        include: {
          pricelist_item: {
            include: { pricelist_items_products: true },
          },
          pricelists_customer: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          pricelists_route: {
            select: {
              id: true,
              name: true,
            },
          },
          pricelists_depot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!priceList)
        return res
          .status(404)
          .send({ success: false, message: 'Price list not found' });

      res.json({
        success: true,
        message: 'Price list fetched successfully',
        data: serializePriceList(priceList),
      });
    } catch (error: any) {
      console.error('Get PriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePriceLists(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;

      const existingPriceList = await prisma.pricelists.findUnique({
        where: { id: Number(id) },
      });

      if (!existingPriceList)
        return res
          .status(404)
          .send({ success: false, message: 'Price list not found' });

      if (existingPriceList.is_default === 'Y') {
        return res.status(400).send({
          success: false,
          message: 'Cannot delete default price list',
        });
      }

      await prisma.pricelist_items.deleteMany({
        where: { pricelist_id: Number(id) },
      });

      await prisma.pricelists.delete({
        where: { id: Number(id) },
      });

      res.send({
        success: true,
        message: 'Price list deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete PriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPriceListForCustomer(req: Request, res: Response) {
    try {
      const { customer_id } = req.params;
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();

      const customerPriceList = await prisma.pricelists.findFirst({
        where: {
          customer_id: Number(customer_id),
          is_active: 'Y',
          valid_from: { lte: targetDate },
          valid_to: { gte: targetDate },
        },
        include: {
          pricelist_item: {
            where: { is_active: 'Y' },
            include: { pricelist_items_products: true },
          },
          pricelists_customer: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: [{ priority: 'asc' }],
      });

      if (customerPriceList) {
        return res.json({
          message: 'Customer price list found',
          data: {
            level: 'CUSTOMER',
            priceList: serializePriceList(customerPriceList),
            reason: `Customer assigned ${customerPriceList.name} price list`,
          },
        });
      }

      const customer = await prisma.customers.findUnique({
        where: { id: Number(customer_id) },
        select: { route_id: true, depot_id: true },
      });

      if (customer?.route_id) {
        const routePriceList = await prisma.pricelists.findFirst({
          where: {
            route_id: customer.route_id,
            is_active: 'Y',
            valid_from: { lte: targetDate },
            valid_to: { gte: targetDate },
          },
          include: {
            pricelist_item: {
              where: { is_active: 'Y' },
              include: { pricelist_items_products: true },
            },
            pricelists_route: {
              select: { id: true, name: true },
            },
          },
        });

        if (routePriceList) {
          return res.json({
            message: 'Route price list found',
            data: {
              level: 'ROUTE',
              priceList: serializePriceList(routePriceList),
              reason: `Customer route assigned ${routePriceList.name} price list`,
            },
          });
        }
      }

      if (customer?.depot_id) {
        const depotPriceList = await prisma.pricelists.findFirst({
          where: {
            depot_id: customer.depot_id,
            is_active: 'Y',
            valid_from: { lte: targetDate },
            valid_to: { gte: targetDate },
          },
          include: {
            pricelist_item: {
              where: { is_active: 'Y' },
              include: { pricelist_items_products: true },
            },
            pricelists_depot: {
              select: { id: true, name: true },
            },
          },
        });

        if (depotPriceList) {
          return res.json({
            message: 'Depot price list found',
            data: {
              level: 'DEPOT',
              priceList: serializePriceList(depotPriceList),
              reason: `Customer depot assigned ${depotPriceList.name} price list`,
            },
          });
        }
      }

      const defaultPriceList = await prisma.pricelists.findFirst({
        where: {
          is_default: 'Y',
          is_active: 'Y',
          valid_from: { lte: targetDate },
          valid_to: { gte: targetDate },
        },
        include: {
          pricelist_item: {
            where: { is_active: 'Y' },
            include: { pricelist_items_products: true },
          },
        },
      });

      if (defaultPriceList) {
        return res.json({
          message: 'Default price list found',
          data: {
            level: 'DEFAULT',
            priceList: serializePriceList(defaultPriceList),
            reason: 'Using default price list',
          },
        });
      }

      res.status(404).json({
        message: 'No valid price list found for customer',
        data: null,
      });
    } catch (error: any) {
      console.error('Get Price List For Customer Error:', error);
      res.status(500).send({ sucess: false, message: error.message });
    }
  },

  // async getProductsAndCustomer(req: Request, res: Response) {
  //   try {
  //     const { salesperson_id } = req.params;
  //     const {
  //       page,
  //       limit,
  //       product_id,
  //       document_date,
  //       customer_id, // ADD customer_id parameter
  //       include_expired_batches = 'false',
  //       batch_status,
  //       serial_status,
  //     } = req.query;

  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 50;

  //     // ADD: Price List Resolution Function
  //     const resolvePriceListForCustomer = async (customerId: number) => {
  //       const targetDate = new Date();

  //       // Priority 1: Customer-specific price list
  //       const customerPriceList = await prisma.pricelists.findFirst({
  //         where: {
  //           customer_id: customerId,
  //           is_active: 'Y',
  //           valid_from: { lte: targetDate },
  //           valid_to: { gte: targetDate },
  //         },
  //         orderBy: [{ priority: 'asc' }],
  //         include: {
  //           pricelist_item: {
  //             where: { is_active: 'Y' },
  //             include: {
  //               pricelist_items_products: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   code: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });

  //       if (customerPriceList) {
  //         return { priceList: customerPriceList, level: 'CUSTOMER' };
  //       }

  //       // Priority 2: Get customer's route and check route-specific price list
  //       const customer = await prisma.customers.findUnique({
  //         where: { id: customerId },
  //         select: { route_id: true, depot_id: true },
  //       });

  //       if (customer?.route_id) {
  //         const routePriceList = await prisma.pricelists.findFirst({
  //           where: {
  //             route_id: customer.route_id,
  //             is_active: 'Y',
  //             valid_from: { lte: targetDate },
  //             valid_to: { gte: targetDate },
  //           },
  //           orderBy: [{ priority: 'asc' }],
  //           include: {
  //             pricelist_item: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 pricelist_items_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         });

  //         if (routePriceList) {
  //           return { priceList: routePriceList, level: 'ROUTE' };
  //         }
  //       }

  //       // Priority 3: Depot-specific price list
  //       if (customer?.depot_id) {
  //         const depotPriceList = await prisma.pricelists.findFirst({
  //           where: {
  //             depot_id: customer.depot_id,
  //             is_active: 'Y',
  //             valid_from: { lte: targetDate },
  //             valid_to: { gte: targetDate },
  //           },
  //           orderBy: [{ priority: 'asc' }],
  //           include: {
  //             pricelist_item: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 pricelist_items_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         });

  //         if (depotPriceList) {
  //           return { priceList: depotPriceList, level: 'DEPOT' };
  //         }
  //       }

  //       // Priority 4: Default price list
  //       const defaultPriceList = await prisma.pricelists.findFirst({
  //         where: {
  //           is_default: 'Y',
  //           is_active: 'Y',
  //           valid_from: { lte: targetDate },
  //           valid_to: { gte: targetDate },
  //         },
  //         orderBy: [{ priority: 'asc' }],
  //         include: {
  //           pricelist_item: {
  //             where: { is_active: 'Y' },
  //             include: {
  //               pricelist_items_products: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   code: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });

  //       return defaultPriceList
  //         ? { priceList: defaultPriceList, level: 'DEFAULT' }
  //         : { priceList: null, level: 'NONE' };
  //     };

  //     // ADD: Resolve price list if customer_id is provided
  //     let resolvedPriceList = null;
  //     if (customer_id) {
  //       resolvedPriceList = await resolvePriceListForCustomer(
  //         Number(customer_id)
  //       );
  //     }

  //     const processVanInventoryItems = async (vanInventories: any[]) => {
  //       let totalQuantity = 0;
  //       let totalRemainingQuantity = 0;
  //       const allProducts = new Set<number>();
  //       let totalBatches = 0;
  //       let totalSerials = 0;

  //       // Create a map of products available in the resolved price list
  //       const priceListProductMap = new Map<number, any>();
  //       if (resolvedPriceList?.priceList) {
  //         resolvedPriceList.priceList.pricelist_item.forEach((item: any) => {
  //           priceListProductMap.set(item.product_id, {
  //             unit_price: item.unit_price,
  //             discount_percent: item.discount_percent,
  //             tax_percent: item.tax_percent,
  //             effective_from: item.effective_from,
  //             effective_to: item.effective_to,
  //             pricelist_item_id: item.id,
  //           });
  //         });
  //       }

  //       const processedVanInventories = vanInventories
  //         .map(vanInventory => {
  //           const products: Map<number, any> = new Map();

  //           for (const item of vanInventory.van_inventory_items_inventory) {
  //             if (
  //               product_id &&
  //               item.product_id !== parseInt(product_id as string, 10)
  //             ) {
  //               continue;
  //             }

  //             // ENHANCEMENT: Only include products that exist in the resolved price list
  //             if (customer_id && !priceListProductMap.has(item.product_id)) {
  //               continue; // Skip products not in price list when customer_id is provided
  //             }

  //             const product = item.van_inventory_items_products;
  //             const batch = item.van_inventory_items_batch_lot;

  //             const trackingType = (
  //               product?.tracking_type || 'none'
  //             ).toLowerCase();

  //             let shouldSkipItem = false;

  //             let allProductBatches: any[] = [];

  //             if (batch && trackingType === 'batch') {
  //               allProductBatches.push({
  //                 id: batch.id,
  //                 batch_lot_id: batch.id,
  //                 batch_number: batch.batch_number,
  //                 lot_number: batch.lot_number,
  //                 manufacturing_date: batch.manufacturing_date,
  //                 expiry_date: batch.expiry_date,
  //                 supplier_name: batch.supplier_name,
  //                 quality_grade: batch.quality_grade,
  //                 quantity: batch.quantity,
  //                 remaining_quantity: batch.remaining_quantity,
  //                 loaded_quantity: item.quantity || 0,
  //               });
  //             }

  //             if (shouldSkipItem) {
  //               continue;
  //             }

  //             // Process serials using normalized trackingType
  //             let serials: any[] = [];
  //             if (trackingType === 'serial') {
  //               const linkedSerial = item.van_inventory_serial;

  //               if (linkedSerial && linkedSerial.status === 'in_van') {
  //                 const warrantyExpired =
  //                   linkedSerial.warranty_expiry &&
  //                   new Date(linkedSerial.warranty_expiry) <= new Date();

  //                 serials = [
  //                   {
  //                     serial_id: linkedSerial.id,
  //                     serial_number: linkedSerial.serial_number,
  //                     status: linkedSerial.status,
  //                     warranty_expiry: linkedSerial.warranty_expiry,
  //                     warranty_expired: warrantyExpired,
  //                     warranty_days_remaining: linkedSerial.warranty_expiry
  //                       ? Math.floor(
  //                           (new Date(linkedSerial.warranty_expiry).getTime() -
  //                             Date.now()) /
  //                             (1000 * 60 * 60 * 24)
  //                         )
  //                       : null,
  //                     customer_id: linkedSerial.customer_id,
  //                     customer: linkedSerial.serial_numbers_customers,
  //                     sold_date: linkedSerial.sold_date,
  //                   },
  //                 ];
  //               }
  //             }

  //             const productId = item.product_id;

  //             if (trackingType === 'serial' && serials.length === 0) {
  //               continue;
  //             }

  //             let itemQuantity = 0;
  //             if (trackingType === 'serial') {
  //               itemQuantity = item.quantity || serials.length;
  //             } else if (
  //               trackingType === 'batch' &&
  //               allProductBatches.length > 0
  //             ) {
  //               itemQuantity = item.quantity || 0;
  //             } else {
  //               itemQuantity = item.quantity || 0;
  //             }

  //             if (!products.has(productId)) {
  //               // ENHANCEMENT: Get price list information for this product
  //               const priceListInfo = priceListProductMap.get(productId);

  //               products.set(productId, {
  //                 product_id: productId,
  //                 product_name: product?.name || null,
  //                 product_code: product?.code || null,
  //                 unit_of_measurment: product.product_unit_of_measurement,
  //                 unit_price: product?.base_price
  //                   ? Number(product.base_price)
  //                   : null,
  //                 tracking_type: product?.tracking_type || 'none',
  //                 quantity: 0,
  //                 batches: [],
  //                 serials: [],
  //                 tax_details: product?.product_tax_master
  //                   ? {
  //                       id: product.product_tax_master.id,
  //                       name: product.product_tax_master.name,
  //                       code: product.product_tax_master.code,
  //                       tax_rate: Number(product.product_tax_master.tax_rate),
  //                       description: product.product_tax_master.description,
  //                     }
  //                   : null,
  //                 // ENHANCEMENT: Add price list information
  //                 price_list_info: priceListInfo
  //                   ? {
  //                       pricelist_item_id: priceListInfo.pricelist_item_id,
  //                       unit_price: priceListInfo.unit_price,
  //                       discount_percent: priceListInfo.discount_percent,
  //                       tax_percent: priceListInfo.tax_percent,
  //                       effective_from: priceListInfo.effective_from,
  //                       effective_to: priceListInfo.effective_to,
  //                     }
  //                   : null,
  //               });
  //             }

  //             const productData = products.get(productId)!;

  //             productData.quantity += itemQuantity;
  //             totalQuantity += itemQuantity;
  //             allProducts.add(productId);

  //             allProductBatches.forEach(batchInfo => {
  //               const existingBatch = productData.batches.find(
  //                 (b: any) => b.batch_lot_id === batchInfo.batch_lot_id
  //               );
  //               if (!existingBatch) {
  //                 productData.batches.push(batchInfo);
  //                 totalRemainingQuantity += batchInfo.remaining_quantity || 0;
  //                 totalBatches++;
  //               } else {
  //                 existingBatch.loaded_quantity =
  //                   (existingBatch.loaded_quantity || 0) +
  //                   (batchInfo.loaded_quantity || 0);
  //               }
  //             });

  //             if (serials.length > 0) {
  //               serials.forEach((serial: any) => {
  //                 if (
  //                   !productData.serials.find(
  //                     (existing: any) => existing.serial_id === serial.serial_id
  //                   )
  //                 ) {
  //                   productData.serials.push(serial);
  //                   totalSerials++;
  //                 }
  //               });
  //             }
  //           }

  //           if (products.size === 0) {
  //             return null;
  //           }

  //           return {
  //             van_inventory_id: vanInventory.id,
  //             document_date: vanInventory.document_date,
  //             status: vanInventory.status,
  //             loading_type: vanInventory.loading_type,
  //             location_id: vanInventory.location_id,
  //             location_type: vanInventory.location_type,
  //             vehicle_id: vanInventory.vehicle_id,
  //             vehicle: vanInventory.vehicle
  //               ? {
  //                   vehicle_id: vanInventory.vehicle.id,
  //                   vehicle_number: vanInventory.vehicle.vehicle_number,
  //                 }
  //               : null,
  //             products: Array.from(products.values()),
  //           };
  //         })
  //         .filter(vanInventory => vanInventory !== null);

  //       return {
  //         vanInventories: processedVanInventories,
  //         totalProducts: allProducts.size,
  //         totalQuantity,
  //         totalRemainingQuantity,
  //         totalBatches,
  //         totalSerials,
  //       };
  //     };

  //     let dateFilter = {};
  //     if (document_date) {
  //       const date = new Date(document_date as string);
  //       if (isNaN(date.getTime())) {
  //         return res.status(400).json({
  //           success: false,
  //           message: 'Invalid document_date format. Use YYYY-MM-DD',
  //         });
  //       }

  //       const startOfDay = new Date(date);
  //       startOfDay.setHours(0, 0, 0, 0);

  //       const endOfDay = new Date(date);
  //       endOfDay.setHours(23, 59, 59, 999);

  //       dateFilter = {
  //         document_date: {
  //           gte: startOfDay,
  //           lte: endOfDay,
  //         },
  //       };
  //     }

  //     if (
  //       !salesperson_id ||
  //       salesperson_id === '' ||
  //       salesperson_id === 'all'
  //     ) {
  //       const allSalespersons = await prisma.users.findMany({
  //         where: {},
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           phone_number: true,
  //           profile_image: true,
  //           user_role: {
  //             select: {
  //               name: true,
  //             },
  //           },
  //         },
  //       });

  //       const consolidatedSalespersons: any[] = [];

  //       for (const salesperson of allSalespersons) {
  //         const vanInventories = await prisma.van_inventory.findMany({
  //           where: {
  //             user_id: salesperson.id,
  //             is_active: 'Y',
  //             status: 'A',
  //             ...dateFilter,
  //           },
  //           select: {
  //             id: true,
  //             status: true,
  //             loading_type: true,
  //             document_date: true,
  //             location_id: true,
  //             location_type: true,
  //             vehicle_id: true,
  //             vehicle: {
  //               select: {
  //                 id: true,
  //                 vehicle_number: true,
  //               },
  //             },
  //             van_inventory_items_inventory: {
  //               select: {
  //                 id: true,
  //                 product_id: true,
  //                 quantity: true,
  //                 batch_lot_id: true,
  //                 serial_id: true,
  //                 unit_price: true,
  //                 van_inventory_items_batch_lot: {
  //                   select: {
  //                     id: true,
  //                     batch_number: true,
  //                     lot_number: true,
  //                     manufacturing_date: true,
  //                     expiry_date: true,
  //                     supplier_name: true,
  //                     quality_grade: true,
  //                     quantity: true,
  //                     remaining_quantity: true,
  //                   },
  //                 },
  //                 van_inventory_serial: {
  //                   select: {
  //                     id: true,
  //                     serial_number: true,
  //                     status: true,
  //                     warranty_expiry: true,
  //                     batch_id: true,
  //                     customer_id: true,
  //                     sold_date: true,
  //                     batch_lots: {
  //                       select: {
  //                         id: true,
  //                         batch_number: true,
  //                         lot_number: true,
  //                         expiry_date: true,
  //                       },
  //                     },
  //                     serial_numbers_customers: {
  //                       select: {
  //                         id: true,
  //                         name: true,
  //                         code: true,
  //                       },
  //                     },
  //                   },
  //                 },
  //                 van_inventory_items_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     base_price: true,
  //                     product_unit_of_measurement: true,
  //                     tracking_type: true,
  //                     tax_id: true,
  //                     product_tax_master: {
  //                       select: {
  //                         id: true,
  //                         name: true,
  //                         code: true,
  //                         tax_rate: true,
  //                         description: true,
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           orderBy: { document_date: 'desc' },
  //         });

  //         if (vanInventories.length === 0) continue;

  //         const {
  //           vanInventories: processedVanInventories,
  //           totalProducts,
  //           totalQuantity,
  //           totalRemainingQuantity,
  //           totalBatches,
  //           totalSerials,
  //         } = await processVanInventoryItems(vanInventories);

  //         if (processedVanInventories.length === 0) continue;

  //         consolidatedSalespersons.push({
  //           salesperson_id: salesperson.id,
  //           salesperson_name: salesperson.name,
  //           salesperson_email: salesperson.email,
  //           salesperson_phone: salesperson.phone_number,
  //           salesperson_profile_image: salesperson.profile_image,
  //           salesperson_role: salesperson.user_role.name,
  //           total_van_inventories: processedVanInventories.length,
  //           total_products: totalProducts,
  //           total_quantity: totalQuantity,
  //           total_remaining_quantity: totalRemainingQuantity,
  //           total_batches: totalBatches,
  //           total_serials: totalSerials,
  //           van_inventories: processedVanInventories,
  //           // ENHANCEMENT: Add price list information
  //           price_list: resolvedPriceList
  //             ? {
  //                 id: resolvedPriceList.priceList?.id,
  //                 name: resolvedPriceList.priceList?.name,
  //                 level: resolvedPriceList.level,
  //                 priority: resolvedPriceList.priceList?.priority,
  //                 valid_from: resolvedPriceList.priceList?.valid_from,
  //                 valid_to: resolvedPriceList.priceList?.valid_to,
  //               }
  //             : null,
  //         });
  //       }

  //       const startIndex = (pageNum - 1) * limitNum;
  //       const paginatedData = consolidatedSalespersons.slice(
  //         startIndex,
  //         startIndex + limitNum
  //       );

  //       const pagination = {
  //         current_page: pageNum,
  //         per_page: limitNum,
  //         total_pages: Math.ceil(consolidatedSalespersons.length / limitNum),
  //         total_count: consolidatedSalespersons.length,
  //         has_next:
  //           pageNum < Math.ceil(consolidatedSalespersons.length / limitNum),
  //         has_prev: pageNum > 1,
  //       };

  //       return res.json({
  //         success: true,
  //         message: 'All salesperson inventory data retrieved successfully',
  //         data: paginatedData,
  //         filters: {
  //           document_date: document_date || null,
  //           product_id: product_id || null,
  //           customer_id: customer_id || null,
  //           batch_status: batch_status || null,
  //           serial_status: serial_status || null,
  //         },
  //         pagination,
  //       });
  //     }

  //     const salespersonIdNum = parseInt(salesperson_id as string, 10);

  //     const salesperson = await prisma.users.findUnique({
  //       where: { id: salespersonIdNum },
  //       select: {
  //         id: true,
  //         name: true,
  //         email: true,
  //         phone_number: true,
  //         profile_image: true,
  //         user_role: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!salesperson) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Salesperson not found',
  //       });
  //     }

  //     const vanInventories = await prisma.van_inventory.findMany({
  //       where: {
  //         user_id: salespersonIdNum,
  //         is_active: 'Y',
  //         status: 'A',
  //         ...dateFilter,
  //       },
  //       select: {
  //         id: true,
  //         status: true,
  //         loading_type: true,
  //         document_date: true,
  //         location_id: true,
  //         location_type: true,
  //         vehicle_id: true,
  //         vehicle: {
  //           select: {
  //             id: true,
  //             vehicle_number: true,
  //           },
  //         },
  //         van_inventory_items_inventory: {
  //           select: {
  //             id: true,
  //             product_id: true,
  //             quantity: true,
  //             batch_lot_id: true,
  //             serial_id: true,
  //             unit_price: true,
  //             van_inventory_items_batch_lot: {
  //               select: {
  //                 id: true,
  //                 batch_number: true,
  //                 lot_number: true,
  //                 manufacturing_date: true,
  //                 expiry_date: true,
  //                 supplier_name: true,
  //                 quality_grade: true,
  //                 quantity: true,
  //                 remaining_quantity: true,
  //               },
  //             },
  //             van_inventory_serial: {
  //               select: {
  //                 id: true,
  //                 serial_number: true,
  //                 status: true,
  //                 warranty_expiry: true,
  //                 batch_id: true,
  //                 customer_id: true,
  //                 sold_date: true,
  //                 batch_lots: {
  //                   select: {
  //                     id: true,
  //                     batch_number: true,
  //                     lot_number: true,
  //                     expiry_date: true,
  //                   },
  //                 },
  //                 serial_numbers_customers: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                   },
  //                 },
  //               },
  //             },
  //             van_inventory_items_products: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 code: true,
  //                 base_price: true,
  //                 product_unit_of_measurement: true,
  //                 tracking_type: true,
  //                 tax_id: true,
  //                 product_tax_master: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     tax_rate: true,
  //                     description: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: { document_date: 'desc' },
  //     });

  //     if (vanInventories.length === 0) {
  //       return res.json({
  //         success: true,
  //         message: 'No inventory found for this salesperson',
  //         data: {
  //           salesperson_id: salesperson.id,
  //           salesperson_name: salesperson.name,
  //           salesperson_email: salesperson.email,
  //           salesperson_phone: salesperson.phone_number,
  //           salesperson_role: salesperson.user_role.name,
  //           salesperson_profile_image: salesperson.profile_image,
  //           total_van_inventories: 0,
  //           total_products: 0,
  //           total_quantity: 0,
  //           total_remaining_quantity: 0,
  //           total_batches: 0,
  //           total_serials: 0,
  //           van_inventories: [],
  //           // ENHANCEMENT: Add price list information
  //           price_list: resolvedPriceList
  //             ? {
  //                 id: resolvedPriceList.priceList?.id,
  //                 name: resolvedPriceList.priceList?.name,
  //                 level: resolvedPriceList.level,
  //                 priority: resolvedPriceList.priceList?.priority,
  //                 valid_from: resolvedPriceList.priceList?.valid_from,
  //                 valid_to: resolvedPriceList.priceList?.valid_to,
  //               }
  //             : null,
  //         },
  //         filters: {
  //           document_date: document_date || null,
  //           product_id: product_id || null,
  //           customer_id: customer_id || null,
  //           batch_status: batch_status || null,
  //           serial_status: serial_status || null,
  //         },
  //       });
  //     }

  //     const {
  //       vanInventories: processedVanInventories,
  //       totalProducts,
  //       totalQuantity,
  //       totalRemainingQuantity,
  //       totalBatches,
  //       totalSerials,
  //     } = await processVanInventoryItems(vanInventories);

  //     const startIndex = (pageNum - 1) * limitNum;
  //     const paginatedVanInventories = processedVanInventories.slice(
  //       startIndex,
  //       startIndex + limitNum
  //     );

  //     const pagination = {
  //       current_page: pageNum,
  //       per_page: limitNum,
  //       total_pages: Math.ceil(processedVanInventories.length / limitNum),
  //       total_count: processedVanInventories.length,
  //       has_next:
  //         pageNum < Math.ceil(processedVanInventories.length / limitNum),
  //       has_prev: pageNum > 1,
  //     };

  //     res.json({
  //       success: true,
  //       message: 'Salesperson inventory retrieved successfully',
  //       data: {
  //         salesperson_id: salesperson.id,
  //         salesperson_name: salesperson.name,
  //         salesperson_email: salesperson.email,
  //         salesperson_phone: salesperson.phone_number,
  //         salesperson_profile_image: salesperson.profile_image,
  //         total_van_inventories: processedVanInventories.length,
  //         total_products: totalProducts,
  //         total_quantity: totalQuantity,
  //         total_remaining_quantity: totalRemainingQuantity,
  //         total_batches: totalBatches,
  //         total_serials: totalSerials,
  //         van_inventories: paginatedVanInventories,
  //         // ENHANCEMENT: Add price list information
  //         price_list: resolvedPriceList
  //           ? {
  //               id: resolvedPriceList.priceList?.id,
  //               name: resolvedPriceList.priceList?.name,
  //               level: resolvedPriceList.level,
  //               priority: resolvedPriceList.priceList?.priority,
  //               valid_from: resolvedPriceList.priceList?.valid_from,
  //               valid_to: resolvedPriceList.priceList?.valid_to,
  //             }
  //           : null,
  //       },
  //       filters: {
  //         document_date: document_date || null,
  //         product_id: product_id || null,
  //         customer_id: customer_id || null,
  //         batch_status: batch_status || null,
  //         serial_status: serial_status || null,
  //       },
  //       pagination,
  //     });
  //   } catch (error: any) {
  //     console.error('Get Salesperson Inventory Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve salesperson inventory',
  //       error: error.message,
  //     });
  //   }
  // },

  async getProductsAndCustomer(req: Request, res: Response) {
    try {
      const { salesperson_id } = req.params;
      const {
        page,
        limit,
        product_id,
        document_date,
        customer_id,
        include_expired_batches = 'false',
        batch_status,
        serial_status,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      const resolvePriceListForCustomer = async (
        customerId: number,
        vanInventoryProductIds: number[]
      ) => {
        const targetDate = new Date();

        const getPriceListWithMatchingProducts = async (whereClause: any) => {
          const priceList = await prisma.pricelists.findFirst({
            where: whereClause,
            orderBy: [{ priority: 'asc' }],
            include: {
              pricelist_item: {
                where: {
                  is_active: 'Y',
                  product_id: { in: vanInventoryProductIds },
                },
                include: {
                  pricelist_items_products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          });

          return priceList && priceList.pricelist_item.length > 0
            ? priceList
            : null;
        };

        const customerPriceList = await getPriceListWithMatchingProducts({
          customer_id: customerId,
          is_active: 'Y',
          valid_from: { lte: targetDate },
          valid_to: { gte: targetDate },
        });

        if (customerPriceList) {
          return { priceList: customerPriceList, level: 'CUSTOMER' };
        }

        const customer = await prisma.customers.findUnique({
          where: { id: customerId },
          select: { route_id: true, depot_id: true },
        });

        if (customer?.route_id) {
          const routePriceList = await getPriceListWithMatchingProducts({
            route_id: customer.route_id,
            is_active: 'Y',
            valid_from: { lte: targetDate },
            valid_to: { gte: targetDate },
          });

          if (routePriceList) {
            return { priceList: routePriceList, level: 'ROUTE' };
          }
        }

        if (customer?.depot_id) {
          const depotPriceList = await getPriceListWithMatchingProducts({
            depot_id: customer.depot_id,
            is_active: 'Y',
            valid_from: { lte: targetDate },
            valid_to: { gte: targetDate },
          });

          if (depotPriceList) {
            return { priceList: depotPriceList, level: 'DEPOT' };
          }
        }

        const defaultPriceList = await getPriceListWithMatchingProducts({
          is_default: 'Y',
          is_active: 'Y',
          valid_from: { lte: targetDate },
          valid_to: { gte: targetDate },
        });

        return defaultPriceList
          ? { priceList: defaultPriceList, level: 'DEFAULT' }
          : { priceList: null, level: 'NONE' };
      };

      const processVanInventoryItems = async (
        vanInventories: any[],
        resolvedPriceList: any
      ) => {
        let totalQuantity = 0;
        let totalRemainingQuantity = 0;
        const allProducts = new Set<number>();
        let totalBatches = 0;
        let totalSerials = 0;

        const priceListProductMap = new Map<number, any>();
        if (resolvedPriceList?.priceList) {
          const priceList = resolvedPriceList.priceList as any;
          priceList.pricelist_item.forEach((item: any) => {
            priceListProductMap.set(item.product_id, {
              unit_price: item.unit_price,
              discount_percent: item.discount_percent,
              tax_percent: item.tax_percent,
              effective_from: item.effective_from,
              effective_to: item.effective_to,
              pricelist_item_id: item.id,
            });
          });
        }

        const processedVanInventories = vanInventories
          .map(vanInventory => {
            const products: Map<number, any> = new Map();

            for (const item of vanInventory.van_inventory_items_inventory) {
              if (
                product_id &&
                item.product_id !== parseInt(product_id as string, 10)
              ) {
                continue;
              }

              if (customer_id && !priceListProductMap.has(item.product_id)) {
                continue;
              }

              const product = item.van_inventory_items_products;
              const batch = item.van_inventory_items_batch_lot;

              const trackingType = (
                product?.tracking_type || 'none'
              ).toLowerCase();

              let shouldSkipItem = false;

              let allProductBatches: any[] = [];

              if (batch && trackingType === 'batch') {
                allProductBatches.push({
                  id: batch.id,
                  batch_lot_id: batch.id,
                  batch_number: batch.batch_number,
                  lot_number: batch.lot_number,
                  manufacturing_date: batch.manufacturing_date,
                  expiry_date: batch.expiry_date,
                  supplier_name: batch.supplier_name,
                  quality_grade: batch.quality_grade,
                  quantity: batch.quantity,
                  remaining_quantity: batch.remaining_quantity,
                  loaded_quantity: item.quantity || 0,
                });
              }

              if (shouldSkipItem) {
                continue;
              }

              let serials: any[] = [];
              if (trackingType === 'serial') {
                const linkedSerial = item.van_inventory_serial;

                if (linkedSerial && linkedSerial.status === 'in_van') {
                  const warrantyExpired =
                    linkedSerial.warranty_expiry &&
                    new Date(linkedSerial.warranty_expiry) <= new Date();

                  serials = [
                    {
                      serial_id: linkedSerial.id,
                      serial_number: linkedSerial.serial_number,
                      status: linkedSerial.status,
                      warranty_expiry: linkedSerial.warranty_expiry,
                      warranty_expired: warrantyExpired,
                      warranty_days_remaining: linkedSerial.warranty_expiry
                        ? Math.floor(
                            (new Date(linkedSerial.warranty_expiry).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null,
                      customer_id: linkedSerial.customer_id,
                      customer: linkedSerial.serial_numbers_customers,
                      sold_date: linkedSerial.sold_date,
                    },
                  ];
                }
              }

              const productId = item.product_id;

              if (trackingType === 'serial' && serials.length === 0) {
                continue;
              }

              let itemQuantity = 0;
              if (trackingType === 'serial') {
                itemQuantity = item.quantity || serials.length;
              } else if (
                trackingType === 'batch' &&
                allProductBatches.length > 0
              ) {
                itemQuantity = item.quantity || 0;
              } else {
                itemQuantity = item.quantity || 0;
              }

              if (!products.has(productId)) {
                const priceListInfo = priceListProductMap.get(productId);

                products.set(productId, {
                  product_id: productId,
                  product_name: product?.name || null,
                  product_code: product?.code || null,
                  unit_of_measurment: product.product_unit_of_measurement,
                  unit_price: product?.base_price
                    ? Number(product.base_price)
                    : null,
                  tracking_type: product?.tracking_type || 'none',
                  quantity: 0,
                  batches: [],
                  serials: [],
                  tax_details: product?.product_tax_master
                    ? {
                        id: product.product_tax_master.id,
                        name: product.product_tax_master.name,
                        code: product.product_tax_master.code,
                        tax_rate: Number(product.product_tax_master.tax_rate),
                        description: product.product_tax_master.description,
                      }
                    : null,
                  price_list_info: priceListInfo
                    ? {
                        pricelist_item_id: priceListInfo.pricelist_item_id,
                        unit_price: priceListInfo.unit_price,
                        discount_percent: priceListInfo.discount_percent,
                        tax_percent: priceListInfo.tax_percent,
                        effective_from: priceListInfo.effective_from,
                        effective_to: priceListInfo.effective_to,
                      }
                    : null,
                });
              }

              const productData = products.get(productId)!;

              productData.quantity += itemQuantity;
              totalQuantity += itemQuantity;
              allProducts.add(productId);

              allProductBatches.forEach(batchInfo => {
                const existingBatch = productData.batches.find(
                  (b: any) => b.batch_lot_id === batchInfo.batch_lot_id
                );
                if (!existingBatch) {
                  productData.batches.push(batchInfo);
                  totalRemainingQuantity += batchInfo.remaining_quantity || 0;
                  totalBatches++;
                } else {
                  existingBatch.loaded_quantity =
                    (existingBatch.loaded_quantity || 0) +
                    (batchInfo.loaded_quantity || 0);
                }
              });

              if (serials.length > 0) {
                serials.forEach((serial: any) => {
                  if (
                    !productData.serials.find(
                      (existing: any) => existing.serial_id === serial.serial_id
                    )
                  ) {
                    productData.serials.push(serial);
                    totalSerials++;
                  }
                });
              }
            }

            if (products.size === 0) {
              return null;
            }

            return {
              van_inventory_id: vanInventory.id,
              document_date: vanInventory.document_date,
              status: vanInventory.status,
              loading_type: vanInventory.loading_type,
              location_id: vanInventory.location_id,
              location_type: vanInventory.location_type,
              vehicle_id: vanInventory.vehicle_id,
              vehicle: vanInventory.vehicle
                ? {
                    vehicle_id: vanInventory.vehicle.id,
                    vehicle_number: vanInventory.vehicle.vehicle_number,
                  }
                : null,
              products: Array.from(products.values()),
            };
          })
          .filter(vanInventory => vanInventory !== null);

        return {
          vanInventories: processedVanInventories,
          totalProducts: allProducts.size,
          totalQuantity,
          totalRemainingQuantity,
          totalBatches,
          totalSerials,
        };
      };

      let dateFilter = {};
      if (document_date) {
        const date = new Date(document_date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid document_date format. Use YYYY-MM-DD',
          });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
          document_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }

      if (
        !salesperson_id ||
        salesperson_id === '' ||
        salesperson_id === 'all'
      ) {
        const allSalespersons = await prisma.users.findMany({
          where: {},
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            profile_image: true,
            user_role: {
              select: {
                name: true,
              },
            },
          },
        });

        const consolidatedSalespersons: any[] = [];

        for (const salesperson of allSalespersons) {
          const vanInventories = await prisma.van_inventory.findMany({
            where: {
              user_id: salesperson.id,
              is_active: 'Y',
              status: 'A',
              ...dateFilter,
            },
            select: {
              id: true,
              status: true,
              loading_type: true,
              document_date: true,
              location_id: true,
              location_type: true,
              vehicle_id: true,
              vehicle: {
                select: {
                  id: true,
                  vehicle_number: true,
                },
              },
              van_inventory_items_inventory: {
                select: {
                  id: true,
                  product_id: true,
                  quantity: true,
                  batch_lot_id: true,
                  serial_id: true,
                  unit_price: true,
                  van_inventory_items_batch_lot: {
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
                  van_inventory_serial: {
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
                        select: {
                          id: true,
                          name: true,
                          code: true,
                        },
                      },
                    },
                  },
                  van_inventory_items_products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      base_price: true,
                      product_unit_of_measurement: true,
                      tracking_type: true,
                      tax_id: true,
                      product_tax_master: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          tax_rate: true,
                          description: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { document_date: 'desc' },
          });

          if (vanInventories.length === 0) continue;

          const vanInventoryProductIds = vanInventories.flatMap(vi =>
            vi.van_inventory_items_inventory.map(item => item.product_id)
          );

          let resolvedPriceList = null;
          if (customer_id) {
            resolvedPriceList = await resolvePriceListForCustomer(
              Number(customer_id),
              vanInventoryProductIds
            );
          }

          const {
            vanInventories: processedVanInventories,
            totalProducts,
            totalQuantity,
            totalRemainingQuantity,
            totalBatches,
            totalSerials,
          } = await processVanInventoryItems(vanInventories, resolvedPriceList);

          if (processedVanInventories.length === 0) continue;

          consolidatedSalespersons.push({
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_profile_image: salesperson.profile_image,
            salesperson_role: salesperson.user_role.name,
            total_van_inventories: processedVanInventories.length,
            total_products: totalProducts,
            total_quantity: totalQuantity,
            total_remaining_quantity: totalRemainingQuantity,
            total_batches: totalBatches,
            total_serials: totalSerials,
            van_inventories: processedVanInventories,
            price_list: resolvedPriceList
              ? {
                  id: resolvedPriceList.priceList?.id,
                  name: resolvedPriceList.priceList?.name,
                  level: resolvedPriceList.level,
                  priority: resolvedPriceList.priceList?.priority,
                  valid_from: resolvedPriceList.priceList?.valid_from,
                  valid_to: resolvedPriceList.priceList?.valid_to,
                }
              : null,
          });
        }

        const startIndex = (pageNum - 1) * limitNum;
        const paginatedData = consolidatedSalespersons.slice(
          startIndex,
          startIndex + limitNum
        );

        const pagination = {
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(consolidatedSalespersons.length / limitNum),
          total_count: consolidatedSalespersons.length,
          has_next:
            pageNum < Math.ceil(consolidatedSalespersons.length / limitNum),
          has_prev: pageNum > 1,
        };

        return res.json({
          success: true,
          message: 'All salesperson inventory data retrieved successfully',
          data: paginatedData,
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            customer_id: customer_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
          pagination,
        });
      }

      const salespersonIdNum = parseInt(salesperson_id as string, 10);

      const salesperson = await prisma.users.findUnique({
        where: { id: salespersonIdNum },
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          profile_image: true,
          user_role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!salesperson) {
        return res.status(404).json({
          success: false,
          message: 'Salesperson not found',
        });
      }

      const vanInventories = await prisma.van_inventory.findMany({
        where: {
          user_id: salespersonIdNum,
          is_active: 'Y',
          status: 'A',
          ...dateFilter,
        },
        select: {
          id: true,
          status: true,
          loading_type: true,
          document_date: true,
          location_id: true,
          location_type: true,
          vehicle_id: true,
          vehicle: {
            select: {
              id: true,
              vehicle_number: true,
            },
          },
          van_inventory_items_inventory: {
            select: {
              id: true,
              product_id: true,
              quantity: true,
              batch_lot_id: true,
              serial_id: true,
              unit_price: true,
              van_inventory_items_batch_lot: {
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
              van_inventory_serial: {
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
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
              van_inventory_items_products: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  base_price: true,
                  product_unit_of_measurement: true,
                  tracking_type: true,
                  tax_id: true,
                  product_tax_master: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      tax_rate: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { document_date: 'desc' },
      });

      if (vanInventories.length === 0) {
        return res.json({
          success: true,
          message: 'No inventory found for this salesperson',
          data: {
            salesperson_id: salesperson.id,
            salesperson_name: salesperson.name,
            salesperson_email: salesperson.email,
            salesperson_phone: salesperson.phone_number,
            salesperson_role: salesperson.user_role.name,
            salesperson_profile_image: salesperson.profile_image,
            total_van_inventories: 0,
            total_products: 0,
            total_quantity: 0,
            total_remaining_quantity: 0,
            total_batches: 0,
            total_serials: 0,
            van_inventories: [],
            price_list: null,
          },
          filters: {
            document_date: document_date || null,
            product_id: product_id || null,
            customer_id: customer_id || null,
            batch_status: batch_status || null,
            serial_status: serial_status || null,
          },
        });
      }

      const vanInventoryProductIds = vanInventories.flatMap(vi =>
        vi.van_inventory_items_inventory.map(item => item.product_id)
      );

      let resolvedPriceList = null;
      if (customer_id) {
        resolvedPriceList = await resolvePriceListForCustomer(
          Number(customer_id),
          vanInventoryProductIds
        );
      }

      const {
        vanInventories: processedVanInventories,
        totalProducts,
        totalQuantity,
        totalRemainingQuantity,
        totalBatches,
        totalSerials,
      } = await processVanInventoryItems(vanInventories, resolvedPriceList);

      const startIndex = (pageNum - 1) * limitNum;
      const paginatedVanInventories = processedVanInventories.slice(
        startIndex,
        startIndex + limitNum
      );

      const pagination = {
        current_page: pageNum,
        per_page: limitNum,
        total_pages: Math.ceil(processedVanInventories.length / limitNum),
        total_count: processedVanInventories.length,
        has_next:
          pageNum < Math.ceil(processedVanInventories.length / limitNum),
        has_prev: pageNum > 1,
      };

      res.json({
        success: true,
        message: 'Salesperson inventory retrieved successfully',
        data: {
          salesperson_id: salesperson.id,
          salesperson_name: salesperson.name,
          salesperson_email: salesperson.email,
          salesperson_phone: salesperson.phone_number,
          salesperson_profile_image: salesperson.profile_image,
          total_van_inventories: processedVanInventories.length,
          total_products: totalProducts,
          total_quantity: totalQuantity,
          total_remaining_quantity: totalRemainingQuantity,
          total_batches: totalBatches,
          total_serials: totalSerials,
          van_inventories: paginatedVanInventories,
          price_list: resolvedPriceList
            ? {
                id: resolvedPriceList.priceList?.id,
                name: resolvedPriceList.priceList?.name,
                level: resolvedPriceList.level,
                priority: resolvedPriceList.priceList?.priority,
                valid_from: resolvedPriceList.priceList?.valid_from,
                valid_to: resolvedPriceList.priceList?.valid_to,
              }
            : null,
        },
        filters: {
          document_date: document_date || null,
          product_id: product_id || null,
          customer_id: customer_id || null,
          batch_status: batch_status || null,
          serial_status: serial_status || null,
        },
        pagination,
      });
    } catch (error: any) {
      console.error('Get Salesperson Inventory Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve salesperson inventory',
        error: error.message,
      });
    }
  },
};
