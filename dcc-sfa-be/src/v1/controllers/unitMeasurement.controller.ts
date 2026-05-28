import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { parse } from 'path';

interface UnitSerialized {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  symbol?: string | null;
  sub_unit?: string | null;
  conversion_rate?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_unit_of_measurement?: { id: number; name: string }[];
  subunit?: {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    subunits_products?: {
      id: number;
      name: string;
      code: string;
    } | null;
  } | null;
}

const serializeUnit = (unit: any): UnitSerialized => ({
  id: unit.id,
  name: unit.name,
  description: unit.description,
  category: unit.category,
  symbol: unit.symbol,
  sub_unit: unit.sub_unit,
  conversion_rate: unit.conversion_rate,
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
  subunit: unit.subunit
    ? {
        id: unit.subunit.id,
        name: unit.subunit.name,
        code: unit.subunit.code,
        description: unit.subunit.description,
        subunits_products: unit.subunit.subunits_products
          ? {
              id: unit.subunit.subunits_products.id,
              name: unit.subunit.subunits_products.name,
              code: unit.subunit.subunits_products.code,
            }
          : null,
      }
    : null,
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
          sub_unit: data.sub_unit || null,
          conversion_rate: data.conversion_rate || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || data.createdby || 1,
          log_inst: data.log_inst || 1,
          subunit: {
            create: {
              name: data.name,
              code: data.code || data.name.toUpperCase().replace(/\s/g, '_'),
              description: data.description || null,
              is_active: data.is_active || 'Y',
              createdate: new Date(),
              createdby: req.user?.id || data.createdby || 1,
              log_inst: data.log_inst || 1,
            },
          },
        },
        include: {
          product_unit_of_measurement: true,
          subunit: true,
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
          subunit: {
            include: {
              subunits_products: true,
            },
          },
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
        include: {
          product_unit_of_measurement: true,
          subunit: {
            include: {
              subunits_products: true,
            },
          },
        },
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
        include: {
          subunit: true,
        },
      });

      if (!existingUnit)
        return res.status(404).json({ message: 'Unit not found' });

      const data = {
        name: req.body.name,
        description: req.body.description || '',
        category: req.body.category || '',
        symbol: req.body.symbol || '',
        sub_unit: req.body.sub_unit || '',
        conversion_rate: req.body.conversion_rate || null,
        is_active: req.body.is_active || 'Y',
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const unit = await prisma.unit_of_measurement.update({
        where: { id: Number(id) },
        data: {
          ...data,
          subunit: existingUnit.subunit
            ? {
                update: {
                  name: req.body.name,
                  code:
                    req.body.code ||
                    req.body.name.toUpperCase().replace(/\s/g, '_'),
                  description: req.body.description || null,
                  is_active: req.body.is_active || 'Y',
                  updatedate: new Date(),
                  updatedby: req.user?.id,
                },
              }
            : {
                create: {
                  name: req.body.name,
                  code:
                    req.body.code ||
                    req.body.name.toUpperCase().replace(/\s/g, '_'),
                  description: req.body.description || null,
                  is_active: req.body.is_active || 'Y',
                  createdate: new Date(),
                  createdby: req.user?.id || 1,
                  log_inst: 1,
                },
              },
        },
        include: {
          product_unit_of_measurement: true,
          subunit: true,
        },
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

  async getSubunitsByUnitMeasurement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await prisma.unit_of_measurement.findUnique({
        where: { id: Number(id) },
        include: {
          subunit: {
            include: {
              subunits_products: true,
            },
          },
        },
      });

      if (!unit) {
        return res
          .status(404)
          .json({ message: 'Unit of measurement not found' });
      }

      if (!unit.subunit) {
        return res.json({
          message: 'No subunit found for this unit',
          data: null,
        });
      }

      res.json({
        message: 'Subunit retrieved successfully',
        data: {
          id: unit.subunit.id,
          name: unit.subunit.name,
          code: unit.subunit.code,
          description: unit.subunit.description,
          unit_of_measurement_id: unit.subunit.unit_of_measurement_id,
          is_active: unit.subunit.is_active,
          createdate: unit.subunit.createdate,
          createdby: unit.subunit.createdby,
          updatedate: unit.subunit.updatedate,
          updatedby: unit.subunit.updatedby,
          log_inst: unit.subunit.log_inst,
          subunits_products: unit.subunit.subunits_products,
          unit_of_measurement: {
            id: unit.id,
            name: unit.name,
            symbol: unit.symbol,
          },
        },
      });
    } catch (error: any) {
      console.error('Get Subunit by Unit Measurement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteUnitMeasurement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingUnit = await prisma.unit_of_measurement.findUnique({
        where: { id: Number(id) },
        include: {
          subunit: true,
        },
      });

      if (!existingUnit)
        return res.status(404).json({ message: 'Unit not found' });

      if (existingUnit.subunit) {
        await prisma.subunits.delete({
          where: { id: existingUnit.subunit.id },
        });
      }

      await prisma.unit_of_measurement.delete({
        where: { id: Number(id) },
      });

      res.json({
        message: 'Unit deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Unit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
