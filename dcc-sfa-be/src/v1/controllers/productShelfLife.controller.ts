import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface ProductShelfLifeSerialized {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const generateShelfLifeCode = (name: string): string => {
  const upperName = name.trim().toUpperCase();

  const daysMatch = upperName.match(/(\d+)\s*DAYS?/i);
  if (daysMatch) {
    const number = daysMatch[1];
    return `SHELF-${number}D-001`;
  }

  const numberOnly = upperName.replace(/[^\d]/g, '');
  if (numberOnly) {
    return `SHELF-${numberOnly}D-001`;
  }

  const prefix = upperName.substring(0, 6).replace(/\s+/g, '');
  return `SHELF-${prefix}-001`;
};

const serializeProductShelfLife = (
  shelfLife: any
): ProductShelfLifeSerialized => ({
  id: shelfLife.id,
  name: shelfLife.name,
  code: shelfLife.code,
  is_active: shelfLife.is_active,
  created_by: shelfLife.createdby,
  createdate: shelfLife.createdate,
  updatedate: shelfLife.updatedate,
  updatedby: shelfLife.updatedby,
});

export const productShelfLifeController = {
  async createProductShelfLife(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Shelf life name is required' });
      }

      const code = data.code || generateShelfLifeCode(data.name);

      const shelfLife = await prisma.product_shelf_life.create({
        data: {
          ...data,
          code,
          createdby: data.createdby
            ? Number(data.createdby)
            : req.user?.id || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Product shelf life created successfully',
        data: serializeProductShelfLife(shelfLife),
      });
    } catch (error: any) {
      console.error('Create Product Shelf Life Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductShelfLife(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
          ],
        }),
      };

      const totalShelfLife = await prisma.product_shelf_life.count();
      const activeShelfLife = await prisma.product_shelf_life.count({
        where: { is_active: 'Y' },
      });
      const inactiveShelfLife = await prisma.product_shelf_life.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newShelfLifeThisMonth = await prisma.product_shelf_life.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_product_shelf_life: totalShelfLife,
        active_product_shelf_life: activeShelfLife,
        inactive_product_shelf_life: inactiveShelfLife,
        new_product_shelf_life_this_month: newShelfLifeThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.product_shelf_life,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Product shelf life retrieved successfully',
        data: data.map((d: any) => serializeProductShelfLife(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Product Shelf Life Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getProductShelfLifeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shelfLife = await prisma.product_shelf_life.findUnique({
        where: { id: Number(id) },
      });

      if (!shelfLife) {
        return res
          .status(404)
          .json({ message: 'Product shelf life not found' });
      }

      res.json({
        message: 'Product shelf life fetched successfully',
        data: serializeProductShelfLife(shelfLife),
      });
    } catch (error: any) {
      console.error('Get Product Shelf Life Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProductShelfLife(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingShelfLife = await prisma.product_shelf_life.findUnique({
        where: { id: Number(id) },
      });

      if (!existingShelfLife) {
        return res
          .status(404)
          .json({ message: 'Product shelf life not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const shelfLife = await prisma.product_shelf_life.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Product shelf life updated successfully',
        data: serializeProductShelfLife(shelfLife),
      });
    } catch (error: any) {
      console.error('Update Product Shelf Life Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProductShelfLife(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingShelfLife = await prisma.product_shelf_life.findUnique({
        where: { id: Number(id) },
      });

      if (!existingShelfLife) {
        return res
          .status(404)
          .json({ message: 'Product shelf life not found' });
      }

      await prisma.product_shelf_life.delete({ where: { id: Number(id) } });

      res.json({ message: 'Product shelf life deleted successfully' });
    } catch (error: any) {
      console.error('Delete Product Shelf Life Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
