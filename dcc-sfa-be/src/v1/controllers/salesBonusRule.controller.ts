import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface SalesBonusRuleSerialized {
  id: number;
  sales_target_id: number;
  achievement_min_percent: number;
  achievement_max_percent: number;
  bonus_amount?: number | null;
  bonus_percent?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_targets?: any;
}

const serializeSalesBonusRule = (rule: any): SalesBonusRuleSerialized => ({
  id: rule.id,
  sales_target_id: rule.sales_target_id,
  achievement_min_percent: rule.achievement_min_percent,
  achievement_max_percent: rule.achievement_max_percent,
  bonus_amount: rule.bonus_amount,
  bonus_percent: rule.bonus_percent,
  is_active: rule.is_active,
  createdate: rule.createdate,
  createdby: rule.createdby,
  updatedate: rule.updatedate,
  updatedby: rule.updatedby,
  log_inst: rule.log_inst,
  sales_targets: rule.sales_targets,
});

export const salesBonusRulesController = {
  async createSalesBonusRule(req: any, res: any) {
    try {
      const data = req.body;
      const rule = await prisma.sales_bonus_rules.create({
        data: {
          sales_target_id: data.sales_target_id,
          achievement_min_percent: data.achievement_min_percent,
          achievement_max_percent: data.achievement_max_percent,
          bonus_amount: data.bonus_amount ?? null,
          bonus_percent: data.bonus_percent ?? null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: { sales_targets: true },
      });

      res.status(201).json({
        message: 'Sales bonus rule created successfully',
        data: serializeSalesBonusRule(rule),
      });
    } catch (error: any) {
      console.error('Create SalesBonusRule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllSalesBonusRules(req: any, res: any) {
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
        model: prisma.sales_bonus_rules,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { sales_targets: true },
      });

      const totalRules = await prisma.sales_bonus_rules.count();
      const activeRules = await prisma.sales_bonus_rules.count({
        where: { is_active: 'Y' },
      });
      const inactiveRules = await prisma.sales_bonus_rules.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const salesBonusRulesThisMonth = await prisma.sales_bonus_rules.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Sales bonus rules retrieved successfully',
        data.map((r: any) => serializeSalesBonusRule(r)),
        200,
        pagination,
        {
          total_rules: totalRules,
          active_rules: activeRules,
          inactive_rules: inactiveRules,
          sales_bonus_rules_this_month: salesBonusRulesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get SalesBonusRules Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSalesBonusRuleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await prisma.sales_bonus_rules.findUnique({
        where: { id: Number(id) },
        include: { sales_targets: true },
      });

      if (!rule)
        return res.status(404).json({ message: 'Sales bonus rule not found' });

      res.json({
        message: 'Sales bonus rule fetched successfully',
        data: serializeSalesBonusRule(rule),
      });
    } catch (error: any) {
      console.error('Get SalesBonusRule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSalesBonusRule(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_bonus_rules.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Sales bonus rule not found' });

      const data = req.body;
      const updated = await prisma.sales_bonus_rules.update({
        where: { id: Number(id) },
        data: {
          sales_target_id: data.sales_target_id ?? existing.sales_target_id,
          achievement_min_percent:
            data.achievement_min_percent ?? existing.achievement_min_percent,
          achievement_max_percent:
            data.achievement_max_percent ?? existing.achievement_max_percent,
          bonus_amount: data.bonus_amount ?? existing.bonus_amount,
          bonus_percent: data.bonus_percent ?? existing.bonus_percent,
          is_active: data.is_active ?? existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
          log_inst: data.log_inst ?? existing.log_inst,
        },
        include: { sales_targets: true },
      });

      res.json({
        message: 'Sales bonus rule updated successfully',
        data: serializeSalesBonusRule(updated),
      });
    } catch (error: any) {
      console.error('Update SalesBonusRule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSalesBonusRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_bonus_rules.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Sales bonus rule not found' });

      await prisma.sales_bonus_rules.delete({ where: { id: Number(id) } });

      res.json({ message: 'Sales bonus rule deleted successfully' });
    } catch (error: any) {
      console.error('Delete SalesBonusRule Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
