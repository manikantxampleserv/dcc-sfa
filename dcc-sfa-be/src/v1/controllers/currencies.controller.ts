import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface CurrencySerialized {
  id: number;
  code: string;
  name: string;
  symbol?: string | null;
  exchange_rate_to_base?: number | null;
  is_base: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  credit_notes?: { id: number; note_number: string; amount: number }[];
  invoices?: { id: number; invoice_number: string; amount: number }[];
  payments?: { id: number; payment_number: string; amount: number }[];
  orders?: { id: number; order_number: string; total_amount: number }[];
}

const generateCurrenciesCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastCurrency = await prisma.currencies.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCurrency && lastCurrency.code) {
    const match = lastCurrency.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}`;
  return code;
};
const serializeCurrency = (currency: any): CurrencySerialized => ({
  id: currency.id,
  code: currency.code,
  name: currency.name,
  symbol: currency.symbol,
  exchange_rate_to_base: currency.exchange_rate_to_base,
  is_base: currency.is_base,
  is_active: currency.is_active,
  createdate: currency.createdate,
  createdby: currency.createdby,
  updatedate: currency.updatedate,
  updatedby: currency.updatedby,
  log_inst: currency.log_inst,
  credit_notes:
    currency.credit_notes?.map((cn: any) => ({
      id: cn.id,
      note_number: cn.note_number,
      amount: cn.amount,
    })) || [],
  invoices:
    currency.invoices?.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
    })) || [],
  payments:
    currency.payments?.map((p: any) => ({
      id: p.id,
      payment_number: p.payment_number,
      amount: p.amount,
    })) || [],
  orders:
    currency.orders_currencies?.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: o.total_amount,
    })) || [],
});

export const currenciesController = {
  async createCurrencies(req: Request, res: Response) {
    try {
      const data = req.body;

      const newCode = await generateCurrenciesCode(data.name);

      const currency = await prisma.currencies.create({
        data: {
          ...data,
          code: newCode,
          is_active: data.is_active || 'Y',
          is_base: data.is_base || 'N',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          credit_notes: true,
          invoices: true,
          payments: true,
          orders_currencies: true,
        },
      });

      res.status(201).json({
        message: 'Currency created successfully',
        data: serializeCurrency(currency),
      });
    } catch (error: any) {
      console.error('Create Currency Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCurrencies(req: any, res: any) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { code: { contains: searchLower } },
            { name: { contains: searchLower } },
            { symbol: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.currencies,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          credit_notes: true,
          invoices: true,
          payments: true,
          orders_currencies: true,
        },
      });

      const totalCurrencies = await prisma.currencies.count();
      const activeCurrencies = await prisma.currencies.count({
        where: { is_active: 'Y' },
      });
      const inactiveCurrencies = await prisma.currencies.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const currenciesInMonth = await prisma.currencies.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Currencies retrieved successfully',
        data.map((currency: any) => serializeCurrency(currency)),
        200,
        pagination,
        {
          total_currencies: totalCurrencies,
          active_currencies: activeCurrencies,
          inactive_currencies: inactiveCurrencies,
          currencies_in_month: currenciesInMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Currencies Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCurrenciesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currency = await prisma.currencies.findUnique({
        where: { id: Number(id) },
        include: {
          credit_notes: true,
          invoices: true,
          payments: true,
          orders_currencies: true,
        },
      });

      if (!currency)
        return res.status(404).json({ message: 'Currency not found' });

      res.json({
        message: 'Currency fetched successfully',
        data: serializeCurrency(currency),
      });
    } catch (error: any) {
      console.error('Get Currency Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCurrencies(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingCurrency = await prisma.currencies.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCurrency)
        return res.status(404).json({ message: 'Currency not found' });

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const currency = await prisma.currencies.update({
        where: { id: Number(id) },
        data,
        include: {
          credit_notes: true,
          invoices: true,
          payments: true,
          orders_currencies: true,
        },
      });

      res.json({
        message: 'Currency updated successfully',
        data: serializeCurrency(currency),
      });
    } catch (error: any) {
      console.error('Update Currency Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCurrencies(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCurrency = await prisma.currencies.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCurrency)
        return res.status(404).json({ message: 'Currency not found' });

      await prisma.currencies.delete({ where: { id: Number(id) } });

      res.json({ message: 'Currency deleted successfully' });
    } catch (error: any) {
      console.error('Delete Currency Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
