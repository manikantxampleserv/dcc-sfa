import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface VanInventorySerialized {
  id: number;
  user_id: number;
  product_id: number;
  batch_id?: number | null;
  serial_no_id?: number | null;
  quantity?: number | null;
  reserved_quantity?: number | null;
  available_quantity?: number | null;
  last_updated?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  vehicle_id?: number | null;
  location_type?: string | null;
  location_id?: number | null;
  product?: { id: number; name: string; code: string } | null;
  user?: { id: number; name: string; email: string } | null;
  batch?: { id: number; batch_number: string; quantity: number } | null;
  serial_number?: { id: number; serial_number: string; status: string } | null;
  vehicle?: { id: number; vehicle_number: string; type: string } | null;
  location?: { id: number; name: string; code: string } | null;
}

const serializeVanInventory = (item: any): VanInventorySerialized => ({
  id: item.id,
  user_id: item.user_id,
  product_id: item.product_id,
  batch_id: item.batch_id,
  serial_no_id: item.serial_no_id,
  quantity: item.quantity,
  reserved_quantity: item.reserved_quantity,
  available_quantity: item.available_quantity,
  last_updated: item.last_updated,
  is_active: item.is_active,
  createdate: item.createdate,
  createdby: item.createdby,
  updatedate: item.updatedate,
  updatedby: item.updatedby,
  log_inst: item.log_inst,
  vehicle_id: item.vehicle_id,
  location_type: item.location_type,
  location_id: item.location_id,
  product: item.van_inventory_products
    ? {
        id: item.van_inventory_products.id,
        name: item.van_inventory_products.name,
        code: item.van_inventory_products.code,
      }
    : null,
  user: item.van_inventory_users
    ? {
        id: item.van_inventory_users.id,
        name: item.van_inventory_users.name,
        email: item.van_inventory_users.email,
      }
    : null,
  batch: item.batch_lots
    ? {
        id: item.batch_lots.id,
        batch_number: item.batch_lots.batch_number,
        quantity: item.batch_lots.quantity,
      }
    : null,
  serial_number: item.serial_numbers
    ? {
        id: item.serial_numbers.id,
        serial_number: item.serial_numbers.serial_number,
        status: item.serial_numbers.status,
      }
    : null,
  vehicle: item.vehicle
    ? {
        id: item.vehicle.id,
        vehicle_number: item.vehicle.vehicle_number,
        type: item.vehicle.type,
      }
    : null,
  location: item.location
    ? {
        id: item.location.id,
        name: item.location.name,
        code: item.location.code,
      }
    : null,
});

export const vanInventoryController = {
  async createVanInventory(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.user_id || !data.product_id) {
        return res.status(400).json({
          message: 'user_id and product_id are required',
        });
      }

      const inventory = await prisma.van_inventory.create({
        data: {
          user_id: data.user_id,
          product_id: data.product_id,
          batch_id: data.batch_id || null,
          serial_no_id: data.serial_no_id || null,
          quantity: data.quantity || 0,
          reserved_quantity: data.reserved_quantity || 0,
          available_quantity: data.available_quantity || data.quantity || 0,
          vehicle_id: data.vehicle_id || null,
          location_type: data.location_type || 'van',
          location_id: data.location_id || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          van_inventory_products: true,
          van_inventory_users: true,
          batch_lots: true,
          serial_numbers: true,
          vehicle: true,
          location: true,
        },
      });

      res.status(201).json({
        message: 'Van inventory created successfully',
        data: serializeVanInventory(inventory),
      });
    } catch (error: any) {
      console.error('Create Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllVanInventory(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { van_inventory_products: { name: { contains: searchLower } } },
            { van_inventory_users: { name: { contains: searchLower } } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.van_inventory,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          van_inventory_products: true,
          van_inventory_users: true,
          batch_lots: true,
          serial_numbers: true,
          vehicle: true,
          location: true,
        },
      });

      const totalVanInventory = await prisma.van_inventory.count();
      const activeVanInventory = await prisma.van_inventory.count({
        where: { is_active: 'Y' },
      });
      const inactiveVanInventory = await prisma.van_inventory.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const vanInventory = await prisma.van_inventory.count({
        where: {
          createdate: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      });

      res.success(
        'Van inventory fetched successfully',
        data.map((v: any) => serializeVanInventory(v)),
        200,
        pagination,
        {
          total_records: totalVanInventory,
          active_records: activeVanInventory,
          inactive_records: inactiveVanInventory,
          van_inventory: vanInventory,
        }
      );
    } catch (error: any) {
      console.error('Get Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getVanInventoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
        include: {
          van_inventory_products: true,
          van_inventory_users: true,
          batch_lots: true,
          serial_numbers: true,
          vehicle: true,
          location: true,
        },
      });

      if (!record)
        return res.status(404).json({ message: 'Van inventory not found' });

      res.json({
        message: 'Van inventory fetched successfully',
        data: serializeVanInventory(record),
      });
    } catch (error: any) {
      console.error('Get Van Inventory by ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateVanInventory(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      const updated = await prisma.van_inventory.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          van_inventory_products: true,
          van_inventory_users: true,
          batch_lots: true,
          serial_numbers: true,
          vehicle: true,
          location: true,
        },
      });

      res.json({
        message: 'Van inventory updated successfully',
        data: serializeVanInventory(updated),
      });
    } catch (error: any) {
      console.error('Update Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVanInventory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.van_inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Van inventory not found' });

      await prisma.van_inventory.delete({ where: { id: Number(id) } });
      res.json({ message: 'Van inventory deleted successfully' });
    } catch (error: any) {
      console.error('Delete Van Inventory Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
