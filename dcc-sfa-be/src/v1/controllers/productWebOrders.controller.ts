import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface ProductWebOrderSerialized {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeProductWebOrder = (
  productWebOrder: any
): ProductWebOrderSerialized => ({
  id: productWebOrder.id,
  name: productWebOrder.name,
  code: productWebOrder.code,
  is_active: productWebOrder.is_active,
  created_by: productWebOrder.createdby,
  createdate: productWebOrder.createdate,
  updatedate: productWebOrder.updatedate,
  updatedby: productWebOrder.updatedby,
});

export const productWebOrdersController = {
  async createProductWebOrder(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Product web order name is required' });
      }

      const productWebOrder = await prisma.product_web_order.create({
        data: {
          ...data,
          code: data.code || data.name.toUpperCase().replace(/\s+/g, '_'),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Product web order created successfully',
        data: serializeProductWebOrder(productWebOrder),
      });
    } catch (error: any) {
      console.error('Create Product Web Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductWebOrders(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(search && {
          OR: [
            { name: { contains: searchLower, mode: 'insensitive' } },
            { code: { contains: searchLower, mode: 'insensitive' } },
          ],
        }),
      };

      const totalProductWebOrders = await prisma.product_web_order.count();
      const activeProductWebOrders = await prisma.product_web_order.count({
        where: { is_active: 'Y' },
      });
      const inactiveProductWebOrders = await prisma.product_web_order.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newProductWebOrdersThisMonth = await prisma.product_web_order.count(
        {
          where: {
            createdate: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
        }
      );

      const stats = {
        total_product_web_orders: totalProductWebOrders,
        active_product_web_orders: activeProductWebOrders,
        inactive_product_web_orders: inactiveProductWebOrders,
        new_product_web_orders_this_month: newProductWebOrdersThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.product_web_order,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Product web orders retrieved successfully',
        data: data.map((d: any) => serializeProductWebOrder(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Product Web Orders Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getProductWebOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productWebOrder = await prisma.product_web_order.findUnique({
        where: { id: Number(id) },
      });

      if (!productWebOrder) {
        return res.status(404).json({ message: 'Product web order not found' });
      }

      res.json({
        message: 'Product web order fetched successfully',
        data: serializeProductWebOrder(productWebOrder),
      });
    } catch (error: any) {
      console.error('Get Product Web Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProductWebOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingProductWebOrder = await prisma.product_web_order.findUnique(
        {
          where: { id: Number(id) },
        }
      );

      if (!existingProductWebOrder) {
        return res.status(404).json({ message: 'Product web order not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const productWebOrder = await prisma.product_web_order.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Product web order updated successfully',
        data: serializeProductWebOrder(productWebOrder),
      });
    } catch (error: any) {
      console.error('Update Product Web Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProductWebOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingProductWebOrder = await prisma.product_web_order.findUnique(
        {
          where: { id: Number(id) },
        }
      );

      if (!existingProductWebOrder) {
        return res.status(404).json({ message: 'Product web order not found' });
      }

      await prisma.product_web_order.delete({ where: { id: Number(id) } });

      res.json({ message: 'Product web order deleted successfully' });
    } catch (error: any) {
      console.error('Delete Product Web Order Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
