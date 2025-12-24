"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFlavoursController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateFlavourCode = (name) => {
    const words = name.trim().toUpperCase().split(/\s+/);
    if (words.length === 1) {
        const word = words[0];
        if (word.length <= 6) {
            return `FLAV-${word}`;
        }
        return `FLAV-${word.substring(0, 6)}`;
    }
    const abbreviations = words.map(word => {
        if (word.length <= 3)
            return word;
        return word.substring(0, 3);
    });
    return `FLAV-${abbreviations.join('-')}`;
};
const serializeProductFlavour = (flavour) => ({
    id: flavour.id,
    name: flavour.name,
    code: flavour.code,
    is_active: flavour.is_active,
    created_by: flavour.createdby,
    createdate: flavour.createdate,
    updatedate: flavour.updatedate,
    updatedby: flavour.updatedby,
});
exports.productFlavoursController = {
    async createProductFlavour(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ message: 'Flavour name is required' });
            }
            const code = data.code || generateFlavourCode(data.name);
            const flavour = await prisma_client_1.default.product_flavours.create({
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
                message: 'Product flavour created successfully',
                data: serializeProductFlavour(flavour),
            });
        }
        catch (error) {
            console.error('Create Product Flavour Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductFlavours(req, res) {
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
            const totalFlavours = await prisma_client_1.default.product_flavours.count();
            const activeFlavours = await prisma_client_1.default.product_flavours.count({
                where: { is_active: 'Y' },
            });
            const inactiveFlavours = await prisma_client_1.default.product_flavours.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newFlavoursThisMonth = await prisma_client_1.default.product_flavours.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_flavours: totalFlavours,
                active_product_flavours: activeFlavours,
                inactive_product_flavours: inactiveFlavours,
                new_product_flavours_this_month: newFlavoursThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_flavours,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product flavours retrieved successfully',
                data: data.map((d) => serializeProductFlavour(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Flavours Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductFlavourById(req, res) {
        try {
            const { id } = req.params;
            const flavour = await prisma_client_1.default.product_flavours.findUnique({
                where: { id: Number(id) },
            });
            if (!flavour) {
                return res.status(404).json({ message: 'Product flavour not found' });
            }
            res.json({
                message: 'Product flavour fetched successfully',
                data: serializeProductFlavour(flavour),
            });
        }
        catch (error) {
            console.error('Get Product Flavour Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductFlavour(req, res) {
        try {
            const { id } = req.params;
            const existingFlavour = await prisma_client_1.default.product_flavours.findUnique({
                where: { id: Number(id) },
            });
            if (!existingFlavour) {
                return res.status(404).json({ message: 'Product flavour not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const flavour = await prisma_client_1.default.product_flavours.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product flavour updated successfully',
                data: serializeProductFlavour(flavour),
            });
        }
        catch (error) {
            console.error('Update Product Flavour Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductFlavour(req, res) {
        try {
            const { id } = req.params;
            const existingFlavour = await prisma_client_1.default.product_flavours.findUnique({
                where: { id: Number(id) },
            });
            if (!existingFlavour) {
                return res.status(404).json({ message: 'Product flavour not found' });
            }
            await prisma_client_1.default.product_flavours.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product flavour deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Flavour Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductFlavoursDropdown(req, res) {
        try {
            const { search = '', flavour_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const flavourId = flavour_id ? Number(flavour_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (flavourId) {
                where.id = flavourId;
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
            const flavours = await prisma_client_1.default.product_flavours.findMany({
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
            res.success('Product flavours dropdown fetched successfully', flavours, 200);
        }
        catch (error) {
            console.error('Error fetching product flavours dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productFlavours.controller.js.map