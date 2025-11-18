import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeComplaint = (c: any) => ({
  id: c.id,
  complaint_title: c.complaint_title,
  customer_id: c.customer_id,
  complaint_description: c.complaint_description,
  status: c.status,
  createdate: c.createdate,
  createdby: c.createdby,
  updatedate: c.updatedate,
  updatedby: c.updatedby,
  log_inst: c.log_inst,

  customer: c.customer_complaint
    ? {
        id: c.customer_complaint.id,
        name: c.customer_complaint.name,
        code: c.customer_complaint.code,
      }
    : null,

  submitted_by_user: c.submitted_by_users
    ? {
        id: c.submitted_by_users.id,
        name: c.submitted_by_users.name,
        email: c.submitted_by_users.email,
      }
    : null,
});

export const customerComplaintsController = {
  async createOrUpdateCustomerComplaints(req: Request, res: Response) {
    const userId = req.user?.id || 1;
    const data = req.body;

    try {
      const isBulk = Array.isArray(data);
      const complaints = isBulk ? data : [data];

      const results = [];

      for (const complaint of complaints) {
        const complaintId = complaint.id;
        const isUpdate = Boolean(complaintId);

        const payload = {
          customer_id: Number(complaint.customer_id),
          complaint_title: complaint.complaint_title,
          complaint_description: complaint.complaint_description,
          status: complaint.status || 'P',
          submitted_by: Number(complaint.submitted_by),
        };

        let result;

        if (isUpdate) {
          result = await prisma.customer_complaints.update({
            where: { id: complaintId },
            data: {
              ...payload,
              updatedate: new Date(),
              updatedby: userId,
              log_inst: { increment: 1 },
            },
            include: {
              customer_complaint: true,
              submitted_by_users: true,
            },
          });
        } else {
          result = await prisma.customer_complaints.create({
            data: {
              ...payload,
              createdate: new Date(),
              createdby: userId,
              log_inst: 1,
            },
            include: {
              customer_complaint: true,
              submitted_by_users: true,
            },
          });
        }

        results.push(serializeComplaint(result));
      }

      const hasUpdates = complaints.some(c => Boolean(c.id));
      const hasCreates = complaints.some(c => !Boolean(c.id));

      let message;
      if (isBulk) {
        message = `${results.length} complaint(s) processed successfully`;
      } else {
        message = hasUpdates
          ? 'Complaint updated successfully'
          : 'Complaint created successfully';
      }

      return res.status(hasCreates ? 201 : 200).json({
        message,
        data: isBulk ? results : results[0],
      });
    } catch (error: any) {
      console.error('Create/Update Complaint Error:', error);
      return res.status(500).json({
        message: 'Failed to process complaint',
        error: error.message,
      });
    }
  },

  async getAllCustomerComplaints(req: Request, res: Response) {
    try {
      const { page, limit, search, status, customer_id } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      const filters: any = {};

      if (search) {
        filters.OR = [
          { complaint_title: { contains: search as string } },
          { complaint_description: { contains: search as string } },
          {
            customer_complaint: {
              name: { contains: search as string },
            },
          },
        ];
      }

      if (status) filters.status = status as string;
      if (customer_id) filters.customer_id = Number(customer_id);

      const { data, pagination } = await paginate({
        model: prisma.customer_complaints,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_complaint: true,
          submitted_by_users: true,
        },
      });

      return res.json({
        message: 'Complaints retrieved successfully',
        data: data.map((c: any) => serializeComplaint(c)),
        pagination,
      });
    } catch (error: any) {
      console.error('Get Complaints Error:', error);
      return res.status(500).json({
        message: 'Failed to retrieve complaints',
        error: error.message,
      });
    }
  },

  async getCustomerComplaintsById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const complaint = await prisma.customer_complaints.findUnique({
        where: { id: Number(id) },
        include: {
          customer_complaint: true,
          submitted_by_users: true,
        },
      });

      if (!complaint)
        return res.status(404).json({ message: 'Complaint not found' });

      return res.json({
        message: 'Complaint retrieved successfully',
        data: serializeComplaint(complaint),
      });
    } catch (error: any) {
      console.error('Get Complaint Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomerComplaints(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.customer_complaints.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Complaint not found' });

      await prisma.customer_complaints.delete({
        where: { id: Number(id) },
      });

      return res.json({
        message: 'Complaint deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Complaint Error:', error);
      return res.status(500).json({ message: error.message });
    }
  },
};
