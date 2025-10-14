import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface PaymentSerialized {
  id: number;
  payment_number: string;
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  currency_id?: number;
  customer?: {
    id: number;
    name: string;
    code: string;
  };
  collected_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  currency?: {
    id: number;
    name: string;
    code: string;
  };
}

const serializePayment = (payment: any): PaymentSerialized => ({
  id: payment.id,
  payment_number: payment.payment_number,
  customer_id: payment.customer_id,
  payment_date: payment.payment_date?.toISOString() || '',
  collected_by: payment.collected_by,
  method: payment.method,
  reference_number: payment.reference_number,
  total_amount: Number(payment.total_amount),
  notes: payment.notes,
  is_active: payment.is_active,
  createdate: payment.createdate?.toISOString(),
  createdby: payment.createdby,
  updatedate: payment.updatedate?.toISOString(),
  updatedby: payment.updatedby,
  log_inst: payment.log_inst,
  currency_id: payment.currency_id,
  customer: payment.payments_customers
    ? {
        id: payment.payments_customers.id,
        name: payment.payments_customers.name,
        code: payment.payments_customers.code,
      }
    : undefined,
  collected_by_user: payment.users_payments_collected_byTousers
    ? {
        id: payment.users_payments_collected_byTousers.id,
        name: payment.users_payments_collected_byTousers.name,
        email: payment.users_payments_collected_byTousers.email,
      }
    : undefined,
  currency: payment.currencies
    ? {
        id: payment.currencies.id,
        name: payment.currencies.name,
        code: payment.currencies.code,
      }
    : undefined,
});

export const paymentsController = {
  async createPayment(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.customer_id) {
        return res.status(400).json({ message: 'Customer is required' });
      }
      if (!data.payment_date) {
        return res.status(400).json({ message: 'Payment date is required' });
      }
      if (!data.collected_by) {
        return res.status(400).json({ message: 'Collected by is required' });
      }
      if (!data.method) {
        return res.status(400).json({ message: 'Payment method is required' });
      }
      if (!data.total_amount) {
        return res.status(400).json({ message: 'Total amount is required' });
      }

      const payment = await prisma.payments.create({
        data: {
          ...data,
          payment_number: `PAY-${Date.now()}`,
          payment_date: new Date(data.payment_date),
          total_amount: Number(data.total_amount),
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          payments_customers: true,
          users_payments_collected_byTousers: true,
          currencies: true,
        },
      });

      res.status(201).json({
        message: 'Payment created successfully',
        data: serializePayment(payment),
      });
    } catch (error: any) {
      console.error('Create Payment Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPayments(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        customer_id,
        collected_by,
        method,
        payment_date_from,
        payment_date_to,
        currency_id,
        is_active = 'Y',
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: is_active as string,
        ...(search && {
          OR: [
            { payment_number: { contains: searchLower } },
            { reference_number: { contains: searchLower } },
            { notes: { contains: searchLower } },
            { payments_customers: { name: { contains: searchLower } } },
            {
              users_payments_collected_byTousers: {
                name: { contains: searchLower },
              },
            },
          ],
        }),
        ...(customer_id && { customer_id: Number(customer_id) }),
        ...(collected_by && { collected_by: Number(collected_by) }),
        ...(method && { method: method as string }),
        ...(currency_id && { currency_id: Number(currency_id) }),
        ...(payment_date_from || payment_date_to
          ? {
              payment_date: {
                ...(payment_date_from && {
                  gte: new Date(payment_date_from as string),
                }),
                ...(payment_date_to && {
                  lte: new Date(payment_date_to as string),
                }),
              },
            }
          : {}),
      };

      const totalPayments = await prisma.payments.count({ where: filters });
      const totalAmount = await prisma.payments.aggregate({
        where: filters,
        _sum: { total_amount: true },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const paymentsThisMonth = await prisma.payments.count({
        where: {
          ...filters,
          payment_date: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const amountThisMonth = await prisma.payments.aggregate({
        where: {
          ...filters,
          payment_date: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
        _sum: { total_amount: true },
      });

      const pendingCollections = await prisma.invoices.count({
        where: {
          is_active: 'Y',
          balance_due: { gt: 0 },
        },
      });

      const overdueAmount = await prisma.invoices.aggregate({
        where: {
          is_active: 'Y',
          balance_due: { gt: 0 },
        },
        _sum: { balance_due: true },
      });

      const stats = {
        total_payments: totalPayments,
        total_amount: Number(totalAmount._sum.total_amount || 0),
        payments_this_month: paymentsThisMonth,
        amount_this_month: Number(amountThisMonth._sum.total_amount || 0),
        pending_collections: pendingCollections,
        overdue_amount: Number(overdueAmount._sum.balance_due || 0),
      };

      const { data, pagination } = await paginate({
        model: prisma.payments,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          payments_customers: true,
          users_payments_collected_byTousers: true,
          currencies: true,
        },
      });

      res.json({
        success: true,
        message: 'Payments retrieved successfully',
        data: data.map((d: any) => serializePayment(d)),
        pagination: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Payments Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await prisma.payments.findUnique({
        where: { id: Number(id) },
        include: {
          payments_customers: true,
          users_payments_collected_byTousers: true,
          currencies: true,
        },
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      res.json({
        message: 'Payment fetched successfully',
        data: serializePayment(payment),
      });
    } catch (error: any) {
      console.error('Get Payment Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingPayment = await prisma.payments.findUnique({
        where: { id: Number(id) },
      });

      if (!existingPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      const data = { ...req.body, updatedate: new Date() };

      const payment = await prisma.payments.update({
        where: { id: Number(id) },
        data,
        include: {
          payments_customers: true,
          users_payments_collected_byTousers: true,
          currencies: true,
        },
      });

      res.json({
        message: 'Payment updated successfully',
        data: serializePayment(payment),
      });
    } catch (error: any) {
      console.error('Update Payment Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingPayment = await prisma.payments.findUnique({
        where: { id: Number(id) },
      });

      if (!existingPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      await prisma.payments.delete({ where: { id: Number(id) } });

      res.json({ message: 'Payment deleted successfully' });
    } catch (error: any) {
      console.error('Delete Payment Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
