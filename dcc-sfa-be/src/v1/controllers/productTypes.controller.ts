import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface ProductTypeSerialized {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeProductType = (productType: any): ProductTypeSerialized => ({
  id: productType.id,
  name: productType.name,
  code: productType.code,
  is_active: productType.is_active,
  created_by: productType.createdby,
  createdate: productType.createdate,
  updatedate: productType.updatedate,
  updatedby: productType.updatedby,
});

export const productTypesController = {
  async createProductType(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res
          .status(400)
          .json({ message: 'Product type name is required' });
      }

      const productType = await prisma.product_type.create({
        data: {
          ...data,
          code: data.code || data.name.toUpperCase().replace(/\s+/g, '_'),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Product type created successfully',
        data: serializeProductType(productType),
      });
    } catch (error: any) {
      console.error('Create Product Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductTypes(req: Request, res: Response) {
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

      const totalProductTypes = await prisma.product_type.count();
      const activeProductTypes = await prisma.product_type.count({
        where: { is_active: 'Y' },
      });
      const inactiveProductTypes = await prisma.product_type.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newProductTypesThisMonth = await prisma.product_type.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_product_types: totalProductTypes,
        active_product_types: activeProductTypes,
        inactive_product_types: inactiveProductTypes,
        new_product_types_this_month: newProductTypesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.product_type,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Product types retrieved successfully',
        data: data.map((d: any) => serializeProductType(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Product Types Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getProductTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productType = await prisma.product_type.findUnique({
        where: { id: Number(id) },
      });

      if (!productType) {
        return res.status(404).json({ message: 'Product type not found' });
      }

      res.json({
        message: 'Product type fetched successfully',
        data: serializeProductType(productType),
      });
    } catch (error: any) {
      console.error('Get Product Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProductType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingProductType = await prisma.product_type.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProductType) {
        return res.status(404).json({ message: 'Product type not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const productType = await prisma.product_type.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Product type updated successfully',
        data: serializeProductType(productType),
      });
    } catch (error: any) {
      console.error('Update Product Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProductType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingProductType = await prisma.product_type.findUnique({
        where: { id: Number(id) },
      });

      if (!existingProductType) {
        return res.status(404).json({ message: 'Product type not found' });
      }

      await prisma.product_type.delete({ where: { id: Number(id) } });

      res.json({ message: 'Product type deleted successfully' });
    } catch (error: any) {
      console.error('Delete Product Type Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
