"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTypesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeProductType = (productType) => ({
    id: productType.id,
    name: productType.name,
    code: productType.code,
    is_active: productType.is_active,
    created_by: productType.createdby,
    createdate: productType.createdate,
    updatedate: productType.updatedate,
    updatedby: productType.updatedby,
});
exports.productTypesController = {
    async createProductType(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res
                    .status(400)
                    .json({ message: 'Product type name is required' });
            }
            const generateCode = (name) => {
                const words = name.toUpperCase().split(/\s+/);
                const firstWord = words[0];
                let abbreviation = firstWord.substring(0, 4);
                if (firstWord.length <= 4) {
                    abbreviation = firstWord;
                }
                return `PROD-${abbreviation}`;
            };
            const productType = await prisma_client_1.default.product_type.create({
                data: {
                    ...data,
                    code: data.code || generateCode(data.name),
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Product type created successfully',
                data: serializeProductType(productType),
            });
        }
        catch (error) {
            console.error('Create Product Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductTypes(req, res) {
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
            const totalProductTypes = await prisma_client_1.default.product_type.count();
            const activeProductTypes = await prisma_client_1.default.product_type.count({
                where: { is_active: 'Y' },
            });
            const inactiveProductTypes = await prisma_client_1.default.product_type.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newProductTypesThisMonth = await prisma_client_1.default.product_type.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_types: totalProductTypes,
                active_product_types: activeProductTypes,
                inactive_product_types: inactiveProductTypes,
                new_product_types_this_month: newProductTypesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_type,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product types retrieved successfully',
                data: data.map((d) => serializeProductType(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Types Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductTypeById(req, res) {
        try {
            const { id } = req.params;
            const productType = await prisma_client_1.default.product_type.findUnique({
                where: { id: Number(id) },
            });
            if (!productType) {
                return res.status(404).json({ message: 'Product type not found' });
            }
            res.json({
                message: 'Product type fetched successfully',
                data: serializeProductType(productType),
            });
        }
        catch (error) {
            console.error('Get Product Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductType(req, res) {
        try {
            const { id } = req.params;
            const existingProductType = await prisma_client_1.default.product_type.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductType) {
                return res.status(404).json({ message: 'Product type not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const productType = await prisma_client_1.default.product_type.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product type updated successfully',
                data: serializeProductType(productType),
            });
        }
        catch (error) {
            console.error('Update Product Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductType(req, res) {
        try {
            const { id } = req.params;
            const existingProductType = await prisma_client_1.default.product_type.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductType) {
                return res.status(404).json({ message: 'Product type not found' });
            }
            await prisma_client_1.default.product_type.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product type deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Type Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductTypesDropdown(req, res) {
        try {
            const { search = '', product_type_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const productTypeId = product_type_id ? Number(product_type_id) : null;
            const where = {
                is_active: 'Y',
            };
            if (productTypeId) {
                where.id = productTypeId;
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
            const productTypes = await prisma_client_1.default.product_type.findMany({
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
            res.success('Product types dropdown fetched successfully', productTypes, 200);
        }
        catch (error) {
            console.error('Error fetching product types dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productTypes.controller.js.map