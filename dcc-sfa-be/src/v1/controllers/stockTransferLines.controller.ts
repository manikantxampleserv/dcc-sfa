import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface StockTransferLineSerialized {
  id: number;
  stock_transfer_request_id: number;
  product_id: number;
  batch_id?: number | null;
  quantity: number;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  batch?: { id: number; batch_number: string; quantity: number } | null;
  product?: { id: number; name: string; code: string } | null;
  stock_transfer_request?: {
    id: number;
    request_number: string;
    source_type: string;
    destination_type: string;
    status: string;
  } | null;
}

const serializeStockTransferLine = (
  line: any
): StockTransferLineSerialized => ({
  id: line.id,
  stock_transfer_request_id: line.stock_transfer_request_id,
  product_id: line.product_id,
  batch_id: line.batch_id,
  quantity: line.quantity,
  is_active: line.is_active,
  createdate: line.createdate,
  createdby: line.createdby,
  updatedate: line.updatedate,
  updatedby: line.updatedby,
  log_inst: line.log_inst,
  batch: line.batch_lots
    ? {
        id: line.batch_lots.id,
        batch_number: line.batch_lots.batch_number,
        quantity: line.batch_lots.quantity,
      }
    : null,
  product: line.stock_transfer_lines_products
    ? {
        id: line.stock_transfer_lines_products.id,
        name: line.stock_transfer_lines_products.name,
        code: line.stock_transfer_lines_products.code,
      }
    : null,
  stock_transfer_request: line.stock_transfer_requests
    ? {
        id: line.stock_transfer_requests.id,
        request_number: line.stock_transfer_requests.request_number,
        source_type: line.stock_transfer_requests.source_type,
        destination_type: line.stock_transfer_requests.destination_type,
        status: line.stock_transfer_requests.status,
      }
    : null,
});

export const stockTransferLinesController = {
  async getAllStockTransferLines(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            {
              stock_transfer_lines_products: {
                name: { contains: searchLower },
              },
            },
            {
              stock_transfer_requests: {
                request_number: { contains: searchLower },
              },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.stock_transfer_lines,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          batch_lots: true,
          stock_transfer_lines_products: true,
          stock_transfer_requests: true,
        },
      });

      const totalRecords = await prisma.stock_transfer_lines.count();
      const activeRecords = await prisma.stock_transfer_lines.count({
        where: { is_active: 'Y' },
      });
      const inactiveRecords = await prisma.stock_transfer_lines.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const stockTransferLinesByMonth = await prisma.stock_transfer_lines.count(
        {
          where: {
            createdate: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
              lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
          },
        }
      );
      res.success(
        'Stock transfer lines fetched successfully',
        data.map((l: any) => serializeStockTransferLine(l)),
        200,
        pagination,
        {
          total_records: totalRecords,
          active_records: activeRecords,
          inactive_records: inactiveRecords,
          stock_transfer_lines_by_month: stockTransferLinesByMonth,
        }
      );
    } catch (error: any) {
      console.error('Get All Stock Transfer Lines Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // GET BY ID
  async getStockTransferLineById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const record = await prisma.stock_transfer_lines.findUnique({
        where: { id: Number(id) },
        include: {
          batch_lots: true,
          stock_transfer_lines_products: true,
          stock_transfer_requests: true,
        },
      });

      if (!record)
        return res
          .status(404)
          .json({ message: 'Stock transfer line not found' });

      res.json({
        message: 'Stock transfer line fetched successfully',
        data: serializeStockTransferLine(record),
      });
    } catch (error: any) {
      console.error('Get Stock Transfer Line By ID Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // UPDATE
  async updateStockTransferLine(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.stock_transfer_lines.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Stock transfer line not found' });

      const updated = await prisma.stock_transfer_lines.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          batch_lots: true,
          stock_transfer_lines_products: true,
          stock_transfer_requests: true,
        },
      });

      res.json({
        message: 'Stock transfer line updated successfully',
        data: serializeStockTransferLine(updated),
      });
    } catch (error: any) {
      console.error('Update Stock Transfer Line Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE
  async deleteStockTransferLine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.stock_transfer_lines.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Stock transfer line not found' });

      await prisma.stock_transfer_lines.delete({ where: { id: Number(id) } });

      res.json({ message: 'Stock transfer line deleted successfully' });
    } catch (error: any) {
      console.error('Delete Stock Transfer Line Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
