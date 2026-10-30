import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetMaintenanceSerialized {
  id: number;
  asset_id: number;
  maintenance_date: Date;
  issue_reported?: string | null;
  action_taken?: string | null;
  technician_id: number;
  cost?: number | null;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_maintenance_master?: {
    id: number;
    name: string;
    serial_number: string;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
  } | null;
  asset_maintenance_technician?: {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
  } | null;
  spares?: Array<{
    id: number;
    name: string;
    cost: number;
  }>;
}
const serializeAssetMaintenance = (m: any): AssetMaintenanceSerialized => ({
  id: m.id,
  asset_id: m.asset_id,
  maintenance_date: m.maintenance_date,
  issue_reported: m.issue_reported,
  action_taken: m.action_taken,
  technician_id: m.technician_id,
  cost: m.cost ? Number(m.cost) : null,
  remarks: m.remarks,
  is_active: m.is_active,
  createdate: m.createdate,
  createdby: m.createdby,
  updatedate: m.updatedate,
  updatedby: m.updatedby,
  log_inst: m.log_inst,
  spares: Array.isArray(m.spares)
    ? m.spares.map((s: any) => ({
        id: s.id,
        name: s.name,
        cost: Number(s.cost) || 0,
      }))
    : [],
  asset_maintenance_master: m.asset_maintenance_master
    ? {
        id: m.asset_maintenance_master.id,
        name: m.asset_maintenance_master.name,
        serial_number: m.asset_maintenance_master.serial_number,
        asset_master_asset_types: m.asset_maintenance_master
          .asset_master_asset_types
          ? {
              id: m.asset_maintenance_master.asset_master_asset_types.id,
              name: m.asset_maintenance_master.asset_master_asset_types.name,
            }
          : null,
      }
    : null,
  asset_maintenance_technician: m.asset_maintenance_technician
    ? {
        id: m.asset_maintenance_technician.id,
        name: m.asset_maintenance_technician.name,
        email: m.asset_maintenance_technician.email,
        profile_image: m.asset_maintenance_technician.profile_image,
      }
    : null,
});

export const assetMaintenanceController = {
  async createAssetMaintenance(req: any, res: Response) {
    try {
      const { spares, ...maintenanceData } = req.body;

      if (
        !maintenanceData.asset_id ||
        !maintenanceData.technician_id ||
        !maintenanceData.maintenance_date
      ) {
        return res.status(400).json({
          message: 'asset_id, technician_id, and maintenance_date are required',
        });
      }

      const asset = await prisma.asset_master.findUnique({
        where: { id: maintenanceData.asset_id },
      });

      if (!asset) {
        return res.status(404).json({
          message: 'Asset not found',
        });
      }

      const sparesToCreate =
        Array.isArray(spares) && spares.length > 0
          ? spares
              .filter(
                (s: any) => s && typeof s.name === 'string' && s.name.trim()
              )
              .map((s: any) => ({
                name: s.name.trim(),
                cost: Number(s.cost) || 0,
                createdby: req.user?.id || 1,
              }))
          : [];

      const record = await prisma.asset_maintenance.create({
        data: {
          ...maintenanceData,
          maintenance_date: new Date(maintenanceData.maintenance_date),
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: maintenanceData.log_inst || 1,
          ...(sparesToCreate.length > 0
            ? {
                spares: {
                  create: sparesToCreate,
                },
              }
            : {}),
        },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      res.status(201).json({
        message: 'Asset maintenance record created successfully',
        data: serializeAssetMaintenance(record),
      });
    } catch (error: any) {
      console.error('Create Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetMaintenance(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { issue_reported: { contains: searchLower } },
            { action_taken: { contains: searchLower } },
            { remarks: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_maintenance,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      const totalRecords = await prisma.asset_maintenance.count();
      const activeRecords = await prisma.asset_maintenance.count({
        where: { is_active: 'Y' },
      });
      const inactiveRecords = await prisma.asset_maintenance.count({
        where: { is_active: 'N' },
      });
      const thisMonthRecords = await prisma.asset_maintenance.count({
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
        'Asset maintenance records retrieved successfully',
        data.map((m: any) => serializeAssetMaintenance(m)),
        200,
        pagination,
        {
          total_records: totalRecords,
          active_records: activeRecords,
          inactive_records: inactiveRecords,
          this_month_records: thisMonthRecords,
        }
      );
    } catch (error: any) {
      console.error('Get Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetMaintenanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
        include: {
          asset_maintenance_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_maintenance_technician: true,
          spares: true,
        },
      });

      if (!record)
        return res.status(404).json({ message: 'Asset maintenance not found' });

      res.json({
        message: 'Asset maintenance fetched successfully',
        data: serializeAssetMaintenance(record),
      });
    } catch (error: any) {
      console.error('Get Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetMaintenance(req: any, res: any) {
    try {
      const { id } = req.params;
      const maintenanceId = Number(id);

      const existing = await prisma.asset_maintenance.findUnique({
        where: { id: maintenanceId },
      });

      if (!existing)
        return res.status(404).json({ message: 'Asset maintenance not found' });

      const { spares, ...updateData } = req.body;

      const updated = await prisma.$transaction(async (tx: any) => {
        if (spares !== undefined) {
          await tx.asset_maintenance_spares.deleteMany({
            where: { asset_maintenance_id: maintenanceId },
          });

          if (Array.isArray(spares) && spares.length > 0) {
            const sparesToCreate = spares
              .filter(
                (s: any) => s && typeof s.name === 'string' && s.name.trim()
              )
              .map((s: any) => ({
                asset_maintenance_id: maintenanceId,
                name: s.name.trim(),
                cost: Number(s.cost) || 0,
                createdby: req.user?.id || 1,
              }));

            if (sparesToCreate.length > 0) {
              await tx.asset_maintenance_spares.createMany({
                data: sparesToCreate,
              });
            }
          }
        }

        return tx.asset_maintenance.update({
          where: { id: maintenanceId },
          data: {
            ...updateData,
            ...(updateData.maintenance_date
              ? { maintenance_date: new Date(updateData.maintenance_date) }
              : {}),
            updatedby: req.user?.id || updateData.updatedby || 1,
            updatedate: new Date(),
          },
          include: {
            asset_maintenance_master: {
              include: {
                asset_master_asset_types: {
                  select: { id: true, name: true },
                },
              },
            },
            asset_maintenance_technician: true,
            spares: true,
          },
        });
      });

      res.json({
        message: 'Asset maintenance updated successfully',
        data: serializeAssetMaintenance(updated),
      });
    } catch (error: any) {
      console.error('Update Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.asset_maintenance.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Asset maintenance not found' });

      await prisma.asset_maintenance.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset maintenance deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Maintenance Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
