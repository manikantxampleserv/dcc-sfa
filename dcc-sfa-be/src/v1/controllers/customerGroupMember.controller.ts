import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CustomerGroupMemberSerialized {
  id: number;
  customer_group_id: number;
  customer_id: number;
  joined_at?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_group?: { id: number; name: string; code: string } | null;
  customer?: { id: number; name: string; email?: string | null } | null;
}

const serializeCustomerGroupMember = (
  member: any
): CustomerGroupMemberSerialized => ({
  id: member.id,
  customer_group_id: member.customer_group_id,
  customer_id: member.customer_id,
  joined_at: member.joined_at,
  is_active: member.is_active,
  createdate: member.createdate,
  createdby: member.createdby,
  updatedate: member.updatedate,
  updatedby: member.updatedby,
  log_inst: member.log_inst,
  customer_group: member.customer_group_members_customer_group
    ? {
        id: member.customer_group_members_customer_group.id,
        name: member.customer_group_members_customer_group.name,
        code: member.customer_group_members_customer_group.code,
      }
    : null,
  customer: member.customer_group_members_customers
    ? {
        id: member.customer_group_members_customers.id,
        name: member.customer_group_members_customers.name,
        email: member.customer_group_members_customers.email,
      }
    : null,
});

export const customerGroupMemberController = {
  async createCustomerGroupMember(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.customer_group_id || !data.customer_id) {
        return res
          .status(400)
          .json({ message: 'customer_group_id and customer_id are required' });
      }

      const existing = await prisma.customer_group_members.findUnique({
        where: {
          customer_group_id_customer_id: {
            customer_group_id: data.customer_group_id,
            customer_id: data.customer_id,
          },
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: 'Customer already exists in this group' });
      }

      const member = await prisma.customer_group_members.create({
        data: {
          ...data,
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
        include: {
          customer_group_members_customer_group: true,
          customer_group_members_customers: true,
        },
      });

      res.status(201).json({
        message: 'Customer group member created successfully',
        data: serializeCustomerGroupMember(member),
      });
    } catch (error: any) {
      console.error('Create Customer Group Member Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomerGroupMember(req: any, res: any) {
    try {
      const { page, limit, search, customer_group_id, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(customer_group_id && {
          customer_group_id: Number(customer_group_id),
        }),
        ...(search && {
          OR: [
            {
              customer_group_members_customers: {
                name: { contains: searchLower },
              },
            },
            {
              customer_group_members_customer_group: {
                name: { contains: searchLower },
              },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_group_members,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_group_members_customer_group: true,
          customer_group_members_customers: true,
        },
      });

      const totalMembers = await prisma.customer_group_members.count();
      const activeMembers = await prisma.customer_group_members.count({
        where: { is_active: 'Y' },
      });
      const inactiveMembers = await prisma.customer_group_members.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const monthlyMembers = await prisma.customer_group_members.count({
        where: {
          joined_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Customer group members retrieved successfully',
        data.map((m: any) => serializeCustomerGroupMember(m)),
        200,
        pagination,
        {
          total_members: totalMembers,
          active_members: activeMembers,
          inactive_members: inactiveMembers,
          monthly_members: monthlyMembers,
        }
      );
    } catch (error: any) {
      console.error('Get Customer Group Members Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomerGroupMemberById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const member = await prisma.customer_group_members.findUnique({
        where: { id: Number(id) },
        include: {
          customer_group_members_customer_group: true,
          customer_group_members_customers: true,
        },
      });

      if (!member) {
        return res
          .status(404)
          .json({ message: 'Customer group member not found' });
      }

      res.json({
        message: 'Customer group member fetched successfully',
        data: serializeCustomerGroupMember(member),
      });
    } catch (error: any) {
      console.error('Get Customer Group Member Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomerGroupMember(req: any, res: any) {
    try {
      const { id } = req.params;

      const existing = await prisma.customer_group_members.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ message: 'Customer group member not found' });
      }

      const member = await prisma.customer_group_members.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedate: new Date(),
          updatedby: req.user?.id,
        },
        include: {
          customer_group_members_customer_group: true,
          customer_group_members_customers: true,
        },
      });

      res.json({
        message: 'Customer group member updated successfully',
        data: serializeCustomerGroupMember(member),
      });
    } catch (error: any) {
      console.error('Update Customer Group Member Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomerGroupMember(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.customer_group_members.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ message: 'Customer group member not found' });
      }

      await prisma.customer_group_members.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Customer group member deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Group Member Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
