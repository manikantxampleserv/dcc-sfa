import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface AssetMovement {
  id: number;
  asset_id: number;
  from_location?: string | null;
  to_location?: string | null;
  movement_type?: string | null;
  movement_date: string;
  performed_by: number;
  notes?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_movements_master?: {
    id: number;
    name: string;
    serial_number: string;
    asset_master_asset_types?: {
      id: number;
      name: string;
    } | null;
  } | null;
  asset_movements_performed_by?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
}

export interface CreateAssetMovementPayload {
  asset_id: number;
  from_location?: string;
  to_location?: string;
  movement_type?: string;
  movement_date: string;
  performed_by: number;
  notes?: string;
  is_active?: string;
}

export interface UpdateAssetMovementPayload {
  asset_id?: number;
  from_location?: string;
  to_location?: string;
  movement_type?: string;
  movement_date?: string;
  performed_by?: number;
  notes?: string;
  is_active?: string;
}

export interface AssetMovementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AssetMovementStats {
  total_records: number;
  active_records: number;
  inactive_records: number;
  this_month_records: number;
}

export const fetchAssetMovements = async (
  params?: AssetMovementQueryParams
): Promise<ApiResponse<AssetMovement[]>> => {
  try {
    const response = await axiosInstance.get('/asset-movement', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset movements:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset movements'
    );
  }
};

export const fetchAssetMovementById = async (
  id: number
): Promise<AssetMovement> => {
  try {
    const response = await axiosInstance.get(`/asset-movement/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching asset movement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset movement'
    );
  }
};

export const createAssetMovement = async (
  data: CreateAssetMovementPayload
): Promise<AssetMovement> => {
  try {
    const response = await axiosInstance.post('/asset-movement', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating asset movement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset movement'
    );
  }
};

export const updateAssetMovement = async (
  id: number,
  data: UpdateAssetMovementPayload
): Promise<AssetMovement> => {
  try {
    const response = await axiosInstance.put(`/asset-movement/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating asset movement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset movement'
    );
  }
};

export const deleteAssetMovement = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/asset-movement/${id}`);
  } catch (error: any) {
    console.error('Error deleting asset movement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset movement'
    );
  }
};
