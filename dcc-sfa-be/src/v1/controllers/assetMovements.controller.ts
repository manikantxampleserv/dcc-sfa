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
      if (!data.asset_id || !data.performed_by || !data.movement_type) {
        return res.status(400).json({
          message: 'asset_id, performed_by, and movement_type are required',
        });
      }

      const currentAsset = await prisma.asset_master.findUnique({
        where: { id: data.asset_id },
      });

      if (!currentAsset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      let assetStatusUpdate: string = '';
      let fromDepotId: number | null = null;
      let toDepotId: number | null = null;
      let fromCustomerId: number | null = null;
      let toCustomerId: number | null = null;
      let fromLocation: string = '';
      let toLocation: string = '';

      switch (data.movement_type.toLowerCase()) {
        case 'transfer':
          if (!data.asset_movements_depot_id || !data.to_depot_id) {
            return res.status(400).json({
              message:
                'from_depot_id and to_depot_id are required for transfer movements',
            });
          }
          fromDepotId = data.asset_movements_depot_id;
          toDepotId = data.to_depot_id;

          const fromDepot = await prisma.depots.findUnique({
            where: { id: fromDepotId! },
          });
          const toDepot = await prisma.depots.findUnique({
            where: { id: toDepotId! },
          });

          if (!fromDepot || !toDepot) {
            return res.status(400).json({
              message: 'One or both depots not found',
            });
          }

          fromLocation = fromDepot.name;
          toLocation = toDepot.name;
          assetStatusUpdate = 'Available';
          break;

        case 'maintenance':
          const fromIsDepot =
            data.asset_movements_depot_id && !data.asset_movements_customer_id;
          const toIsDepot = data.to_depot_id && !data.to_customer_id;
          const fromIsCustomer =
            data.asset_movements_customer_id && !data.asset_movements_depot_id;
          const toIsCustomer = data.to_customer_id && !data.to_depot_id;

          if (
            !((fromIsDepot && toIsCustomer) || (fromIsCustomer && toIsDepot))
          ) {
            return res.status(400).json({
              message:
                'Maintenance movements must be from depot to customer or customer to depot',
            });
          }

          if (fromIsDepot) {
            fromDepotId = data.asset_movements_depot_id;
            const fromDepot = await prisma.depots.findUnique({
              where: { id: fromDepotId! },
            });
            if (!fromDepot)
              return res.status(400).json({ message: 'From depot not found' });
            fromLocation = fromDepot.name;

            toCustomerId = data.to_customer_id;
            const toCustomer = await prisma.customers.findUnique({
              where: { id: toCustomerId! },
            });
            if (!toCustomer)
              return res.status(400).json({ message: 'To customer not found' });
            toLocation = toCustomer.name;
          } else {
            fromCustomerId = data.asset_movements_customer_id;
            const fromCustomer = await prisma.customers.findUnique({
              where: { id: fromCustomerId! },
            });
            if (!fromCustomer)
              return res
                .status(400)
                .json({ message: 'From customer not found' });
            fromLocation = fromCustomer.name;

            toDepotId = data.to_depot_id;
            const toDepot = await prisma.depots.findUnique({
              where: { id: toDepotId! },
            });
            if (!toDepot)
              return res.status(400).json({ message: 'To depot not found' });
            toLocation = toDepot.name;
          }

          assetStatusUpdate = 'Under Maintenance';

          try {
            await prisma.asset_maintenance.create({
              data: {
                asset_id: data.asset_id,
                maintenance_date: new Date(data.movement_date),
                issue_reported: data.notes || 'Maintenance movement',
                action_taken: `Asset moved from ${fromLocation} to ${toLocation}`,
                remarks: `Movement type: ${data.movement_type}`,
                createdby: req.user?.id || 1,
                createdate: new Date(),
                technician_id: data.performed_by,
                log_inst: 1,
              },
            });
          } catch (maintenanceError) {
            console.error(
              'Error creating asset maintenance record:',
              maintenanceError
            );
          }

          break;

        case 'repair':
          const repairFromIsDepot =
            data.asset_movements_depot_id && !data.asset_movements_customer_id;
          const repairToIsDepot = data.to_depot_id && !data.to_customer_id;
          const repairFromIsCustomer =
            data.asset_movements_customer_id && !data.asset_movements_depot_id;
          const repairToIsCustomer = data.to_customer_id && !data.to_depot_id;

          if (
            !(
              (repairFromIsDepot && repairToIsCustomer) ||
              (repairFromIsCustomer && repairToIsDepot)
            )
          ) {
            return res.status(400).json({
              message:
                'Repair movements must be from depot to customer or customer to depot',
            });
          }

          if (repairFromIsDepot) {
            fromDepotId = data.asset_movements_depot_id;
            const fromDepot = await prisma.depots.findUnique({
              where: { id: fromDepotId! },
            });
            if (!fromDepot)
              return res.status(400).json({ message: 'From depot not found' });
            fromLocation = fromDepot.name;

            toCustomerId = data.to_customer_id;
            const toCustomer = await prisma.customers.findUnique({
              where: { id: toCustomerId! },
            });
            if (!toCustomer)
              return res.status(400).json({ message: 'To customer not found' });
            toLocation = toCustomer.name;
          } else {
            fromCustomerId = data.asset_movements_customer_id;
            const fromCustomer = await prisma.customers.findUnique({
              where: { id: fromCustomerId! },
            });
            if (!fromCustomer)
              return res
                .status(400)
                .json({ message: 'From customer not found' });
            fromLocation = fromCustomer.name;

            toDepotId = data.to_depot_id;
            const toDepot = await prisma.depots.findUnique({
              where: { id: toDepotId! },
            });
            if (!toDepot)
              return res.status(400).json({ message: 'To depot not found' });
            toLocation = toDepot.name;
          }

          assetStatusUpdate = 'Under Maintenance';

          try {
            await prisma.asset_maintenance.create({
              data: {
                asset_id: data.asset_id,
                maintenance_date: new Date(data.movement_date),
                issue_reported: data.notes || 'Repair movement',
                action_taken: `Asset moved from ${fromLocation} to ${toLocation}`,
                remarks: `Movement type: ${data.movement_type}`,
                createdby: req.user?.id || 1,
                createdate: new Date(),
                technician_id: data.performed_by,
                log_inst: 1,
              },
            });
          } catch (maintenanceError) {
            console.error(
              'Error creating asset maintenance record:',
              maintenanceError
            );
          }

          break;

        case 'disposal':
        case 'return':
          const disposalFromIsDepot =
            data.asset_movements_depot_id && !data.asset_movements_customer_id;
          const disposalToIsDepot = data.to_depot_id && !data.to_customer_id;
          const disposalFromIsCustomer =
            data.asset_movements_customer_id && !data.asset_movements_depot_id;
          const disposalToIsCustomer = data.to_customer_id && !data.to_depot_id;

          if (
            !(
              (disposalFromIsDepot && disposalToIsCustomer) ||
              (disposalFromIsCustomer && disposalToIsDepot)
            )
          ) {
            return res.status(400).json({
              message:
                'Disposal and return movements must be from depot to customer or customer to depot',
            });
          }

          if (disposalFromIsDepot) {
            fromDepotId = data.asset_movements_depot_id;
            const fromDepot = await prisma.depots.findUnique({
              where: { id: fromDepotId! },
            });
            if (!fromDepot)
              return res.status(400).json({ message: 'From depot not found' });
            fromLocation = fromDepot.name;

            toCustomerId = data.to_customer_id;
            const toCustomer = await prisma.customers.findUnique({
              where: { id: toCustomerId! },
            });
            if (!toCustomer)
              return res.status(400).json({ message: 'To customer not found' });
            toLocation = toCustomer.name;
          } else {
            fromCustomerId = data.asset_movements_customer_id;
            const fromCustomer = await prisma.customers.findUnique({
              where: { id: fromCustomerId! },
            });
            if (!fromCustomer)
              return res
                .status(400)
                .json({ message: 'From customer not found' });
            fromLocation = fromCustomer.name;

            toDepotId = data.to_depot_id;
            const toDepot = await prisma.depots.findUnique({
              where: { id: toDepotId! },
            });
            if (!toDepot)
              return res.status(400).json({ message: 'To depot not found' });
            toLocation = toDepot.name;
          }

          assetStatusUpdate = 'Retired';
          break;

        default:
          return res.status(400).json({
            message:
              'Invalid movement_type. Must be one of: transfer, maintenance, repair, disposal, return',
          });
      }

      const assetMovement = await prisma.asset_movements.create({
        data: {
          asset_id: data.asset_id,
          from_location: fromLocation,
          to_location: toLocation,
          movement_type: data.movement_type,
          movement_date: new Date(data.movement_date),
          performed_by: data.performed_by,
          notes: data.notes,
          asset_movements_depot_id: fromDepotId,
          asset_movements_customer_id: fromCustomerId,
          is_active: data.is_active || 'Y',
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
          asset_movements_depot: true,
          asset_movements_customer: true,
        },
      });

      await prisma.asset_master.update({
        where: { id: data.asset_id },
        data: {
          current_location: toLocation,
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
              asset_movements_master: {
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
            { from_location: { contains: searchLower } },
            { to_location: { contains: searchLower } },
            { movement_type: { contains: searchLower } },
            { notes: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(performed_by && { performed_by: Number(performed_by) }),
        ...(asset_type_id && {
          asset_movements_master: {
            asset_type_id: Number(asset_type_id),
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
