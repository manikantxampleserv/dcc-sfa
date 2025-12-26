"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerCategoryController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const serializeCustomerCategory = (category) => ({
    id: category.id,
    category_name: category.category_name,
    category_code: category.category_code,
    is_active: category.is_active,
    createdate: category.createdate,
    createdby: category.createdby,
    updatedate: category.updatedate,
    updatedby: category.updatedby,
    log_inst: category.log_inst,
    conditions: category.customer_category_condition_customer_category?.map((c) => ({
        id: c.id,
        condition_type: c.condition_type,
        condition_operator: c.condition_operator,
        threshold_value: c.threshold_value,
        product_category_id: c.product_category_id,
        condition_description: c.condition_description,
        is_active: c.is_active,
    })) || [],
});
exports.customerCategoryController = {
    async bulkCustomerCategory(req, res) {
        try {
            const input = Array.isArray(req.body)
                ? req.body
                : [req.body];
            const results = {
                created: [],
                updated: [],
                failed: [],
            };
            for (const item of input) {
                try {
                    const result = await prisma_client_1.default.$transaction(async (tx) => {
                        let parent;
                        if (item.id) {
                            const exists = await tx.customer_category.findUnique({
                                where: { id: item.id },
                            });
                            if (!exists)
                                throw new Error(`Category with id ${item.id} not found`);
                            parent = await tx.customer_category.update({
                                where: { id: item.id },
                                data: {
                                    category_name: item.category_name,
                                    category_code: item.category_code,
                                    is_active: item.is_active || 'Y',
                                    updatedby: req.user?.id || item.updatedby || 1,
                                    updatedate: new Date(),
                                },
                            });
                        }
                        else {
                            parent = await tx.customer_category.create({
                                data: {
                                    category_name: item.category_name,
                                    category_code: item.category_code,
                                    is_active: item.is_active || 'Y',
                                    createdby: req.user?.id || item.createdby || 1,
                                    createdate: new Date(),
                                    log_inst: 1,
                                },
                            });
                        }
                        const parentId = parent.id;
                        if (item.conditions && item.conditions.length > 0) {
                            for (const cond of item.conditions) {
                                const condData = {
                                    condition_type: cond.condition_type,
                                    condition_operator: cond.condition_operator,
                                    threshold_value: cond.threshold_value,
                                    product_category_id: cond.product_category_id,
                                    condition_description: cond.condition_description,
                                    is_active: cond.is_active || 'Y',
                                };
                                if (cond.id) {
                                    await tx.customer_category_condition.update({
                                        where: { id: cond.id },
                                        data: {
                                            ...condData,
                                        },
                                    });
                                }
                                else {
                                    await tx.customer_category_condition.create({
                                        data: {
                                            ...condData,
                                            customer_category_id: parentId,
                                        },
                                    });
                                }
                            }
                        }
                        const completeRecord = await tx.customer_category.findUnique({
                            where: { id: parentId },
                            include: {
                                customer_category_condition_customer_category: true,
                            },
                        });
                        return completeRecord;
                    });
                    if (item.id)
                        results.updated.push(serializeCustomerCategory(result));
                    else
                        results.created.push(serializeCustomerCategory(result));
                }
                catch (error) {
                    results.failed.push({
                        item,
                        error: error.message,
                    });
                }
            }
            return res.status(200).json({
                message: 'Bulk upsert completed',
                results,
            });
        }
        catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
    async getAllCustomerCategory(req, res) {
        try {
            const { page, limit, search, is_active } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { category_name: { contains: searchLower } },
                        { category_code: { contains: searchLower } },
                    ],
                }),
                ...(is_active && { is_active: is_active }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_category,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    customer_category_condition_customer_category: true,
                },
            });
            const totalCategories = await prisma_client_1.default.customer_category.count({
                where: filters,
            });
            const activeCategories = await prisma_client_1.default.customer_category.count({
                where: { ...filters, is_active: 'Y' },
            });
            const inactiveCategories = await prisma_client_1.default.customer_category.count({
                where: { ...filters, is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newCategoriesThisMonth = await prisma_client_1.default.customer_category.count({
                where: {
                    ...filters,
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Customer categories retrieved successfully', data.map(serializeCustomerCategory), 200, pagination, {
                total_categories: totalCategories,
                active_categories: activeCategories,
                inactive_categories: inactiveCategories,
                new_categories_this_month: newCategoriesThisMonth,
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    async getCustomerCategoryById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await prisma_client_1.default.customer_category.findUnique({
                where: { id },
                include: {
                    customer_category_condition_customer_category: true,
                },
            });
            if (!data) {
                return res.status(404).json({
                    message: `Customer category ${id} not found`,
                });
            }
            return res.status(200).json({
                message: 'Customer category retrieved',
                data: serializeCustomerCategory(data),
            });
        }
        catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
    async deleteCustomerCategory(req, res) {
        try {
            const id = Number(req.params.id);
            const exists = await prisma_client_1.default.customer_category.findUnique({
                where: { id },
            });
            if (!exists)
                return res.status(404).json({ message: 'Category not found' });
            await prisma_client_1.default.customer_category.delete({
                where: { id },
            });
            return res.status(200).json({
                message: 'Customer category deleted successfully',
            });
        }
        catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
};
//# sourceMappingURL=customerCategory.controller.js.map