import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface WarehouseSerialized {
  id: number;
  name: string;
  type?: string | null;
  location?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeWarehouse = (warehouse: any): WarehouseSerialized => ({
  id: warehouse.id,
  name: warehouse.name,
  type: warehouse.type,
  location: warehouse.location,
  is_active: warehouse.is_active,
  created_by: warehouse.createdby,
  createdate: warehouse.createdate,
  updatedate: warehouse.updatedate,
  updatedby: warehouse.updatedby,
});

export const warehousesController = {
  async createWarehouse(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Warehouse name is required' });
      }

      const warehouse = await prisma.warehouses.create({
        data: {
          ...data,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        message: 'Warehouse created successfully',
        data: serializeWarehouse(warehouse),
      });
    } catch (error: any) {
      console.error('Create Warehouse Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getWarehouses(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        type,
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { type: { contains: searchLower } },
            { location: { contains: searchLower } },
          ],
        }),
        ...(type && { type: type as string }),
      };

      const totalWarehouses = await prisma.warehouses.count();
      const activeWarehouses = await prisma.warehouses.count({
        where: { is_active: 'Y' },
      });
      const inactiveWarehouses = await prisma.warehouses.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newWarehousesThisMonth = await prisma.warehouses.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total_warehouses: totalWarehouses,
        active_warehouses: activeWarehouses,
        inactive_warehouses: inactiveWarehouses,
        new_warehouses: newWarehousesThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.warehouses,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Warehouses retrieved successfully',
        data: data.map((d: any) => serializeWarehouse(d)),
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Warehouses Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getWarehouseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouse = await prisma.warehouses.findUnique({
        where: { id: Number(id) },
      });

      if (!warehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      res.json({
        message: 'Warehouse fetched successfully',
        data: serializeWarehouse(warehouse),
      });
    } catch (error: any) {
      console.error('Get Warehouse Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingWarehouse = await prisma.warehouses.findUnique({
        where: { id: Number(id) },
      });

      if (!existingWarehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const warehouse = await prisma.warehouses.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Warehouse updated successfully',
        data: serializeWarehouse(warehouse),
      });
    } catch (error: any) {
      console.error('Update Warehouse Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingWarehouse = await prisma.warehouses.findUnique({
        where: { id: Number(id) },
      });

      if (!existingWarehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      await prisma.warehouses.delete({ where: { id: Number(id) } });

      res.json({ message: 'Warehouse deleted successfully' });
    } catch (error: any) {
      console.error('Delete Warehouse Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
