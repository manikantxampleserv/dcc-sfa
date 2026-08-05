"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesTargetsController = void 0;
const paginate_1 = require("../../utils/paginate");
const express_validator_1 = require("express-validator");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeSalesTarget = (salesTarget) => ({
    id: salesTarget.id,
    sales_target_group_id: salesTarget.sales_target_group_id,
    product_category_id: salesTarget.product_category_id,
    target_quantity: salesTarget.target_quantity,
    target_amount: salesTarget.target_amount
        ? Number(salesTarget.target_amount)
        : null,
    start_date: salesTarget.start_date,
    end_date: salesTarget.end_date,
    is_active: salesTarget.is_active,
    createdate: salesTarget.createdate,
    createdby: salesTarget.createdby,
    updatedate: salesTarget.updatedate,
    updatedby: salesTarget.updatedby,
    log_inst: salesTarget.log_inst,
    sales_target_group: salesTarget.sales_targets_groups
        ? {
            id: salesTarget.sales_targets_groups.id,
            group_name: salesTarget.sales_targets_groups.group_name,
            description: salesTarget.sales_targets_groups.description,
        }
        : null,
    product_category: salesTarget.sales_targets_product_categories
        ? {
            id: salesTarget.sales_targets_product_categories.id,
            category_name: salesTarget.sales_targets_product_categories.category_name,
            description: salesTarget.sales_targets_product_categories.description,
        }
        : null,
});
exports.salesTargetsController = {
    /**
     * Creates a new sales target.
     * Validates group, category, and date overlaps.
     */
    async createSalesTarget(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }
            const { sales_target_group_id, product_category_id, target_quantity, target_amount, start_date, end_date, is_active, } = req.body;
            const salesTargetGroup = await prisma_client_1.default.sales_target_groups.findUnique({
                where: { id: sales_target_group_id },
            });
            if (!salesTargetGroup) {
                return res
                    .status(404)
                    .json({ message: 'Sales target group not found' });
            }
            const productCategory = await prisma_client_1.default.product_categories.findUnique({
                where: { id: product_category_id },
            });
            if (!productCategory) {
                return res.status(404).json({ message: 'Product category not found' });
            }
            const existingTarget = await prisma_client_1.default.sales_targets.findFirst({
                where: {
                    sales_target_group_id,
                    product_category_id,
                    is_active: 'Y',
                    OR: [
                        {
                            start_date: { lte: new Date(end_date) },
                            end_date: { gte: new Date(start_date) },
                        },
                    ],
                },
            });
            if (existingTarget) {
                return res
                    .status(400)
                    .json({ message: 'Sales target already exists for this period' });
            }
            const salesTarget = await prisma_client_1.default.sales_targets.create({
                data: {
                    sales_target_group_id,
                    product_category_id,
                    target_quantity,
                    target_amount: target_amount ? Number(target_amount) : null,
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    is_active: is_active || 'Y',
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: 1,
                },
                include: {
                    sales_targets_groups: true,
                    sales_targets_product_categories: true,
                },
            });
            res.status(201).json({
                message: 'Sales target created successfully',
                data: serializeSalesTarget(salesTarget),
            });
        }
        catch (error) {
            console.error('Create Sales Target Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    /**
     * Retrieves all sales targets with pagination and filtering.
     * Includes statistics for dashboard views.
     */
    async getAllSalesTargets(req, res) {
        try {
            const { page = '1', limit = '10', search = '', sales_target_group_id, product_category_id, is_active, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const filters = {
                ...(is_active && { is_active: is_active }),
                ...(sales_target_group_id && {
                    sales_target_group_id: parseInt(sales_target_group_id, 10),
                }),
                ...(product_category_id && {
                    product_category_id: parseInt(product_category_id, 10),
                }),
                ...(search && {
                    OR: [
                        {
                            sales_targets_groups: {
                                group_name: { contains: search },
                            },
                        },
                        {
                            sales_targets_product_categories: {
                                category_name: { contains: search },
                            },
                        },
                    ],
                }),
            };
            const totalTargets = await prisma_client_1.default.sales_targets.count();
            const activeTargets = await prisma_client_1.default.sales_targets.count({
                where: { is_active: 'Y' },
            });
            const inactiveTargets = await prisma_client_1.default.sales_targets.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const targetsThisMonth = await prisma_client_1.default.sales_targets.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.sales_targets,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    sales_targets_groups: true,
                    sales_targets_product_categories: true,
                },
            });
            res.json({
                success: true,
                message: 'Sales targets retrieved successfully',
                data: data.map((salesTarget) => serializeSalesTarget(salesTarget)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats: {
                    total_sales_targets: totalTargets,
                    active_sales_targets: activeTargets,
                    inactive_sales_targets: inactiveTargets,
                    sales_targets_this_month: targetsThisMonth,
                },
            });
        }
        catch (error) {
            console.error('Get All Sales Targets Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    /**
     * Retrieves a specific sales target by its ID.
     */
    async getSalesTargetById(req, res) {
        try {
            const { id } = req.params;
            const salesTarget = await prisma_client_1.default.sales_targets.findUnique({
                where: { id: parseInt(id) },
                include: {
                    sales_targets_groups: true,
                    sales_targets_product_categories: true,
                },
            });
            if (!salesTarget) {
                return res.status(404).json({ message: 'Sales target not found' });
            }
            res.json({
                data: serializeSalesTarget(salesTarget),
            });
        }
        catch (error) {
            console.error('Get Sales Target By ID Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    /**
     * Updates an existing sales target.
     * Validates overlaps and references before updating.
     */
    async updateSalesTarget(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const { sales_target_group_id, product_category_id, target_quantity, target_amount, start_date, end_date, is_active, } = req.body;
            const existingSalesTarget = await prisma_client_1.default.sales_targets.findUnique({
                where: { id: parseInt(id) },
            });
            if (!existingSalesTarget) {
                return res.status(404).json({ message: 'Sales target not found' });
            }
            if (sales_target_group_id &&
                sales_target_group_id !== existingSalesTarget.sales_target_group_id) {
                const salesTargetGroup = await prisma_client_1.default.sales_target_groups.findUnique({
                    where: { id: sales_target_group_id },
                });
                if (!salesTargetGroup) {
                    return res
                        .status(404)
                        .json({ message: 'Sales target group not found' });
                }
            }
            if (product_category_id &&
                product_category_id !== existingSalesTarget.product_category_id) {
                const productCategory = await prisma_client_1.default.product_categories.findUnique({
                    where: { id: product_category_id },
                });
                if (!productCategory) {
                    return res
                        .status(404)
                        .json({ message: 'Product category not found' });
                }
            }
            if (start_date ||
                end_date ||
                sales_target_group_id ||
                product_category_id) {
                const checkGroupId = sales_target_group_id || existingSalesTarget.sales_target_group_id;
                const checkCategoryId = product_category_id || existingSalesTarget.product_category_id;
                const checkStartDate = start_date
                    ? new Date(start_date)
                    : existingSalesTarget.start_date;
                const checkEndDate = end_date
                    ? new Date(end_date)
                    : existingSalesTarget.end_date;
                const conflictingTarget = await prisma_client_1.default.sales_targets.findFirst({
                    where: {
                        id: { not: parseInt(id) },
                        sales_target_group_id: checkGroupId,
                        product_category_id: checkCategoryId,
                        is_active: 'Y',
                        OR: [
                            {
                                start_date: { lte: checkEndDate },
                                end_date: { gte: checkStartDate },
                            },
                        ],
                    },
                });
                if (conflictingTarget) {
                    return res
                        .status(400)
                        .json({ message: 'Sales target already exists for this period' });
                }
            }
            const updatedSalesTarget = await prisma_client_1.default.sales_targets.update({
                where: { id: parseInt(id) },
                data: {
                    ...(sales_target_group_id && { sales_target_group_id }),
                    ...(product_category_id && { product_category_id }),
                    ...(target_quantity && { target_quantity }),
                    ...(target_amount !== undefined && {
                        target_amount: target_amount ? Number(target_amount) : null,
                    }),
                    ...(start_date && { start_date: new Date(start_date) }),
                    ...(end_date && { end_date: new Date(end_date) }),
                    ...(is_active && { is_active }),
                    updatedby: req.user?.id || 1,
                    updatedate: new Date(),
                },
                include: {
                    sales_targets_groups: true,
                    sales_targets_product_categories: true,
                },
            });
            res.json({
                message: 'Sales target updated successfully',
                data: serializeSalesTarget(updatedSalesTarget),
            });
        }
        catch (error) {
            console.error('Update Sales Target Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    /**
     * Soft-deletes a sales target by setting is_active to 'N'.
     */
    async deleteSalesTarget(req, res) {
        try {
            const { id } = req.params;
            const existingSalesTarget = await prisma_client_1.default.sales_targets.findUnique({
                where: { id: parseInt(id) },
            });
            if (!existingSalesTarget) {
                return res.status(404).json({ message: 'Sales target not found' });
            }
            await prisma_client_1.default.sales_bonus_rules.deleteMany({
                where: { sales_target_id: parseInt(id) },
            });
            await prisma_client_1.default.sales_targets.delete({
                where: { id: parseInt(id) },
            });
            res.json({
                message: 'Sales target deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Sales Target Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    /**
     * Retrieves personalized targets for the logged-in salesman.
     * Merges group targets with individual overrides and calculates actual achievements.
     */
    async getSalesmanTargets(req, res) {
        try {
            const salesmanId = req.user?.id;
            if (!salesmanId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not found in token',
                });
            }
            const groupMembers = await prisma_client_1.default.sales_target_group_members.findMany({
                where: { sales_person_id: salesmanId, is_active: 'Y' },
            });
            const groupIds = groupMembers.map((gm) => gm.sales_target_group_id);
            const baseTargets = await prisma_client_1.default.sales_targets.findMany({
                where: {
                    sales_target_group_id: { in: groupIds },
                    is_active: 'Y',
                },
                include: {
                    sales_bonus_rules: { where: { is_active: 'Y' } },
                    sales_targets_product_categories: true,
                    sales_targets_groups: true,
                },
            });
            const overrides = await prisma_client_1.default.sales_target_overrides.findMany({
                where: {
                    sales_person_id: salesmanId,
                    is_active: 'Y',
                },
                include: {
                    sales_target_overrides_product_categories: true,
                },
            });
            const overrideCategoryIds = new Set(overrides.map((o) => o.product_category_id));
            const finalTargets = [];
            for (const bt of baseTargets) {
                if (!overrideCategoryIds.has(bt.product_category_id)) {
                    finalTargets.push({
                        type: 'group_target',
                        id: bt.id,
                        group_name: bt.sales_targets_groups?.group_name,
                        product_category_id: bt.product_category_id,
                        category_name: bt.sales_targets_product_categories?.category_name,
                        target_quantity: bt.target_quantity,
                        target_amount: bt.target_amount ? Number(bt.target_amount) : null,
                        start_date: bt.start_date,
                        end_date: bt.end_date,
                        bonus_rules: (bt.sales_bonus_rules || []).map((br) => ({
                            ...br,
                            achievement_min_percent: Number(br.achievement_min_percent),
                            achievement_max_percent: Number(br.achievement_max_percent),
                            bonus_amount: br.bonus_amount ? Number(br.bonus_amount) : null,
                            bonus_percent: br.bonus_percent ? Number(br.bonus_percent) : null,
                        })),
                    });
                }
            }
            for (const ov of overrides) {
                finalTargets.push({
                    type: 'override_target',
                    id: ov.id,
                    group_name: 'Override',
                    product_category_id: ov.product_category_id,
                    category_name: ov.sales_target_overrides_product_categories?.category_name,
                    target_quantity: ov.target_quantity,
                    target_amount: ov.target_amount ? Number(ov.target_amount) : null,
                    start_date: ov.start_date,
                    end_date: ov.end_date,
                    bonus_rules: [],
                });
            }
            const allSales = await prisma_client_1.default.invoice_items.findMany({
                where: {
                    invoices: {
                        is_active: 'Y',
                        OR: [{ salesperson_id: salesmanId }],
                    },
                },
                include: {
                    invoice_items_products: { select: { category_id: true } },
                    invoices: { select: { invoice_date: true } },
                },
            });
            const targetsWithAchievement = finalTargets.map(target => {
                let achievedQuantity = 0;
                let achievedAmount = 0;
                const targetStartDate = new Date(target.start_date).getTime();
                const targetEndDate = new Date(target.end_date).getTime();
                for (const sale of allSales) {
                    if (sale.invoice_items_products?.category_id ===
                        target.product_category_id) {
                        const saleDate = sale.invoices?.invoice_date
                            ? new Date(sale.invoices.invoice_date).getTime()
                            : 0;
                        if (saleDate >= targetStartDate && saleDate <= targetEndDate) {
                            achievedQuantity += sale.quantity;
                            achievedAmount += Number(sale.total_amount || 0);
                        }
                    }
                }
                let achievementPercentage = 0;
                if (target.target_amount && target.target_amount > 0) {
                    achievementPercentage = (achievedAmount / target.target_amount) * 100;
                }
                else if (target.target_quantity > 0) {
                    achievementPercentage =
                        (achievedQuantity / target.target_quantity) * 100;
                }
                return {
                    ...target,
                    achieved_quantity: achievedQuantity,
                    achieved_amount: achievedAmount,
                    achievement_percentage: Math.round(achievementPercentage * 100) / 100, // round to 2 decimals
                };
            });
            res.json({
                success: true,
                message: 'Salesman targets retrieved successfully',
                data: targetsWithAchievement,
            });
        }
        catch (error) {
            console.error('Get Salesman Targets Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
//# sourceMappingURL=salesTargets.controller.js.map