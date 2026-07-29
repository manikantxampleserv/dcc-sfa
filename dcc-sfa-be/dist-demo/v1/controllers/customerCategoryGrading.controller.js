"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerCategoryGradingController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
exports.customerCategoryGradingController = {
    async getGradingRequestById(req, res) {
        try {
            const requestId = Number(req.params.id);
            const request = await prisma_client_1.default.customer_category_grading.findUnique({
                where: { id: requestId },
                include: {
                    category_grading_customers: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            customer_category_id: true,
                        },
                    },
                    approver_users: {
                        select: { id: true, name: true, email: true },
                    },
                },
            });
            if (!request) {
                return res.status(404).json({ message: 'Grading request not found' });
            }
            const orderSales = await prisma_client_1.default.orders.aggregate({
                where: {
                    parent_id: request.customer_id,
                    status: { in: ['approved', 'pending', 'confirmed'] },
                    is_active: 'Y',
                },
                _sum: { total_amount: true },
            });
            const totalSales = Number(orderSales._sum?.total_amount || 0);
            return res.status(200).json({
                message: 'Grading request retrieved',
                data: {
                    ...request,
                    total_sales: totalSales,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    async processGradingRequest(req, res) {
        try {
            const requestId = Number(req.params.id);
            const { action, notes } = req.body;
            const gradingRequest = await prisma_client_1.default.customer_category_grading.findUnique({
                where: { id: requestId },
            });
            if (!gradingRequest) {
                return res.status(404).json({ message: 'Grading request not found' });
            }
            if (gradingRequest.action_taken !== 'N') {
                return res.status(400).json({
                    message: `Request already ${gradingRequest.action_taken === 'A' ? 'approved' : 'rejected'}`,
                });
            }
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.customer_category_grading.update({
                    where: { id: requestId },
                    data: {
                        action_taken: action === 'approve' ? 'A' : 'R',
                        status: action === 'approve' ? 'C' : 'R',
                        approver_id: req.user?.id,
                        approved_date: new Date(),
                        updatedby: req.user?.id,
                        updatedate: new Date(),
                    },
                });
                if (action === 'approve') {
                    await tx.customers.update({
                        where: { id: gradingRequest.customer_id },
                        data: {
                            customer_category_id: gradingRequest.upcoming_category_id,
                            updatedate: new Date(),
                            updatedby: req.user?.id,
                        },
                    });
                }
            });
            return res.status(200).json({
                message: `Grading request ${action}d successfully`,
                action,
                requestId,
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    async bulkProcessGradingRequests(req, res) {
        try {
            const { requestIds, action, notes } = req.body;
            const results = {
                processed: 0,
                approved: 0,
                rejected: 0,
                failed: 0,
                errors: [],
            };
            for (const requestId of requestIds) {
                try {
                    await processSingleGradingRequest(requestId, action, notes, req.user?.id || 1);
                    results.processed++;
                    if (action === 'approve')
                        results.approved++;
                    else if (action === 'reject')
                        results.rejected++;
                }
                catch (error) {
                    results.failed++;
                    results.errors.push(`Request ${requestId}: ${error.message}`);
                }
            }
            return res.status(200).json({
                message: `Bulk ${action} completed`,
                results,
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    async getAllGradingRequests(req, res) {
        try {
            const { page, limit, status, change_type, search, name, start_date, end_date, } = req.query;
            const whereClause = {
                ...(status && { status: status }),
                ...(change_type && { change_type: change_type }),
            };
            const searchTerm = (search || name);
            if (searchTerm) {
                whereClause.OR = [
                    {
                        category_grading_customers: {
                            name: { contains: searchTerm },
                        },
                    },
                    {
                        category_grading_customers: {
                            code: { contains: searchTerm },
                        },
                    },
                ];
            }
            if (start_date || end_date) {
                whereClause.createdate = {};
                if (start_date) {
                    whereClause.createdate.gte = new Date(start_date);
                }
                if (end_date) {
                    whereClause.createdate.lte = new Date(end_date);
                }
            }
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 10;
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_category_grading,
                filters: whereClause,
                page: pageNumber,
                limit: limitNumber,
                orderBy: { createdate: 'desc' },
                include: {
                    category_grading_customers: {
                        select: { id: true, name: true, code: true },
                    },
                    approver_users: {
                        select: { id: true, name: true, email: true },
                    },
                    customer_category_grading_current_category: {
                        select: {
                            id: true,
                            category_name: true,
                            level: true,
                            customer_category_condition_customer_category: true,
                        },
                    },
                    customer_category_grading_upcoming_category: {
                        select: {
                            id: true,
                            category_name: true,
                            level: true,
                            customer_category_condition_customer_category: true,
                        },
                    },
                },
            });
            return res.status(200).json({
                message: 'All grading requests retrieved',
                data,
                pagination,
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    async getGradingStats(req, res) {
        try {
            const stats = await Promise.all([
                prisma_client_1.default.customer_category_grading.count({
                    where: { status: 'P' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { status: 'C' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { status: 'R' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'upgrade', status: 'P' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'downgrade', status: 'P' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'upgrade', status: 'C' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'downgrade', status: 'C' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'upgrade', status: 'R' },
                }),
                prisma_client_1.default.customer_category_grading.count({
                    where: { change_type: 'downgrade', status: 'R' },
                }),
                prisma_client_1.default.customers.count({
                    where: {
                        is_active: 'Y',
                        customer_category_id: { not: null },
                    },
                }),
                prisma_client_1.default.customers.groupBy({
                    by: ['customer_category_id'],
                    where: {
                        is_active: 'Y',
                        customer_category_id: { not: null },
                    },
                    _count: {
                        id: true,
                    },
                }),
                prisma_client_1.default.customer_category.findMany({
                    where: { is_active: 'Y' },
                    select: { id: true, category_name: true },
                    orderBy: { level: 'asc' },
                }),
            ]);
            const allCategories = stats[11];
            const categoryCountMap = stats[10].reduce((acc, cat) => {
                acc[cat.customer_category_id] = cat._count.id;
                return acc;
            }, {});
            const categoryDistribution = allCategories.map(category => ({
                categoryId: category.id,
                categoryName: category.category_name,
                customerCount: categoryCountMap[category.id] || 0,
            }));
            return res.status(200).json({
                message: 'Grading statistics retrieved',
                data: {
                    pending: stats[0],
                    changed: stats[1],
                    retained: stats[2],
                    pending_upgrades: stats[3],
                    pending_downgrades: stats[4],
                    total_upgrades: stats[5],
                    total_downgrades: stats[6],
                    rejected_upgrades: stats[7],
                    rejected_downgrades: stats[8],
                    total_customers_with_categories: stats[9],
                    category_distribution: categoryDistribution,
                    all_categories: allCategories,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};
async function processSingleGradingRequest(requestId, action, notes, userId) {
    const gradingRequest = await prisma_client_1.default.customer_category_grading.findUnique({
        where: { id: requestId },
    });
    if (!gradingRequest) {
        throw new Error('Grading request not found');
    }
    if (gradingRequest.action_taken !== 'N') {
        throw new Error('Request already processed');
    }
    await prisma_client_1.default.$transaction(async (tx) => {
        await tx.customer_category_grading.update({
            where: { id: requestId },
            data: {
                action_taken: action === 'approve' ? 'A' : 'R',
                status: action === 'approve' ? 'C' : 'R',
                approver_id: userId,
                approved_date: new Date(),
                updatedby: userId,
                updatedate: new Date(),
            },
        });
        if (action === 'approve') {
            await tx.customers.update({
                where: { id: gradingRequest.customer_id },
                data: {
                    customer_category_id: gradingRequest.upcoming_category_id,
                    updatedate: new Date(),
                    updatedby: userId,
                },
            });
        }
    });
}
//# sourceMappingURL=customerCategoryGrading.controller.js.map