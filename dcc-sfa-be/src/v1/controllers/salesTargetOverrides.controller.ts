import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface SalesTargetOverridesSerialized {
  id: number;
  sales_person_id: number;
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
  sales_person?: { id: number; name: string } | null;
  product_category?: { id: number; name: string } | null;
}

const serializeSalesTargetOverrides = (
  target: any
): SalesTargetOverridesSerialized => ({
  id: target.id,
  sales_person_id: target.sales_person_id,
  product_category_id: target.product_category_id,
  target_quantity: target.target_quantity,
  target_amount: target.target_amount,
  start_date: target.start_date,
  end_date: target.end_date,
  is_active: target.is_active,
  createdate: target.createdate,
  createdby: target.createdby,
  updatedate: target.updatedate,
  updatedby: target.updatedby,
  log_inst: target.log_inst,
  sales_person: target.sales_target_overrides_users
    ? {
        id: target.sales_target_overrides_users.id,
        name: `${target.sales_target_overrides_users.first_name || ''} ${target.sales_target_overrides_users.last_name || ''}`.trim(),
      }
    : null,
  product_category: target.sales_target_overrides_product_categories
    ? {
        id: target.sales_target_overrides_product_categories.id,
        name: target.sales_target_overrides_product_categories.name,
      }
    : null,
});

export const salesTargetOverridesController = {
  async createSalesTargetOverride(req: Request, res: Response) {
    try {
      const data = req.body;

      const target = await prisma.sales_target_overrides.create({
        data: {
          ...data,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          sales_target_overrides_users: true,
          sales_target_overrides_product_categories: true,
        },
      });

      res.status(201).json({
        message: 'Sales target override created successfully',
        data: serializeSalesTargetOverrides(target),
      });
    } catch (error: any) {
      console.error('Create Sales Target Override Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllSalesTargetOverrides(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';
      const filters: any = {
        ...(search && {
          OR: [
            {
              sales_target_overrides_users: {
                first_name: { contains: searchLower },
              },
            },
            {
              sales_target_overrides_users: {
                last_name: { contains: searchLower },
              },
            },
            {
              sales_target_overrides_product_categories: {
                name: { contains: searchLower },
              },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.sales_target_overrides,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          sales_target_overrides_users: true,
          sales_target_overrides_product_categories: true,
        },
      });

      const totalSalesTargetOverrides =
        await prisma.sales_target_overrides.count();
      const activeSalesTargetOverrides =
        await prisma.sales_target_overrides.count({
          where: { is_active: 'Y' },
        });
      const inactiveSalesTargetOverrides =
        await prisma.sales_target_overrides.count({
          where: { is_active: 'N' },
        });
      const salesTargetOverridesThisMonth =
        await prisma.sales_target_overrides.count({
          where: {
            createdate: {
              gte: new Date(),
              lte: new Date(),
            },
          },
        });
      res.success(
        'Sales target overrides retrieved successfully',
        data.map((t: any) => serializeSalesTargetOverrides(t)),
        200,
        pagination,
        {
          totalSalesTargetOverrides,
          activeSalesTargetOverrides,
          inactiveSalesTargetOverrides,
          salesTargetOverridesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get All Sales Target Overrides Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSalesTargetOverrideById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const target = await prisma.sales_target_overrides.findUnique({
        where: { id: Number(id) },
        include: {
          sales_target_overrides_users: true,
          sales_target_overrides_product_categories: true,
        },
      });

      if (!target)
        return res
          .status(404)
          .json({ message: 'Sales target override not found' });

      res.json({
        message: 'Sales target override fetched successfully',
        data: serializeSalesTargetOverrides(target),
      });
    } catch (error: any) {
      console.error('Get Sales Target Override By ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSalesTargetOverride(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_target_overrides.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target override not found' });

      const data = {
        ...req.body,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        is_active: req.body.is_active || 'Y',
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const updated = await prisma.sales_target_overrides.update({
        where: { id: Number(id) },
        data,
        include: {
          sales_target_overrides_users: true,
          sales_target_overrides_product_categories: true,
        },
      });

      res.json({
        message: 'Sales target override updated successfully',
        data: serializeSalesTargetOverrides(updated),
      });
    } catch (error: any) {
      console.error('Update Sales Target Override Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSalesTargetOverride(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_target_overrides.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target override not found' });

      await prisma.sales_target_overrides.delete({ where: { id: Number(id) } });

      res.json({ message: 'Sales target override deleted successfully' });
    } catch (error: any) {
      console.error('Delete Sales Target Override Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
