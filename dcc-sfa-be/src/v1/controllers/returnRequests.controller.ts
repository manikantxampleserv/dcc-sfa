import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { ReturnWorkflowService } from '../services/returnWorkflow.service';
import prisma from '../../configs/prisma.client';

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
  workflow_steps?: any[];
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
        serial_no: rr.return_requests_serial_numbers.serial_number,
      }
    : null,

  approved_user: rr.return_requests_users
    ? {
        id: rr.return_requests_users.id,
        name: rr.return_requests_users.name,
        email: rr.return_requests_users.email,
      }
    : null,
  workflow_steps: rr.workflow_steps || [],
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
          return_requests_users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          return_requests_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_products: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_serial_numbers: {
            select: {
              id: true,
              serial_number: true,
            },
          },
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
      const {
        page,
        limit,
        search,
        status,
        customer_id,
        product_id,
        is_active,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filters: any = {
        ...(status && { status: status }),
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(product_id && { product_id: parseInt(product_id as string) }),
        ...(is_active && { is_active: is_active }),
        ...(search && {
          OR: [
            { reason: { contains: search as string } },
            { status: { contains: search as string } },
            {
              resolution_notes: {
                contains: search as string,
              },
            },
            {
              return_requests_customers: {
                name: { contains: search as string },
              },
            },
            {
              return_requests_products: {
                name: { contains: search as string },
              },
            },
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
          return_requests_users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          return_requests_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_products: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_serial_numbers: {
            select: {
              id: true,
              serial_number: true,
            },
          },
        },
      });

      const totalRequests = await prisma.return_requests.count({
        where: filters,
      });
      const pendingRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'pending' },
      });
      const approvedRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'approved' },
      });
      const rejectedRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'rejected' },
      });
      const processingRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'processing' },
      });
      const completedRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'completed' },
      });
      const cancelledRequests = await prisma.return_requests.count({
        where: { ...filters, status: 'cancelled' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newRequestsThisMonth = await prisma.return_requests.count({
        where: {
          ...filters,
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.json({
        message: 'Return requests retrieved successfully',
        data: data.map((rr: any) => serializeReturnRequest(rr)),
        pagination,
        stats: {
          total_requests: totalRequests,
          pending_requests: pendingRequests,
          approved_requests: approvedRequests,
          rejected_requests: rejectedRequests,
          processing_requests: processingRequests,
          completed_requests: completedRequests,
          cancelled_requests: cancelledRequests,
          new_requests_this_month: newRequestsThisMonth,
        },
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
          return_requests_users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          return_requests_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_products: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_serial_numbers: {
            select: {
              id: true,
              serial_number: true,
            },
          },
        },
      });

      if (!rr)
        return res.status(404).json({ message: 'Return request not found' });

      // Get workflow steps
      const workflowSteps = await ReturnWorkflowService.getWorkflowSteps(
        Number(id)
      );

      const serializedRequest = serializeReturnRequest(rr);
      serializedRequest.workflow_steps = workflowSteps;

      res.json({
        message: 'Return request fetched successfully',
        data: serializedRequest,
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
          return_requests_users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          return_requests_customers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_products: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          return_requests_serial_numbers: {
            select: {
              id: true,
              serial_number: true,
            },
          },
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
