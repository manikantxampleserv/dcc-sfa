import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

interface SalesTargetSerialized {
  id: number;
  sales_target_group_id: number;
  product_category_id: number;
  target_quantity: number;
  target_amount?: number | null;
  start_date: Date;
  end_date: Date;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_target_group?: {
    id: number;
    group_name: string;
    description?: string | null;
  } | null;
  product_category?: {
    id: number;
    category_name: string;
    description?: string | null;
  } | null;
}

const serializeSalesTarget = (salesTarget: any): SalesTargetSerialized => ({
  id: salesTarget.id,
  sales_target_group_id: salesTarget.sales_target_group_id,
  product_category_id: salesTarget.product_category_id,
  target_quantity: salesTarget.target_quantity,
  target_amount: salesTarget.target_amount
    ? Number(salesTarget.target_amount)
    : null,
  start_date: salesTarget.start_date,
  end_date: salesTarget.end_date,
  is_active: salesTarget.is_active,
  createdate: salesTarget.createdate,
  createdby: salesTarget.createdby,
  updatedate: salesTarget.updatedate,
  updatedby: salesTarget.updatedby,
  log_inst: salesTarget.log_inst,
  sales_target_group: salesTarget.sales_targets_groups
    ? {
        id: salesTarget.sales_targets_groups.id,
        group_name: salesTarget.sales_targets_groups.group_name,
        description: salesTarget.sales_targets_groups.description,
      }
    : null,
  product_category: salesTarget.sales_targets_product_categories
    ? {
        id: salesTarget.sales_targets_product_categories.id,
        category_name:
          salesTarget.sales_targets_product_categories.category_name,
        description: salesTarget.sales_targets_product_categories.description,
      }
    : null,
});

