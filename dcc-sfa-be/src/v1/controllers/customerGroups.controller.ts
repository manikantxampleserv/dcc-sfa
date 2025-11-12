import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CustomerGroupSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  discount_percentage?: number | null;
  credit_terms?: number | null;
  payment_terms?: string | null;
  price_group?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  members?: { id: number; customer_id: number; group_id: number }[];
}

const generateCustomerGroupCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastCustomerGroupCode = await prisma.customer_groups.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCustomerGroupCode && lastCustomerGroupCode.code) {
    const match = lastCustomerGroupCode.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializeCustomerGroup = (group: any): CustomerGroupSerialized => ({
  id: group.id,
  name: group.name,
  code: group.code,
  description: group.description,
  discount_percentage: group.discount_percentage,
  credit_terms: group.credit_terms,
  payment_terms: group.payment_terms,
  price_group: group.price_group,
  is_active: group.is_active,
  createdate: group.createdate,
  createdby: group.createdby,
  updatedate: group.updatedate,
  updatedby: group.updatedby,
  log_inst: group.log_inst,
  members:
    group.customer_group_members_customer_group?.map((m: any) => ({
      id: m.id,
      customer_id: m.customer_id,
      group_id: m.group_id,
    })) || [],
});

export const customerGroupsController = {
  async createCustomerGroups(req: Request, res: Response) {
    try {
      const { customerGroups, ...groupData } = req.body;
      const newCode = await generateCustomerGroupCode(groupData.name);

      const group = await prisma.customer_groups.create({
        data: {
          ...groupData,
          code: newCode,
          is_active: groupData.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: groupData.log_inst || 1,
          customer_group_members_customer_group: {
            create: customerGroups?.map((member: any) => ({
              customer_id: member.customer_id,
              joined_at: member.joined_at || new Date(),
              is_active: member.is_active || 'Y',
              createdate: new Date(),
              createdby: req.user?.id || 1,
              log_inst: member.log_inst || 1,
            })),
          },
        },
        include: {
          customer_group_members_customer_group: true,
        },
      });

      res.status(201).json({
        message: 'Customer group created successfully',
        data: serializeCustomerGroup(group),
      });
    } catch (error: any) {
      console.error('Create Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomerGroups(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_groups,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_group_members_customer_group: true,
        },
      });

      const totalGroups = await prisma.customer_groups.count();
      const activeGroups = await prisma.customer_groups.count({
        where: { is_active: 'Y' },
      });
      const inactiveGroups = await prisma.customer_groups.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const avgResult = await prisma.customer_groups.aggregate({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _avg: { discount_percentage: true },
      });

      const avgDiscount = avgResult._avg.discount_percentage || 0;

      const newGroups = await prisma.customer_groups.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Customer groups retrieved successfully',
        data.map((g: any) => serializeCustomerGroup(g)),
        200,
        pagination,
        {
          total_groups: totalGroups,
          active_groups: activeGroups,
          inactive_groups: inactiveGroups,
          new_groups: newGroups,
          avg_discount: avgDiscount,
        }
      );
    } catch (error: any) {
      console.error('Get Customer Groups Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomerGroupsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
        include: {
          customer_group_members_customer_group: true,
        },
      });

      if (!group)
        return res.status(404).json({ message: 'Customer group not found' });

      res.json({
        message: 'Customer group fetched successfully',
        data: serializeCustomerGroup(group),
      });
    } catch (error: any) {
      console.error('Get Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomerGroups(req: any, res: any) {
    try {
      const { id } = req.params;
      const { customerGroups, ...groupData } = req.body;

      const existingGroup = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existingGroup)
        return res.status(404).json({ message: 'Customer group not found' });

      // If customerGroups is provided, update the members
      if (customerGroups) {
        // Delete existing members
        await prisma.customer_group_members.deleteMany({
          where: { customer_group_id: Number(id) },
        });

        // Create new members
        if (customerGroups.length > 0) {
          await prisma.customer_group_members.createMany({
            data: customerGroups.map((member: any) => ({
              customer_group_id: Number(id),
              customer_id: member.customer_id,
              joined_at: member.joined_at || new Date(),
              is_active: member.is_active || 'Y',
              createdate: new Date(),
              createdby: req.user?.id || 1,
              log_inst: member.log_inst || 1,
            })),
          });
        }
      }

      const data = {
        ...groupData,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const group = await prisma.customer_groups.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_group_members_customer_group: true,
        },
      });

      res.json({
        message: 'Customer group updated successfully',
        data: serializeCustomerGroup(group),
      });
    } catch (error: any) {
      console.error('Update Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomerGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingGroup = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existingGroup)
        return res.status(404).json({ message: 'Customer group not found' });

      await prisma.customer_groups.delete({ where: { id: Number(id) } });

      res.json({ message: 'Customer group deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
