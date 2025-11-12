import prisma from '../../configs/prisma.client';

export interface WorkflowStep {
  id: number;
  request_type: string;
  request_id: number;
  step: string;
  status: string;
  remarks?: string | null;
  action_by?: number | null;
  action_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  action_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export class ReturnWorkflowService {
  /**
   * Get workflow steps for a return request
   * @param requestId - The ID of the return request
   * @returns Promise<WorkflowStep[]> - Array of workflow steps
   */
  static async getWorkflowSteps(requestId: number): Promise<WorkflowStep[]> {
    try {
      const steps = await prisma.return_workflow.findMany({
        where: {
          request_id: requestId,
          request_type: 'return',
          is_active: 'Y',
        },
        include: {
          users_return_workflow_action_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdate: 'asc',
        },
      });

      return steps.map(step => ({
        id: step.id,
        request_type: step.request_type,
        request_id: step.request_id,
        step: step.step,
        status: step.status || 'pending',
        remarks: step.remarks,
        action_by: step.action_by,
        action_date: step.action_date,
        is_active: step.is_active,
        createdate: step.createdate,
        createdby: step.createdby,
        updatedate: step.updatedate,
        updatedby: step.updatedby,
        log_inst: step.log_inst,
        action_user: step.users_return_workflow_action_byTousers,
      }));
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      throw error;
    }
  }

  /**
   * Create initial workflow steps for a return request
   * @param requestId - The ID of the return request
   * @param userId - The ID of the user creating the workflow
   * @returns Promise<void>
   */
  static async createInitialWorkflow(
    requestId: number,
    userId: number
  ): Promise<void> {
    try {
      const initialSteps = [
        {
          request_type: 'return',
          request_id: requestId,
          step: 'Request Submitted',
          status: 'completed',
          remarks: 'Return request submitted by customer',
          action_by: userId,
          action_date: new Date(),
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
        {
          request_type: 'return',
          request_id: requestId,
          step: 'Initial Review',
          status: 'in_progress',
          remarks: 'Under review by customer service team',
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
        {
          request_type: 'return',
          request_id: requestId,
          step: 'Approval Decision',
          status: 'pending',
          remarks: 'Awaiting approval decision',
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
        {
          request_type: 'return',
          request_id: requestId,
          step: 'Processing',
          status: 'pending',
          remarks: 'Processing return and preparing refund/replacement',
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
        {
          request_type: 'return',
          request_id: requestId,
          step: 'Completion',
          status: 'pending',
          remarks: 'Awaiting completion',
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
      ];

      await prisma.return_workflow.createMany({
        data: initialSteps,
      });
    } catch (error) {
      console.error('Error creating initial workflow:', error);
      throw error;
    }
  }

  /**
   * Update workflow step status
   * @param stepId - The ID of the workflow step
   * @param status - The new status for the step
   * @param remarks - Optional remarks for the step
   * @param actionBy - Optional user ID who performed the action
   * @returns Promise<WorkflowStep> - Updated workflow step
   */
  static async updateWorkflowStep(
    stepId: number,
    status: string,
    remarks?: string,
    actionBy?: number
  ): Promise<WorkflowStep> {
    try {
      const updatedStep = await prisma.return_workflow.update({
        where: { id: stepId },
        data: {
          status,
          remarks,
          action_by: actionBy,
          action_date: new Date(),
          updatedate: new Date(),
          updatedby: actionBy,
        },
        include: {
          users_return_workflow_action_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        id: updatedStep.id,
        request_type: updatedStep.request_type,
        request_id: updatedStep.request_id,
        step: updatedStep.step,
        status: updatedStep.status || 'pending',
        remarks: updatedStep.remarks,
        action_by: updatedStep.action_by,
        action_date: updatedStep.action_date,
        is_active: updatedStep.is_active,
        createdate: updatedStep.createdate,
        createdby: updatedStep.createdby,
        updatedate: updatedStep.updatedate,
        updatedby: updatedStep.updatedby,
        log_inst: updatedStep.log_inst,
        action_user: updatedStep.users_return_workflow_action_byTousers,
      };
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }
  }

  /**
   * Add a new workflow step
   * @param requestId - The ID of the return request
   * @param step - The name of the workflow step
   * @param status - The status of the step
   * @param remarks - Remarks for the step
   * @param actionBy - User ID who performed the action (null for system/auto assignment)
   * @param userId - User ID who created the step
   * @returns Promise<WorkflowStep> - New workflow step
   */
  static async addWorkflowStep(
    requestId: number,
    step: string,
    status: string,
    remarks: string,
    actionBy: number | null,
    userId: number
  ): Promise<WorkflowStep> {
    try {
      const newStep = await prisma.return_workflow.create({
        data: {
          request_type: 'return',
          request_id: requestId,
          step,
          status,
          remarks,
          action_by: actionBy,
          action_date: new Date(),
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
        include: {
          users_return_workflow_action_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        id: newStep.id,
        request_type: newStep.request_type,
        request_id: newStep.request_id,
        step: newStep.step,
        status: newStep.status || 'pending',
        remarks: newStep.remarks,
        action_by: newStep.action_by,
        action_date: newStep.action_date,
        is_active: newStep.is_active,
        createdate: newStep.createdate,
        createdby: newStep.createdby,
        updatedate: newStep.updatedate,
        updatedby: newStep.updatedby,
        log_inst: newStep.log_inst,
        action_user: newStep.users_return_workflow_action_byTousers,
      };
    } catch (error) {
      console.error('Error adding workflow step:', error);
      throw error;
    }
  }

  /**
   * Get workflow step by step name and request ID
   * @param requestId - The ID of the return request
   * @param step - The name of the workflow step
   * @returns Promise<WorkflowStep | null> - Workflow step or null if not found
   */
  static async getWorkflowStepByStep(
    requestId: number,
    step: string
  ): Promise<WorkflowStep | null> {
    try {
      const workflowStep = await prisma.return_workflow.findFirst({
        where: {
          request_id: requestId,
          request_type: 'return',
          step,
          is_active: 'Y',
        },
        include: {
          users_return_workflow_action_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!workflowStep) return null;

      return {
        id: workflowStep.id,
        request_type: workflowStep.request_type,
        request_id: workflowStep.request_id,
        step: workflowStep.step,
        status: workflowStep.status || 'pending',
        remarks: workflowStep.remarks,
        action_by: workflowStep.action_by,
        action_date: workflowStep.action_date,
        is_active: workflowStep.is_active,
        createdate: workflowStep.createdate,
        createdby: workflowStep.createdby,
        updatedate: workflowStep.updatedate,
        updatedby: workflowStep.updatedby,
        log_inst: workflowStep.log_inst,
        action_user: workflowStep.users_return_workflow_action_byTousers,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute full workflow flow - automatically progress through all steps
   * @param requestId - The ID of the return request
   * @param userId - The ID of the user executing the workflow
   * @param templateId - The template ID to use (default: 'standard_return')
   * @returns Promise<WorkflowStep[]> - Array of completed workflow steps
   */
  static async executeFullWorkflowFlow(
    requestId: number,
    userId: number,
    templateId: string = 'standard_return'
  ): Promise<WorkflowStep[]> {
    try {
      // Clear existing workflow steps
      await prisma.return_workflow.deleteMany({
        where: {
          request_id: requestId,
          request_type: 'return',
        },
      });

      // Define workflow templates
      const templates = {
        standard_return: [
          {
            step: 'Request Submitted',
            status: 'completed',
            remarks: 'Return request submitted by customer',
          },
          {
            step: 'Initial Review',
            status: 'completed',
            remarks: 'Request reviewed and validated',
          },
          {
            step: 'Approval Decision',
            status: 'completed',
            remarks: 'Request approved for processing',
          },
          {
            step: 'Processing',
            status: 'completed',
            remarks: 'Return processing completed',
          },
          {
            step: 'Completion',
            status: 'completed',
            remarks: 'Return request fully completed',
          },
        ],
        urgent_return: [
          {
            step: 'Request Submitted',
            status: 'completed',
            remarks: 'Urgent return request submitted',
          },
          {
            step: 'Priority Review',
            status: 'completed',
            remarks: 'Priority review completed',
          },
          {
            step: 'Fast Approval',
            status: 'completed',
            remarks: 'Fast-track approval granted',
          },
          {
            step: 'Express Processing',
            status: 'completed',
            remarks: 'Express processing completed',
          },
          {
            step: 'Completion',
            status: 'completed',
            remarks: 'Urgent return completed',
          },
        ],
        warranty_return: [
          {
            step: 'Request Submitted',
            status: 'completed',
            remarks: 'Warranty return request submitted',
          },
          {
            step: 'Warranty Verification',
            status: 'completed',
            remarks: 'Warranty verified and confirmed',
          },
          {
            step: 'Technical Review',
            status: 'completed',
            remarks: 'Technical review completed',
          },
          {
            step: 'Approval Decision',
            status: 'completed',
            remarks: 'Warranty approval granted',
          },
          {
            step: 'Replacement/Refund',
            status: 'completed',
            remarks: 'Replacement/refund processed',
          },
        ],
      };

      const template =
        templates[templateId as keyof typeof templates] ||
        templates.standard_return;
      const workflowSteps: WorkflowStep[] = [];

      // Create all workflow steps with completed status
      for (let i = 0; i < template.length; i++) {
        const stepData = template[i];

        // For template-generated steps, assign the first step to the current user
        // and subsequent steps to null (indicating system/auto assignment)
        const assignedUserId = i === 0 ? userId : null;

        const newStep = await this.addWorkflowStep(
          requestId,
          stepData.step,
          stepData.status,
          stepData.remarks,
          assignedUserId,
          userId
        );

        workflowSteps.push(newStep);

        // Add a small delay between steps to simulate real processing
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update return request status to completed
      await prisma.return_requests.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          approved_by: userId,
          approved_date: new Date(),
          resolution_notes: 'Full workflow flow completed automatically',
          updatedate: new Date(),
          updatedby: userId,
        },
      });

      return workflowSteps;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject return request with reason
   * @param requestId - The ID of the return request
   * @param userId - The ID of the user rejecting the request
   * @param rejectionReason - The reason for rejection
   * @returns Promise<WorkflowStep> - Rejection workflow step
   */
  static async rejectReturnRequest(
    requestId: number,
    userId: number,
    rejectionReason: string
  ): Promise<WorkflowStep> {
    try {
      // Get current workflow steps
      const currentSteps = await this.getWorkflowSteps(requestId);

      // Find the current active step
      const activeStep = currentSteps.find(
        step => step.status === 'in_progress'
      );

      if (activeStep) {
        // Update the current step to rejected
        await this.updateWorkflowStep(
          activeStep.id,
          'rejected',
          `Rejected: ${rejectionReason}`,
          userId
        );
      }

      // Create a rejection step
      const rejectionStep = await this.addWorkflowStep(
        requestId,
        'Request Rejected',
        'rejected',
        `Return request rejected: ${rejectionReason}`,
        userId,
        userId
      );

      // Update return request status to rejected
      await prisma.return_requests.update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          approved_by: userId,
          approved_date: new Date(),
          resolution_notes: `Rejected: ${rejectionReason}`,
          updatedate: new Date(),
          updatedby: userId,
        },
      });

      return rejectionStep;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute next workflow step automatically
   * @param requestId - The ID of the return request
   * @param userId - The ID of the user executing the step
   * @returns Promise<WorkflowStep | null> - Next executed step or null if all completed
   */
  static async executeNextWorkflowStep(
    requestId: number,
    userId: number
  ): Promise<WorkflowStep | null> {
    try {
      // Get current workflow steps
      const currentSteps = await this.getWorkflowSteps(requestId);

      if (currentSteps.length === 0) {
        // No steps exist, create initial workflow
        const reponse = await this.executeFullWorkflowFlow(requestId, userId);
        return reponse[0];
      }

      // Find the next pending step
      const nextStep = currentSteps.find(step => step.status === 'pending');

      if (!nextStep) {
        // All steps completed, update return request status
        await prisma.return_requests.update({
          where: { id: requestId },
          data: {
            status: 'completed',
            updatedate: new Date(),
            updatedby: userId,
          },
        });
        return null;
      }

      // Update the next step to completed
      const updatedStep = await this.updateWorkflowStep(
        nextStep.id,
        'completed',
        `Step completed automatically by system`,
        userId
      );

      // Check if this was the last step
      const remainingSteps = currentSteps.filter(
        step => step.status === 'pending'
      );
      if (remainingSteps.length === 1) {
        // Only the step we just completed was pending
        // Update return request status to completed
        await prisma.return_requests.update({
          where: { id: requestId },
          data: {
            status: 'completed',
            updatedate: new Date(),
            updatedby: userId,
          },
        });
      }

      return updatedStep;
    } catch (error) {
      throw error;
    }
  }
}
