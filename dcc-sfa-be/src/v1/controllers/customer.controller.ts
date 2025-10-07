import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface CustomerSerialized {
  id: number;
  name: string;
  code: string;
  zones_id?: number | null;
  type?: string | null;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  credit_limit?: string | null;
  outstanding_amount: string;
  route_id?: number | null;
  salesperson_id?: number | null;
  last_visit_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_zones?: { id: number; name: string; code: string } | null;
  customer_routes?: { id: number; name: string; code: string } | null;
  customer_users?: { id: number; name: string; email: string } | null;
}

const generateCustomerCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastCustomers = await prisma.customers.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCustomers && lastCustomers.code) {
    const match = lastCustomers.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

  return code;
};
const serializeCustomer = (customer: any): CustomerSerialized => ({
  id: customer.id,
  name: customer.name,
  code: customer.code,
  zones_id: customer.zones_id,
  type: customer.type,
  contact_person: customer.contact_person,
  phone_number: customer.phone_number,
  email: customer.email,
  address: customer.address,
  city: customer.city,
  state: customer.state,
  zipcode: customer.zipcode,
  latitude: customer.latitude?.toString() || null,
  longitude: customer.longitude?.toString() || null,
  credit_limit: customer.credit_limit?.toString() || null,
  outstanding_amount: customer.outstanding_amount?.toString() || '0',
  route_id: customer.route_id,
  salesperson_id: customer.salesperson_id,
  last_visit_date: customer.last_visit_date,
  is_active: customer.is_active,
  createdate: customer.createdate,
  createdby: customer.createdby,
  updatedate: customer.updatedate,
  updatedby: customer.updatedby,
  log_inst: customer.log_inst,

  customer_zones: customer.customer_zones
    ? {
        id: customer.customer_zones.id,
        name: customer.customer_zones.name,
        code: customer.customer_zones.code,
      }
    : null,
  customer_routes: customer.customer_routes
    ? {
        id: customer.customer_routes.id,
        name: customer.customer_routes.name,
        code: customer.customer_routes.code,
      }
    : null,
  customer_users: customer.customer_users
    ? {
        id: customer.customer_users.id,
        name: customer.customer_users.name,
        email: customer.customer_users.email,
      }
    : null,
});

export const customerController = {
  async createCustomers(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Customer name is required' });
      }
      const newCode = await generateCustomerCode(data.name);
      const customer = await prisma.customers.create({
        data: {
          ...data,
          code: newCode,
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      res.status(201).json({
        message: 'Customer created successfully',
        data: serializeCustomer(customer),
      });
    } catch (error: any) {
      console.error('Create Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomers(req: any, res: any) {
    try {
      const { page, limit, search, type } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
          ],
        }),
        ...(type && type !== 'All' && { type }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customers,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      const distributors = await prisma.customers.count({
        where: { type: 'Distributor' },
      });
      const retailers = await prisma.customers.count({
        where: { type: 'Retailer' },
      });

      const wholesellers = await prisma.customers.count({
        where: { type: 'Wholesaler' },
      });
      const totalCustomers = await prisma.customers.count();
      const activeCustomers = await prisma.customers.count({
        where: { is_active: 'Y' },
      });
      const inactiveCustomers = await prisma.customers.count({
        where: { is_active: 'N' },
      });
      const totals = await prisma.customers.aggregate({
        _sum: {
          credit_limit: true,
          outstanding_amount: true,
        },
      });

      const totalCreditLimit = totals._sum.credit_limit || 0;
      const totalOutstandingAmount = totals._sum.outstanding_amount || 0;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newCustomersThisMonth = await prisma.customers.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Customers retrieved successfully',
        data.map((c: any) => serializeCustomer(c)),
        200,
        pagination,
        {
          new_customers_this_month: newCustomersThisMonth,
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          inactive_customers: inactiveCustomers,
          distributors: distributors,
          retailers: retailers,
          wholesaler: wholesellers,
          total_credit_limit: totalCreditLimit,
          total_outstanding_amount: totalOutstandingAmount,
        }
      );
    } catch (error: any) {
      console.error('Get Customers Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomersById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({
        message: 'Customer fetched successfully',
        data: serializeCustomer(customer),
      });
    } catch (error: any) {
      console.error('Get Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomers(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };
      const customer = await prisma.customers.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      res.json({
        message: 'Customer updated successfully',
        data: serializeCustomer(customer),
      });
    } catch (error: any) {
      console.error('Update Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      await prisma.customers.delete({ where: { id: Number(id) } });

      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
