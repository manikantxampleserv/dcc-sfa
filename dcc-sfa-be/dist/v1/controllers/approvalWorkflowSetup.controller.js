"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalWorkflowSetupController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeApprovalWorkFlowData = (data) => ({
    request_type: data.request_type || '',
    sequence: data.sequence ? Number(data.sequence) : 1,
    approver_id: Number(data.approver_id),
    zone_id: data.zone_id ? Number(data.zone_id) : null,
    depot_id: data.depot_id ? Number(data.depot_id) : null,
    header_approval_type: data.header_approval_type || '',
    header_role_id: data.header_role_id ? Number(data.header_role_id) : null,
    remarks: data.remarks || '',
    is_active: data.is_active || 'Y',
});
exports.approvalWorkflowSetupController = {
    async createApprovalWorkFlow(req, res) {
        try {
            let dataArray = req.body;
            const userId = req.user?.id || 1;
            if (!Array.isArray(dataArray)) {
                dataArray = [dataArray];
            }
            const serializedData = dataArray.map(data => ({
                ...serializeApprovalWorkFlowData(data),
                createdby: userId,
                createdate: new Date(),
                log_inst: data.log_inst ? Number(data.log_inst) : 1,
            }));
            // Validate all approvers first
            for (const data of dataArray) {
                const approver = await prisma_client_1.default.users.findUnique({
                    where: { id: Number(data.approver_id) },
                    select: {
                        id: true,
                        name: true,
                        zone_id: true,
                        depot_id: true,
                    },
                });
                if (!approver) {
                    return res.status(400).json({
                        message: `Approver with ID ${data.approver_id} not found`,
                    });
                }
                // Only validate zone if zone_id is provided (not null/global)
                if (data.zone_id && approver.zone_id !== Number(data.zone_id)) {
                    const zone = await prisma_client_1.default.zones.findUnique({
                        where: { id: Number(data.zone_id) },
                        select: { name: true },
                    });
                    return res.status(400).json({
                        message: `Approver ${approver.name} does not belong to ${zone?.name} zone`,
                    });
                }
                // Validate depot if depot_id is provided (not null/global)
                //   if (data.depot_id && approver.depot_id !== Number(data.depot_id)) {
                //     const depot = await prisma.depots.findUnique({
                //       where: { id: Number(data.depot_id) },
                //       select: { name: true },
                //     });
                //     return res.status(400).json({
                //       message: `Approver ${approver.name} does not belong to ${depot?.name} depot`,
                //     });
                //   }
            }
            // Delete existing workflows for the same request_type, zone_id, and depot_id
            // This ensures we replace instead of duplicate
            if (dataArray.length > 0) {
                const firstItem = dataArray[0];
                await prisma_client_1.default.approval_work_flow.deleteMany({
                    where: {
                        request_type: firstItem.request_type,
                        zone_id: firstItem.zone_id ? Number(firstItem.zone_id) : null,
                        depot_id: firstItem.depot_id ? Number(firstItem.depot_id) : null,
                    },
                });
            }
            const result = await prisma_client_1.default.approval_work_flow.createMany({
                data: serializedData,
            });
            console.log(` Created ${result.count} approval workflows`);
            const createdWorkflows = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: dataArray[0].request_type,
                },
                include: {
                    approval_work_flow_approver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    approval_work_flow_zone: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    approval_work_flow_depot: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdate: 'desc' },
                take: dataArray.length,
            });
            res.status(201).json({
                message: 'Approval workflow created successfully',
                data: createdWorkflows,
            });
        }
        catch (error) {
            console.error('Create Workflow Error:', error);
            res.status(500).json({
                message: 'Failed to create approval workflow',
                error: error.message,
            });
        }
    },
    async getApprovalWorkFlowById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ message: 'Invalid or missing ID' });
            }
            const workflow = await prisma_client_1.default.approval_work_flow.findUnique({
                where: { id: Number(id) },
                include: {
                    approval_work_flow_approver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    approval_work_flow_zone: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    approval_work_flow_depot: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (!workflow) {
                return res.status(404).json({ message: 'Approval workflow not found' });
            }
            res.json({
                message: 'Approval workflow fetched successfully',
                data: workflow,
            });
        }
        catch (error) {
            console.error('Get Workflow Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateApprovalWorkFlow(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user?.id || 1;
            if (data.approver_id) {
                const approver = await prisma_client_1.default.users.findUnique({
                    where: { id: Number(data.approver_id) },
                    select: {
                        zone_id: true,
                        depot_id: true,
                        name: true,
                    },
                });
                if (!approver) {
                    return res.status(400).json({
                        message: `Approver with ID ${data.approver_id} not found`,
                    });
                }
                if (data.zone_id && approver.zone_id !== Number(data.zone_id)) {
                    return res.status(400).json({
                        message: `Approver ${approver.name} does not belong to the specified zone`,
                    });
                }
            }
            const updatedEntry = await prisma_client_1.default.approval_work_flow.update({
                where: { id: Number(id) },
                data: {
                    ...serializeApprovalWorkFlowData(data),
                    updatedby: userId,
                    updatedate: new Date(),
                },
                include: {
                    approval_work_flow_approver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    approval_work_flow_zone: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    approval_work_flow_depot: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Approval workflow updated successfully',
                data: updatedEntry,
            });
        }
        catch (error) {
            console.error('Update Workflow Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteApprovalWorkFlow(req, res) {
        try {
            const { requestType } = req.params;
            const result = await prisma_client_1.default.approval_work_flow.deleteMany({
                where: { request_type: requestType },
            });
            console.log(`🗑 Deleted ${result.count} workflows for ${requestType}`);
            res.json({
                message: `Deleted ${result.count} approval workflows for ${requestType}`,
            });
        }
        catch (error) {
            console.error('Delete Workflow Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteApprovalWorkFlows(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'IDs array is required' });
            }
            const result = await prisma_client_1.default.approval_work_flow.deleteMany({
                where: { id: { in: ids.map(Number) } },
            });
            console.log(`🗑 Deleted ${result.count} workflows by IDs`);
            res.json({
                message: `Deleted ${result.count} approval workflows`,
            });
        }
        catch (error) {
            console.error('Delete Workflows Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllApprovalWorkFlow(req, res) {
        try {
            const { page = 1, size = 10, search, startDate, endDate, request_type, } = req.query;
            const pageNum = Number(page) || 1;
            const sizeNum = Number(size) || 10;
            const filters = {};
            if (request_type && request_type !== 'all') {
                filters.request_type = request_type;
            }
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    filters.createdate = { gte: start, lte: end };
                }
            }
            const workflows = await prisma_client_1.default.approval_work_flow.findMany({
                where: filters,
                orderBy: [
                    { request_type: 'asc' },
                    { zone_id: 'asc' },
                    { depot_id: 'asc' },
                    { sequence: 'asc' },
                ],
                include: {
                    approval_work_flow_approver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    approval_work_flow_zone: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    approval_work_flow_depot: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            // Group by request_type
            const grouped = {};
            for (const wf of workflows) {
                const type = wf.request_type;
                if (!grouped[type]) {
                    grouped[type] = {
                        request_type: type,
                        zones: [],
                        depots: [],
                        no_of_approvers: 0,
                        is_active: wf.is_active,
                        request_approval_request: [],
                    };
                }
                const zoneName = wf.approval_work_flow_zone?.name || 'Global (All Zones)';
                const depotName = wf.approval_work_flow_depot?.name || 'Global (All Depots)';
                if (!grouped[type].zones.some((z) => z.id === wf.zone_id)) {
                    grouped[type].zones.push({
                        id: wf.zone_id,
                        name: zoneName,
                        is_global: wf.zone_id === null,
                    });
                }
                if (!grouped[type].depots.some((d) => d.id === wf.depot_id)) {
                    grouped[type].depots.push({
                        id: wf.depot_id,
                        name: depotName,
                        is_global: wf.depot_id === null,
                    });
                }
                grouped[type].request_approval_request.push({
                    id: wf.id,
                    sequence: wf.sequence,
                    approver_id: wf.approver_id,
                    zone_id: wf.zone_id,
                    depot_id: wf.depot_id,
                    is_active: wf.is_active,
                    createdate: wf.createdate,
                    createdby: wf.createdby,
                    updatedate: wf.updatedate,
                    updatedby: wf.updatedby,
                    log_inst: wf.log_inst,
                    approval_work_flow_approver: {
                        id: wf.approval_work_flow_approver?.id || null,
                        name: wf.approval_work_flow_approver?.name || null,
                        email: wf.approval_work_flow_approver?.email || null,
                    },
                });
                grouped[type].no_of_approvers += 1;
            }
            let groupedArray = Object.values(grouped);
            // Apply search filter if provided
            if (search && search.trim()) {
                const searchLower = search.toLowerCase().trim();
                groupedArray = groupedArray.filter((item) => item.request_type.toLowerCase().includes(searchLower));
            }
            // Calculate total count after all filters are applied
            const totalCount = groupedArray.length;
            const totalPages = totalCount > 0 ? Math.ceil(totalCount / sizeNum) : 0;
            // Apply pagination
            const paginatedData = groupedArray.slice((pageNum - 1) * sizeNum, pageNum * sizeNum);
            res.json({
                message: 'Approval workflows retrieved successfully',
                data: paginatedData,
                pagination: {
                    currentPage: pageNum,
                    size: sizeNum,
                    totalPages,
                    totalCount,
                },
                summary: {
                    total_workflows: totalCount,
                },
            });
        }
        catch (error) {
            console.error('Get All Workflows Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllApprovalWorkFlowByRequest(req, res) {
        try {
            const { request_type, zone_id, depot_id } = req.query;
            if (!request_type) {
                return res.status(400).json({ message: 'Request type is required' });
            }
            const includeConfig = {
                approval_work_flow_approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                approval_work_flow_zone: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                approval_work_flow_depot: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            };
            if (zone_id && depot_id) {
                const results = [];
                const seenApprovers = new Set();
                const zoneDepotWorkflows = await prisma_client_1.default.approval_work_flow.findMany({
                    where: {
                        request_type: request_type,
                        zone_id: Number(zone_id),
                        depot_id: Number(depot_id),
                        is_active: 'Y',
                    },
                    orderBy: { sequence: 'asc' },
                    include: includeConfig,
                });
                zoneDepotWorkflows.forEach(wf => {
                    results.push(wf);
                    seenApprovers.add(wf.approver_id);
                });
                const zoneWorkflows = await prisma_client_1.default.approval_work_flow.findMany({
                    where: {
                        request_type: request_type,
                        zone_id: Number(zone_id),
                        depot_id: null,
                        is_active: 'Y',
                    },
                    orderBy: { sequence: 'asc' },
                    include: includeConfig,
                });
                zoneWorkflows.forEach(wf => {
                    if (!seenApprovers.has(wf.approver_id)) {
                        results.push(wf);
                        seenApprovers.add(wf.approver_id);
                    }
                });
                const depotWorkflows = await prisma_client_1.default.approval_work_flow.findMany({
                    where: {
                        request_type: request_type,
                        depot_id: Number(depot_id),
                        zone_id: null,
                        is_active: 'Y',
                    },
                    orderBy: { sequence: 'asc' },
                    include: includeConfig,
                });
                depotWorkflows.forEach(wf => {
                    if (!seenApprovers.has(wf.approver_id)) {
                        results.push(wf);
                        seenApprovers.add(wf.approver_id);
                    }
                });
                const globalWorkflows = await prisma_client_1.default.approval_work_flow.findMany({
                    where: {
                        request_type: request_type,
                        zone_id: null,
                        depot_id: null,
                        is_active: 'Y',
                    },
                    orderBy: { sequence: 'asc' },
                    include: includeConfig,
                });
                globalWorkflows.forEach(wf => {
                    if (!seenApprovers.has(wf.approver_id)) {
                        results.push(wf);
                        seenApprovers.add(wf.approver_id);
                    }
                });
                results.sort((a, b) => {
                    if (a.sequence !== b.sequence) {
                        return a.sequence - b.sequence;
                    }
                    return (new Date(b.createdate).getTime() - new Date(a.createdate).getTime());
                });
                return res.json({
                    success: true,
                    data: results,
                    meta: {
                        total_approvers: results.length,
                        workflow_type: 'merged',
                    },
                });
            }
            const workflows = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: request_type,
                    zone_id: null,
                    depot_id: null,
                    is_active: 'Y',
                },
                orderBy: { sequence: 'asc' },
                include: includeConfig,
            });
            res.json({
                success: true,
                data: workflows,
                meta: {
                    total_approvers: workflows.length,
                    workflow_type: 'global',
                },
            });
        }
        catch (error) {
            console.error('Get Workflows By Request Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getZonesWithWorkflows(req, res) {
        try {
            const { requestType } = req.params;
            const zones = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: requestType,
                    is_active: 'Y',
                },
                select: {
                    zone_id: true,
                    approval_work_flow_zone: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                distinct: ['zone_id'],
            });
            const result = zones.map(z => ({
                zone_id: z.zone_id,
                zone_name: z.zone_id
                    ? z.approval_work_flow_zone?.name
                    : 'Global (All Zones)',
                is_global: z.zone_id === null,
            }));
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Get Zones Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getDepotsWithWorkflows(req, res) {
        try {
            const { requestType } = req.params;
            const depots = await prisma_client_1.default.approval_work_flow.findMany({
                where: {
                    request_type: requestType,
                    is_active: 'Y',
                },
                select: {
                    depot_id: true,
                    approval_work_flow_depot: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                distinct: ['depot_id'],
            });
            const result = depots.map(d => ({
                depot_id: d.depot_id,
                depot_name: d.depot_id
                    ? d.approval_work_flow_depot?.name
                    : 'Global (All Depots)',
                is_global: d.depot_id === null,
            }));
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Get Depots Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=approvalWorkflowSetup.controller.js.map