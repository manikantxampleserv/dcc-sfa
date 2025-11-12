import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface PromotionProductSerialized {
  id: number;
  promotion_id: number;
  product_id: number;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  products?: { id: number; name: string; code: string } | null;
  promotions?: { id: number; name: string; code: string } | null;
}

const serializePromotionProduct = (p: any): PromotionProductSerialized => ({
  id: p.id,
  promotion_id: p.promotion_id,
  product_id: p.product_id,
  is_active: p.is_active,
  createdate: p.createdate,
  createdby: p.createdby,
  updatedate: p.updatedate,
  updatedby: p.updatedby,
  log_inst: p.log_inst,
  products: p.promotion_products_products
    ? {
        id: p.promotion_products_products.id,
        name: p.promotion_products_products.name,
        code: p.promotion_products_products.code,
      }
    : null,
  promotions: p.products_promotion_products
    ? {
        id: p.products_promotion_products.id,
        name: p.products_promotion_products.name,
        code: p.products_promotion_products.code,
      }
    : null,
});

export const promotionProductsController = {
  async createPromotionProduct(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.promotion_id || !data.product_id) {
        return res
          .status(400)
          .json({ message: 'promotion_id and product_id are required' });
      }

      const promotionProduct = await prisma.promotion_products.create({
        data: {
          ...data,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          promotion_products_products: true,
          products_promotion_products: true,
        },
      });

      res.status(201).json({
        message: 'Promotion product created successfully',
        data: serializePromotionProduct(promotionProduct),
      });
    } catch (error: any) {
      console.error('Create Promotion Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllPromotionProducts(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.promotion_products,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          promotion_products_products: true,
          products_promotion_products: true,
        },
      });

      const totalCount = await prisma.promotion_products.count();
      const activeCount = await prisma.promotion_products.count({
        where: { is_active: 'Y' },
      });
      const inactiveCount = await prisma.promotion_products.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const totalPromotionProducts = await prisma.promotion_products.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Promotion products retrieved successfully',
        data.map((p: any) => serializePromotionProduct(p)),
        200,
        pagination,
        {
          total_count: totalCount,
          active_count: activeCount,
          inactive_count: inactiveCount,
          total_promotion_products: totalPromotionProducts,
        }
      );
    } catch (error: any) {
      console.error('Get Promotion Products Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPromotionProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promotionProduct = await prisma.promotion_products.findUnique({
        where: { id: Number(id) },
        include: {
          promotion_products_products: true,
          products_promotion_products: true,
        },
      });

      if (!promotionProduct) {
        return res.status(404).json({ message: 'Promotion product not found' });
      }

      res.status(200).json({
        message: 'Promotion product fetched successfully',
        data: serializePromotionProduct(promotionProduct),
      });
    } catch (error: any) {
      console.error('Get Promotion Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updatePromotionProduct(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.promotion_products.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Promotion product not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      const updated = await prisma.promotion_products.update({
        where: { id: Number(id) },
        data,
        include: {
          promotion_products_products: true,
          products_promotion_products: true,
        },
      });

      res.json({
        message: 'Promotion product updated successfully',
        data: serializePromotionProduct(updated),
      });
    } catch (error: any) {
      console.error('Update Promotion Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePromotionProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.promotion_products.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Promotion product not found' });

      await prisma.promotion_products.delete({ where: { id: Number(id) } });

      res.json({ message: 'Promotion product deleted successfully' });
    } catch (error: any) {
      console.error('Delete Promotion Product Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
