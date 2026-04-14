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
