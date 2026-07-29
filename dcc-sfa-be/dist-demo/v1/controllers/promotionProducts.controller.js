"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionProductsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializePromotionProduct = (p) => ({
    id: p.id,
    promotion_id: p.promotion_id,
    product_id: p.product_id,
    is_active: p.is_active,
    createdate: p.createdate,
    createdby: p.createdby,
    updatedate: p.updatedate,
    updatedby: p.updatedby,
    log_inst: p.log_inst,
    products: p.promotion_products_products
        ? {
            id: p.promotion_products_products.id,
            name: p.promotion_products_products.name,
            code: p.promotion_products_products.code,
        }
        : null,
    promotions: p.products_promotion_products
        ? {
            id: p.products_promotion_products.id,
            name: p.products_promotion_products.name,
            code: p.products_promotion_products.code,
        }
        : null,
});
exports.promotionProductsController = {
    async createPromotionProduct(req, res) {
        try {
            const data = req.body;
            if (!data.promotion_id || !data.product_id) {
                return res
                    .status(400)
                    .json({ message: 'promotion_id and product_id are required' });
            }
            const promotionProduct = await prisma_client_1.default.promotion_products.create({
                data: {
                    ...data,
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    promotion_products_products: true,
                    products_promotion_products: true,
                },
            });
            res.status(201).json({
                message: 'Promotion product created successfully',
                data: serializePromotionProduct(promotionProduct),
            });
        }
        catch (error) {
            console.error('Create Promotion Product Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllPromotionProducts(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.promotion_products,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    promotion_products_products: true,
                    products_promotion_products: true,
                },
            });
            const totalCount = await prisma_client_1.default.promotion_products.count();
            const activeCount = await prisma_client_1.default.promotion_products.count({
                where: { is_active: 'Y' },
            });
            const inactiveCount = await prisma_client_1.default.promotion_products.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const totalPromotionProducts = await prisma_client_1.default.promotion_products.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Promotion products retrieved successfully', data.map((p) => serializePromotionProduct(p)), 200, pagination, {
                total_count: totalCount,
                active_count: activeCount,
                inactive_count: inactiveCount,
                total_promotion_products: totalPromotionProducts,
            });
        }
        catch (error) {
            console.error('Get Promotion Products Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getPromotionProductById(req, res) {
        try {
            const { id } = req.params;
            const promotionProduct = await prisma_client_1.default.promotion_products.findUnique({
                where: { id: Number(id) },
                include: {
                    promotion_products_products: true,
                    products_promotion_products: true,
                },
            });
            if (!promotionProduct) {
                return res.status(404).json({ message: 'Promotion product not found' });
            }
            res.status(200).json({
                message: 'Promotion product fetched successfully',
                data: serializePromotionProduct(promotionProduct),
            });
        }
        catch (error) {
            console.error('Get Promotion Product Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updatePromotionProduct(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.promotion_products.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Promotion product not found' });
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id || 1,
            };
            const updated = await prisma_client_1.default.promotion_products.update({
                where: { id: Number(id) },
                data,
                include: {
                    promotion_products_products: true,
                    products_promotion_products: true,
                },
            });
            res.json({
                message: 'Promotion product updated successfully',
                data: serializePromotionProduct(updated),
            });
        }
        catch (error) {
            console.error('Update Promotion Product Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deletePromotionProduct(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.promotion_products.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Promotion product not found' });
            await prisma_client_1.default.promotion_products.delete({ where: { id: Number(id) } });
            res.json({ message: 'Promotion product deleted successfully' });
        }
        catch (error) {
            console.error('Delete Promotion Product Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=promotionProducts.controller.js.map