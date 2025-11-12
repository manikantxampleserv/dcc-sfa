import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface UnitSerialized {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  symbol?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_unit_of_measurement?: { id: number; name: string }[];
}

const serializeUnit = (unit: any): UnitSerialized => ({
  id: unit.id,
  name: unit.name,
  description: unit.description,
  category: unit.category,
  symbol: unit.symbol,
  is_active: unit.is_active,
  createdate: unit.createdate,
  createdby: unit.createdby,
  updatedate: unit.updatedate,
  updatedby: unit.updatedby,
  log_inst: unit.log_inst,
  product_unit_of_measurement:
    unit.product_unit_of_measurement?.map((p: any) => ({
      id: p.id,
      name: p.name,
    })) || [],
});

export const unitMeasurementController = {
  async createUnitMeasurement(req: any, res: any) {
    try {
      const data = req.body;

      const unit = await prisma.unit_of_measurement.create({
        data: {
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          symbol: data.symbol || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || data.createdby || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          product_unit_of_measurement: true,
        },
      });

      res.status(201).json({
        message: 'Unit of measurement created successfully',
        data: serializeUnit(unit),
      });
    } catch (error: any) {
      console.error('Create Unit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllUnitMeasurement(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { description: { contains: searchLower } },
            { category: { contains: searchLower } },
            { symbol: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.unit_of_measurement,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          product_unit_of_measurement: true,
        },
      });

      const totalUnits = await prisma.unit_of_measurement.count();
      const activeUnits = await prisma.unit_of_measurement.count({
        where: { is_active: 'Y' },
      });
      const inactiveUnits = await prisma.unit_of_measurement.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newUnitsThisMonth = await prisma.unit_of_measurement.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Units retrieved successfully',
        data.map((u: any) => serializeUnit(u)),
        200,
        pagination,
        {
          total_units: totalUnits,
          active_units: activeUnits,
          inactive_units: inactiveUnits,
          new_units_this_month: newUnitsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Units Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getUnitMeasurementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await prisma.unit_of_measurement.findUnique({
        where: { id: Number(id) },
        include: { product_unit_of_measurement: true },
      });

      if (!unit) return res.status(404).json({ message: 'Unit not found' });

      res.json({
        message: 'Unit fetched successfully',
        data: serializeUnit(unit),
      });
    } catch (error: any) {
      console.error('Get Unit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateUnitMeasurement(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingUnit = await prisma.unit_of_measurement.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUnit)
        return res.status(404).json({ message: 'Unit not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const unit = await prisma.unit_of_measurement.update({
        where: { id: Number(id) },
        data,
        include: { product_unit_of_measurement: true },
      });

      res.json({
        message: 'Unit updated successfully',
        data: serializeUnit(unit),
      });
    } catch (error: any) {
      console.error('Update Unit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteUnitMeasurement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingUnit = await prisma.unit_of_measurement.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUnit)
        return res.status(404).json({ message: 'Unit not found' });

      await prisma.unit_of_measurement.delete({ where: { id: Number(id) } });

      res.json({ message: 'Unit deleted successfully' });
    } catch (error: any) {
      console.error('Delete Unit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
