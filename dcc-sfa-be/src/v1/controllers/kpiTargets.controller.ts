import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

interface KpiTargetSerialized {
  id: number;
  employee_id: number;
  kpi_name: string;
  target_value: string;
  measure_unit?: string | null;
  period_start: Date;
  period_end: Date;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  employee?: { id: number; name: string; email: string } | null;
  kpi_actuals?: { id: number; actual_value: string; measured_date: Date }[];
}

const serializeKpiTarget = (kpiTarget: any): KpiTargetSerialized => ({
  id: kpiTarget.id,
  employee_id: kpiTarget.employee_id,
  kpi_name: kpiTarget.kpi_name,
  target_value: kpiTarget.target_value?.toString(),
  measure_unit: kpiTarget.measure_unit,
  period_start: kpiTarget.period_start,
  period_end: kpiTarget.period_end,
  is_active: kpiTarget.is_active,
  createdate: kpiTarget.createdate,
  createdby: kpiTarget.createdby,
  updatedate: kpiTarget.updatedate,
  updatedby: kpiTarget.updatedby,
  log_inst: kpiTarget.log_inst,
  employee: kpiTarget.users_employee_kpi_targets_employee_idTousers
    ? {
        id: kpiTarget.users_employee_kpi_targets_employee_idTousers.id,
        name: kpiTarget.users_employee_kpi_targets_employee_idTousers.name,
        email: kpiTarget.users_employee_kpi_targets_employee_idTousers.email,
      }
    : null,
  kpi_actuals: kpiTarget.employee_kpi_actuals
    ? kpiTarget.employee_kpi_actuals.map((actual: any) => ({
        id: actual.id,
        actual_value: actual.actual_value?.toString(),
        measured_date: actual.measured_date,
      }))
    : [],
});

