import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface SparePartItem {
  id?: number;
  part_name?: string;
  name?: string;
  quantity?: number;
  unit_cost?: number;
  cost?: number;
}

export interface MaintenanceActivityLog {
  id: number;
  event_type: string;
  title: string;
  description?: string | null;
  status?: string | null;
  metadata?: any;
  created_at: string;
  asset_activities_user?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface AssetMaintenance {
  id: number;
  job_number?: string | null;
  asset_id: number;
  maintenance_date: string;
  issue_reported?: string | null;
  action_taken?: string | null;
  technician_id?: number | null;
  cost?: number | null;
  labour_cost?: number | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  repair_location?: string | null;
  source_type?: string | null;
  source_id?: number | null;
  source_code?: string | null;
  secondary_source_code?: string | null;
  status_after_repair?: string | null;
  repaired_date?: string | null;
  closed_date?: string | null;
  escalated_to?: string | null;
  warranty_claim?: string | null;
  repair_photos?: any;
  remarks?: string | null;
  is_active: string;
  spares?: SparePartItem[] | null;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  is_overdue?: boolean;
  replace_review_needed?: boolean;
  repairs_last_90_days?: number;
  activities?: MaintenanceActivityLog[];
  customer?: {
    id: number;
    name: string;
    code?: string | null;
    address?: string | null;
  } | null;
  asset_maintenance_master?: {
    id: number;
    name: string;
    serial_number: string;
    barcode?: string | null;
    asset_code?: string | null;
    current_location?: string | null;
    warranty_period_months?: number | null;
    createdate?: string | null;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
    asset_master_outlet?: {
      id: number;
      name: string;
      code?: string | null;
      address?: string | null;
    } | null;
    asset_master_depot?: {
      id: number;
      name: string;
    } | null;
    cooler_asset_master?: Array<{
      coolers_customers?: {
        id: number;
        name: string;
        code?: string | null;
        address?: string | null;
      } | null;
    }>;
    customer_assets?: Array<{
      id: number;
      customer_id: number;
      customer_customer_assets?: {
        id: number;
        name: string;
        code?: string | null;
        address?: string | null;
      } | null;
    }>;
  } | null;
  asset_maintenance_technician?: {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
    sap_code?: string | null;
    profile_image: string;
  } | null;
}

export interface CreateAssetMaintenancePayload {
  asset_id: number;
  maintenance_date: string;
  issue_reported?: string;
  action_taken?: string;
  technician_id?: number;
  priority?: string;
  repair_location?: string;
  source_type?: string;
  source_code?: string;
  due_date?: string;
  cost?: number;
  labour_cost?: number;
  remarks?: string;
  is_active?: string;
  spares?: SparePartItem[];
}

export interface UpdateAssetMaintenancePayload {
  asset_id?: number;
  maintenance_date?: string;
  issue_reported?: string;
  action_taken?: string;
  technician_id?: number;
  priority?: string;
  repair_location?: string;
  due_date?: string;
  cost?: number;
  labour_cost?: number;
  remarks?: string;
  is_active?: string;
  spares?: SparePartItem[];
}

export interface AssignTechnicianPayload {
  technician_id: number;
  priority?: string;
  due_date?: string;
}

export interface SubmitMobileRepairPayload {
  action_taken: string;
  status_after_repair?: string;
  repair_photos?: string[];
}

export interface CloseMaintenancePayload {
  labour_cost?: number;
  spares?: Array<{
    name: string;
    quantity: number;
    unit_cost: number;
  }>;
  remarks?: string;
}

export interface AssetMaintenanceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  overdue_only?: boolean;
  technician_id?: number | string;
}

export interface AssetMaintenanceStats {
  total_records: number;
  active_records: number;
  inactive_records: number;
  this_month_records: number;
  new_complaints?: number;
  open_jobs?: number;
  overdue_jobs?: number;
  closed_jobs?: number;
}

/**
 * Fetches paginated asset maintenance jobs.
 *
 * @param {AssetMaintenanceQueryParams} params Search and filter parameters.
 * @returns {Promise<ApiResponse<AssetMaintenance[]>>} Paginated result.
 */
export const fetchAssetMaintenances = async (
  params?: AssetMaintenanceQueryParams
): Promise<ApiResponse<AssetMaintenance[]>> => {
  try {
    const response = await axiosInstance.get('/asset-maintenance', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset maintenances:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset maintenances'
    );
  }
};

/**
 * Fetches a single maintenance job by ID with replace review check.
 *
 * @param {number} id Maintenance record ID.
 * @returns {Promise<AssetMaintenance>} Single maintenance record.
 */
export const fetchAssetMaintenanceById = async (
  id: number
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.get(`/asset-maintenance/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching asset maintenance:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset maintenance'
    );
  }
};

/**
 * Creates a new asset maintenance job.
 *
 * @param {CreateAssetMaintenancePayload} data Job payload.
 * @returns {Promise<AssetMaintenance>} Created maintenance record.
 */
export const createAssetMaintenance = async (
  data: CreateAssetMaintenancePayload
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.post('/asset-maintenance', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating asset maintenance:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset maintenance'
    );
  }
};

/**
 * Updates an asset maintenance job.
 *
 * @param {number} id Record ID.
 * @param {UpdateAssetMaintenancePayload} data Update fields.
 * @returns {Promise<AssetMaintenance>} Updated maintenance record.
 */
export const updateAssetMaintenance = async (
  id: number,
  data: UpdateAssetMaintenancePayload
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.put(`/asset-maintenance/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating asset maintenance:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset maintenance'
    );
  }
};

/**
 * Assigns technician, priority, and due date to a maintenance job.
 *
 * @param {number} id Job ID.
 * @param {AssignTechnicianPayload} data Assignment payload.
 * @returns {Promise<AssetMaintenance>} Assigned record.
 */
export const assignMaintenanceTechnician = async (
  id: number,
  data: AssignTechnicianPayload
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.post(
      `/asset-maintenance/${id}/assign`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error assigning technician:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to assign technician'
    );
  }
};

/**
 * Submits technician mobile repair results.
 *
 * @param {number} id Job ID.
 * @param {SubmitMobileRepairPayload} data Repair action and status.
 * @returns {Promise<AssetMaintenance>} Repaired record.
 */
export const submitMobileRepair = async (
  id: number,
  data: SubmitMobileRepairPayload
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.post(
      `/asset-maintenance/${id}/repair`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error submitting mobile repair:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to submit mobile repair'
    );
  }
};

/**
 * Closes a maintenance job with finalized spares and labour cost.
 *
 * @param {number} id Job ID.
 * @param {CloseMaintenancePayload} data Final pricing and remarks.
 * @returns {Promise<AssetMaintenance>} Closed record.
 */
export const closeMaintenanceJob = async (
  id: number,
  data: CloseMaintenancePayload
): Promise<AssetMaintenance> => {
  try {
    const response = await axiosInstance.post(
      `/asset-maintenance/${id}/close`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error closing maintenance job:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to close maintenance job'
    );
  }
};

/**
 * Deletes a maintenance record.
 *
 * @param {number} id Maintenance ID.
 * @returns {Promise<void>}
 */
export const deleteAssetMaintenance = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/asset-maintenance/${id}`);
  } catch (error: any) {
    console.error('Error deleting asset maintenance:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset maintenance'
    );
  }
};

/**
 * Fetches dashboard KPI summary statistics for asset maintenance.
 *
 * @returns {Promise<any>} KPI statistics.
 */
export const fetchMaintenanceDashboardStats = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      '/asset-maintenance/stats/dashboard'
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching maintenance stats:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch maintenance stats'
    );
  }
};
