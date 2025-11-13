import axioConfig from '../../configs/axio.config';

export interface ApprovalWorkflowSetup {
  id: number;
  request_type: string;
  sequence: number;
  approver_id: number;
  zone_id: number | null;
  depot_id: number | null;
  header_approval_type?: string;
  header_role_id?: number | null;
  remarks?: string;
  is_active: string;
  createdate: string | null;
  createdby: number | null;
  updatedate: string | null;
  updatedby: number | null;
  log_inst: number | null;
  approval_work_flow_approver?: {
    id: number;
    name: string;
    email: string;
  };
  approval_work_flow_zone?: {
    id: number;
    name: string;
  } | null;
  approval_work_flow_depot?: {
    id: number;
    name: string;
  } | null;
}

export interface ApprovalWorkflowSetupGrouped {
  request_type: string;
  zones: Array<{
    id: number | null;
    name: string;
    is_global: boolean;
  }>;
  depots: Array<{
    id: number | null;
    name: string;
    is_global: boolean;
  }>;
  no_of_approvers: number;
  is_active: string;
  request_approval_request: ApprovalWorkflowSetup[];
}

export interface CreateApprovalWorkflowSetupPayload {
  request_type: string;
  sequence: number;
  approver_id: number;
  zone_id?: number | null;
  depot_id?: number | null;
  header_approval_type?: string;
  header_role_id?: number | null;
  remarks?: string;
  is_active?: string;
}

export interface ApprovalWorkflowSetupFilters {
  page?: number;
  size?: number;
  search?: string;
  request_type?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApprovalWorkflowSetupResponse {
  data: ApprovalWorkflowSetupGrouped[];
  pagination: {
    currentPage: number;
    size: number;
    totalPages: number;
    totalCount: number;
  };
  summary: {
    total_workflows: number;
  };
}

export const approvalWorkflowSetupService = {
  /**
   * Get all approval workflow setups
   * @param filters - Optional filters for workflows
   * @returns Promise<ApprovalWorkflowSetupResponse>
   */
  async getApprovalWorkflowSetups(
    filters?: ApprovalWorkflowSetupFilters
  ): Promise<ApprovalWorkflowSetupResponse> {
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.size) params.size = filters.size;
    if (filters?.search) params.search = filters.search;
    if (filters?.request_type) params.request_type = filters.request_type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await axioConfig.get('/approval-workflow-setup', {
      params,
    });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        currentPage: 1,
        size: 10,
        totalPages: 0,
        totalCount: 0,
      },
      summary: response.data.summary || {
        total_workflows: 0,
      },
    };
  },

  /**
   * Get approval workflow setup by ID
   * @param id - The ID of the workflow setup
   * @returns Promise<ApprovalWorkflowSetup>
   */
  async getApprovalWorkflowSetupById(
    id: number
  ): Promise<ApprovalWorkflowSetup> {
    const response = await axioConfig.get(`/approval-workflow-setup/${id}`);
    return response.data.data;
  },

  /**
   * Create approval workflow setup(s)
   * @param data - Single or array of workflow setup data
   * @returns Promise<ApprovalWorkflowSetup[]>
   */
  async createApprovalWorkflowSetup(
    data:
      | CreateApprovalWorkflowSetupPayload
      | CreateApprovalWorkflowSetupPayload[]
  ): Promise<ApprovalWorkflowSetup[]> {
    const response = await axioConfig.post('/approval-workflow-setup', data);
    return response.data.data;
  },

  /**
   * Update approval workflow setup
   * @param id - The ID of the workflow setup
   * @param data - Updated workflow setup data
   * @returns Promise<ApprovalWorkflowSetup>
   */
  async updateApprovalWorkflowSetup(
    id: number,
    data: Partial<CreateApprovalWorkflowSetupPayload>
  ): Promise<ApprovalWorkflowSetup> {
    const response = await axioConfig.put(
      `/approval-workflow-setup/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete approval workflow setup by request type
   * @param requestType - The request type to delete workflows for
   * @returns Promise<void>
   */
  async deleteApprovalWorkflowSetupByRequestType(
    requestType: string
  ): Promise<void> {
    await axioConfig.delete(`/approval-workflow-setup/${requestType}`);
  },

  /**
   * Delete multiple approval workflow setups
   * @param ids - Array of workflow setup IDs to delete
   * @returns Promise<void>
   */
  async deleteApprovalWorkflowSetups(ids: number[]): Promise<void> {
    await axioConfig.post('/approval-workflow-setup/delete-multiple', { ids });
  },

  /**
   * Get approval workflow setups by request type
   * @param requestType - The request type
   * @param zoneId - Optional zone ID
   * @param depotId - Optional depot ID
   * @returns Promise<ApprovalWorkflowSetup[]>
   */
  async getApprovalWorkflowSetupsByRequest(
    requestType: string,
    zoneId?: number,
    depotId?: number
  ): Promise<ApprovalWorkflowSetup[]> {
    const params: any = { request_type: requestType };
    if (zoneId) params.zone_id = zoneId;
    if (depotId) params.depot_id = depotId;

    const response = await axioConfig.get('/approval-setup/get-all-workflow', {
      params,
    });
    return response.data.data || [];
  },

  /**
   * Get zones with workflows for a request type
   * @param requestType - The request type
   * @returns Promise<Array<{ zone_id: number | null; zone_name: string; is_global: boolean }>>
   */
  async getZonesWithWorkflows(
    requestType: string
  ): Promise<
    Array<{ zone_id: number | null; zone_name: string; is_global: boolean }>
  > {
    const response = await axioConfig.get(
      `/zones-with-workflow-setup/${requestType}`
    );
    return response.data.data || [];
  },

  /**
   * Get depots with workflows for a request type
   * @param requestType - The request type
   * @returns Promise<Array<{ depot_id: number | null; depot_name: string; is_global: boolean }>>
   */
  async getDepotsWithWorkflows(
    requestType: string
  ): Promise<
    Array<{ depot_id: number | null; depot_name: string; is_global: boolean }>
  > {
    const response = await axioConfig.get(
      `/depots-with-workflow-setup/${requestType}`
    );
    return response.data.data || [];
  },
};
