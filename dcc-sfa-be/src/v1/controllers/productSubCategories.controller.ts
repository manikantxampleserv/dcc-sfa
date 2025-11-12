import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

interface ProductSubCategorySerialized {
  id: number;
  sub_category_name: string;
  product_category_id: number;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_category?: {
    id: number;
    category_name: string;
  } | null;
}

const serializeSubCategory = (sub: any): ProductSubCategorySerialized => ({
  id: sub.id,
  sub_category_name: sub.sub_category_name,
  product_category_id: sub.product_category_id,
  description: sub.description,
  is_active: sub.is_active,
  createdate: sub.createdate,
  createdby: sub.createdby,
  updatedate: sub.updatedate,
  updatedby: sub.updatedby,
  log_inst: sub.log_inst,
  product_category: sub.product_category
    ? {
        id: sub.product_category.id,
        category_name: sub.product_category.category_name,
      }
    : null,
});

export const productSubCategoriesController = {
  async createProductSubCategories(req: any, res: Response) {
    try {
      const data = req.body;

      const subCategory = await prisma.product_sub_categories.create({
        data: {
          sub_category_name: data.sub_category_name,
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
          product_category: {
            connect: { id: Number(data.product_category_id) },
          },
        },

        include: { product_category: true },
      });

      res.status(201).json({
        message: 'Product sub-category created successfully',
        data: serializeSubCategory(subCategory),
      });
    } catch (error: any) {
      console.error('Create SubCategory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllProductSubCategories(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { sub_category_name: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.product_sub_categories,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { product_category: true },
      });

      const totalSubCategories = await prisma.product_sub_categories.count();
      const activeSubCategories = await prisma.product_sub_categories.count({
        where: { is_active: 'Y' },
      });
      const inactiveSubCategories = await prisma.product_sub_categories.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newSubCategoriesThisMonth =
        await prisma.product_sub_categories.count({
          where: {
            createdate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

      res.success(
        'Product sub-categories retrieved successfully',
        data.map((s: any) => serializeSubCategory(s)),
        200,
        pagination,
        {
          total_sub_categories: totalSubCategories,
          active_sub_categories: activeSubCategories,
          inactive_sub_categories: inactiveSubCategories,
          new_sub_categories_this_month: newSubCategoriesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get All SubCategories Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProductSubCategoriesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subCategory = await prisma.product_sub_categories.findUnique({
        where: { id: Number(id) },
        include: { product_category: true },
      });

      if (!subCategory)
        return res.status(404).json({ message: 'Sub-category not found' });

      res.json({
        message: 'Product sub-category fetched successfully',
        data: serializeSubCategory(subCategory),
      });
    } catch (error: any) {
      console.error('Get SubCategory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateProductSubCategories(req: any, res: any) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const existing = await prisma.product_sub_categories.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Sub-category not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const subCategory = await prisma.product_sub_categories.update({
        where: { id: Number(id) },
        data,
        include: { product_category: true },
      });

      res.json({
        message: 'Product sub-category updated successfully',
        data: serializeSubCategory(subCategory),
      });
    } catch (error: any) {
      console.error('Update SubCategory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProductSubCategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.product_sub_categories.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Sub-category not found' });

      await prisma.product_sub_categories.delete({ where: { id: Number(id) } });

      res.json({ message: 'Product sub-category deleted successfully' });
    } catch (error: any) {
      console.error('Delete SubCategory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
