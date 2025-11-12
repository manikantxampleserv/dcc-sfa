import { randomUUID } from 'crypto';
import prisma from '../configs/prisma.client';

export interface CreateApprovalWorkflowParams {
  workflow_type: string;
  reference_type: string;
  reference_id: string;
  reference_number: string;
  requested_by: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  request_data?: any;
  steps?: WorkflowStepDefinition[];
  createdby?: number;
}

export interface WorkflowStepDefinition {
  step_number: number;
  step_name: string;
  assigned_role?: string;
  assigned_user_id?: number;
  is_required?: boolean;
  due_date?: Date;
}

/**
 * Create an approval workflow with steps
 */
export async function createApprovalWorkflow(
  params: CreateApprovalWorkflowParams
) {
  try {
    const {
      workflow_type,
      reference_type,
      reference_id,
      reference_number,
      requested_by,
      priority = 'medium',
      request_data,
      steps,
      createdby = 1,
    } = params;

    const referenceIdUuid = reference_id || randomUUID();
    let workflowSteps: WorkflowStepDefinition[] = steps || [];

    if (!steps || steps.length === 0) {
      switch (workflow_type.toLowerCase()) {
        case 'order':
          workflowSteps = [
            {
              step_number: 1,
              step_name: 'Salesperson Review',
              assigned_role: 'Salesperson',
              is_required: false,
            },
            {
              step_number: 2,
              step_name: 'Manager Approval',
              assigned_role: 'Manager',
              is_required: true,
            },
            {
              step_number: 3,
              step_name: 'Finance Approval',
              assigned_role: 'Finance',
              is_required: true,
            },
            {
              step_number: 4,
              step_name: 'Final Approval',
              assigned_role: 'Director',
              is_required: true,
            },
          ];
          break;

        case 'return':
          workflowSteps = [
            {
              step_number: 1,
              step_name: 'Request Submitted',
              is_required: false,
            },
            {
              step_number: 2,
              step_name: 'Initial Review',
              assigned_role: 'Customer Service',
              is_required: true,
            },
            {
              step_number: 3,
              step_name: 'Approval Decision',
              assigned_role: 'Manager',
              is_required: true,
            },
            {
              step_number: 4,
              step_name: 'Processing',
              assigned_role: 'Operations',
              is_required: true,
            },
          ];
          break;

        case 'expense':
          workflowSteps = [
            {
              step_number: 1,
              step_name: 'Expense Submitted',
              is_required: false,
            },
            {
              step_number: 2,
              step_name: 'Manager Approval',
              assigned_role: 'Manager',
              is_required: true,
            },
            {
              step_number: 3,
              step_name: 'Finance Approval',
              assigned_role: 'Finance',
              is_required: true,
            },
          ];
          break;

        default:
          workflowSteps = [
            {
              step_number: 1,
              step_name: 'Request Submitted',
              is_required: false,
            },
            {
              step_number: 2,
              step_name: 'Review',
              assigned_role: 'Manager',
              is_required: true,
            },
            {
              step_number: 3,
              step_name: 'Approval',
              assigned_role: 'Director',
              is_required: true,
            },
          ];
      }
    }

    const totalSteps = workflowSteps.length;

    // Determine initial current_step: if step 1 is auto-completed, start at step 2
    const firstStepAutoCompleted =
      workflowSteps[0]?.step_number === 1 &&
      (workflowSteps[0]?.assigned_role === 'Salesperson' ||
        workflowSteps[0]?.is_required === false);
    const initialCurrentStep = firstStepAutoCompleted ? 2 : 1;
    const initialStatus = 'P'; // Always start with Pending (P)

    const workflow = await prisma.$transaction(async tx => {
      const approvalWorkflow = await tx.approval_workflows.create({
        data: {
          workflow_type,
          reference_id: referenceIdUuid,
          reference_type,
          reference_number,
          requested_by,
          request_date: new Date(),
          priority,
          status: initialStatus,
          current_step: initialCurrentStep,
          total_steps: totalSteps,
          request_data: request_data ? JSON.stringify(request_data) : null,
          is_active: 'Y',
          createdate: new Date(),
          createdby,
        },
      });

      const stepsToCreate = workflowSteps.map(step => ({
        workflow_id: approvalWorkflow.id,
        step_number: step.step_number,
        step_name: step.step_name,
        assigned_role: step.assigned_role || '',
        assigned_user_id: step.assigned_user_id || null,
        status:
          step.step_number === 1 && firstStepAutoCompleted
            ? 'completed'
            : 'pending',
        is_required: step.is_required !== false,
        due_date: step.due_date || null,
        is_active: 'Y',
        createdate: new Date(),
        createdby,
      }));

      await tx.workflow_steps.createMany({
        data: stepsToCreate,
      });

      const workflowWithSteps = await tx.approval_workflows.findUnique({
        where: { id: approvalWorkflow.id },
        include: {
          workflow_steps: {
            orderBy: { step_number: 'asc' },
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

      return workflowWithSteps;
    });

    if (!workflow) {
      throw new Error('Failed to create approval workflow');
    }

    console.log(
      `Approval workflow created: ${workflow_type} - ${reference_number} (ID: ${workflow.id})`
    );

    return workflow;
  } catch (error) {
    console.error('Error creating approval workflow:', error);
    throw error;
  }
}

/**
 * Create approval workflow for an order
 */
export async function createOrderApprovalWorkflow(
  orderId: number,
  orderNumber: string,
  requestedBy: number,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  orderData?: any,
  createdby?: number
) {
  const referenceIdUuid = randomUUID();

  return await createApprovalWorkflow({
    workflow_type: 'order',
    reference_type: 'order',
    reference_id: referenceIdUuid,
    reference_number: orderNumber,
    requested_by: requestedBy,
    priority,
    request_data: {
      ...(orderData || {}),
      order_id: orderId,
    },
    createdby: createdby || requestedBy,
  });
}
