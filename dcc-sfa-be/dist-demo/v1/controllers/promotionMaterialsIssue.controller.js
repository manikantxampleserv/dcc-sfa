"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionMaterialsIssueController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const serializePromotionMaterialsIssue = (issue, currentApprover = null) => {
    return {
        id: issue.id,
        gin_number: issue.gin_number,
        depot_id: issue.depot_id,
        outlet_id: issue.outlet_id,
        issue_date: issue.issue_date?.toISOString(),
        issued_by_id: issue.issued_by_id || issue.issued_by?.id,
        campaign_reference: issue.campaign_reference,
        remarks: issue.remarks,
        total_value: Number(issue.total_value),
        approval_status: issue.approval_status,
        createdby: issue.createdby,
        createdate: issue.createdate?.toISOString(),
        updatedby: issue.updatedby,
        updatedate: issue.updatedate?.toISOString(),
        depot: issue.depot
            ? { id: issue.depot.id, name: issue.depot.name, code: issue.depot.code }
            : null,
        outlet: issue.outlet
            ? {
                id: issue.outlet.id,
                name: issue.outlet.name,
                code: issue.outlet.code,
            }
            : null,
        issued_by: issue.issued_by
            ? {
                id: issue.issued_by.id,
                name: issue.issued_by.name,
                sap_code: issue.issued_by.sap_code,
                email: issue.issued_by.email,
            }
            : null,
        items: issue.items,
        current_approver: currentApprover,
    };
};
exports.promotionMaterialsIssueController = {
    async getPromotionMaterialsIssues(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const search = req.query.search;
            const status = req.query.status;
            const where = { is_active: 'Y' };
            if (search) {
                where.OR = [
                    { gin_number: { contains: search } },
                    { outlet: { name: { contains: search } } },
                ];
            }
            if (status) {
                where.approval_status = status;
            }
            if (req.query.depot_id) {
                where.depot_id = parseInt(req.query.depot_id);
            }
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.promotion_materials_issue,
                filters: where,
                page,
                limit,
                orderBy: { issue_date: 'desc' },
                include: {
                    depot: true,
                    outlet: true,
                    issued_by: true,
                    items: {
                        where: { is_active: 'Y' },
                        include: { asset: true },
                    },
                },
            });
            res.json({
                success: true,
                message: 'Promotion materials issues retrieved successfully',
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                data: data.map((d) => serializePromotionMaterialsIssue(d)),
            });
        }
        catch (error) {
            console.error('getPromotionMaterialsIssues Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getPromotionMaterialsIssueById(req, res) {
        try {
            const { id } = req.params;
            const issue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
                include: {
                    depot: true,
                    outlet: true,
                    issued_by: true,
                    items: {
                        where: { is_active: 'Y' },
                        include: { asset: true },
                    },
                },
            });
            if (!issue || issue.is_active !== 'Y') {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            res.json({
                success: true,
                message: 'Issue retrieved successfully',
                data: serializePromotionMaterialsIssue(issue),
            });
        }
        catch (error) {
            console.error('getPromotionMaterialsIssueById Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createPromotionMaterialsIssue(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { depot_id, outlet_id, issue_date, issued_by_id, campaign_reference, notes, items, } = req.body;
            const depot = await prisma_client_1.default.depots.findUnique({
                where: { id: Number(depot_id) },
            });
            const depotCode = depot?.code || 'DEP';
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const datePart = `${dd}${mm}`;
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const todayIssuesCount = await prisma_client_1.default.promotion_materials_issue.count({
                where: {
                    depot_id: Number(depot_id),
                    createdate: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            });
            const sequence = String(todayIssuesCount + 1).padStart(4, '0');
            const ginNumber = `GIN-${depotCode}-${datePart}-${sequence}`;
            const total_value = items.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0);
            const issue = await prisma_client_1.default.promotion_materials_issue.create({
                data: {
                    gin_number: ginNumber,
                    depot_id: Number(depot_id),
                    outlet_id: Number(outlet_id),
                    issue_date: new Date(issue_date),
                    issued_by_id: Number(issued_by_id),
                    campaign_reference,
                    notes,
                    total_value,
                    approval_status: 'A',
                    createdby: userId,
                    items: {
                        create: items.map((item) => ({
                            asset_id: Number(item.asset_id),
                            quantity: Number(item.quantity),
                            unit_value: Number(item.unit_value) || 0,
                            total_value: Number(item.total_value) || 0,
                            createdby: userId,
                        })),
                    },
                },
                include: { items: true },
            });
            res.status(201).json({
                success: true,
                data: serializePromotionMaterialsIssue(issue),
                message: 'Issue created successfully',
            });
        }
        catch (error) {
            console.error('createPromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updatePromotionMaterialsIssue(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            const { depot_id, outlet_id, issue_date, issued_by_id, campaign_reference, notes, approval_status, items, } = req.body;
            const existingIssue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
            });
            if (!existingIssue) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            const total_value = items
                ? items.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0)
                : existingIssue.total_value;
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.promotion_materials_issue.update({
                    where: { id: Number(id) },
                    data: {
                        ...(depot_id && { depot_id: Number(depot_id) }),
                        ...(outlet_id && { outlet_id: Number(outlet_id) }),
                        ...(issue_date && { issue_date: new Date(issue_date) }),
                        ...(issued_by_id && { issued_by_id: Number(issued_by_id) }),
                        campaign_reference,
                        notes,
                        ...(approval_status && { approval_status }),
                        total_value,
                        updatedby: userId,
                        updatedate: new Date(),
                    },
                });
                if (items) {
                    await tx.promotion_materials_issue_items.updateMany({
                        where: { issue_id: Number(id) },
                        data: { is_active: 'N', updatedby: userId, updatedate: new Date() },
                    });
                    for (const item of items) {
                        await tx.promotion_materials_issue_items.create({
                            data: {
                                issue_id: Number(id),
                                asset_id: Number(item.asset_id),
                                quantity: Number(item.quantity),
                                unit_value: Number(item.unit_value) || 0,
                                total_value: Number(item.total_value) || 0,
                                createdby: userId,
                            },
                        });
                    }
                }
            });
            res.json({ success: true, message: 'Issue updated successfully' });
        }
        catch (error) {
            console.error('updatePromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deletePromotionMaterialsIssue(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            await prisma_client_1.default.promotion_materials_issue.update({
                where: { id: Number(id) },
                data: { is_active: 'N', updatedby: userId, updatedate: new Date() },
            });
            res.json({ success: true, message: 'Issue deleted successfully' });
        }
        catch (error) {
            console.error('deletePromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
//# sourceMappingURL=promotionMaterialsIssue.controller.js.map