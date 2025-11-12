import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface InventoryStockSerialized {
  id: number;
  product_id: number;
  location_id: number;
  location_type?: string | null;
  current_stock?: number | null;
  reserved_stock?: number | null;
  available_stock?: number | null;
  minimum_stock?: number | null;
  maximum_stock?: number | null;
  reorder_level?: number | null;
  reorder_quantity?: number | null;
  average_daily_sales?: number | null;
  lead_time?: number | null;
  safety_stock?: number | null;
  stock_value?: number | null;
  last_stock_update?: Date | null;
  stock_status?: string | null;
  turnover_rate?: number | null;
  days_of_stock?: number | null;
  last_count_date?: Date | null;
  next_count_due?: Date | null;
  variance?: number | null;
  variance_percentage?: number | null;
  cost_price?: number | null;
  selling_price?: number | null;
  margin?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product?: { id: number; name: string } | null;
  location?: { id: number; name: string } | null;
}

const serializeInventoryStock = (stock: any): InventoryStockSerialized => ({
  id: stock.id,
  product_id: stock.product_id,
  location_id: stock.location_id,
  location_type: stock.location_type,
  current_stock: stock.current_stock,
  reserved_stock: stock.reserved_stock,
  available_stock: stock.available_stock,
  minimum_stock: stock.minimum_stock,
  maximum_stock: stock.maximum_stock,
  reorder_level: stock.reorder_level,
  reorder_quantity: stock.reorder_quantity,
  average_daily_sales: stock.average_daily_sales,
  lead_time: stock.lead_time,
  safety_stock: stock.safety_stock,
  stock_value: stock.stock_value,
  last_stock_update: stock.last_stock_update,
  stock_status: stock.stock_status,
  turnover_rate: stock.turnover_rate,
  days_of_stock: stock.days_of_stock,
  last_count_date: stock.last_count_date,
  next_count_due: stock.next_count_due,
  variance: stock.variance,
  variance_percentage: stock.variance_percentage,
  cost_price: stock.cost_price,
  selling_price: stock.selling_price,
  margin: stock.margin,
  is_active: stock.is_active,
  createdate: stock.createdate,
  createdby: stock.createdby,
  updatedate: stock.updatedate,
  updatedby: stock.updatedby,
  log_inst: stock.log_inst,
  product: stock.inventory_stock_products
    ? {
        id: stock.inventory_stock_products.id,
        name: stock.inventory_stock_products.name,
      }
    : null,
  location: stock.inventory_stock_depots
    ? {
        id: stock.inventory_stock_depots.id,
        name: stock.inventory_stock_depots.name,
      }
    : null,
});

export const inventoryStockController = {
  async createInventoryStock(req: Request, res: Response) {
    try {
      const data = req.body;

      const stock = await prisma.inventory_stock.create({
        data: {
          ...data,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          inventory_stock_products: true,
          inventory_stock_depots: true,
        },
      });

      res.status(201).json({
        message: 'Inventory stock created successfully',
        data: serializeInventoryStock(stock),
      });
    } catch (error: any) {
      console.error('Create Inventory Stock Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllInventoryStock(req: any, res: any) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { location_type: { contains: searchLower } },
            { stock_status: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.inventory_stock,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          inventory_stock_products: true,
          inventory_stock_depots: true,
        },
      });

      res.success(
        'Inventory stocks retrieved successfully',
        data.map((stock: any) => serializeInventoryStock(stock)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get Inventory Stock Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getInventoryStockById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await prisma.inventory_stock.findUnique({
        where: { id: Number(id) },
        include: {
          inventory_stock_products: true,
          inventory_stock_depots: true,
        },
      });

      if (!stock)
        return res.status(404).json({ message: 'Inventory stock not found' });

      res.json({
        message: 'Inventory stock fetched successfully',
        data: serializeInventoryStock(stock),
      });
    } catch (error: any) {
      console.error('Get Inventory Stock Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateInventoryStock(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingStock = await prisma.inventory_stock.findUnique({
        where: { id: Number(id) },
      });

      if (!existingStock)
        return res.status(404).json({ message: 'Inventory stock not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const stock = await prisma.inventory_stock.update({
        where: { id: Number(id) },
        data,
        include: {
          inventory_stock_products: true,
          inventory_stock_depots: true,
        },
      });

      res.json({
        message: 'Inventory stock updated successfully',
        data: serializeInventoryStock(stock),
      });
    } catch (error: any) {
      console.error('Update Inventory Stock Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteInventoryStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingStock = await prisma.inventory_stock.findUnique({
        where: { id: Number(id) },
      });

      if (!existingStock)
        return res.status(404).json({ message: 'Inventory stock not found' });

      await prisma.inventory_stock.delete({ where: { id: Number(id) } });

      res.json({ message: 'Inventory stock deleted successfully' });
    } catch (error: any) {
      console.error('Delete Inventory Stock Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
