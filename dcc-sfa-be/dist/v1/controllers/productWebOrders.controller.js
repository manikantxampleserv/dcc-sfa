"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productWebOrdersController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeProductWebOrder = (productWebOrder) => ({
    id: productWebOrder.id,
    name: productWebOrder.name,
    code: productWebOrder.code,
    is_active: productWebOrder.is_active,
    created_by: productWebOrder.createdby,
    createdate: productWebOrder.createdate,
    updatedate: productWebOrder.updatedate,
    updatedby: productWebOrder.updatedby,
});
exports.productWebOrdersController = {
    async createProductWebOrder(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res
                    .status(400)
                    .json({ message: 'Product web order name is required' });
            }
            const productWebOrder = await prisma_client_1.default.product_web_order.create({
                data: {
                    ...data,
                    code: data.code || `WO-${data.name.toUpperCase().replace(/\s+/g, '-')}`,
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Product web order created successfully',
                data: serializeProductWebOrder(productWebOrder),
            });
        }
        catch (error) {
            console.error('Create Product Web Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductWebOrders(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                ...(isActive && { is_active: isActive }),
                ...(search && {
                    OR: [
                        { name: { contains: searchLower, mode: 'insensitive' } },
                        { code: { contains: searchLower, mode: 'insensitive' } },
                    ],
                }),
            };
            const totalProductWebOrders = await prisma_client_1.default.product_web_order.count();
            const activeProductWebOrders = await prisma_client_1.default.product_web_order.count({
                where: { is_active: 'Y' },
            });
            const inactiveProductWebOrders = await prisma_client_1.default.product_web_order.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newProductWebOrdersThisMonth = await prisma_client_1.default.product_web_order.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_web_orders: totalProductWebOrders,
                active_product_web_orders: activeProductWebOrders,
                inactive_product_web_orders: inactiveProductWebOrders,
                new_product_web_orders_this_month: newProductWebOrdersThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_web_order,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product web orders retrieved successfully',
                data: data.map((d) => serializeProductWebOrder(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Web Orders Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductWebOrderById(req, res) {
        try {
            const { id } = req.params;
            const productWebOrder = await prisma_client_1.default.product_web_order.findUnique({
                where: { id: Number(id) },
            });
            if (!productWebOrder) {
                return res.status(404).json({ message: 'Product web order not found' });
            }
            res.json({
                message: 'Product web order fetched successfully',
                data: serializeProductWebOrder(productWebOrder),
            });
        }
        catch (error) {
            console.error('Get Product Web Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductWebOrder(req, res) {
        try {
            const { id } = req.params;
            const existingProductWebOrder = await prisma_client_1.default.product_web_order.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductWebOrder) {
                return res.status(404).json({ message: 'Product web order not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const productWebOrder = await prisma_client_1.default.product_web_order.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product web order updated successfully',
                data: serializeProductWebOrder(productWebOrder),
            });
        }
        catch (error) {
            console.error('Update Product Web Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductWebOrder(req, res) {
        try {
            const { id } = req.params;
            const existingProductWebOrder = await prisma_client_1.default.product_web_order.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductWebOrder) {
                return res.status(404).json({ message: 'Product web order not found' });
            }
            await prisma_client_1.default.product_web_order.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product web order deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Web Order Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductWebOrdersDropdown(req, res) {
        try {
            const { search = '', product_web_order_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const productWebOrderId = product_web_order_id
                ? Number(product_web_order_id)
                : null;
            const where = {
                is_active: 'Y',
            };
            if (productWebOrderId) {
                where.id = productWebOrderId;
            }
            else if (searchLower) {
                where.OR = [
                    {
                        name: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        code: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const productWebOrders = await prisma_client_1.default.product_web_order.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                orderBy: {
                    name: 'asc',
                },
                take: 50,
            });
            res.success('Product web orders dropdown fetched successfully', productWebOrders, 200);
        }
        catch (error) {
            console.error('Error fetching product web orders dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productWebOrders.controller.js.map