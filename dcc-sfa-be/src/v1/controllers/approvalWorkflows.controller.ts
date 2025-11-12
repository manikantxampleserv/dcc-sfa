import { createWorkflowNotification } from '../../helpers';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface ApprovalWorkflowSerialized {
  id: number;
  workflow_type: string;
  reference_type: string;
  reference_number: string;
  requested_by: number;
  request_date: Date | null;
  priority: string | null;
  status: string | null;
  current_step: number | null;
  total_steps: number;
  request_data: any;
  final_approved_by: number | null;
  final_approved_at: Date | null;
  rejected_by: number | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
  createdate: Date | null;
  requested_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  workflow_steps?: Array<{
    id: number;
    step_number: number;
    step_name: string;
    status: string | null;
    comments: string | null;
    processed_by: number | null;
    processed_at: Date | null;
    assigned_role: string | null;
    assigned_user_id: number | null;
    is_required: boolean | null;
    due_date: Date | null;
    users_workflow_steps_processed_byTousers?: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
}

const serializeApprovalWorkflow = (
  workflow: any
): ApprovalWorkflowSerialized => ({
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
  workflow_steps: workflow.workflow_steps?.map((step: any) => ({
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
    users_workflow_steps_processed_byTousers:
      step.users_workflow_steps_processed_byTousers
        ? {
            id: step.users_workflow_steps_processed_byTousers.id,
            name: step.users_workflow_steps_processed_byTousers.name,
            email: step.users_workflow_steps_processed_byTousers.email,
          }
        : null,
  })),
});

export const approvalWorkflowsController = {
  /**
   * Get all approval workflows
   * GET /api/v1/approval-workflows
   */
  async getApprovalWorkflows(req: any, res: any) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        priority,
        workflow_type,
      } = req.query;

      const userId = req.user?.id;
      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const where: any = {
        is_active: 'Y',
      };

      if (search) {
        const searchLower = (search as string).toLowerCase();
        where.OR = [
          { reference_number: { contains: searchLower } },
          { workflow_type: { contains: searchLower } },
        ];
      }

      if (status && status !== 'all') {
        const normalizedStatus = (status as string).toUpperCase();
        where.status = normalizedStatus;
      }

      if (priority && priority !== 'all') {
        where.priority = priority as string;
      }

      if (workflow_type) {
        where.workflow_type = workflow_type as string;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const { data, pagination } = await paginate({
        model: prisma.approval_workflows,
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

      res.success(
        'Approval workflows retrieved successfully',
        data.map((w: any) => serializeApprovalWorkflow(w)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get Approval Workflows Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Get approval workflow by ID
   * GET /api/v1/approval-workflows/:id
   */
  async getApprovalWorkflowById(req: any, res: any) {
    try {
      const { id } = req.params;

      const workflow = await prisma.approval_workflows.findUnique({
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

      res.success(
        'Approval workflow retrieved successfully',
        serializeApprovalWorkflow(workflow)
      );
    } catch (error: any) {
      console.error('Get Approval Workflow By ID Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Approve a workflow step
   * POST /api/v1/approval-workflows/:id/approve
   */
  async approveWorkflowStep(req: any, res: any) {
    try {
      const { id } = req.params;
      const { step_id, comments } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.error('Unauthorized', 401);
      }

      const workflow = await prisma.approval_workflows.findUnique({
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
      if (
        normalizedWorkflowStatus === 'A' ||
        normalizedWorkflowStatus === 'APPROVED' ||
        normalizedWorkflowStatus === 'R' ||
        normalizedWorkflowStatus === 'REJECTED'
      ) {
        return res.error(
          `Cannot approve workflow that is already ${workflow.status}`,
          400
        );
      }

      const currentStep = step_id
        ? workflow.workflow_steps.find(s => s.id === parseInt(step_id))
        : workflow.workflow_steps.find(
            s => s.step_number === workflow.current_step
          );

      if (!currentStep) {
        return res.error('Workflow step not found', 404);
      }

      if (currentStep.status === 'completed') {
        return res.error('This step is already completed', 400);
      }

      // Check if this is the last step
      const isLastStep = currentStep.step_number === workflow.total_steps;

      const result = await prisma.$transaction(async tx => {
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
        } else {
          // Move to next step
          const nextStepNumber = currentStep.step_number + 1;
          const nextStep = workflow.workflow_steps.find(
            s => s.step_number === nextStepNumber
          );

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
      if (
        normalizedResultStatus === 'A' ||
        normalizedResultStatus === 'APPROVED'
      ) {
        try {
          await createWorkflowNotification(
            workflow.requested_by,
            workflow.id,
            workflow.reference_number,
            'approved',
            userId
          );

          // Update order approval_status if this is an order workflow
          if (workflow.reference_type === 'order' && workflow.reference_id) {
            try {
              const orderId = await prisma.orders.findFirst({
                where: {
                  order_number: workflow.reference_number,
                },
                select: { id: true },
              });

              if (orderId) {
                await prisma.orders.update({
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
            } catch (orderUpdateError) {
              console.error(
                'Error updating order approval status:',
                orderUpdateError
              );
            }
          }
        } catch (notifError) {
          console.error('Error sending approval notification:', notifError);
        }
      }

      res.success(
        isLastStep
          ? 'Workflow approved successfully'
          : 'Workflow step approved successfully',
        serializeApprovalWorkflow(result)
      );
    } catch (error: any) {
      console.error('Approve Workflow Step Error:', error);
      res.error(error.message);
    }
  },

  /**
   * Reject a workflow step
   * POST /api/v1/approval-workflows/:id/reject
   */
  async rejectWorkflowStep(req: any, res: any) {
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

      const workflow = await prisma.approval_workflows.findUnique({
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
      if (
        normalizedStatus === 'A' ||
        normalizedStatus === 'APPROVED' ||
        normalizedStatus === 'R' ||
        normalizedStatus === 'REJECTED'
      ) {
        return res.error(
          `Cannot reject workflow that is already ${workflow.status}`,
          400
        );
      }

      const currentStep = step_id
        ? workflow.workflow_steps.find(s => s.id === parseInt(step_id))
        : workflow.workflow_steps.find(
            s => s.step_number === workflow.current_step
          );

      if (!currentStep) {
        return res.error('Workflow step not found', 404);
      }

      const result = await prisma.$transaction(async tx => {
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
        await createWorkflowNotification(
          workflow.requested_by,
          workflow.id,
          workflow.reference_number,
          'rejected',
          userId
        );

        // Update order approval_status if this is an order workflow
        if (workflow.reference_type === 'order' && workflow.reference_id) {
          try {
            const orderId = await prisma.orders.findFirst({
              where: {
                order_number: workflow.reference_number,
              },
              select: { id: true },
            });

            if (orderId) {
              await prisma.orders.update({
                where: { id: orderId.id },
                data: {
                  approval_status: 'R',
                  updatedate: new Date(),
                  updatedby: userId,
                },
              });
            }
          } catch (orderUpdateError) {
            console.error(
              'Error updating order approval status:',
              orderUpdateError
            );
          }
        }
      } catch (notifError) {
        console.error('Error sending rejection notification:', notifError);
      }

      res.success(
        'Workflow rejected successfully',
        serializeApprovalWorkflow(result)
      );
    } catch (error: any) {
      console.error('Reject Workflow Step Error:', error);
      res.error(error.message);
    }
  },
};
