import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface SalesTargetGroupSerialized {
  id: number;
  group_name: string;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_target_group_members?: any[];
  sales_targets_groups?: any[];
}

const serializeSalesTargetGroup = (stg: any): SalesTargetGroupSerialized => ({
  id: stg.id,
  group_name: stg.group_name,
  description: stg.description,
  is_active: stg.is_active,
  createdate: stg.createdate,
  createdby: stg.createdby,
  updatedate: stg.updatedate,
  updatedby: stg.updatedby,
  log_inst: stg.log_inst,
  sales_target_group_members: stg.sales_target_group_members_id || [],
  sales_targets_groups: stg.sales_targets_groups || [],
});

export const salesTargetGroupsController = {
  async createSalesTargetGroups(req: any, res: any) {
    try {
      const data = req.body;

      const newGroup = await prisma.sales_target_groups.create({
        data: {
          group_name: data.group_name,
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      res.status(201).json({
        message: 'Sales target groups created successfully',
        data: serializeSalesTargetGroup(newGroup),
      });
    } catch (error: any) {
      console.error('Create SalesTargetGroups Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllSalesTargetGroups(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { group_name: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.sales_target_groups,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      const totalGroups = await prisma.sales_target_groups.count();
      const activeGroups = await prisma.sales_target_groups.count({
        where: { is_active: 'Y' },
      });
      const inactiveGroups = await prisma.sales_target_groups.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const salesTargetGroupsThisMonth =
        await prisma.sales_target_groups.findMany({
          where: {
            createdate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          include: {
            sales_target_group_members_id: true,
            sales_targets_groups: true,
          },
        });
      res.success(
        'Sales target groups retrieved successfully',
        data.map((g: any) => serializeSalesTargetGroup(g)),
        200,
        pagination,
        {
          total_groups: totalGroups,
          active_groups: activeGroups,
          inactive_groups: inactiveGroups,
          sales_target_groups_this_month: salesTargetGroupsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get SalesTargetGroups Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSalesTargetGroupsById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const group = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      if (!group)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      res.json({
        message: 'Sales target group fetched successfully',
        data: serializeSalesTargetGroup(group),
      });
    } catch (error: any) {
      console.error('Get SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSalesTargetGroups(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      const data = req.body;

      const updatedGroup = await prisma.sales_target_groups.update({
        where: { id: Number(id) },
        data: {
          group_name: data.group_name ?? existing.group_name,
          description: data.description ?? existing.description,
          is_active: data.is_active ?? existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
          log_inst: data.log_inst ?? existing.log_inst,
        },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      res.json({
        message: 'Sales target group updated successfully',
        data: serializeSalesTargetGroup(updatedGroup),
      });
    } catch (error: any) {
      console.error('Update SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSalesTargetGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      await prisma.sales_target_groups.delete({ where: { id: Number(id) } });

      res.json({ message: 'Sales target group deleted successfully' });
    } catch (error: any) {
      console.error('Delete SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
