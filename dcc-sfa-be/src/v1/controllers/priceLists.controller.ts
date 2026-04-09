import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

interface PriceListSerialized {
  id: number;
  name: string;
  description?: string | null;
  valid_from?: Date | null;
  valid_to?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  pricelist_item?: any[];
  route_pricelist?: any[];
}

const serializePriceList = (pl: any): PriceListSerialized => ({
  id: pl.id,
  name: pl.name,
  description: pl.description,
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
  route_pricelist: pl.route_pricelist || [],
});

export const priceListsController = {
  async upsertPriceList(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;

    try {
      let priceList;

      if (data.id) {
        priceList = await prisma.pricelists.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
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
          .filter(Boolean) as number[];

        await prisma.pricelist_items.deleteMany({
          where: {
            pricelist_id: priceList.id,
            id: { notIn: requestIds.length ? requestIds : [0] },
          },
        });

        for (const item of items) {
          const itemData = {
            product_id: item.product_id,
            unit_price: item.unit_price,
            uom: item.uom || null,
            discount_percent:
              item.discount_percent !== '' && item.discount_percent !== null
                ? Number(item.discount_percent)
                : null,
            tax_percent:
              item.tax_percent !== '' && item.tax_percent !== null
                ? Number(item.tax_percent)
                : null,
            sub_unit_price:
              item.sub_unit_price !== '' && item.sub_unit_price !== null
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

          if (item.id && existingItems.find(e => e.id === item.id)) {
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
          pricelist_item: true,
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
        ...(depot_id && {
          route_pricelist: { some: { depot_id: Number(depot_id) } },
        }),
        ...(route_id && {
          route_pricelist: { some: { route_id: Number(route_id) } },
        }),
        ...(customer_id && {
          route_pricelist: { some: { customer_id: Number(customer_id) } },
        }),
        ...(customer_category_id && {
          route_pricelist: {
            some: { customer_category_id: Number(customer_category_id) },
          },
        }),
        ...(from_date && {
          valid_from: { gte: new Date(from_date as string) },
        }),
        ...(to_date && { valid_to: { lte: new Date(to_date as string) } }),
      };

      const include: any = {};
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
        include: { pricelist_item: true },
      });

      if (!priceList)
        return res.status(404).json({ message: 'Price list not found' });

      res.json({
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
        return res.status(404).json({ message: 'Price list not found' });

      await prisma.pricelists.delete({ where: { id: Number(id) } });

      res.json({ message: 'Price list deleted successfully' });
    } catch (error: any) {
      console.error('Delete PriceList Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
