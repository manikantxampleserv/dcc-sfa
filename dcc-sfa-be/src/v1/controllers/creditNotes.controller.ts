import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CreditNoteItemInput {
  id?: number;
  product_id: number;
  product_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
}

interface CreditNoteInput {
  id?: number;
  credit_note_number?: string;
  parent_id: number;
  products_id?: number;
  customer_id: number;
  credit_note_date?: Date | string;
  due_date?: Date | string;
  status?: string;
  reason?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  amount_applied?: number;
  balance_due?: number;
  notes?: string;
  billing_address?: string;
  currency_id?: number;
  is_active?: string;
  createdby?: number;
  creditNoteItems?: CreditNoteItemInput[];
}

interface CreditNoteSerialized {
  id: number;
  credit_note_number: string;
  parent_id: number;
  products_id?: number | null;
  customer_id: number;
  credit_note_date?: Date | null;
  due_date?: Date | null;
  status?: string | null;
  reason?: string | null;
  payment_method?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  tax_amount?: number | null;
  shipping_amount?: number | null;
  total_amount?: number | null;
  amount_applied?: number | null;
  balance_due?: number | null;
  notes?: string | null;
  billing_address?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  currency_id?: number | null;
  customer?: { id: number; name: string; code: string } | null;
  product?: { id: number; name: string } | null;
  order?: { id: number; order_number: string } | null;
  currency?: { id: number; code: string } | null;
  creditNoteItems?: any[];
}

const serializeCreditNote = (cn: any): CreditNoteSerialized => ({
  id: cn.id,
  credit_note_number: cn.credit_note_number,
  parent_id: cn.parent_id,
  products_id: cn.products_id,
  customer_id: cn.customer_id,
  credit_note_date: cn.credit_note_date,
  due_date: cn.due_date,
  status: cn.status,
  reason: cn.reason,
  payment_method: cn.payment_method,
  subtotal: cn.subtotal ? Number(cn.subtotal) : null,
  discount_amount: cn.discount_amount ? Number(cn.discount_amount) : null,
  tax_amount: cn.tax_amount ? Number(cn.tax_amount) : null,
  shipping_amount: cn.shipping_amount ? Number(cn.shipping_amount) : null,
  total_amount: cn.total_amount ? Number(cn.total_amount) : null,
  amount_applied: cn.amount_applied ? Number(cn.amount_applied) : null,
  balance_due: cn.balance_due ? Number(cn.balance_due) : null,
  notes: cn.notes,
  billing_address: cn.billing_address,
  is_active: cn.is_active,
  createdate: cn.createdate,
  createdby: cn.createdby,
  updatedate: cn.updatedate,
  updatedby: cn.updatedby,
  log_inst: cn.log_inst,
  currency_id: cn.currency_id,
  customer: cn.credit_notes_customers
    ? {
        id: cn.credit_notes_customers.id,
        name: cn.credit_notes_customers.name,
        code: cn.credit_notes_customers.code,
      }
    : null,
  product: cn.credit_notes_products
    ? { id: cn.credit_notes_products.id, name: cn.credit_notes_products.name }
    : null,
  order: cn.credit_notes_orders
    ? {
        id: cn.credit_notes_orders.id,
        order_number: cn.credit_notes_orders.order_number,
      }
    : null,
  currency: cn.credit_note_currencies
    ? { id: cn.credit_note_currencies.id, code: cn.credit_note_currencies.code }
    : null,
  creditNoteItems: cn.credit_notes_items
    ? cn.credit_notes_items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price ? Number(item.unit_price) : null,
        discount_amount: item.discount_amount
          ? Number(item.discount_amount)
          : null,
        tax_amount: item.tax_amount ? Number(item.tax_amount) : null,
        total_amount: item.total_amount ? Number(item.total_amount) : null,
        notes: item.notes,
        product: item.credit_notes_items_products
          ? {
              id: item.credit_notes_items_products.id,
              name: item.credit_notes_items_products.name,
            }
          : null,
      }))
    : [],
});

