import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

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

const handleBaseCurrency = async (
  isBase: string,
  currentCurrencyId?: number,
  tx?: any
) => {
  const db = tx || prisma;

  if (isBase === 'Y') {
    await db.currencies.updateMany({
      where: {
        is_base: 'Y',
        ...(currentCurrencyId && { id: { not: currentCurrencyId } }),
      },
      data: {
        is_base: 'N',
        updatedate: new Date(),
      },
    });
  }
};
export const currenciesController = {
  async createCurrencies(req: any, res: any) {
    try {
      const data = req.body;
      const userId = req.user?.id || 1;

      const isBase = data.is_base || 'N';

      const currency = await prisma.$transaction(async tx => {
        if (isBase === 'Y') {
          await handleBaseCurrency('Y', undefined, tx);
        }

        return await tx.currencies.create({
          data: {
            code: data.code,
            name: data.name,
            symbol: data.symbol,
            exchange_rate_to_base: data.exchange_rate_to_base,
            is_base: isBase,
            is_active: data.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: data.log_inst || 1,
          },
          include: {
            credit_note_currencies: true,
            invoices: true,
            payments: true,
            orders_currencies: true,
          },
        });
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
          credit_note_currencies: true,
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
      const baseCurrencies = await prisma.currencies.count({
        where: { is_base: 'Y' },
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
          base_currencies: baseCurrencies,
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
          credit_note_currencies: true,
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
      const userId = req.user?.id || 1;

      const existingCurrency = await prisma.currencies.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCurrency)
        return res.status(404).json({ message: 'Currency not found' });

      const data = req.body;
      const isBase = data.is_base ?? existingCurrency.is_base;

      const currency = await prisma.$transaction(async tx => {
        if (isBase === 'Y' && existingCurrency.is_base !== 'Y') {
          await handleBaseCurrency('Y', Number(id), tx);
        }

        return await tx.currencies.update({
          where: { id: Number(id) },
          data: {
            code: data.code ?? existingCurrency.code,
            name: data.name ?? existingCurrency.name,
            symbol: data.symbol ?? existingCurrency.symbol,
            exchange_rate_to_base:
              data.exchange_rate_to_base ??
              existingCurrency.exchange_rate_to_base,
            is_base: isBase,
            is_active: data.is_active ?? existingCurrency.is_active,
            updatedate: new Date(),
            updatedby: userId,
            log_inst: data.log_inst ?? existingCurrency.log_inst,
          },
          include: {
            credit_note_currencies: true,
            invoices: true,
            payments: true,
            orders_currencies: true,
          },
        });
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
