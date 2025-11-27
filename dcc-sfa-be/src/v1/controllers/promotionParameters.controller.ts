import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface PromotionParameterSerialized {
  id: number;
  promotion_id: number;
  param_name: string;
  param_type: string;
  param_value?: string | null;
  param_category: string;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  promotions?: { id: number; name: string; code: string } | null;
}

const serializePromotionParameter = (p: any): PromotionParameterSerialized => ({
  id: p.id,
  promotion_id: p.promotion_id,
  param_name: p.param_name,
  param_type: p.param_type,
  param_value: p.param_value,
  param_category: p.param_category,
  is_active: p.is_active,
  createdate: p.createdate,
  createdby: p.createdby,
  updatedate: p.updatedate,
  updatedby: p.updatedby,
  log_inst: p.log_inst,
  promotions: p.promotion_parameters_promotions
    ? {
        id: p.promotion_parameters_promotions.id,
        name: p.promotion_parameters_promotions.name,
        code: p.promotion_parameters_promotions.code,
      }
    : null,
});

export const promotionParametersController = {
  async createPromotionParameter(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.promotion_id || !data.param_name || !data.param_type) {
        return res.status(400).json({
          message: 'promotion_id, param_name, and param_type are required',
        });
      }

      const parameter = await prisma.promotion_parameters.create({
        data: {
          ...data,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          promotion_parameters_promotions: true,
        },
      });

      res.status(201).json({
        message: 'Promotion parameter created successfully',
        data: serializePromotionParameter(parameter),
      });
    } catch (error: any) {
      console.error('Create Promotion Parameter Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllPromotionParameters(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { param_name: { contains: searchLower } },
            { param_category: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.promotion_parameters,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          promotion_parameters_promotions: true,
        },
      });

      const totalCount = await prisma.promotion_parameters.count();
      const activeCount = await prisma.promotion_parameters.count({
        where: { is_active: 'Y' },
      });
      const inactiveCount = await prisma.promotion_parameters.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const totalPromotionParameters = await prisma.promotion_parameters.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Promotion parameters retrieved successfully',
        data.map((p: any) => serializePromotionParameter(p)),
        200,
        pagination,
        {
          total_count: totalCount,
          active_count: activeCount,
          inactive_count: inactiveCount,
          total_promotion_parameters: totalPromotionParameters,
        }
      );
    } catch (error: any) {
      console.error('Get Promotion Parameters Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPromotionParameterById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parameter = await prisma.promotion_parameters.findUnique({
        where: { id: Number(id) },
        include: { promotion_parameters_promotions: true },
      });

      if (!parameter)
        return res
          .status(404)
          .json({ message: 'Promotion parameter not found' });

      res.status(200).json({
        message: 'Promotion parameter fetched successfully',
        data: serializePromotionParameter(parameter),
      });
    } catch (error: any) {
      console.error('Get Promotion Parameter Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updatePromotionParameter(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.promotion_parameters.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Promotion parameter not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      const updated = await prisma.promotion_parameters.update({
        where: { id: Number(id) },
        data,
        include: { promotion_parameters_promotions: true },
      });

      res.json({
        message: 'Promotion parameter updated successfully',
        data: serializePromotionParameter(updated),
      });
    } catch (error: any) {
      console.error('Update Promotion Parameter Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePromotionParameter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.promotion_parameters.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Promotion parameter not found' });

      await prisma.promotion_parameters.delete({ where: { id: Number(id) } });

      res.json({ message: 'Promotion parameter deleted successfully' });
    } catch (error: any) {
      console.error('Delete Promotion Parameter Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