async function generateCreditNoteNumber(tx: any): Promise<string> {
  const maxRetries = 10;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const lastCreditNote = await tx.credit_notes.findFirst({
        where: {
          credit_note_number: {
            startsWith: 'CN-',
          },
        },
        orderBy: {
          id: 'desc',
        },
        select: {
          credit_note_number: true,
        },
      });

      let nextNumber = 1;

      if (lastCreditNote && lastCreditNote.credit_note_number) {
        const match = lastCreditNote.credit_note_number.match(/CN-(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const allCreditNotes = await tx.credit_notes.findMany({
        where: {
          credit_note_number: {
            startsWith: 'CN-',
          },
        },
        select: {
          credit_note_number: true,
        },
      });

      for (const creditNote of allCreditNotes) {
        const match = creditNote.credit_note_number.match(/CN-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num >= nextNumber) {
            nextNumber = num + 1;
          }
        }
      }

      const newCreditNoteNumber = `CN-${nextNumber.toString().padStart(5, '0')}`;

      const exists = await tx.credit_notes.findFirst({
        where: {
          credit_note_number: newCreditNoteNumber,
        },
      });

      if (!exists) {
        console.log(
          ' Generated unique credit note number:',
          newCreditNoteNumber
        );
        return newCreditNoteNumber;
      }

      console.log(
        ' Credit note number exists, retrying...',
        newCreditNoteNumber
      );
      retryCount++;
    } catch (error) {
      console.error(' Error generating credit note number:', error);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const timestamp = Date.now();
  const fallbackCreditNoteNumber = `CN-${timestamp}`;
  console.log(' Using fallback credit note number:', fallbackCreditNoteNumber);
  return fallbackCreditNoteNumber;
}

export const creditNotesController = {
  async upsertCreditNote(req: Request, res: Response) {
    try {
      const data: CreditNoteInput = req.body;
      const userId = req.user?.id || 1;

      if (!data.parent_id || !data.customer_id) {
        return res.status(400).json({
          message: 'Parent (Order) ID and Customer ID are required',
        });
      }

      const isUpdate = !!data.id;
      const creditNoteItems: CreditNoteItemInput[] = data.creditNoteItems || [];

      let creditNote;

      if (isUpdate) {
        const existingNote = await prisma.credit_notes.findUnique({
          where: { id: data.id },
          include: { credit_notes_items: true },
        });

        if (!existingNote) {
          return res.status(404).json({ message: 'Credit Note not found' });
        }

        const existingItemIds = existingNote.credit_notes_items.map(
          item => item.id
        );
        const incomingItemIds = creditNoteItems
          .filter(item => item.id)
          .map(item => item.id!);

        const itemsToDelete = existingItemIds.filter(
          id => !incomingItemIds.includes(id)
        );

        creditNote = await prisma.$transaction(async tx => {
          if (itemsToDelete.length > 0) {
            await tx.credit_note_items.deleteMany({
              where: {
                id: { in: itemsToDelete },
                parent_id: data.id,
              },
            });
          }

          for (const item of creditNoteItems) {
            const itemData = {
              product_id: item.product_id,
              product_name: item.product_name,
              unit: item.unit,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount_amount: item.discount_amount || 0,
              tax_amount: item.tax_amount || 0,
              total_amount: item.total_amount,
              notes: item.notes,
            };

            if (item.id) {
              await tx.credit_note_items.update({
                where: { id: item.id },
                data: {
                  ...itemData,
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });
            } else {
              await tx.credit_note_items.create({
                data: {
                  ...itemData,
                  parent_id: data.id!,
                  createdby: userId,
                  createdate: new Date(),
                },
              });
            }
          }

          const processedData = {
            credit_note_number:
              data.credit_note_number || existingNote.credit_note_number,
            parent_id: data.parent_id,
            products_id: data.products_id,
            customer_id: data.customer_id,
            credit_note_date: data.credit_note_date
              ? new Date(data.credit_note_date)
              : existingNote.credit_note_date,
            due_date: data.due_date
              ? new Date(data.due_date)
              : existingNote.due_date,
            status: data.status || existingNote.status,
            reason: data.reason,
            payment_method: data.payment_method || existingNote.payment_method,
            subtotal: data.subtotal ?? existingNote.subtotal,
            discount_amount:
              data.discount_amount ?? existingNote.discount_amount,
            tax_amount: data.tax_amount ?? existingNote.tax_amount,
            shipping_amount:
              data.shipping_amount ?? existingNote.shipping_amount,
            total_amount: data.total_amount ?? existingNote.total_amount,
            amount_applied: data.amount_applied ?? existingNote.amount_applied,
            balance_due: data.balance_due ?? existingNote.balance_due,
            notes: data.notes,
            billing_address: data.billing_address,
            currency_id: data.currency_id,
            is_active: data.is_active || existingNote.is_active,
            updatedate: new Date(),
            updatedby: userId,
          };

          return await tx.credit_notes.update({
            where: { id: data.id },
            data: processedData,
            include: {
              credit_notes_customers: true,
              credit_notes_products: true,
              credit_notes_orders: true,
              credit_note_currencies: true,
              credit_notes_items: {
                include: {
                  credit_notes_items_products: true,
                },
              },
            },
          });
        });

        res.status(200).json({
          message: 'Credit Note updated successfully',
          data: serializeCreditNote(creditNote),
        });
      } else {
        creditNote = await prisma.$transaction(async tx => {
          const creditNoteNumber = data.credit_note_number
            ? data.credit_note_number
            : await generateCreditNoteNumber(tx);

          const processedData = {
            credit_note_number: creditNoteNumber,
            parent_id: data.parent_id,
            products_id: data.products_id,
            customer_id: data.customer_id,
            credit_note_date: data.credit_note_date
              ? new Date(data.credit_note_date)
              : new Date(),
            due_date: data.due_date ? new Date(data.due_date) : undefined,
            status: data.status || 'draft',
            reason: data.reason,
            payment_method: data.payment_method || 'credit',
            subtotal: data.subtotal || 0,
            discount_amount: data.discount_amount || 0,
            tax_amount: data.tax_amount || 0,
            shipping_amount: data.shipping_amount || 0,
            total_amount: data.total_amount || 0,
            amount_applied: data.amount_applied || 0,
            balance_due: data.balance_due,
            notes: data.notes,
            billing_address: data.billing_address,
            currency_id: data.currency_id,
            is_active: data.is_active || 'Y',
            log_inst: 1,
            createdate: new Date(),
            createdby: userId,
          };

          return await tx.credit_notes.create({
            data: {
              ...processedData,
              credit_notes_items: {
                create: creditNoteItems.map((item: CreditNoteItemInput) => ({
                  product_id: item.product_id,
                  product_name: item.product_name,
                  unit: item.unit,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  discount_amount: item.discount_amount || 0,
                  tax_amount: item.tax_amount || 0,
                  total_amount: item.total_amount,
                  notes: item.notes,
                  createdby: userId,
                  createdate: new Date(),
                })),
              },
            },
            include: {
              credit_notes_customers: true,
              credit_notes_products: true,
              credit_notes_orders: true,
              credit_note_currencies: true,
              credit_notes_items: {
                include: {
                  credit_notes_items_products: true,
                },
              },
            },
          });
        });

        res.status(201).json({
          message: 'Credit Note created successfully',
          data: serializeCreditNote(creditNote),
        });
      }
    } catch (error: any) {
      console.error('Create Credit Note Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async createCreditNotes(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.parent_id || !data.customer_id) {
        return res
          .status(400)
          .json({ message: 'Parent (Order) ID and Customer ID are required' });
      }

      const processedData = {
        ...data,
        credit_note_date: data.credit_note_date
          ? new Date(data.credit_note_date)
          : undefined,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
      };

      const creditNote = await prisma.credit_notes.create({
        data: {
          ...processedData,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          credit_notes_customers: true,
          credit_notes_products: true,
          credit_notes_orders: true,
          credit_note_currencies: true,
        },
      });

      res.status(201).json({
        message: 'Credit Note created successfully',
        data: serializeCreditNote(creditNote),
      });
    } catch (error: any) {
      console.error('Create Credit Note Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCreditNotes(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { credit_note_number: { contains: searchLower } },
            { status: { contains: searchLower } },
            { reason: { contains: searchLower } },
            {
              credit_notes_customers: {
                OR: [
                  { name: { contains: searchLower } },
                  { code: { contains: searchLower } },
                ],
              },
            },
          ],
        }),
        ...(status && status !== 'all' && { status: status as string }),
      };

      const { data, pagination } = await paginate({
        model: prisma.credit_notes,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          credit_notes_customers: true,
          credit_notes_products: true,
          credit_notes_orders: true,
          credit_note_currencies: true,
          credit_notes_items: {
            include: {
              credit_notes_items_products: true,
            },
          },
        },
      });
      const totalCreditNotes = await prisma.credit_notes.count();
      const activeCreditNotes = await prisma.credit_notes.count({
        where: { is_active: 'Y' },
      });
      const inactiveCreditNotes = await prisma.credit_notes.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCreditNotesThisMonth = await prisma.credit_notes.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });
      res.success(
        'Credit Notes retrieved successfully',
        data.map((cn: any) => serializeCreditNote(cn)),
        200,
        pagination,
        {
          active_credit_notes: activeCreditNotes,
          inactive_credit_notes: inactiveCreditNotes,
          new_credit_notes_this_month: newCreditNotesThisMonth,
          total_credit_notes: totalCreditNotes,
        }
      );
    } catch (error: any) {
      console.error('Get All Credit Notes Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCreditNoteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const creditNote = await prisma.credit_notes.findUnique({
        where: { id: Number(id) },
        include: {
          credit_notes_customers: true,
          credit_notes_products: true,
          credit_notes_orders: true,
          credit_note_currencies: true,
          credit_notes_items: {
            include: {
              credit_notes_items_products: true,
            },
          },
        },
      });
      if (!creditNote) {
        return res.status(404).json({ message: 'Credit Note not found' });
      }
      res.status(200).json({
        message: 'Credit Note retrieved successfully',
        data: serializeCreditNote(creditNote),
      });
    } catch (error: any) {
      console.error('Get Credit Note Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCreditNotes(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingNote = await prisma.credit_notes.findUnique({
        where: { id: Number(id) },
      });
      if (!existingNote) {
        return res.status(404).json({ message: 'Credit Note not found' });
      }

      const processedData = {
        ...req.body,
        credit_note_date: req.body.credit_note_date
          ? new Date(req.body.credit_note_date)
          : undefined,
        due_date: req.body.due_date ? new Date(req.body.due_date) : undefined,
      };

      const updatedNote = await prisma.credit_notes.update({
        where: { id: Number(id) },
        data: {
          ...processedData,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
        include: {
          credit_notes_customers: true,
          credit_notes_products: true,
          credit_notes_orders: true,
          credit_note_currencies: true,
        },
      });

      res.status(200).json({
        message: 'Credit Note updated successfully',
        data: serializeCreditNote(updatedNote),
      });
    } catch (error: any) {
      console.error('Update Credit Note Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCreditNotes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingNote = await prisma.credit_notes.findUnique({
        where: { id: Number(id) },
      });
      if (!existingNote) {
        return res.status(404).json({ message: 'Credit Note not found' });
      }

      await prisma.credit_notes.delete({ where: { id: Number(id) } });
      res.status(200).json({ message: 'Credit Note deleted successfully' });
    } catch (error: any) {
      console.error('Delete Credit Note Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
