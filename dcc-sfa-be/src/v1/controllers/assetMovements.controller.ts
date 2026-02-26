import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetMovementSerialized {
  id: number;
  asset_ids: number[];
  from_direction?: string | null;
  from_depot_id?: number | null;
  from_customer_id?: number | null;
  to_direction?: string | null;
  to_depot_id?: number | null;
  to_customer_id?: number | null;
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
  asset_movements_assets?: {
    id: number;
    asset_id: number;
    asset_master: {
      id: number;
      name: string;
      serial_number: string;
      asset_master_asset_types?: {
        id: number;
        name: string;
      } | null;
    };
  }[];
  asset_movement_from_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_from_customer?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_customer?: {
    id: number;
    name: string;
  } | null;
  asset_movements_performed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const serializeAssetMovement = (movement: any): AssetMovementSerialized => ({
  id: movement.id,
  asset_ids:
    movement.asset_movements_assets?.map((aa: any) => aa.asset_id) || [],
  from_direction: movement.from_direction,
  from_depot_id: movement.from_depot_id,
  from_customer_id: movement.from_customer_id,
  to_direction: movement.to_direction,
  to_depot_id: movement.to_depot_id,
  to_customer_id: movement.to_customer_id,
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
  asset_movements_assets:
    movement.asset_movements_assets?.map((aa: any) => ({
      id: aa.id,
      asset_id: aa.asset_id,
      asset_master: aa.asset_movement_assets_asset
        ? {
            id: aa.asset_movement_assets_asset.id,
            name: aa.asset_movement_assets_asset.name,
            serial_number: aa.asset_movement_assets_asset.serial_number,
            asset_master_asset_types: aa.asset_movement_assets_asset
              .asset_master_asset_types
              ? {
                  id: aa.asset_movement_assets_asset.asset_master_asset_types
                    .id,
                  name: aa.asset_movement_assets_asset.asset_master_asset_types
                    .name,
                }
              : null,
          }
        : null,
    })) || [],
  asset_movement_from_depot: movement.asset_movement_from_depot
    ? {
        id: movement.asset_movement_from_depot.id,
        name: movement.asset_movement_from_depot.name,
      }
    : null,
  asset_movement_from_customer: movement.asset_movement_from_customer
    ? {
        id: movement.asset_movement_from_customer.id,
        name: movement.asset_movement_from_customer.name,
      }
    : null,
  asset_movement_to_depot: movement.asset_movement_to_depot
    ? {
        id: movement.asset_movement_to_depot.id,
        name: movement.asset_movement_to_depot.name,
      }
    : null,
  asset_movement_to_customer: movement.asset_movement_to_customer
    ? {
        id: movement.asset_movement_to_customer.id,
        name: movement.asset_movement_to_customer.name,
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
      const assetIds = Array.isArray(data.asset_ids)
        ? data.asset_ids
        : [data.asset_id];

      if (!assetIds.length || !data.performed_by || !data.movement_type) {
        return res.status(400).json({
          message:
            'asset_ids (array or single), performed_by, and movement_type are required',
        });
      }

      const currentAssets = await prisma.asset_master.findMany({
        where: { id: { in: assetIds } },
      });

      if (currentAssets.length !== assetIds.length) {
        return res.status(404).json({
          message: 'One or more assets not found',
          missing_assets: assetIds.filter(
            (id: number) => !currentAssets.find((asset: any) => asset.id === id)
          ),
        });
      }

      let assetStatusUpdate: string = '';
      let fromDepotId: number | null = null;
      let toDepotId: number | null = null;
      let fromCustomerId: number | null = null;
      let toCustomerId: number | null = null;
      let fromDirection: string = '';
      let toDirection: string = '';

      // Set direction and IDs based on input
      if (data.from_direction === 'depot' && data.from_depot_id) {
        fromDirection = 'depot';
        fromDepotId = data.from_depot_id;
      } else if (data.from_direction === 'outlet' && data.from_customer_id) {
        fromDirection = 'outlet';
        fromCustomerId = data.from_customer_id;
      }

      if (data.to_direction === 'depot' && data.to_depot_id) {
        toDirection = 'depot';
        toDepotId = data.to_depot_id;
      } else if (data.to_direction === 'outlet' && data.to_customer_id) {
        toDirection = 'outlet';
        toCustomerId = data.to_customer_id;
      }

      // Validate depot/customer existence
      if (fromDepotId) {
        const fromDepot = await prisma.depots.findUnique({
          where: { id: fromDepotId },
        });
        if (!fromDepot) {
          return res.status(400).json({ message: 'From depot not found' });
        }
      }

      if (toDepotId) {
        const toDepot = await prisma.depots.findUnique({
          where: { id: toDepotId },
        });
        if (!toDepot) {
          return res.status(400).json({ message: 'To depot not found' });
        }
      }

      if (fromCustomerId) {
        const fromCustomer = await prisma.customers.findUnique({
          where: { id: fromCustomerId },
        });
        if (!fromCustomer) {
          return res.status(400).json({ message: 'From customer not found' });
        }
      }

      if (toCustomerId) {
        const toCustomer = await prisma.customers.findUnique({
          where: { id: toCustomerId },
        });
        if (!toCustomer) {
          return res.status(400).json({ message: 'To customer not found' });
        }
      }

      // Set asset status based on movement type
      switch (data.movement_type.toLowerCase()) {
        case 'transfer':
          assetStatusUpdate = 'Available';
          break;
        case 'maintenance':
        case 'repair':
          assetStatusUpdate = 'Under Maintenance';
          // Create maintenance records
          try {
            await prisma.asset_maintenance.createMany({
              data: assetIds.map((assetId: number) => ({
                asset_id: assetId,
                maintenance_date: new Date(data.movement_date),
                issue_reported: data.notes || `${data.movement_type} movement`,
                action_taken: `Asset moved from ${fromDirection} to ${toDirection}`,
                remarks: `Movement type: ${data.movement_type}`,
                createdby: req.user?.id || 1,
                createdate: new Date(),
                technician_id: data.performed_by,
                log_inst: 1,
              })),
            });
          } catch (maintenanceError) {
            console.error(
              'Error creating asset maintenance records:',
              maintenanceError
            );
          }
          break;
        case 'installation':
          assetStatusUpdate = 'Installed';
          break;
        case 'disposal':
          assetStatusUpdate = 'Retired';
          break;
        case 'return':
          assetStatusUpdate = 'Available';
          break;
        default:
          return res.status(400).json({
            message:
              'Invalid movement_type. Must be one of: transfer, maintenance, repair, disposal, return, installation',
          });
      }

      const assetMovement = await prisma.asset_movements.create({
        data: {
          from_direction: data.from_direction,
          to_direction: data.to_direction,
          from_depot_id: fromDepotId,
          from_customer_id: fromCustomerId,
          to_depot_id: toDepotId,
          to_customer_id: toCustomerId,
          movement_type: data.movement_type,
          movement_date: new Date(data.movement_date),
          performed_by: data.performed_by,
          notes: data.notes,
          is_active: data.is_active || 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
          asset_movement_assets: {
            create: assetIds.map((assetId: number) => ({
              asset_id: assetId,
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            })),
          },
        },
        include: {
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          asset_movements_performed_by: true,
          asset_movement_from_depot: {
            select: { id: true, name: true },
          },
          asset_movement_from_customer: {
            select: { id: true, name: true },
          },
          asset_movement_to_depot: {
            select: { id: true, name: true },
          },
          asset_movement_to_customer: {
            select: { id: true, name: true },
          },
        },
      });

      await prisma.asset_master.updateMany({
        where: { id: { in: assetIds } },
        data: {
          current_location: `${toDirection} (${toDepotId || toCustomerId})`,
          current_status: assetStatusUpdate,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
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
      const { page, limit, search, status, asset_type_id, performed_by } =
        req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            {
              asset_movement_assets: {
                some: {
                  asset_movement_assets_asset: {
                    OR: [
                      { serial_number: { contains: searchLower } },
                      { current_location: { contains: searchLower } },
                      { current_status: { contains: searchLower } },
                      { assigned_to: { contains: searchLower } },
                      {
                        asset_master_asset_types: {
                          name: { contains: searchLower },
                        },
                      },
                    ],
                  },
                },
              },
            },
            { from_direction: { contains: searchLower } },
            { to_direction: { contains: searchLower } },
            { movement_type: { contains: searchLower } },
            { notes: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(performed_by && { performed_by: Number(performed_by) }),
        ...(asset_type_id && {
          asset_movement_assets: {
            some: {
              asset_movement_assets_asset: {
                asset_type_id: Number(asset_type_id),
              },
            },
          },
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_movements,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          asset_movements_performed_by: true,
          asset_movement_from_depot: {
            select: { id: true, name: true },
          },
          asset_movement_from_customer: {
            select: { id: true, name: true },
          },
          asset_movement_to_depot: {
            select: { id: true, name: true },
          },
          asset_movement_to_customer: {
            select: { id: true, name: true },
          },
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
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
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
          asset_movement_assets: {
            include: {
              asset_movement_assets_asset: {
                include: {
                  asset_master_asset_types: {
                    select: { id: true, name: true },
                  },
                },
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
