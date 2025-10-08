import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface AssetMaster {
  id: number;
  asset_type_id: number;
  serial_number: string;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
  current_location?: string | null;
  current_status?: string | null;
  assigned_to?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_master_image?: AssetImage[];
  asset_maintenance_master?: AssetMaintenance[];
  asset_movements_master?: AssetMovement[];
  asset_master_warranty_claims?: AssetWarrantyClaim[];
  asset_master_asset_types?: AssetType;
}

export interface AssetImage {
  id: number;
  asset_id: number;
  image_url: string;
  caption?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface AssetMaintenance {
  id: number;
  asset_id: number;
  maintenance_type?: string | null;
  maintenance_date?: string | null;
  description?: string | null;
  cost?: number | null;
  performed_by?: string | null;
  next_maintenance_date?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface AssetMovement {
  id: number;
  asset_id: number;
  from_location?: string | null;
  to_location?: string | null;
  movement_date?: string | null;
  moved_by?: string | null;
  reason?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface AssetWarrantyClaim {
  id: number;
  asset_id: number;
  claim_date?: string | null;
  issue_description?: string | null;
  claim_status?: string | null;
  resolution_date?: string | null;
  resolution_description?: string | null;
  claim_amount?: number | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface AssetType {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface CreateAssetMasterPayload {
  asset_type_id: number;
  serial_number: string;
  purchase_date?: string;
  warranty_expiry?: string;
  current_location?: string;
  current_status?: string;
  assigned_to?: string;
  is_active?: string;
}

export interface UpdateAssetMasterPayload {
  asset_type_id?: number;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  current_location?: string;
  current_status?: string;
  assigned_to?: string;
  is_active?: string;
}

export interface AssetMasterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AssetMasterStats {
  total_assets: number;
  active_assets: number;
  inactive_assets: number;
  assets_this_month: number;
}

export const fetchAssetMaster = async (
  params?: AssetMasterQueryParams
): Promise<ApiResponse<AssetMaster[]>> => {
  try {
    const response = await axiosInstance.get('/asset-master', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset master'
    );
  }
};

export const fetchAssetMasterById = async (
  id: number
): Promise<AssetMaster> => {
  try {
    const response = await axiosInstance.get(`/asset-master/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching asset master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset master'
    );
  }
};

export const createAssetMaster = async (
  data: CreateAssetMasterPayload,
  images?: File[]
): Promise<AssetMaster> => {
  try {
    const formData = new FormData();

    // Add asset data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('assetImages', image);
      });

      // Add image metadata
      const imageMetadata = images.map((_, idx) => ({
        caption: `Asset Image ${idx + 1}`,
      }));
      formData.append('assetImages', JSON.stringify(imageMetadata));
    }

    const response = await axiosInstance.post('/asset-master', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating asset master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset master'
    );
  }
};

export const updateAssetMaster = async (
  id: number,
  data: UpdateAssetMasterPayload
): Promise<AssetMaster> => {
  try {
    const response = await axiosInstance.put(`/asset-master/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating asset master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset master'
    );
  }
};

export const deleteAssetMaster = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/asset-master/${id}`);
  } catch (error: any) {
    console.error('Error deleting asset master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset master'
    );
  }
};
