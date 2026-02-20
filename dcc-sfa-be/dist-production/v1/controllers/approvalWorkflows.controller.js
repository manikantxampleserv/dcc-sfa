"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalWorkflowsController = void 0;
const helpers_1 = require("../../helpers");
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeApprovalWorkflow = (workflow) => ({
    id: workflow.id,
    workflow_type: workflow.workflow_type,
    reference_type: workflow.reference_type,
    reference_number: workflow.reference_number,
    requested_by: workflow.requested_by,
    request_date: workflow.request_date,
    priority: workflow.priority,
    status: workflow.status,
    current_step: workflow.current_step,
    total_steps: workflow.total_steps,
    request_data: workflow.request_data
        ? JSON.parse(workflow.request_data)
        : null,
    final_approved_by: workflow.final_approved_by,
    final_approved_at: workflow.final_approved_at,
    rejected_by: workflow.rejected_by,
    rejected_at: workflow.rejected_at,
    rejection_reason: workflow.rejection_reason,
    createdate: workflow.createdate,
    requested_by_user: workflow.users_approval_workflows_requested_byTousers
        ? {
            id: workflow.users_approval_workflows_requested_byTousers.id,
            name: workflow.users_approval_workflows_requested_byTousers.name,
            email: workflow.users_approval_workflows_requested_byTousers.email,
        }
        : undefined,
    workflow_steps: workflow.workflow_steps?.map((step) => ({
        id: step.id,
        step_number: step.step_number,
        step_name: step.step_name,
        status: step.status,
        comments: step.comments,
        processed_by: step.processed_by,
        processed_at: step.processed_at,
        assigned_role: step.assigned_role,
        assigned_user_id: step.assigned_user_id,
        is_required: step.is_required,
        due_date: step.due_date,
        users_workflow_steps_processed_byTousers: step.users_workflow_steps_processed_byTousers
            ? {
                id: step.users_workflow_steps_processed_byTousers.id,
                name: step.users_workflow_steps_processed_byTousers.name,
                email: step.users_workflow_steps_processed_byTousers.email,
            }
            : null,
    })),
});
exports.approvalWorkflowsController = {
    /**
     * Get all approval workflows
     * GET /api/v1/approval-workflows
     */
    async getApprovalWorkflows(req, res) {
        try {
            const { page = 1, limit = 10, search, status, priority, workflow_type, } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const where = {
                is_active: 'Y',
            };
            if (search) {
                const searchLower = search.toLowerCase();
                where.OR = [
                    { reference_number: { contains: searchLower } },
                    { workflow_type: { contains: searchLower } },
                ];
            }
            if (status && status !== 'all') {
                const normalizedStatus = status.toUpperCase();
                where.status = normalizedStatus;
            }
            if (priority && priority !== 'all') {
                where.priority = priority;
            }
            if (workflow_type) {
                where.workflow_type = workflow_type;
            }
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.approval_workflows,
                filters: where,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    users_approval_workflows_requested_byTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            res.success('Approval workflows retrieved successfully', data.map((w) => serializeApprovalWorkflow(w)), 200, pagination);
        }
        catch (error) {
            console.error('Get Approval Workflows Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Get approval workflow by ID
     * GET /api/v1/approval-workflows/:id
     */
    async getApprovalWorkflowById(req, res) {
        try {
            const { id } = req.params;
            const workflow = await prisma_client_1.default.approval_workflows.findUnique({
                where: { id: parseInt(id) },
                include: {
                    users_approval_workflows_requested_byTousers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    workflow_steps: {
                        orderBy: { step_number: 'asc' },
                        include: {
                            users_workflow_steps_assigned_user_idTousers: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            users_workflow_steps_processed_byTousers: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!workflow) {
                return res.error('Approval workflow not found', 404);
            }
            res.success('Approval workflow retrieved successfully', serializeApprovalWorkflow(workflow));
        }
        catch (error) {
            console.error('Get Approval Workflow By ID Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Approve a workflow step
     * POST /api/v1/approval-workflows/:id/approve
     */
    async approveWorkflowStep(req, res) {
        try {
            const { id } = req.params;
            const { step_id, comments } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            const workflow = await prisma_client_1.default.approval_workflows.findUnique({
                where: { id: parseInt(id) },
                include: {
                    workflow_steps: {
                        orderBy: { step_number: 'asc' },
                    },
                },
            });
            if (!workflow) {
                return res.error('Approval workflow not found', 404);
            }
            const normalizedWorkflowStatus = workflow.status?.toUpperCase();
            if (normalizedWorkflowStatus === 'A' ||
                normalizedWorkflowStatus === 'APPROVED' ||
                normalizedWorkflowStatus === 'R' ||
                normalizedWorkflowStatus === 'REJECTED') {
                return res.error(`Cannot approve workflow that is already ${workflow.status}`, 400);
            }
            const currentStep = step_id
                ? workflow.workflow_steps.find(s => s.id === parseInt(step_id))
                : workflow.workflow_steps.find(s => s.step_number === workflow.current_step);
            if (!currentStep) {
                return res.error('Workflow step not found', 404);
            }
            if (currentStep.status === 'completed') {
                return res.error('This step is already completed', 400);
            }
            // Check if this is the last step
            const isLastStep = currentStep.step_number === workflow.total_steps;
            const result = await prisma_client_1.default.$transaction(async (tx) => {
                // Update current step to completed
                await tx.workflow_steps.update({
                    where: { id: currentStep.id },
                    data: {
                        status: 'completed',
                        comments: comments || null,
                        processed_by: userId,
                        processed_at: new Date(),
                        updatedate: new Date(),
                        updatedby: userId,
                    },
                });
                if (isLastStep) {
                    // Mark workflow as approved
                    await tx.approval_workflows.update({
                        where: { id: workflow.id },
                        data: {
                            status: 'A',
                            current_step: workflow.total_steps,
                            final_approved_by: userId,
                            final_approved_at: new Date(),
                            updatedate: new Date(),
                            updatedby: userId,
                        },
                    });
                }
                else {
                    // Move to next step
                    const nextStepNumber = currentStep.step_number + 1;
                    const nextStep = workflow.workflow_steps.find(s => s.step_number === nextStepNumber);
                    if (nextStep) {
                        await tx.workflow_steps.update({
                            where: { id: nextStep.id },
                            data: {
                                status: 'pending',
                            },
                        });
                    }
                    await tx.approval_workflows.update({
                        where: { id: workflow.id },
                        data: {
                            current_step: nextStepNumber,
                            status: 'P',
                            updatedate: new Date(),
                            updatedby: userId,
                        },
                    });
                }
                // Get updated workflow
                const updatedWorkflow = await tx.approval_workflows.findUnique({
                    where: { id: workflow.id },
                    include: {
                        workflow_steps: {
                            orderBy: { step_number: 'asc' },
                            include: {
                                users_workflow_steps_processed_byTousers: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        users_approval_workflows_requested_byTousers: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });
                return updatedWorkflow;
            });
            // Send notification to requester if workflow is approved
            const normalizedResultStatus = result?.status?.toUpperCase();
            if (normalizedResultStatus === 'A' ||
                normalizedResultStatus === 'APPROVED') {
                try {
                    await (0, helpers_1.createWorkflowNotification)(workflow.requested_by, workflow.id, workflow.reference_number, 'approved', userId);
                    // Update order approval_status if this is an order workflow
                    if (workflow.reference_type === 'order' && workflow.reference_id) {
                        try {
                            const orderId = await prisma_client_1.default.orders.findFirst({
                                where: {
                                    order_number: workflow.reference_number,
                                },
                                select: { id: true },
                            });
                            if (orderId) {
                                await prisma_client_1.default.orders.update({
                                    where: { id: orderId.id },
                                    data: {
                                        approval_status: 'A',
                                        approved_by: userId,
                                        approved_at: new Date(),
                                        updatedate: new Date(),
                                        updatedby: userId,
                                    },
                                });
                            }
                        }
                        catch (orderUpdateError) {
                            console.error('Error updating order approval status:', orderUpdateError);
                        }
                    }
                }
                catch (notifError) {
                    console.error('Error sending approval notification:', notifError);
                }
            }
            res.success(isLastStep
                ? 'Workflow approved successfully'
                : 'Workflow step approved successfully', serializeApprovalWorkflow(result));
        }
        catch (error) {
            console.error('Approve Workflow Step Error:', error);
            res.error(error.message);
        }
    },
    /**
     * Reject a workflow step
     * POST /api/v1/approval-workflows/:id/reject
     */
    async rejectWorkflowStep(req, res) {
        try {
            const { id } = req.params;
            const { step_id, rejection_reason } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.error('Unauthorized', 401);
            }
            if (!rejection_reason || rejection_reason.trim() === '') {
                return res.error('Rejection reason is required', 400);
            }
            const workflow = await prisma_client_1.default.approval_workflows.findUnique({
                where: { id: parseInt(id) },
                include: {
                    workflow_steps: {
                        orderBy: { step_number: 'asc' },
                    },
                },
            });
            if (!workflow) {
                return res.error('Approval workflow not found', 404);
            }
            const normalizedStatus = workflow.status?.toUpperCase();
            if (normalizedStatus === 'A' ||
                normalizedStatus === 'APPROVED' ||
                normalizedStatus === 'R' ||
                normalizedStatus === 'REJECTED') {
                return res.error(`Cannot reject workflow that is already ${workflow.status}`, 400);
            }
            const currentStep = step_id
                ? workflow.workflow_steps.find(s => s.id === parseInt(step_id))
                : workflow.workflow_steps.find(s => s.step_number === workflow.current_step);
            if (!currentStep) {
                return res.error('Workflow step not found', 404);
            }
            const result = await prisma_client_1.default.$transaction(async (tx) => {
                // Update current step to rejected
                await tx.workflow_steps.update({
                    where: { id: currentStep.id },
                    data: {
                        status: 'R',
                        comments: rejection_reason.trim(),
                        processed_by: userId,
                        processed_at: new Date(),
                        updatedate: new Date(),
                        updatedby: userId,
                    },
                });
                // Mark workflow as rejected
                await tx.approval_workflows.update({
                    where: { id: workflow.id },
                    data: {
                        status: 'R',
                        rejected_by: userId,
                        rejected_at: new Date(),
                        rejection_reason: rejection_reason.trim(),
                        updatedate: new Date(),
                        updatedby: userId,
                    },
                });
                // Get updated workflow
                const updatedWorkflow = await tx.approval_workflows.findUnique({
                    where: { id: workflow.id },
                    include: {
                        workflow_steps: {
                            orderBy: { step_number: 'asc' },
                            include: {
                                users_workflow_steps_processed_byTousers: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        users_approval_workflows_requested_byTousers: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });
                return updatedWorkflow;
            });
            // Send notification to requester
            try {
                await (0, helpers_1.createWorkflowNotification)(workflow.requested_by, workflow.id, workflow.reference_number, 'rejected', userId);
                // Update order approval_status if this is an order workflow
                if (workflow.reference_type === 'order' && workflow.reference_id) {
                    try {
                        const orderId = await prisma_client_1.default.orders.findFirst({
                            where: {
                                order_number: workflow.reference_number,
                            },
                            select: { id: true },
                        });
                        if (orderId) {
                            await prisma_client_1.default.orders.update({
                                where: { id: orderId.id },
                                data: {
                                    approval_status: 'R',
                                    updatedate: new Date(),
                                    updatedby: userId,
                                },
                            });
                        }
                    }
                    catch (orderUpdateError) {
                        console.error('Error updating order approval status:', orderUpdateError);
                    }
                }
            }
            catch (notifError) {
                console.error('Error sending rejection notification:', notifError);
            }
            res.success('Workflow rejected successfully', serializeApprovalWorkflow(result));
        }
        catch (error) {
            console.error('Reject Workflow Step Error:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=approvalWorkflows.controller.js.map