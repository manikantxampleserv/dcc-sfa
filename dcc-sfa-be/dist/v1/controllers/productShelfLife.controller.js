"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productShelfLifeController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateShelfLifeCode = (name) => {
    const upperName = name.trim().toUpperCase();
    const daysMatch = upperName.match(/(\d+)\s*DAYS?/i);
    if (daysMatch) {
        const number = daysMatch[1];
        return `SHELF-${number}D-001`;
    }
    const numberOnly = upperName.replace(/[^\d]/g, '');
    if (numberOnly) {
        return `SHELF-${numberOnly}D-001`;
    }
    const prefix = upperName.substring(0, 6).replace(/\s+/g, '');
    return `SHELF-${prefix}-001`;
};
const serializeProductShelfLife = (shelfLife) => ({
    id: shelfLife.id,
    name: shelfLife.name,
    code: shelfLife.code,
    is_active: shelfLife.is_active,
    created_by: shelfLife.createdby,
    createdate: shelfLife.createdate,
    updatedate: shelfLife.updatedate,
    updatedby: shelfLife.updatedby,
});
exports.productShelfLifeController = {
    async createProductShelfLife(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Shelf life name is required' });
            }
            const code = data.code || generateShelfLifeCode(data.name);
            const shelfLife = await prisma_client_1.default.product_shelf_life.create({
                data: {
                    ...data,
                    code,
                    createdby: data.createdby
                        ? Number(data.createdby)
                        : req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Product shelf life created successfully',
                data: serializeProductShelfLife(shelfLife),
            });
        }
        catch (error) {
            console.error('Create Product Shelf Life Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductShelfLife(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                ...(isActive && { is_active: isActive }),
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                    ],
                }),
            };
            const totalShelfLife = await prisma_client_1.default.product_shelf_life.count();
            const activeShelfLife = await prisma_client_1.default.product_shelf_life.count({
                where: { is_active: 'Y' },
            });
            const inactiveShelfLife = await prisma_client_1.default.product_shelf_life.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newShelfLifeThisMonth = await prisma_client_1.default.product_shelf_life.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_shelf_life: totalShelfLife,
                active_product_shelf_life: activeShelfLife,
                inactive_product_shelf_life: inactiveShelfLife,
                new_product_shelf_life_this_month: newShelfLifeThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_shelf_life,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product shelf life retrieved successfully',
                data: data.map((d) => serializeProductShelfLife(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Shelf Life Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductShelfLifeById(req, res) {
        try {
            const { id } = req.params;
            const shelfLife = await prisma_client_1.default.product_shelf_life.findUnique({
                where: { id: Number(id) },
            });
            if (!shelfLife) {
                return res
                    .status(404)
                    .json({ message: 'Product shelf life not found' });
            }
            res.json({
                message: 'Product shelf life fetched successfully',
                data: serializeProductShelfLife(shelfLife),
            });
        }
        catch (error) {
            console.error('Get Product Shelf Life Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductShelfLife(req, res) {
        try {
            const { id } = req.params;
            const existingShelfLife = await prisma_client_1.default.product_shelf_life.findUnique({
                where: { id: Number(id) },
            });
            if (!existingShelfLife) {
                return res
                    .status(404)
                    .json({ message: 'Product shelf life not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const shelfLife = await prisma_client_1.default.product_shelf_life.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product shelf life updated successfully',
                data: serializeProductShelfLife(shelfLife),
            });
        }
        catch (error) {
            console.error('Update Product Shelf Life Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductShelfLife(req, res) {
        try {
            const { id } = req.params;
            const existingShelfLife = await prisma_client_1.default.product_shelf_life.findUnique({
                where: { id: Number(id) },
            });
            if (!existingShelfLife) {
                return res
                    .status(404)
                    .json({ message: 'Product shelf life not found' });
            }
            await prisma_client_1.default.product_shelf_life.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product shelf life deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Shelf Life Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductShelfLifeDropdown(req, res) {
        try {
            const { search = '', shelf_life_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const shelfLifeId = shelf_life_id ? Number(shelf_life_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (shelfLifeId) {
                where.id = shelfLifeId;
            }
            else if (searchLower) {
                where.OR = [
                    {
                        name: {
                            contains: searchLower,
                        },
                    },
                    {
                        code: {
                            contains: searchLower,
                        },
                    },
                ];
            }
            const shelfLife = await prisma_client_1.default.product_shelf_life.findMany({
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
            res.success('Product shelf life dropdown fetched successfully', shelfLife, 200);
        }
        catch (error) {
            console.error('Error fetching product shelf life dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productShelfLife.controller.js.map