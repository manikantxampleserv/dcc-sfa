"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTargetGroupsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeProductTargetGroup = (productTargetGroup) => ({
    id: productTargetGroup.id,
    name: productTargetGroup.name,
    code: productTargetGroup.code,
    is_active: productTargetGroup.is_active,
    created_by: productTargetGroup.createdby,
    createdate: productTargetGroup.createdate,
    updatedate: productTargetGroup.updatedate,
    updatedby: productTargetGroup.updatedby,
});
exports.productTargetGroupsController = {
    async createProductTargetGroup(req, res) {
        try {
            const data = req.body;
            if (!data.name) {
                return res
                    .status(400)
                    .json({ message: 'Product target group name is required' });
            }
            const generateCode = (name) => {
                const upperName = name.toUpperCase();
                const words = upperName.split(/\s+/);
                let code = 'TG-';
                if (words.length > 1) {
                    const firstWord = words[0];
                    const rest = words
                        .slice(1)
                        .join(' ')
                        .replace(/[^A-Z0-9]/g, '');
                    if (firstWord.length <= 4) {
                        code += firstWord + '-' + rest;
                    }
                    else {
                        code += firstWord.substring(0, 2) + '-' + rest;
                    }
                }
                else {
                    const cleaned = upperName.replace(/[^A-Z0-9]/g, '');
                    code += cleaned.length <= 4 ? cleaned : cleaned.substring(0, 6);
                }
                return code;
            };
            const productTargetGroup = await prisma_client_1.default.product_target_group.create({
                data: {
                    ...data,
                    code: data.code || generateCode(data.name),
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Product target group created successfully',
                data: serializeProductTargetGroup(productTargetGroup),
            });
        }
        catch (error) {
            console.error('Create Product Target Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductTargetGroups(req, res) {
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
            const totalProductTargetGroups = await prisma_client_1.default.product_target_group.count();
            const activeProductTargetGroups = await prisma_client_1.default.product_target_group.count({
                where: { is_active: 'Y' },
            });
            const inactiveProductTargetGroups = await prisma_client_1.default.product_target_group.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newProductTargetGroupsThisMonth = await prisma_client_1.default.product_target_group.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_product_target_groups: totalProductTargetGroups,
                active_product_target_groups: activeProductTargetGroups,
                inactive_product_target_groups: inactiveProductTargetGroups,
                new_product_target_groups_this_month: newProductTargetGroupsThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.product_target_group,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Product target groups retrieved successfully',
                data: data.map((d) => serializeProductTargetGroup(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Product Target Groups Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductTargetGroupById(req, res) {
        try {
            const { id } = req.params;
            const productTargetGroup = await prisma_client_1.default.product_target_group.findUnique({
                where: { id: Number(id) },
            });
            if (!productTargetGroup) {
                return res
                    .status(404)
                    .json({ message: 'Product target group not found' });
            }
            res.json({
                message: 'Product target group fetched successfully',
                data: serializeProductTargetGroup(productTargetGroup),
            });
        }
        catch (error) {
            console.error('Get Product Target Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateProductTargetGroup(req, res) {
        try {
            const { id } = req.params;
            const existingProductTargetGroup = await prisma_client_1.default.product_target_group.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductTargetGroup) {
                return res
                    .status(404)
                    .json({ message: 'Product target group not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const productTargetGroup = await prisma_client_1.default.product_target_group.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Product target group updated successfully',
                data: serializeProductTargetGroup(productTargetGroup),
            });
        }
        catch (error) {
            console.error('Update Product Target Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteProductTargetGroup(req, res) {
        try {
            const { id } = req.params;
            const existingProductTargetGroup = await prisma_client_1.default.product_target_group.findUnique({
                where: { id: Number(id) },
            });
            if (!existingProductTargetGroup) {
                return res
                    .status(404)
                    .json({ message: 'Product target group not found' });
            }
            await prisma_client_1.default.product_target_group.delete({ where: { id: Number(id) } });
            res.json({ message: 'Product target group deleted successfully' });
        }
        catch (error) {
            console.error('Delete Product Target Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getProductTargetGroupsDropdown(req, res) {
        try {
            const { search = '', product_target_group_id } = req.query;
            const searchLower = search.toLowerCase().trim();
            const productTargetGroupId = product_target_group_id
                ? Number(product_target_group_id)
                : null;
            const where = {
                is_active: 'Y',
            };
            if (productTargetGroupId) {
                where.id = productTargetGroupId;
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
            const productTargetGroups = await prisma_client_1.default.product_target_group.findMany({
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
            res.success('Product target groups dropdown fetched successfully', productTargetGroups, 200);
        }
        catch (error) {
            console.error('Error fetching product target groups dropdown:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=productTargetGroups.controller.js.map