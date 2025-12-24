"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionParametersController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializePromotionParameter = (p) => ({
    id: p.id,
    promotion_id: p.promotion_id,
    param_name: p.param_name,
    param_type: p.param_type,
    param_value: p.param_value,
    param_category: p.param_category,
    is_active: p.is_active,
    createdate: p.createdate,
    createdby: p.createdby,
    updatedate: p.updatedate,
    updatedby: p.updatedby,
    log_inst: p.log_inst,
    promotions: p.promotion_parameters_promotions
        ? {
            id: p.promotion_parameters_promotions.id,
            name: p.promotion_parameters_promotions.name,
            code: p.promotion_parameters_promotions.code,
        }
        : null,
});
exports.promotionParametersController = {
    async createPromotionParameter(req, res) {
        try {
            const data = req.body;
            if (!data.promotion_id || !data.param_name || !data.param_type) {
                return res.status(400).json({
                    message: 'promotion_id, param_name, and param_type are required',
                });
            }
            const parameter = await prisma_client_1.default.promotion_parameters.create({
                data: {
                    ...data,
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    promotion_parameters_promotions: true,
                },
            });
            res.status(201).json({
                message: 'Promotion parameter created successfully',
                data: serializePromotionParameter(parameter),
            });
        }
        catch (error) {
            console.error('Create Promotion Parameter Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllPromotionParameters(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { param_name: { contains: searchLower } },
                        { param_category: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.promotion_parameters,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    promotion_parameters_promotions: true,
                },
            });
            const totalCount = await prisma_client_1.default.promotion_parameters.count();
            const activeCount = await prisma_client_1.default.promotion_parameters.count({
                where: { is_active: 'Y' },
            });
            const inactiveCount = await prisma_client_1.default.promotion_parameters.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const totalPromotionParameters = await prisma_client_1.default.promotion_parameters.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Promotion parameters retrieved successfully', data.map((p) => serializePromotionParameter(p)), 200, pagination, {
                total_count: totalCount,
                active_count: activeCount,
                inactive_count: inactiveCount,
                total_promotion_parameters: totalPromotionParameters,
            });
        }
        catch (error) {
            console.error('Get Promotion Parameters Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getPromotionParameterById(req, res) {
        try {
            const { id } = req.params;
            const parameter = await prisma_client_1.default.promotion_parameters.findUnique({
                where: { id: Number(id) },
                include: { promotion_parameters_promotions: true },
            });
            if (!parameter)
                return res
                    .status(404)
                    .json({ message: 'Promotion parameter not found' });
            res.status(200).json({
                message: 'Promotion parameter fetched successfully',
                data: serializePromotionParameter(parameter),
            });
        }
        catch (error) {
            console.error('Get Promotion Parameter Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updatePromotionParameter(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.promotion_parameters.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res
                    .status(404)
                    .json({ message: 'Promotion parameter not found' });
            const data = {
                ...req.body,
                updatedate: new Date(),
                updatedby: req.user?.id || 1,
            };
            const updated = await prisma_client_1.default.promotion_parameters.update({
                where: { id: Number(id) },
                data,
                include: { promotion_parameters_promotions: true },
            });
            res.json({
                message: 'Promotion parameter updated successfully',
                data: serializePromotionParameter(updated),
            });
        }
        catch (error) {
            console.error('Update Promotion Parameter Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deletePromotionParameter(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.promotion_parameters.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res
                    .status(404)
                    .json({ message: 'Promotion parameter not found' });
            await prisma_client_1.default.promotion_parameters.delete({ where: { id: Number(id) } });
            res.json({ message: 'Promotion parameter deleted successfully' });
        }
        catch (error) {
            console.error('Delete Promotion Parameter Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=promotionParameters.controller.js.map