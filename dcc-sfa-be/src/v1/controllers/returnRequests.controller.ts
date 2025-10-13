import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface ReturnRequestSerialized {
  id: number;
  customer_id: number;
  product_id: number;
  serial_id?: number | null;
  return_date?: Date | null;
  reason?: string | null;
  status?: string | null;
  approved_by?: number | null;
  approved_date?: Date | null;
  resolution_notes?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;

  customer?: {
    id: number;
    name: string;
    code: string;
  } | null;

  product?: {
    id: number;
    name: string;
    code: string;
  } | null;

  serial_number?: {
    id: number;
    serial_no: string;
  } | null;

  approved_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const serializeReturnRequest = (rr: any): ReturnRequestSerialized => ({
  id: rr.id,
  customer_id: rr.customer_id,
  product_id: rr.product_id,
  serial_id: rr.serial_id,
  return_date: rr.return_date,
  reason: rr.reason,
  status: rr.status,
  approved_by: rr.approved_by,
  approved_date: rr.approved_date,
  resolution_notes: rr.resolution_notes,
  is_active: rr.is_active,
  createdate: rr.createdate,
  createdby: rr.createdby,
  updatedate: rr.updatedate,
  updatedby: rr.updatedby,
  log_inst: rr.log_inst,

  customer: rr.return_requests_customers
    ? {
        id: rr.return_requests_customers.id,
        name: rr.return_requests_customers.name,
        code: rr.return_requests_customers.code,
      }
    : null,

  product: rr.return_requests_products
    ? {
        id: rr.return_requests_products.id,
        name: rr.return_requests_products.name,
        code: rr.return_requests_products.code,
      }
    : null,

  serial_number: rr.return_requests_serial_numbers
    ? {
        id: rr.return_requests_serial_numbers.id,
        serial_no: rr.return_requests_serial_numbers.serial_no,
      }
    : null,

  approved_user: rr.return_requests_users
    ? {
        id: rr.return_requests_users.id,
        name: rr.return_requests_users.name,
        email: rr.return_requests_users.email,
      }
    : null,
});

export const returnRequestsController = {
  async createReturnRequest(req: Request, res: Response) {
    try {
      const data = req.body;
      const userId = req.user?.id || 1;

      const newRequest = await prisma.return_requests.create({
        data: {
          customer_id: data.customer_id,
          product_id: data.product_id,
          serial_id: data.serial_id || null,
          return_date: data.return_date
            ? new Date(data.return_date)
            : new Date(),
          reason: data.reason || null,
          status: data.status || 'pending',
          approved_by: data.approved_by || null,
          approved_date: data.approved_date
            ? new Date(data.approved_date)
            : null,
          resolution_notes: data.resolution_notes || null,
          is_active: data.is_active || 'Y',
          createdby: userId,
          createdate: new Date(),
          log_inst: 1,
        },
        include: {
          return_requests_users: true,
          return_requests_customers: true,
          return_requests_products: true,
          return_requests_serial_numbers: true,
        },
      });

      res.status(201).json({
        message: 'Return request created successfully',
        data: serializeReturnRequest(newRequest),
      });
    } catch (error: any) {
      console.error('Create Return Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllReturnRequests(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filters: any = {
        ...(search && {
          OR: [
            { reason: { contains: search as string, mode: 'insensitive' } },
            { status: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.return_requests,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          return_requests_users: true,
          return_requests_customers: true,
          return_requests_products: true,
          return_requests_serial_numbers: true,
        },
      });

      res.json({
        message: 'Return requests retrieved successfully',
        data: data.map((rr: any) => serializeReturnRequest(rr)),
        pagination,
      });
    } catch (error: any) {
      console.error('Get Return Requests Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getReturnRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rr = await prisma.return_requests.findUnique({
        where: { id: Number(id) },
        include: {
          return_requests_users: true,
          return_requests_customers: true,
          return_requests_products: true,
          return_requests_serial_numbers: true,
        },
      });

      if (!rr)
        return res.status(404).json({ message: 'Return request not found' });

      res.json({
        message: 'Return request fetched successfully',
        data: serializeReturnRequest(rr),
      });
    } catch (error: any) {
      console.error('Get Return Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateReturnRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.return_requests.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Return request not found' });

      const userId = req.user?.id || 1;

      const updated = await prisma.return_requests.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedate: new Date(),
          updatedby: userId,
          log_inst: (existing.log_inst || 0) + 1,
        },
        include: {
          return_requests_users: true,
          return_requests_customers: true,
          return_requests_products: true,
          return_requests_serial_numbers: true,
        },
      });

      res.json({
        message: 'Return request updated successfully',
        data: serializeReturnRequest(updated),
      });
    } catch (error: any) {
      console.error('Update Return Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteReturnRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.return_requests.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Return request not found' });

      await prisma.return_requests.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Return request deleted successfully' });
    } catch (error: any) {
      console.error('Delete Return Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
