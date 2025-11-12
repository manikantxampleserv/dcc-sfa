import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CreditNoteItemSerialized {
  id: number;
  parent_id: number;
  product_id: number;
  product_name?: string | null;
  unit?: string | null;
  quantity: number;
  unit_price: string;
  discount_amount?: string | null;
  tax_amount?: string | null;
  total_amount?: string | null;
  notes?: string | null;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  credit_notes_items_products?: {
    id: number;
    name: string;
    code: string;
  } | null;
  credit_notes_items?: {
    id: number;
    credit_note_number: string;
  } | null;
}

const serializeCreditNoteItem = (item: any): CreditNoteItemSerialized => ({
  id: item.id,
  parent_id: item.parent_id,
  product_id: item.product_id,
  product_name: item.product_name,
  unit: item.unit,
  quantity: item.quantity,
  unit_price: item.unit_price?.toString() || '0',
  discount_amount: item.discount_amount?.toString() || '0',
  tax_amount: item.tax_amount?.toString() || '0',
  total_amount: item.total_amount?.toString() || '0',
  notes: item.notes,
  createdate: item.createdate || null,
  createdby: item.createdby,
  updatedate: item.updatedate || null,
  updatedby: item.updatedby || null,
  log_inst: item.log_inst || null,
  credit_notes_items_products: item.credit_notes_items_products
    ? {
        id: item.credit_notes_items_products.id,
        name: item.credit_notes_items_products.name,
        code: item.credit_notes_items_products.code,
      }
    : null,
  credit_notes_items: item.credit_notes_items
    ? {
        id: item.credit_notes_items.id,
        credit_note_number: item.credit_notes_items.credit_note_number,
      }
    : null,
});

export const creditNoteItemsController = {
  async createCreditNoteItems(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.parent_id || !data.product_id) {
        return res.status(400).json({
          message: 'parent_id and product_id are required',
        });
      }

      const creditNoteItem = await prisma.credit_note_items.create({
        data: {
          ...data,
          createdate: new Date(),
        },
        include: {
          credit_notes_items_products: true,
          credit_notes_items: true,
        },
      });

      res.status(201).json({
        message: 'Credit Note Item created successfully',
        data: serializeCreditNoteItem(creditNoteItem),
      });
    } catch (error: any) {
      console.error('Create Credit Note Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCreditNoteItems(req: any, res: any) {
    try {
      const { page, limit, search, parent_id } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(parent_id && { parent_id: Number(parent_id) }),
        ...(search && {
          OR: [
            { product_name: { contains: searchLower } },
            { unit: { contains: searchLower } },
            { notes: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.credit_note_items,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { id: 'desc' },
        include: {
          credit_notes_items_products: true,
          credit_notes_items: true,
        },
      });

      res.success(
        'Credit Note Items retrieved successfully',
        data.map((i: any) => serializeCreditNoteItem(i)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get All Credit Note Items Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCreditNoteItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await prisma.credit_note_items.findUnique({
        where: { id: Number(id) },
        include: {
          credit_notes_items_products: true,
          credit_notes_items: true,
        },
      });

      if (!item) {
        return res.status(404).json({ message: 'Credit Note Item not found' });
      }

      res.json({
        message: 'Credit Note Item fetched successfully',
        data: serializeCreditNoteItem(item),
      });
    } catch (error: any) {
      console.error('Get Credit Note Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCreditNoteItem(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.credit_note_items.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Credit Note Item not found' });
      }

      const data = {
        ...req.body,
        updatedate: new Date(),
      };

      const updated = await prisma.credit_note_items.update({
        where: { id: Number(id) },
        data,
        include: {
          credit_notes_items_products: true,
          credit_notes_items: true,
        },
      });

      res.json({
        message: 'Credit Note Item updated successfully',
        data: serializeCreditNoteItem(updated),
      });
    } catch (error: any) {
      console.error('Update Credit Note Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCreditNoteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.credit_note_items.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Credit Note Item not found' });
      }

      await prisma.credit_note_items.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Credit Note Item deleted successfully' });
    } catch (error: any) {
      console.error('Delete Credit Note Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