export const kpiTargetsController = {
  async createKpiTarget(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        employee_id,
        kpi_name,
        target_value,
        measure_unit,
        period_start,
        period_end,
        is_active,
      } = req.body;

      // Check if employee exists
      const employee = await prisma.users.findUnique({
        where: { id: employee_id },
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check for overlapping periods for the same employee and KPI
      const existingTarget = await prisma.employee_kpi_targets.findFirst({
        where: {
          employee_id,
          kpi_name,
          is_active: 'Y',
          OR: [
            {
              period_start: { lte: new Date(period_end) },
              period_end: { gte: new Date(period_start) },
            },
          ],
        },
      });

      if (existingTarget) {
        return res
          .status(400)
          .json({ message: 'KPI target already exists for this period' });
      }

      const kpiTarget = await prisma.employee_kpi_targets.create({
        data: {
          employee_id,
          kpi_name,
          target_value,
          measure_unit,
          period_start: new Date(period_start),
          period_end: new Date(period_end),
          is_active: is_active || 'Y',
          createdby: (req as any).user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
        include: {
          employee_kpi_targets_users: true,
          employee_kpi_actuals_targets: true,
        },
      });

      res.status(201).json({
        message: 'KPI target created successfully',
        data: serializeKpiTarget(kpiTarget),
      });
    } catch (error: any) {
      console.error('Create KPI Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllKpiTargets(req: any, res: any) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        employee_id,
        is_active,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(is_active && { is_active: is_active as string }),
        ...(employee_id && {
          employee_id: parseInt(employee_id as string, 10),
        }),
        ...(search && {
          OR: [
            { kpi_name: { contains: searchLower } },
            { measure_unit: { contains: searchLower } },
            {
              employee_kpi_targets_users: {
                name: { contains: searchLower },
              },
            },
          ],
        }),
      };

      // Statistics
      const totalTargets = await prisma.employee_kpi_targets.count();
      const activeTargets = await prisma.employee_kpi_targets.count({
        where: { is_active: 'Y' },
      });
      const inactiveTargets = await prisma.employee_kpi_targets.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const targetsThisMonth = await prisma.employee_kpi_targets.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      // Paginate
      const { data, pagination } = await paginate({
        model: prisma.employee_kpi_targets,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          employee_kpi_targets_users: true,
          employee_kpi_actuals_targets: {
            where: { is_active: 'Y' },
            orderBy: { measured_date: 'desc' },
            take: 5,
          },
        },
      });

      res.json({
        success: true,
        message: 'KPI targets retrieved successfully',
        data: data.map((kpiTarget: any) => serializeKpiTarget(kpiTarget)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats: {
          total_targets: totalTargets,
          active_targets: activeTargets,
          inactive_targets: inactiveTargets,
          targets_this_month: targetsThisMonth,
        },
      });
    } catch (error: any) {
      console.error('Get All KPI Targets Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getKpiTargetById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const kpiTarget = await prisma.employee_kpi_targets.findUnique({
        where: { id: parseInt(id) },
        include: {
          employee_kpi_targets_users: true,
          employee_kpi_actuals_targets: {
            where: { is_active: 'Y' },
            orderBy: { measured_date: 'desc' },
          },
        },
      });

      if (!kpiTarget) {
        return res.status(404).json({ message: 'KPI target not found' });
      }

      res.json({
        data: serializeKpiTarget(kpiTarget),
      });
    } catch (error: any) {
      console.error('Get KPI Target By ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateKpiTarget(req: Request, res: Response) {
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
        employee_id,
        kpi_name,
        target_value,
        measure_unit,
        period_start,
        period_end,
        is_active,
      } = req.body;

      const existingKpiTarget = await prisma.employee_kpi_targets.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingKpiTarget) {
        return res.status(404).json({ message: 'KPI target not found' });
      }

      // Check if employee exists (if employee_id is being updated)
      if (employee_id && employee_id !== existingKpiTarget.employee_id) {
        const employee = await prisma.users.findUnique({
          where: { id: employee_id },
        });

        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
      }

      // Check for overlapping periods (if period is being updated)
      if (period_start || period_end || kpi_name || employee_id) {
        const checkEmployeeId = employee_id || existingKpiTarget.employee_id;
        const checkKpiName = kpi_name || existingKpiTarget.kpi_name;
        const checkPeriodStart = period_start
          ? new Date(period_start)
          : existingKpiTarget.period_start;
        const checkPeriodEnd = period_end
          ? new Date(period_end)
          : existingKpiTarget.period_end;

        const conflictingTarget = await prisma.employee_kpi_targets.findFirst({
          where: {
            id: { not: parseInt(id) },
            employee_id: checkEmployeeId,
            kpi_name: checkKpiName,
            is_active: 'Y',
            OR: [
              {
                period_start: { lte: checkPeriodEnd },
                period_end: { gte: checkPeriodStart },
              },
            ],
          },
        });

        if (conflictingTarget) {
          return res
            .status(400)
            .json({ message: 'KPI target already exists for this period' });
        }
      }

      const updatedKpiTarget = await prisma.employee_kpi_targets.update({
        where: { id: parseInt(id) },
        data: {
          ...(employee_id && { employee_id }),
          ...(kpi_name && { kpi_name }),
          ...(target_value && { target_value }),
          ...(measure_unit !== undefined && { measure_unit }),
          ...(period_start && { period_start: new Date(period_start) }),
          ...(period_end && { period_end: new Date(period_end) }),
          ...(is_active && { is_active }),
          updatedby: (req as any).user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          employee_kpi_targets_users: true,
          employee_kpi_actuals_targets: {
            where: { is_active: 'Y' },
            orderBy: { measured_date: 'desc' },
          },
        },
      });

      res.json({
        message: 'KPI target updated successfully',
        data: serializeKpiTarget(updatedKpiTarget),
      });
    } catch (error: any) {
      console.error('Update KPI Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteKpiTarget(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingKpiTarget = await prisma.employee_kpi_targets.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingKpiTarget) {
        return res.status(404).json({ message: 'KPI target not found' });
      }

      // Soft delete - set is_active to 'N'
      await prisma.employee_kpi_targets.update({
        where: { id: parseInt(id) },
        data: {
          is_active: 'N',
          updatedby: (req as any).user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.json({
        message: 'KPI target deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete KPI Target Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
