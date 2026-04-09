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
        ...(is_default && { is_default: is_default === 'true' ? 'Y' : 'N' }),
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
};
