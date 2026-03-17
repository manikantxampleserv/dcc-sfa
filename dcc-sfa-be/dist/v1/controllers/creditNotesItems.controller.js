"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditNoteItemsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeCreditNoteItem = (item) => ({
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
exports.creditNoteItemsController = {
    async createCreditNoteItems(req, res) {
        try {
            const data = req.body;
            if (!data.parent_id || !data.product_id) {
                return res.status(400).json({
                    message: 'parent_id and product_id are required',
                });
            }
            const creditNoteItem = await prisma_client_1.default.credit_note_items.create({
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
        }
        catch (error) {
            console.error('Create Credit Note Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCreditNoteItems(req, res) {
        try {
            const { page, limit, search, parent_id } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(parent_id && { parent_id: Number(parent_id) }),
                ...(search && {
                    OR: [
                        { product_name: { contains: searchLower } },
                        { unit: { contains: searchLower } },
                        { notes: { contains: searchLower } },
                    ],
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.credit_note_items,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { id: 'desc' },
                include: {
                    credit_notes_items_products: true,
                    credit_notes_items: true,
                },
            });
            res.success('Credit Note Items retrieved successfully', data.map((i) => serializeCreditNoteItem(i)), 200, pagination);
        }
        catch (error) {
            console.error('Get All Credit Note Items Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCreditNoteItemById(req, res) {
        try {
            const { id } = req.params;
            const item = await prisma_client_1.default.credit_note_items.findUnique({
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
        }
        catch (error) {
            console.error('Get Credit Note Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateCreditNoteItem(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.credit_note_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({ message: 'Credit Note Item not found' });
            }
            const data = {
                ...req.body,
                updatedate: new Date(),
            };
            const updated = await prisma_client_1.default.credit_note_items.update({
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
        }
        catch (error) {
            console.error('Update Credit Note Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCreditNoteItem(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.credit_note_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({ message: 'Credit Note Item not found' });
            }
            await prisma_client_1.default.credit_note_items.delete({
                where: { id: Number(id) },
            });
            res.json({ message: 'Credit Note Item deleted successfully' });
        }
        catch (error) {
            console.error('Delete Credit Note Item Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=creditNotesItems.controller.js.map