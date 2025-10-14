import axioConfig from '../../configs/axio.config';

export interface WorkflowStep {
  id: number;
  request_type: string;
  request_id: number;
  step: string;
  status: string;
  remarks?: string;
  action_by?: number;
  action_date?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  action_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: {
    step: string;
    status: string;
    order: number;
  }[];
}

export interface WorkflowActionPayload {
  action: 'approve' | 'reject' | 'start_processing' | 'complete' | 'cancel';
  remarks?: string;
  actionBy?: number;
}

export const workflowService = {
  /**
   * Get workflow steps for a return request
   * @param requestId - The ID of the return request
   * @returns Promise<WorkflowStep[]> - Array of workflow steps
   */
  async getWorkflowSteps(requestId: number): Promise<WorkflowStep[]> {
    const response = await axioConfig.get(`/workflow/steps/${requestId}`);
    return response.data.data;
  },

  /**
   * Execute workflow action
   * @param requestId - The ID of the return request
   * @param payload - The workflow action payload
   * @returns Promise<{returnRequest: any; workflowSteps: WorkflowStep[]; message: string}> - Updated return request, workflow steps, and message
   */
  async executeWorkflowAction(
    requestId: number,
    payload: WorkflowActionPayload
  ): Promise<{
    returnRequest: any;
    workflowSteps: WorkflowStep[];
    message: string;
  }> {
    const response = await axioConfig.post(
      `/workflow/action/${requestId}`,
      payload
    );
    return {
      ...response.data.data,
      message: response.data.message,
    };
  },

  /**
   * Get workflow templates
   * @returns Promise<WorkflowTemplate[]> - Array of workflow templates
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const response = await axioConfig.get(`/workflow/templates`);
    return response.data.data;
  },

  /**
   * Apply workflow template to a return request
   * @param requestId - The ID of the return request
   * @param templateId - The ID of the template to apply
   * @returns Promise<{workflowSteps: WorkflowStep[]; message: string}> - Array of workflow steps created from template and message
   */
  async applyWorkflowTemplate(
    requestId: number,
    templateId: string
  ): Promise<{ workflowSteps: WorkflowStep[]; message: string }> {
    const response = await axioConfig.post(`/workflow/template/${requestId}`, {
      templateId,
    });
    return {
      workflowSteps: response.data.data,
      message: response.data.message,
    };
  },

  /**
   * Execute full workflow flow - automatically progress through all steps
   * @param requestId - The ID of the return request
   * @param templateId - The template ID to use (default: 'standard_return')
   * @returns Promise<{workflowSteps: WorkflowStep[]; message: string}> - Array of completed workflow steps and message
   */
  async executeFullWorkflowFlow(
    requestId: number,
    templateId: string = 'standard_return'
  ): Promise<{ workflowSteps: WorkflowStep[]; message: string }> {
    const response = await axioConfig.post(`/workflow/full-flow/${requestId}`, {
      templateId,
    });
    return {
      workflowSteps: response.data.data,
      message: response.data.message,
    };
  },

  /**
   * Reject return request with reason
   * @param requestId - The ID of the return request
   * @param rejectionReason - The reason for rejection
   * @returns Promise<{rejectionStep: WorkflowStep; message: string}> - Rejection workflow step and message
   */
  async rejectReturnRequest(
    requestId: number,
    rejectionReason: string
  ): Promise<{ rejectionStep: WorkflowStep; message: string }> {
    const response = await axioConfig.post(`/workflow/reject/${requestId}`, {
      rejectionReason,
    });
    return {
      rejectionStep: response.data.data,
      message: response.data.message,
    };
  },

  /**
   * Execute next workflow step automatically
   * @param requestId - The ID of the return request
   * @returns Promise<{nextStep: WorkflowStep | null; message: string}> - Next executed step or null if all completed, and message
   */
  async executeNextWorkflowStep(
    requestId: number
  ): Promise<{ nextStep: WorkflowStep | null; message: string }> {
    const response = await axioConfig.post(`/workflow/next-step/${requestId}`);
    return {
      nextStep: response.data.data,
      message: response.data.message,
    };
  },
};
