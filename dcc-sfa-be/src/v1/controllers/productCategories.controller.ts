import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

interface ProductCategorySerialized {
  id: number;
  category_name: string;
  sub_category_id: number;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_category?: {
    id: number;
    sub_category_name: string;
  } | null;
}

const serializeCategory = (cat: any): ProductCategorySerialized => ({
  id: cat.id,
  category_name: cat.category_name,
  sub_category_id: cat.sub_category_id,
  description: cat.description,
  is_active: cat.is_active,
  createdate: cat.createdate,
  createdby: cat.createdby,
  updatedate: cat.updatedate,
  updatedby: cat.updatedby,
  log_inst: cat.log_inst,
  product_category: cat.product_category
    ? {
        id: cat.product_category.id,
        sub_category_name: cat.product_category.sub_category_name,
      }
    : null,
});

export const productCategoriesController = {
  async createProductCategories(req: any, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const data = req.body;

      const category = await prisma.product_categories.create({
        data: {
          category_name: data.category_name,
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
      });

      res.status(201).json({
        message: 'Product category created successfully',
        data: serializeCategory(category),
      });
    } catch (error: any) {
      console.error('Create Category Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllProductCategories(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { category_name: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.product_categories,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { product_category: true },
      });

      const totalProductCategories = await prisma.product_categories.count();
      const activeProductCategories = await prisma.product_categories.count({
        where: { is_active: 'Y' },
      });
      const inactiveProductCategories = await prisma.product_categories.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newCategoriesThisMonth = await prisma.product_categories.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Product categories retrieved successfully',
        data.map((c: any) => serializeCategory(c)),
        200,
        pagination,
        {
          total_product_categories: totalProductCategories,
          active_product_categories: activeProductCategories,
          inactive_product_categories: inactiveProductCategories,
          new_product_categories_this_month: newCategoriesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get All Categories Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductCategoriesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await prisma.product_categories.findUnique({
        where: { id: Number(id) },
      });

      if (!category)
        return res.status(404).json({ message: 'Category not found' });

      res.json({
        message: 'Category fetched successfully',
        data: serializeCategory(category),
      });
    } catch (error: any) {
      console.error('Get Category Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProductCategories(req: any, res: any) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const existing = await prisma.product_categories.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Category not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const category = await prisma.product_categories.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Category updated successfully',
        data: serializeCategory(category),
      });
    } catch (error: any) {
      console.error('Update Category Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProductCategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.product_categories.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Category not found' });

      await prisma.product_categories.delete({ where: { id: Number(id) } });

      res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      console.error('Delete Category Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductCategoriesDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '', category_id } = req.query;
      const searchLower = search.toLowerCase().trim();
      const categoryId = category_id ? Number(category_id) : null;

      const where: any = {
        is_active: 'Y',
      };

      if (categoryId) {
        where.id = categoryId;
      } else if (searchLower) {
        where.OR = [
          {
            category_name: {
              contains: searchLower,
            },
          },
          {
            description: {
              contains: searchLower,
            },
          },
        ];
      }

      const categories = await prisma.product_categories.findMany({
        where,
        select: {
          id: true,
          category_name: true,
        },
        orderBy: {
          category_name: 'asc',
        },
        take: 50,
      });

      res.success('Product categories dropdown fetched successfully', categories, 200);
    } catch (error: any) {
      console.error('Error fetching product categories dropdown:', error);
      res.error(error.message);
    }
  },
};
