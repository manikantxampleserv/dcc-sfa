"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesBonusRulesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeSalesBonusRule = (rule) => ({
    id: rule.id,
    sales_target_id: rule.sales_target_id,
    achievement_min_percent: rule.achievement_min_percent,
    achievement_max_percent: rule.achievement_max_percent,
    bonus_amount: rule.bonus_amount,
    bonus_percent: rule.bonus_percent,
    is_active: rule.is_active,
    createdate: rule.createdate,
    createdby: rule.createdby,
    updatedate: rule.updatedate,
    updatedby: rule.updatedby,
    log_inst: rule.log_inst,
    sales_targets: rule.sales_targets,
});
exports.salesBonusRulesController = {
    async createSalesBonusRule(req, res) {
        try {
            const data = req.body;
            const rule = await prisma_client_1.default.sales_bonus_rules.create({
                data: {
                    sales_target_id: data.sales_target_id,
                    achievement_min_percent: data.achievement_min_percent,
                    achievement_max_percent: data.achievement_max_percent,
                    bonus_amount: data.bonus_amount ?? null,
                    bonus_percent: data.bonus_percent ?? null,
                    is_active: data.is_active || 'Y',
                    createdate: new Date(),
                    createdby: req.user?.id || 1,
                    log_inst: data.log_inst || 1,
                },
                include: {
                    sales_targets: {
                        include: {
                            sales_targets_groups: true,
                            sales_targets_product_categories: true,
                        },
                    },
                },
            });
            res.status(201).json({
                message: 'Sales bonus rule created successfully',
                data: serializeSalesBonusRule(rule),
            });
        }
        catch (error) {
            console.error('Create SalesBonusRule Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllSalesBonusRules(req, res) {
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
                model: prisma_client_1.default.sales_bonus_rules,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    sales_targets: {
                        include: {
                            sales_targets_groups: true,
                            sales_targets_product_categories: true,
                        },
                    },
                },
            });
            const totalRules = await prisma_client_1.default.sales_bonus_rules.count();
            const activeRules = await prisma_client_1.default.sales_bonus_rules.count({
                where: { is_active: 'Y' },
            });
            const inactiveRules = await prisma_client_1.default.sales_bonus_rules.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const salesBonusRulesThisMonth = await prisma_client_1.default.sales_bonus_rules.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            res.success('Sales bonus rules retrieved successfully', data.map((r) => serializeSalesBonusRule(r)), 200, pagination, {
                total_rules: totalRules,
                active_rules: activeRules,
                inactive_rules: inactiveRules,
                sales_bonus_rules_this_month: salesBonusRulesThisMonth,
            });
        }
        catch (error) {
            console.error('Get SalesBonusRules Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getSalesBonusRuleById(req, res) {
        try {
            const { id } = req.params;
            const rule = await prisma_client_1.default.sales_bonus_rules.findUnique({
                where: { id: Number(id) },
                include: {
                    sales_targets: {
                        include: {
                            sales_targets_groups: true,
                            sales_targets_product_categories: true,
                        },
                    },
                },
            });
            if (!rule)
                return res.status(404).json({ message: 'Sales bonus rule not found' });
            res.json({
                message: 'Sales bonus rule fetched successfully',
                data: serializeSalesBonusRule(rule),
            });
        }
        catch (error) {
            console.error('Get SalesBonusRule Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateSalesBonusRule(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.sales_bonus_rules.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Sales bonus rule not found' });
            const data = req.body;
            const updated = await prisma_client_1.default.sales_bonus_rules.update({
                where: { id: Number(id) },
                data: {
                    sales_target_id: data.sales_target_id ?? existing.sales_target_id,
                    achievement_min_percent: data.achievement_min_percent ?? existing.achievement_min_percent,
                    achievement_max_percent: data.achievement_max_percent ?? existing.achievement_max_percent,
                    bonus_amount: data.bonus_amount ?? existing.bonus_amount,
                    bonus_percent: data.bonus_percent ?? existing.bonus_percent,
                    is_active: data.is_active ?? existing.is_active,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                    log_inst: data.log_inst ?? existing.log_inst,
                },
                include: {
                    sales_targets: {
                        include: {
                            sales_targets_groups: true,
                            sales_targets_product_categories: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Sales bonus rule updated successfully',
                data: serializeSalesBonusRule(updated),
            });
        }
        catch (error) {
            console.error('Update SalesBonusRule Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteSalesBonusRule(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.sales_bonus_rules.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Sales bonus rule not found' });
            await prisma_client_1.default.sales_bonus_rules.delete({ where: { id: Number(id) } });
            res.json({ message: 'Sales bonus rule deleted successfully' });
        }
        catch (error) {
            console.error('Delete SalesBonusRule Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=salesBonusRule.controller.js.map