import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

interface PriceListSerialized {
  id: number;
  name: string;
  description?: string | null;
  customer_id?: number | null;
  route_id?: number | null;
  depot_id?: number | null;
  base_pricelist_id?: number | null;
  factor?: number | string | null;
  customer_category_id?: number | null;
  is_default: string;
  priority: string;
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
  base_pricelist?: any;
}

const serializePriceList = (pl: any): PriceListSerialized => ({
  id: pl.id,
  name: pl.name,
  description: pl.description,
  depot_id: pl.depot_id,
  base_pricelist_id: pl.base_pricelist_id,
  factor: pl.factor?.toString() || null,
  is_default: pl.is_default,
  priority: pl.priority,
  is_active: pl.is_active,
  createdate: pl.createdate,
  createdby: pl.createdby,
  updatedate: pl.updatedate,
  updatedby: pl.updatedby,
  log_inst: pl.log_inst,
  pricelist_item: (pl.pricelist_item || []).map((item: any) => {
    const rawSpecialPrices =
      item.pricelist_item_special_prices || item.special_prices || [];

    const specialPrices = rawSpecialPrices.map((sp: any) => ({
      id: sp.id,
      valid_from: sp.valid_from,
      valid_to: sp.valid_to,
      route_id: sp.route_id,
      customer_id: sp.customer_id,
      customer_category_id: sp.customer_category_id,
      sale_price: sp.sale_price?.toString() || '0',
      sale_sub_unit_price: sp.sale_sub_unit_price?.toString() || null,
      tax_percent: sp.tax_percent?.toString() || null,
      discount_percent: sp.discount_percent?.toString() || null,
      is_active: sp.is_active,
      special_customer: sp.special_customer,
      special_route: sp.special_route,
      special_customer_category: sp.special_customer_category,
    }));

    return {
      id: item.id,
      product_id: item.product_id,
      unit_price: item.unit_price,
      uom: item.uom,
      discount_percent: item.discount_percent?.toString() || null,
      tax_percent: item.tax_percent?.toString() || null,
      sub_unit_price: item.sub_unit_price,
      is_active: item.is_active,
      product: item.pricelist_items_products
        ? {
            id: item.pricelist_items_products.id,
            name: item.pricelist_items_products.name,
            code: item.pricelist_items_products.code,
          }
        : null,
      special_prices: specialPrices,
    };
  }),
  pricelists_depot: pl.pricelists_depot,
  base_pricelist: pl.base_pricelist,
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

      let priceList;

      if (data.id) {
        priceList = await prisma.pricelists.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            depot_id: data.depot_id || null,
            base_pricelist_id: data.base_pricelist_id || null,
            factor: data.factor ? Number(data.factor) : null,
            is_default: data.is_default || 'N',
            priority: data.priority?.toString() || '1',
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
            depot_id: data.depot_id || null,
            base_pricelist_id: data.base_pricelist_id || null,
            factor: data.factor ? Number(data.factor) : null,
            is_default: data.is_default || 'N',
            priority: data.priority?.toString() || '1',
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
            is_active: item.is_active || 'Y',
          };

          if (item.id && existingItems.find(e => e.id === item.id)) {
            const updatedItem = await prisma.pricelist_items.update({
              where: { id: item.id },
              data: {
                ...itemData,
                updatedate: new Date(),
                updatedby: userId,
                log_inst: { increment: 1 },
              },
            });

            if (Array.isArray(item.special_prices)) {
              const existingSpecialPrices =
                await prisma.pricelist_item_special_prices.findMany({
                  where: { pricelist_item_id: updatedItem.id },
                });

              const requestSpecialIds = item.special_prices
                .map((sp: any) => sp.id)
                .filter(Boolean) as number[];

              await prisma.pricelist_item_special_prices.deleteMany({
                where: {
                  pricelist_item_id: updatedItem.id,
                  id: {
                    notIn: requestSpecialIds.length ? requestSpecialIds : [0],
                  },
                },
              });

              for (const sp of item.special_prices) {
                const spData = {
                  valid_from: sp.valid_from ? new Date(sp.valid_from) : null,
                  valid_to: sp.valid_to ? new Date(sp.valid_to) : null,
                  route_id: sp.route_id || null,
                  customer_id: sp.customer_id || null,
                  customer_category_id: sp.customer_category_id || null,
                  sale_price: Number(sp.sale_price),
                  sale_sub_unit_price: sp.sale_sub_unit_price
                    ? Number(sp.sale_sub_unit_price)
                    : null,
                  tax_percent: sp.tax_percent ? Number(sp.tax_percent) : null,
                  discount_percent: sp.discount_percent
                    ? Number(sp.discount_percent)
                    : null,
                  is_active: sp.is_active || 'Y',
                };

                if (sp.id && existingSpecialPrices.find(e => e.id === sp.id)) {
                  await prisma.pricelist_item_special_prices.update({
                    where: { id: sp.id },
                    data: {
                      ...spData,
                      updatedate: new Date(),
                      updatedby: userId,
                      log_inst: { increment: 1 },
                    },
                  });
                } else {
                  await prisma.pricelist_item_special_prices.create({
                    data: {
                      ...spData,
                      pricelist_item_id: updatedItem.id,
                      createdate: new Date(),
                      createdby: userId,
                      log_inst: 1,
                    },
                  });
                }
              }
            }
          } else {
            const newItem = await prisma.pricelist_items.create({
              data: {
                ...itemData,
                pricelist_id: priceList.id,
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });

            if (Array.isArray(item.special_prices)) {
              for (const sp of item.special_prices) {
                const spData = {
                  valid_from: sp.valid_from ? new Date(sp.valid_from) : null,
                  valid_to: sp.valid_to ? new Date(sp.valid_to) : null,
                  route_id: sp.route_id || null,
                  customer_id: sp.customer_id || null,
                  customer_category_id: sp.customer_category_id || null,
                  sale_price: Number(sp.sale_price),
                  sale_sub_unit_price: sp.sale_sub_unit_price
                    ? Number(sp.sale_sub_unit_price)
                    : null,
                  tax_percent: sp.tax_percent ? Number(sp.tax_percent) : null,
                  discount_percent: sp.discount_percent
                    ? Number(sp.discount_percent)
                    : null,
                  is_active: sp.is_active || 'Y',
                };

                await prisma.pricelist_item_special_prices.create({
                  data: {
                    ...spData,
                    pricelist_item_id: newItem.id,
                    createdate: new Date(),
                    createdby: userId,
                    log_inst: 1,
                  },
                });
              }
            }
          }
        }
      }

      const finalPriceList = await prisma.pricelists.findUnique({
        where: { id: priceList.id },
        include: {
          pricelist_item: {
            include: {
              pricelist_items_products: true,
              pricelist_item_special_prices: true,
            },
          },
          base_pricelist: {
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
        ...((route_id || customer_id || customer_category_id) && {
          pricelist_item: {
            some: {
              pricelist_item_special_prices: {
                some: {
                  ...(route_id && { route_id: Number(route_id) }),
                  ...(customer_id && { customer_id: Number(customer_id) }),
                  ...(customer_category_id && {
                    customer_category_id: Number(customer_category_id),
                  }),
                },
              },
            },
          },
        }),
        ...(is_default !== undefined && {
          is_default: is_default === 'true' ? 'Y' : 'N',
        }),
      };
      const include: any = {
        pricelists_depot: {
          select: {
            id: true,
            name: true,
          },
        },
        base_pricelist: {
          select: {
            id: true,
            name: true,
          },
        },
      };

      if (include_items === 'true' || include_items === true) {
        include.pricelist_item = {
          include: {
            pricelist_items_products: true,
            pricelist_item_special_prices: true,
          },
        };
      } else {
        include.pricelist_item = true;
      }

      const data = await prisma.pricelists.findMany({
        where: filters,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdate: 'desc' },
        include,
      });

      const totalCount = await prisma.pricelists.count({ where: filters });

      const pagination = {
        current_page: pageNum,
        per_page: limitNum,
        total_pages: Math.ceil(totalCount / limitNum),
        total_count: totalCount,
        has_next: pageNum * limitNum < totalCount,
        has_prev: pageNum > 1,
      };

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
            include: {
              pricelist_items_products: true,
              pricelist_item_special_prices: {
                include: {
                  special_customer_category: true,
                  pricelist_item: true,
                  special_customer: true,
                  special_route: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          derived_pricelists: {
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
          base_pricelist: {
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

      await prisma.pricelist_item_special_prices.deleteMany({
        where: {
          pricelist_item: {
            pricelist_id: Number(id),
          },
        },
      });

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

      const whereCondition: any = {
        customer_id: Number(customer_id),
        is_active: 'Y',
      };

      const customerPriceList = await prisma.pricelists.findFirst({
        where: whereCondition,
        include: {
          pricelist_item: {
            where: { is_active: 'Y' },
            include: { pricelist_items_products: true },
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
            // route_id: customer.route_id,
            is_active: 'Y',
          },
          include: {
            pricelist_item: {
              where: { is_active: 'Y' },
              include: { pricelist_items_products: true },
            },
            // pricelists_route: {
            //   select: { id: true, name: true },
            // },
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
            // valid_from: { lte: targetDate },
            // valid_to: { gte: targetDate },
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
          // valid_from: { lte: targetDate },
          // valid_to: { gte: targetDate },
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

      const priceListCache = new Map<string, any>();

      const validatePriceList = (priceList: any, targetDate: Date) => {
        if (!priceList.valid_from || !priceList.valid_to) return true;
        return (
          targetDate >= priceList.valid_from && targetDate <= priceList.valid_to
        );
      };

      const calculateDerivedPrice = (basePrice: number, factor: number) => {
        return basePrice * (factor || 1);
      };

      const resolvePriceListForCustomer = async (
        customerId: number,
        vanInventoryProductIds: number[],
        documentDate?: Date
      ) => {
        const targetDate = documentDate || new Date();

        console.log(' Price List Resolution');
        console.log('Customer ID:', customerId);
        console.log('Product IDs:', vanInventoryProductIds);
        console.log('Target Date:', targetDate);

        const cacheKey = `${customerId}-${vanInventoryProductIds.join(',')}-${targetDate.toISOString()}`;
        if (priceListCache.has(cacheKey)) {
          return priceListCache.get(cacheKey);
        }

        const getPriceListWithMatchingProducts = async (
          whereClause: any,
          level: string
        ) => {
          try {
            console.log(`\n--- Checking ${level} price list ---`);
            console.log('Where clause:', whereClause);
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
                    pricelist_item_special_prices: {
                      where: {
                        is_active: 'Y',
                        OR: [
                          { customer_id: customerId },
                          { customer_id: null },
                          { customer_category_id: { not: null } },
                        ],
                      },
                      include: {
                        special_customer: {
                          select: { id: true, name: true, code: true },
                        },
                        special_customer_category: {
                          select: {
                            id: true,
                            category_name: true,
                            category_code: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });

            if (priceList && validatePriceList(priceList, targetDate)) {
              if (priceList.base_pricelist_id && priceList.factor) {
                const basePriceList = await prisma.pricelists.findUnique({
                  where: { id: priceList.base_pricelist_id },
                  include: {
                    pricelist_item: {
                      where: {
                        is_active: 'Y',
                        product_id: { in: vanInventoryProductIds },
                      },
                    },
                  },
                });

                if (basePriceList) {
                  priceList.pricelist_item.forEach((item: any) => {
                    const baseItem = basePriceList.pricelist_item.find(
                      (baseItem: any) => baseItem.product_id === item.product_id
                    );
                    if (baseItem) {
                      item.unit_price = calculateDerivedPrice(
                        Number(baseItem.unit_price),
                        Number(priceList.factor)
                      );
                    }
                  });
                }
              }

              priceList.pricelist_item.forEach((item: any) => {
                if (item.pricelist_item_special_prices.length > 0) {
                  const customerSpecial =
                    item.pricelist_item_special_prices.find(
                      (sp: any) => sp.customer_id === customerId
                    );

                  if (customerSpecial) {
                    item.unit_price = Number(customerSpecial.sale_price);
                    item.discount_percent = customerSpecial.discount_percent;
                    item.tax_percent = customerSpecial.tax_percent;
                  } else {
                    const categorySpecial =
                      item.pricelist_item_special_prices.find(
                        (sp: any) =>
                          sp.customer_category_id &&
                          sp.customer_category_id !== null
                      );

                    if (categorySpecial) {
                      item.unit_price = Number(categorySpecial.sale_price);
                      item.discount_percent = categorySpecial.discount_percent;
                      item.tax_percent = categorySpecial.tax_percent;
                    }
                  }
                }
              });

              return priceList && priceList.pricelist_item.length > 0
                ? priceList
                : null;
            }
            return null;
          } catch (error) {
            console.error(`Error resolving ${level} price list:`, error);
            return null;
          }
        };

        const customerPriceList = await getPriceListWithMatchingProducts(
          {
            customer_id: customerId,
            is_active: 'Y',
            // valid_from: { lte: targetDate },
            // valid_to: { gte: targetDate },
          },
          'CUSTOMER'
        );

        if (customerPriceList) {
          const result = { priceList: customerPriceList, level: 'CUSTOMER' };
          priceListCache.set(cacheKey, result);
          return result;
        }

        const customer = await prisma.customers.findUnique({
          where: { id: customerId },
          select: {
            id: true,
            name: true,
            route_id: true,
            depot_id: true,
            customer_category_id: true,
          },
        });

        console.log('Customer details:', {
          customer_id: customer?.id,
          customer_name: customer?.name,
          depot_id: customer?.depot_id,
          route_id: customer?.route_id,
          customer_category_id: customer?.customer_category_id,
        });

        console.log('Customer details:', {
          customer_id: customer?.id,
          customer_name: customer?.name,
          depot_id: customer?.depot_id,
          route_id: customer?.route_id,
          customer_category_id: customer?.customer_category_id,
        });

        if (customer?.customer_category_id) {
          const categoryPriceList = await getPriceListWithMatchingProducts(
            {
              customer_category_id: customer.customer_category_id,
              is_active: 'Y',
              // valid_from: { lte: targetDate },
              // valid_to: { gte: targetDate },
            },
            'CATEGORY'
          );

          if (categoryPriceList) {
            const result = { priceList: categoryPriceList, level: 'CATEGORY' };
            priceListCache.set(cacheKey, result);
            return result;
          }
        }

        if (customer?.route_id) {
          const routePriceList = await getPriceListWithMatchingProducts(
            {
              route_id: customer.route_id,
              is_active: 'Y',
              // valid_from: { lte: targetDate },
              // valid_to: { gte: targetDate },
            },
            'ROUTE'
          );

          if (routePriceList) {
            const result = { priceList: routePriceList, level: 'ROUTE' };
            priceListCache.set(cacheKey, result);
            return result;
          }
        }

        if (customer?.depot_id) {
          const depotPriceList = await getPriceListWithMatchingProducts(
            {
              depot_id: customer.depot_id,
              is_active: 'Y',
              // valid_from: { lte: targetDate },
              // valid_to: { gte: targetDate },
            },
            'DEPOT'
          );

          if (depotPriceList) {
            const result = { priceList: depotPriceList, level: 'DEPOT' };
            priceListCache.set(cacheKey, result);
            return result;
          }
        }

        const defaultPriceList = await getPriceListWithMatchingProducts(
          {
            is_default: 'Y',
            is_active: 'Y',
            // valid_from: { lte: targetDate },
            // valid_to: { gte: targetDate },
          },
          'DEFAULT'
        );

        const result = defaultPriceList
          ? { priceList: defaultPriceList, level: 'DEFAULT' }
          : { priceList: null, level: 'NONE' };

        priceListCache.set(cacheKey, result);
        return result;
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
              special_prices: item.pricelist_item_special_prices || [],
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

              // if (customer_id && !priceListProductMap.has(item.product_id)) {
              //   continue;
              // }
              if (
                customer_id &&
                resolvedPriceList?.priceList &&
                !priceListProductMap.has(item.product_id)
              ) {
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
                        special_prices: priceListInfo.special_prices,
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
      let targetDate = new Date();

      if (document_date) {
        const date = new Date(document_date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid document_date format. Use YYYY-MM-DD',
          });
        }

        targetDate = date;
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
              ...(document_date && dateFilter),
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
              vanInventoryProductIds,
              targetDate
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
                  factor: resolvedPriceList.priceList?.factor,
                  base_pricelist_id:
                    resolvedPriceList.priceList?.base_pricelist_id,
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
        },
        ...(document_date && dateFilter),
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
          vanInventoryProductIds,
          targetDate
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
                factor: resolvedPriceList.priceList?.factor,
                base_pricelist_id:
                  resolvedPriceList.priceList?.base_pricelist_id,
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
  async getPriceListByCustomer(req: Request, res: Response) {
    try {
      const { customer_id, order_date } = req.query;

      if (!customer_id || !order_date) {
        return res.status(400).json({
          success: false,
          message: 'customer_id and order_date are required',
        });
      }

      const result = await prisma.$queryRaw`
      EXEC sp_get_price_lists_for_customer 
        @CustomerID = ${parseInt(customer_id as string)},
        @OrderDate = ${order_date as string}
    `;

      const parsedResult = (result as any[]).map(priceList => {
        const pricelistItems = priceList.pricelist_items
          ? JSON.parse(priceList.pricelist_items as string)
          : [];

        const itemsWithSpecialPrices = pricelistItems.map((item: any) => ({
          ...item,
          special_prices: item.special_prices
            ? JSON.parse(item.special_prices)
            : [],
        }));

        return {
          ...priceList,
          pricelist_items: itemsWithSpecialPrices,
        };
      });

      res.status(200).json({
        success: true,
        message: 'Price lists retrieved successfully',
        data: parsedResult,
      });
    } catch (error: any) {
      console.error('Test Price List Procedure Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving price lists',
        error: error.message,
      });
    }
  },
};
