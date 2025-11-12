import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetMovementSerialized {
  id: number;
  asset_id: number;
  from_location?: string | null;
  to_location?: string | null;
  movement_type?: string | null;
  movement_date: Date;
  performed_by: number;
  notes?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_movements_master?: {
    id: number;
    name: string;
    serial_number: string;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
  } | null;
  asset_movements_performed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const serializeAssetMovement = (movement: any): AssetMovementSerialized => ({
  id: movement.id,
  asset_id: movement.asset_id,
  from_location: movement.from_location,
  to_location: movement.to_location,
  movement_type: movement.movement_type,
  movement_date: movement.movement_date,
  performed_by: movement.performed_by,
  notes: movement.notes,
  is_active: movement.is_active,
  createdate: movement.createdate,
  createdby: movement.createdby,
  updatedate: movement.updatedate,
  updatedby: movement.updatedby,
  log_inst: movement.log_inst,
  asset_movements_master: movement.asset_movements_master
    ? {
        id: movement.asset_movements_master.id,
        name: movement.asset_movements_master.name,
        serial_number: movement.asset_movements_master.serial_number,
        asset_master_asset_types: movement.asset_movements_master
          .asset_master_asset_types
          ? {
              id: movement.asset_movements_master.asset_master_asset_types.id,
              name: movement.asset_movements_master.asset_master_asset_types
                .name,
            }
          : null,
      }
    : null,
  asset_movements_performed_by: movement.asset_movements_performed_by
    ? {
        id: movement.asset_movements_performed_by.id,
        name: movement.asset_movements_performed_by.name,
        email: movement.asset_movements_performed_by.email,
      }
    : null,
});

export const assetMovementsController = {
  async createAssetMovements(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.asset_id || !data.performed_by) {
        return res
          .status(400)
          .json({ message: 'asset_id and performed_by are required' });
      }

      const assetMovement = await prisma.asset_movements.create({
        data: {
          ...data,
          movement_date: new Date(data.movement_date),

          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
        include: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: true,
        },
      });

      res.status(201).json({
        message: 'Asset movement created successfully',
        data: serializeAssetMovement(assetMovement),
      });
    } catch (error: any) {
      console.error('Create Asset Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetMovements(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { from_location: { contains: searchLower } },
            { to_location: { contains: searchLower } },
            { movement_type: { contains: searchLower } },
            { notes: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_movements,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: true,
        },
      });

      const totalAssetMovements = await prisma.asset_movements.count();
      const activeAssetMovements = await prisma.asset_movements.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetMovements = await prisma.asset_movements.count({
        where: { is_active: 'N' },
      });
      const thisMonthAssetMovements = await prisma.asset_movements.count({
        where: {
          createdate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
        },
      });
      res.success(
        'Asset movements retrieved successfully',
        data.map((m: any) => serializeAssetMovement(m)),
        200,
        pagination,
        {
          total_records: totalAssetMovements,
          active_records: activeAssetMovements,
          inactive_records: inactiveAssetMovements,
          this_month_records: thisMonthAssetMovements,
        }
      );
    } catch (error: any) {
      console.error('Get Asset Movements Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetMovementsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movement = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
        include: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: true,
        },
      });

      if (!movement) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      res.json({
        message: 'Asset movement fetched successfully',
        data: serializeAssetMovement(movement),
      });
    } catch (error: any) {
      console.error('Get Asset Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetMovements(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      const updated = await prisma.asset_movements.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          movement_date: new Date(req.body.movement_date),

          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        select: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: true,
        },
      });

      res.json({
        message: 'Asset movement updated successfully',
        data: serializeAssetMovement(updated),
      });
    } catch (error: any) {
      console.error('Update Asset Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetMovements(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.asset_movements.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Asset movement not found' });
      }

      await prisma.asset_movements.delete({ where: { id: Number(id) } });
      res.json({ message: 'Asset movement deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
