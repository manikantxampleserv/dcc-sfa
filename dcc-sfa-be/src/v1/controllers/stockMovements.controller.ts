import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface StockMovementSerialized {
  id: number;
  product_id: number;
  batch_id?: number | null;
  serial_id?: number | null;
  movement_type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  from_location_id?: number | null;
  to_location_id?: number | null;
  quantity: number;
  movement_date?: Date | null;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  van_inventory_id?: number | null;
  product?: { id: number; name: string; code: string } | null;
  from_location?: { id: number; name: string } | null;
  to_location?: { id: number; name: string } | null;
  van_inventory?: {
    id: number;
    user_id: number;
    status: string;
    loading_type: string;
    document_date?: Date | null;
    items_count?: number;
  } | null;
}

const serializeStockMovement = (sm: any): StockMovementSerialized => ({
  id: sm.id,
  product_id: sm.product_id,
  batch_id: sm.batch_id,
  serial_id: sm.serial_id,
  movement_type: sm.movement_type,
  reference_type: sm.reference_type,
  reference_id: sm.reference_id,
  from_location_id: sm.from_location_id,
  to_location_id: sm.to_location_id,
  quantity: sm.quantity,
  movement_date: sm.movement_date,
  remarks: sm.remarks,
  is_active: sm.is_active,
  createdate: sm.createdate,
  createdby: sm.createdby,
  updatedate: sm.updatedate,
  updatedby: sm.updatedby,
  log_inst: sm.log_inst,
  van_inventory_id: sm.van_inventory_id,
  product: sm.stock_movements_products
    ? {
        id: sm.stock_movements_products.id,
        name: sm.stock_movements_products.name,
        code: sm.stock_movements_products.code,
      }
    : null,
  from_location: sm.stock_movements_from_location
    ? {
        id: sm.stock_movements_from_location.id,
        name: sm.stock_movements_from_location.name,
      }
    : null,
  to_location: sm.stock_movements_to_location
    ? {
        id: sm.stock_movements_to_location.id,
        name: sm.stock_movements_to_location.name,
      }
    : null,
  van_inventory: sm.van_inventory_stock_movements
    ? {
        id: sm.van_inventory_stock_movements.id,
        user_id: sm.van_inventory_stock_movements.user_id,
        status: sm.van_inventory_stock_movements.status || 'A',
        loading_type: sm.van_inventory_stock_movements.loading_type || 'L',
        document_date: sm.van_inventory_stock_movements.document_date || null,
        items_count:
          sm.van_inventory_stock_movements.van_inventory_items_inventory
            ?.length || 0,
      }
    : null,
});

export const stockMovementsController = {
  async createStockMovement(req: any, res: Response) {
    try {
      const data = req.body;
      if (
        data.from_location_id &&
        data.to_location_id &&
        data.from_location_id === data.to_location_id
      ) {
        return res.status(400).json({
          message: 'From location and To location cannot be the same',
        });
      }
      const newMovement = await prisma.stock_movements.create({
        data: {
          product_id: data.product_id,
          batch_id: data.batch_id,
          serial_id: data.serial_id,
          movement_type: data.movement_type,
          reference_type: data.reference_type,
          reference_id: data.reference_id,
          from_location_id: data.from_location_id,
          to_location_id: data.to_location_id,
          quantity: data.quantity,
          movement_date: data.movement_date
            ? new Date(data.movement_date)
            : new Date(),
          remarks: data.remarks,
          van_inventory_id: data.van_inventory_id,
          createdby: req.user?.id || 1,
          is_active: data.is_active || 'Y',
          log_inst: data.log_inst || 1,
        },
        include: {
          stock_movements_products: true,
          stock_movements_from_location: true,
          stock_movements_to_location: true,
          van_inventory_stock_movements: {
            include: {
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: true,
                },
              },
              van_inventory_users: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Stock Movement created successfully',
        data: serializeStockMovement(newMovement),
      });
    } catch (error: any) {
      console.error('Create Stock Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllStockMovements(req: any, res: any) {
    try {
      const { page, limit, search, status, movement_type } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { movement_type: { contains: searchLower } },
            { reference_type: { contains: searchLower } },
            { remarks: { contains: searchLower } },
          ],
        }),
        ...(status && {
          is_active: status.toLowerCase() === 'active' ? 'Y' : 'N',
        }),
        ...(movement_type && {
          movement_type: movement_type,
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.stock_movements,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          stock_movements_products: true,
          stock_movements_from_location: true,
          stock_movements_to_location: true,
          van_inventory_stock_movements: {
            include: {
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: true,
                },
              },
              van_inventory_users: true,
            },
          },
        },
      });

      // Calculate statistics
      const [
        totalStockMovements,
        activeStockMovements,
        inactiveStockMovements,
        stockMovementsThisMonth,
        totalInMovements,
        totalOutMovements,
        totalTransferMovements,
      ] = await Promise.all([
        prisma.stock_movements.count(),
        prisma.stock_movements.count({ where: { is_active: 'Y' } }),
        prisma.stock_movements.count({ where: { is_active: 'N' } }),
        prisma.stock_movements.count({
          where: {
            createdate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.stock_movements.count({ where: { movement_type: 'IN' } }),
        prisma.stock_movements.count({ where: { movement_type: 'OUT' } }),
        prisma.stock_movements.count({ where: { movement_type: 'TRANSFER' } }),
      ]);

      const stats = {
        total_stock_movements: totalStockMovements,
        active_stock_movements: activeStockMovements,
        inactive_stock_movements: inactiveStockMovements,
        stock_movements_this_month: stockMovementsThisMonth,
        total_in_movements: totalInMovements,
        total_out_movements: totalOutMovements,
        total_transfer_movements: totalTransferMovements,
      };

      res.success(
        'Stock Movements retrieved successfully',
        data.map((sm: any) => serializeStockMovement(sm)),
        200,
        pagination,
        stats
      );
    } catch (error: any) {
      console.error('Get All Stock Movements Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getStockMovementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movement = await prisma.stock_movements.findUnique({
        where: { id: Number(id) },
        include: {
          stock_movements_products: true,
          stock_movements_from_location: true,
          stock_movements_to_location: true,
          van_inventory_stock_movements: {
            include: {
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: true,
                },
              },
              van_inventory_users: true,
            },
          },
        },
      });

      if (!movement)
        return res.status(404).json({ message: 'Stock Movement not found' });

      res.json({
        message: 'Stock Movement fetched successfully',
        data: serializeStockMovement(movement),
      });
    } catch (error: any) {
      console.error('Get Stock Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateStockMovement(req: any, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.stock_movements.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Stock Movement not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
        movement_date: req.body.movement_date
          ? new Date(req.body.movement_date)
          : undefined,
      };

      const updated = await prisma.stock_movements.update({
        where: { id: Number(id) },
        data,
        include: {
          stock_movements_products: true,
          stock_movements_from_location: true,
          stock_movements_to_location: true,
          van_inventory_stock_movements: {
            include: {
              van_inventory_items_inventory: {
                include: {
                  van_inventory_items_products: true,
                },
              },
              van_inventory_users: true,
            },
          },
        },
      });

      res.json({
        message: 'Stock Movement updated successfully',
        data: serializeStockMovement(updated),
      });
    } catch (error: any) {
      console.error('Update Stock Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteStockMovement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.stock_movements.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Stock Movement not found' });

      await prisma.stock_movements.delete({ where: { id: Number(id) } });

      res.json({ message: 'Stock Movement deleted successfully' });
    } catch (error: any) {
      console.error('Delete Stock Movement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
