import axioConfig from '../../configs/axio.config';

export interface ApprovalWorkflow {
  id: number;
  workflow_type: string;
  reference_type: string;
  reference_number: string;
  requested_by: number;
  request_date: string | null;
  priority: string | null;
  status: string | null;
  current_step: number | null;
  total_steps: number;
  request_data?: any;
  final_approved_by: number | null;
  final_approved_at: string | null;
  rejected_by: number | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  createdate: string | null;
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
    processed_at: string | null;
    assigned_role: string | null;
    assigned_user_id: number | null;
    is_required: boolean | null;
    due_date: string | null;
    users_workflow_steps_processed_byTousers?: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
}

export interface ApprovalWorkflowFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  workflow_type?: string;
}

export interface ApprovalWorkflowsResponse {
  data: ApprovalWorkflow[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export const approvalWorkflowsService = {
  /**
   * Get all approval workflows
   * @param filters - Optional filters for workflows
   * @returns Promise<ApprovalWorkflowsResponse> - Array of workflows with pagination
   */
  async getApprovalWorkflows(
    filters?: ApprovalWorkflowFilters
  ): Promise<ApprovalWorkflowsResponse> {
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.workflow_type) params.workflow_type = filters.workflow_type;

    const response = await axioConfig.get('/approval-workflows', { params });
    return {
      data: response.data.data || [],
      meta: response.data.pagination ||
        response.data.meta || {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          has_next: false,
          has_previous: false,
        },
    };
  },

  /**
   * Get approval workflow by ID
   * @param id - The ID of the workflow
   * @returns Promise<ApprovalWorkflow> - Workflow object
   */
  async getApprovalWorkflowById(id: number): Promise<ApprovalWorkflow> {
    const response = await axioConfig.get(`/approval-workflows/${id}`);
    return response.data.data;
  },

  /**
   * Approve a workflow step
   * @param id - The ID of the workflow
   * @param stepId - Optional step ID (uses current step if not provided)
   * @param comments - Optional comments
   * @returns Promise<ApprovalWorkflow> - Updated workflow
   */
  async approveWorkflowStep(
    id: number,
    stepId?: number,
    comments?: string
  ): Promise<ApprovalWorkflow> {
    const response = await axioConfig.post(
      `/approval-workflows/${id}/approve`,
      {
        step_id: stepId,
        comments,
      }
    );
    return response.data.data;
  },

  /**
   * Reject a workflow step
   * @param id - The ID of the workflow
   * @param stepId - Optional step ID (uses current step if not provided)
   * @param rejectionReason - Reason for rejection (required)
   * @returns Promise<ApprovalWorkflow> - Updated workflow
   */
  async rejectWorkflowStep(
    id: number,
    rejectionReason: string,
    stepId?: number
  ): Promise<ApprovalWorkflow> {
    const response = await axioConfig.post(`/approval-workflows/${id}/reject`, {
      step_id: stepId,
      rejection_reason: rejectionReason,
    });
    return response.data.data;
  },
};
