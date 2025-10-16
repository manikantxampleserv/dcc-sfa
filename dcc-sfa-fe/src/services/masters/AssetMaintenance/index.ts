import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface AssetMaintenance {
  id: number;
  asset_id: number;
  maintenance_date: string;
  issue_reported?: string | null;
  action_taken?: string | null;
  technician_id: number;
  cost?: number | null;
  remarks?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_maintenance_master?: {
    id: number;
    name: string;
    serial_number: string;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
  } | null;
  asset_maintenance_technician?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
}

export interface CreateAssetMaintenancePayload {
  asset_id: number;
  maintenance_date: string;
  issue_reported?: string;
  action_taken?: string;
  technician_id: number;
  cost?: number;
  remarks?: string;
  is_active?: string;
}

export interface UpdateAssetMaintenancePayload {
  asset_id?: number;
  maintenance_date?: string;
  issue_reported?: string;
  action_taken?: string;
  technician_id?: number;
  cost?: number;
  remarks?: string;
  is_active?: string;
}

export interface AssetMaintenanceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AssetMaintenanceStats {
  total_records: number;
  active_records: number;
  inactive_records: number;
  this_month_records: number;
}

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
