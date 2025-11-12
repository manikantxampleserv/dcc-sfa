import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface PriceListItemSerialized {
  id: number;
  pricelist_id: number;
  product_id: number;
  unit_price: number;
  uom?: string | null;
  discount_percent?: number | null;
  effective_from?: Date | null;
  effective_to?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product?: { id: number; name: string; code: string } | null;
  pricelist?: { id: number; name: string } | null;
}

const serializePriceListItem = (item: any): PriceListItemSerialized => ({
  id: item.id,
  pricelist_id: item.pricelist_id,
  product_id: item.product_id,
  unit_price: Number(item.unit_price),
  uom: item.uom,
  discount_percent: item.discount_percent
    ? Number(item.discount_percent)
    : null,
  effective_from: item.effective_from,
  effective_to: item.effective_to,
  is_active: item.is_active,
  createdate: item.createdate,
  createdby: item.createdby,
  updatedate: item.updatedate,
  updatedby: item.updatedby,
  log_inst: item.log_inst,
  product: item.pricelist_items_products
    ? {
        id: item.pricelist_items_products.id,
        name: item.pricelist_items_products.name,
        code: item.pricelist_items_products.code,
      }
    : null,
  pricelist: item.pricelist_item
    ? {
        id: item.pricelist_item.id,
        name: item.pricelist_item.name,
      }
    : null,
});

export const priceListItemsController = {
  async createPriceListItems(req: any, res: any) {
    try {
      const data = req.body;

      const item = await prisma.pricelist_items.create({
        data: {
          pricelist_id: data.pricelist_id,
          product_id: data.product_id,
          unit_price: data.unit_price,
          uom: data.uom,
          discount_percent: data.discount_percent,
          effective_from: data.effective_from
            ? new Date(data.effective_from)
            : null,
          effective_to: data.effective_to ? new Date(data.effective_to) : null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          pricelist_item: true,
          pricelist_items_products: true,
        },
      });

      res.status(201).json({
        message: 'Price list item created successfully',
        data: serializePriceListItem(item),
      });
    } catch (error: any) {
      console.error('Create PriceListItem Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllPriceListItems(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [{ uom: { contains: searchLower } }],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.pricelist_items,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { pricelist_item: true, pricelist_items_products: true },
      });

      const totalPriceListItems = await prisma.pricelist_items.count();
      const activePriceListItems = await prisma.pricelist_items.count({
        where: { is_active: 'Y' },
      });
      const inactivePriceListItems = await prisma.pricelist_items.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const totalPriceListItemsThisMonth = await prisma.pricelist_items.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Price list items retrieved successfully',
        data.map((i: any) => serializePriceListItem(i)),
        200,
        pagination,
        {
          total_price_list_items_this_month: totalPriceListItemsThisMonth,
          total_price_list_items: totalPriceListItems,
          total_active_price_list_items: activePriceListItems,
          total_inactive_price_list_items: inactivePriceListItems,
        }
      );
    } catch (error: any) {
      console.error('Get PriceListItems Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPriceListItemsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await prisma.pricelist_items.findUnique({
        where: { id: Number(id) },
        include: { pricelist_item: true, pricelist_items_products: true },
      });

      if (!item)
        return res.status(404).json({ message: 'Price list item not found' });

      res.json({
        message: 'Price list item fetched successfully',
        data: serializePriceListItem(item),
      });
    } catch (error: any) {
      console.error('Get PriceListItem Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updatePriceListItems(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.pricelist_items.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Price list item not found' });

      const data = req.body;

      const updated = await prisma.pricelist_items.update({
        where: { id: Number(id) },
        data: {
          pricelist_id: data.pricelist_id ?? existing.pricelist_id,
          product_id: data.product_id ?? existing.product_id,
          unit_price: data.unit_price ?? existing.unit_price,
          uom: data.uom ?? existing.uom,
          discount_percent: data.discount_percent ?? existing.discount_percent,
          effective_from: data.effective_from
            ? new Date(data.effective_from)
            : existing.effective_from,
          effective_to: data.effective_to
            ? new Date(data.effective_to)
            : existing.effective_to,
          is_active: data.is_active ?? existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
          log_inst: data.log_inst ?? existing.log_inst,
        },
        include: { pricelist_item: true, pricelist_items_products: true },
      });

      res.json({
        message: 'Price list item updated successfully',
        data: serializePriceListItem(updated),
      });
    } catch (error: any) {
      console.error('Update PriceListItem Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePriceListItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.pricelist_items.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Price list item not found' });

      await prisma.pricelist_items.delete({ where: { id: Number(id) } });

      res.json({ message: 'Price list item deleted successfully' });
    } catch (error: any) {
      console.error('Delete PriceListItem Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
