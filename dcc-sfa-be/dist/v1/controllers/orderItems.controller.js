"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderItemsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeOrderItem = (item) => ({
    id: item.id,
    parent_id: item.parent_id,
    product_id: item.product_id,
    product_name: item.product_name,
    unit: item.unit,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    discount_amount: item.discount_amount ? Number(item.discount_amount) : null,
    tax_amount: item.tax_amount ? Number(item.tax_amount) : null,
    total_amount: item.total_amount ? Number(item.total_amount) : null,
    notes: item.notes,
    order: item.orders
        ? { id: item.orders.id, order_number: item.orders.order_number }
        : null,
    product: item.products
        ? {
            id: item.products.id,
            name: item.products.name,
            code: item.products.code,
        }
        : null,
});
exports.orderItemsController = {
    async createOrderItems(req, res) {
        try {
            const data = req.body;
            const totalAmount = (Number(data.quantity) || 0) * (Number(data.unit_price) || 0) -
                (Number(data.discount_amount) || 0) +
                (Number(data.tax_amount) || 0);
            const item = await prisma_client_1.default.order_items.create({
                data: {
                    parent_id: data.parent_id,
                    product_id: data.product_id,
                    product_name: data.product_name,
                    unit: data.unit,
                    quantity: data.quantity || 1,
                    unit_price: data.unit_price || 0,
                    discount_amount: data.discount_amount || 0,
                    tax_amount: data.tax_amount || 0,
                    total_amount: totalAmount,
                    notes: data.notes,
                },
                include: {
                    orders: true,
                    products: true,
                },
            });
            res.status(201).json({
                message: 'Order item created successfully',
                data: serializeOrderItem(item),
            });
        }
        catch (error) {
            console.error('Create OrderItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllOrderItems(req, res) {
        try {
            const { page, limit, search } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { product_name: { contains: searchLower } },
                        { notes: { contains: searchLower } },
                    ],
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.order_items,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { id: 'desc' },
                include: { orders: true, products: true },
            });
            const total = await prisma_client_1.default.order_items.count();
            res.success('Order items retrieved successfully', data.map((i) => serializeOrderItem(i)), 200, pagination, { total_order_items: total });
        }
        catch (error) {
            console.error('Get OrderItems Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getOrderItemsById(req, res) {
        try {
            const { id } = req.params;
            const item = await prisma_client_1.default.order_items.findUnique({
                where: { id: Number(id) },
                include: { orders: true, products: true },
            });
            if (!item)
                return res.status(404).json({ message: 'Order item not found' });
            res.json({
                message: 'Order item fetched successfully',
                data: serializeOrderItem(item),
            });
        }
        catch (error) {
            console.error('Get OrderItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateOrderItems(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.order_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Order item not found' });
            const data = req.body;
            const totalAmount = (Number(data.quantity ?? existing.quantity) || 0) *
                (Number(data.unit_price ?? existing.unit_price) || 0) -
                (Number(data.discount_amount ?? existing.discount_amount) || 0) +
                (Number(data.tax_amount ?? existing.tax_amount) || 0);
            const updated = await prisma_client_1.default.order_items.update({
                where: { id: Number(id) },
                data: {
                    parent_id: data.parent_id ?? existing.parent_id,
                    product_id: data.product_id ?? existing.product_id,
                    product_name: data.product_name ?? existing.product_name,
                    unit: data.unit ?? existing.unit,
                    quantity: data.quantity ?? existing.quantity,
                    unit_price: data.unit_price ?? existing.unit_price,
                    discount_amount: data.discount_amount ?? existing.discount_amount,
                    tax_amount: data.tax_amount ?? existing.tax_amount,
                    total_amount: totalAmount,
                    notes: data.notes ?? existing.notes,
                },
                include: { orders: true, products: true },
            });
            res.json({
                message: 'Order item updated successfully',
                data: serializeOrderItem(updated),
            });
        }
        catch (error) {
            console.error('Update OrderItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteOrderItems(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.order_items.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Order item not found' });
            await prisma_client_1.default.order_items.delete({ where: { id: Number(id) } });
            res.json({ message: 'Order item deleted successfully' });
        }
        catch (error) {
            console.error('Delete OrderItem Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=orderItems.controller.js.map