export const salesTargetsController = {
  async createSalesTarget(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        sales_target_group_id,
        product_category_id,
        target_quantity,
        target_amount,
        start_date,
        end_date,
        is_active,
      } = req.body;

      // Check if sales target group exists
      const salesTargetGroup = await prisma.sales_target_groups.findUnique({
        where: { id: sales_target_group_id },
      });

      if (!salesTargetGroup) {
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });
      }

      // Check if product category exists
      const productCategory = await prisma.product_categories.findUnique({
        where: { id: product_category_id },
      });

      if (!productCategory) {
        return res.status(404).json({ message: 'Product category not found' });
      }

      // Check for overlapping targets for the same group and category
      const existingTarget = await prisma.sales_targets.findFirst({
        where: {
          sales_target_group_id,
          product_category_id,
          is_active: 'Y',
          OR: [
            {
              start_date: { lte: new Date(end_date) },
              end_date: { gte: new Date(start_date) },
            },
          ],
        },
      });

      if (existingTarget) {
        return res
          .status(400)
          .json({ message: 'Sales target already exists for this period' });
      }

      const salesTarget = await prisma.sales_targets.create({
        data: {
          sales_target_group_id,
          product_category_id,
          target_quantity,
          target_amount: target_amount ? Number(target_amount) : null,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          is_active: is_active || 'Y',
          createdby: (req as any).user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
        include: {
          sales_targets_groups: true,
          sales_targets_product_categories: true,
        },
      });

      res.status(201).json({
        message: 'Sales target created successfully',
        data: serializeSalesTarget(salesTarget),
      });
    } catch (error: any) {
      console.error('Create Sales Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllSalesTargets(req: any, res: any) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        sales_target_group_id,
        product_category_id,
        is_active,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(is_active && { is_active: is_active as string }),
        ...(sales_target_group_id && {
          sales_target_group_id: parseInt(sales_target_group_id as string, 10),
        }),
        ...(product_category_id && {
          product_category_id: parseInt(product_category_id as string, 10),
        }),
        ...(search && {
          OR: [
            {
              sales_targets_groups: {
                group_name: { contains: searchLower, mode: 'insensitive' },
              },
            },
            {
              sales_targets_product_categories: {
                category_name: { contains: searchLower, mode: 'insensitive' },
              },
            },
          ],
        }),
      };

      // Statistics
      const totalTargets = await prisma.sales_targets.count();
      const activeTargets = await prisma.sales_targets.count({
        where: { is_active: 'Y' },
      });
      const inactiveTargets = await prisma.sales_targets.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const targetsThisMonth = await prisma.sales_targets.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      // Paginate
      const { data, pagination } = await paginate({
        model: prisma.sales_targets,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          sales_targets_groups: true,
          sales_targets_product_categories: true,
        },
      });

      res.json({
        success: true,
        message: 'Sales targets retrieved successfully',
        data: data.map((salesTarget: any) => serializeSalesTarget(salesTarget)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats: {
          total_sales_targets: totalTargets,
          active_sales_targets: activeTargets,
          inactive_sales_targets: inactiveTargets,
          sales_targets_this_month: targetsThisMonth,
        },
      });
    } catch (error: any) {
      console.error('Get All Sales Targets Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getSalesTargetById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const salesTarget = await prisma.sales_targets.findUnique({
        where: { id: parseInt(id) },
        include: {
          sales_targets_groups: true,
          sales_targets_product_categories: true,
        },
      });

      if (!salesTarget) {
        return res.status(404).json({ message: 'Sales target not found' });
      }

      res.json({
        data: serializeSalesTarget(salesTarget),
      });
    } catch (error: any) {
      console.error('Get Sales Target By ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSalesTarget(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const {
        sales_target_group_id,
        product_category_id,
        target_quantity,
        target_amount,
        start_date,
        end_date,
        is_active,
      } = req.body;

      const existingSalesTarget = await prisma.sales_targets.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingSalesTarget) {
        return res.status(404).json({ message: 'Sales target not found' });
      }

      // Check if sales target group exists (if being updated)
      if (
        sales_target_group_id &&
        sales_target_group_id !== existingSalesTarget.sales_target_group_id
      ) {
        const salesTargetGroup = await prisma.sales_target_groups.findUnique({
          where: { id: sales_target_group_id },
        });

        if (!salesTargetGroup) {
          return res
            .status(404)
            .json({ message: 'Sales target group not found' });
        }
      }

      // Check if product category exists (if being updated)
      if (
        product_category_id &&
        product_category_id !== existingSalesTarget.product_category_id
      ) {
        const productCategory = await prisma.product_categories.findUnique({
          where: { id: product_category_id },
        });

        if (!productCategory) {
          return res
            .status(404)
            .json({ message: 'Product category not found' });
        }
      }

      // Check for overlapping targets (if period is being updated)
      if (
        start_date ||
        end_date ||
        sales_target_group_id ||
        product_category_id
      ) {
        const checkGroupId =
          sales_target_group_id || existingSalesTarget.sales_target_group_id;
        const checkCategoryId =
          product_category_id || existingSalesTarget.product_category_id;
        const checkStartDate = start_date
          ? new Date(start_date)
          : existingSalesTarget.start_date;
        const checkEndDate = end_date
          ? new Date(end_date)
          : existingSalesTarget.end_date;

        const conflictingTarget = await prisma.sales_targets.findFirst({
          where: {
            id: { not: parseInt(id) },
            sales_target_group_id: checkGroupId,
            product_category_id: checkCategoryId,
            is_active: 'Y',
            OR: [
              {
                start_date: { lte: checkEndDate },
                end_date: { gte: checkStartDate },
              },
            ],
          },
        });

        if (conflictingTarget) {
          return res
            .status(400)
            .json({ message: 'Sales target already exists for this period' });
        }
      }

      const updatedSalesTarget = await prisma.sales_targets.update({
        where: { id: parseInt(id) },
        data: {
          ...(sales_target_group_id && { sales_target_group_id }),
          ...(product_category_id && { product_category_id }),
          ...(target_quantity && { target_quantity }),
          ...(target_amount !== undefined && {
            target_amount: target_amount ? Number(target_amount) : null,
          }),
          ...(start_date && { start_date: new Date(start_date) }),
          ...(end_date && { end_date: new Date(end_date) }),
          ...(is_active && { is_active }),
          updatedby: (req as any).user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          sales_targets_groups: true,
          sales_targets_product_categories: true,
        },
      });

      res.json({
        message: 'Sales target updated successfully',
        data: serializeSalesTarget(updatedSalesTarget),
      });
    } catch (error: any) {
      console.error('Update Sales Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSalesTarget(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingSalesTarget = await prisma.sales_targets.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingSalesTarget) {
        return res.status(404).json({ message: 'Sales target not found' });
      }

      // Soft delete - set is_active to 'N'
      await prisma.sales_targets.update({
        where: { id: parseInt(id) },
        data: {
          is_active: 'N',
          updatedby: (req as any).user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.json({
        message: 'Sales target deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Sales Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
