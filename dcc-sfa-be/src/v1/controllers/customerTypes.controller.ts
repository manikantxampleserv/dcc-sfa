import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

interface CustomerTypeSerialized {
  id: number;
  type_name: string;
  type_code: string;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const serializeCustomerType = (c: any): CustomerTypeSerialized => ({
  id: c.id,
  type_name: c.type_name,
  type_code: c.type_code,
  is_active: c.is_active,
  createdate: c.createdate,
  createdby: c.createdby,
  updatedate: c.updatedate,
  updatedby: c.updatedby,
  log_inst: c.log_inst,
  // customer: c.customer_type_customer
  //   ? {
  //       id: c.customer_type_customer.id,
  //       name: c.customer_type_customer.name,
  //     }
  //   : null,
});

const generateCustomerTypeCode = async (type_name: string) => {
  const prefix = type_name.slice(0, 3).toUpperCase();

  const lastRecord = await prisma.customer_type.findFirst({
    orderBy: { id: 'desc' },
    select: { type_code: true },
  });

  let newNum = 1;

  if (lastRecord?.type_code) {
    const match = lastRecord.type_code.match(/(\d+)$/);
    if (match) newNum = Number(match[1]) + 1;
  }

  return `${prefix}${String(newNum).padStart(3, '0')}`;
};

export const customerTypesController = {
  async createCustomerTypes(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.type_name) {
        return res.error('type_name is required', 400);
      }

      const code = await generateCustomerTypeCode(data.type_name);

      const record = await prisma.customer_type.create({
        data: {
          ...data,
          type_code: code,
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
      });

      return res.success(
        'Customer Type created successfully',
        serializeCustomerType(record),
        201
      );
    } catch (error: any) {
      console.error('Create Customer Type Error:', error);
      return res.error(error.message || 'Failed to create customer type', 500);
    }
  },

  async getAllCustomerTypes(req: any, res: any) {
    try {
      const { page, limit, search, is_active } = req.query;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const searchLower = search ? String(search).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { type_name: { contains: searchLower } },
            { type_code: { contains: searchLower } },
          ],
        }),
        ...(is_active && { is_active: is_active as string }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_type,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        // include: { customer_type_customer: true },
      });

      const total = await prisma.customer_type.count();
      const active = await prisma.customer_type.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.customer_type.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newThisMonth = await prisma.customer_type.count({
        where: {
          createdate: {
            gte: start,
            lt: end,
          },
        },
      });

      res.success(
        'Customer types retrieved successfully',
        data.map((c: any) => serializeCustomerType(c)),
        200,
        pagination,
        {
          total,
          active,
          inactive,
          new_this_month: newThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Customer Types Error:', error);
      return res.error(error.message || 'Failed to fetch customer types', 500);
    }
  },

  async getCustomerTypesById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const record = await prisma.customer_type.findUnique({
        where: { id: Number(id) },
        include: { customer_type_customer: true },
      });

      if (!record) {
        return res.error('Customer Type not found', 404);
      }

      return res.success(
        'Customer Type fetched successfully',
        serializeCustomerType(record)
      );
    } catch (error: any) {
      console.error('Get Customer Type Error:', error);
      return res.error(error.message || 'Failed to fetch customer type', 500);
    }
  },

  async updateCustomerTypes(req: any, res: any) {
    try {
      const { id } = req.params;

      const exists = await prisma.customer_type.findUnique({
        where: { id: Number(id) },
      });

      if (!exists) {
        return res.error('Customer Type not found', 404);
      }

      const updated = await prisma.customer_type.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          updatedby: req.user?.id,
          updatedate: new Date(),
        },
        include: { customer_type_customer: true },
      });

      return res.success(
        'Customer Type updated successfully',
        serializeCustomerType(updated)
      );
    } catch (error: any) {
      console.error('Update Customer Type Error:', error);
      return res.error(error.message || 'Failed to update customer type', 500);
    }
  },

  async deleteCustomerTypes(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const exists = await prisma.customer_type.findUnique({
        where: { id: Number(id) },
      });

      if (!exists) {
        return res.error('Customer Type not found', 404);
      }

      await prisma.customer_type.delete({
        where: { id: Number(id) },
      });

      return res.success('Customer Type deleted successfully');
    } catch (error: any) {
      console.error('Delete Customer Type Error:', error);
      return res.error(error.message || 'Failed to delete customer type', 500);
    }
  },
};
