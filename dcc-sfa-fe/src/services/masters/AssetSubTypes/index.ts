/**
 * @fileoverview Asset Sub Types Service with API Integration
 * @description Provides asset sub types CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface AssetSubType {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  asset_type_id?: number | null;
  is_active: string;
  createdby: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageAssetSubTypePayload {
  name: string;
  description?: string;
  asset_type_id?: number;
  is_active?: string;
  createdby?: number;
}

interface UpdateAssetSubTypePayload {
  name?: string;
  description?: string;
  asset_type_id?: number;
  is_active?: string;
  updatedby?: number;
}

interface GetAssetSubTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  assetTypeId?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Fetch asset sub types with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<AssetSubType[]>>
 */
export const fetchAssetSubTypes = async (
  params?: GetAssetSubTypesParams
): Promise<ApiResponse<AssetSubType[]>> => {
  try {
    const response = await api.get('/asset-sub-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset sub types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset sub types'
    );
  }
};

/**
 * Fetch asset sub type by ID
 * @param id - Asset Sub Type ID
 * @returns Promise<ApiResponse<AssetSubType>>
 */
export const fetchAssetSubTypeById = async (
  id: number
): Promise<ApiResponse<AssetSubType>> => {
  try {
    const response = await api.get(`/asset-sub-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset sub type'
    );
  }
};

/**
 * Create new asset sub type
 * @param assetSubTypeData - Asset sub type creation payload
 * @returns Promise<ApiResponse<AssetSubType>>
 */
export const createAssetSubType = async (
  assetSubTypeData: ManageAssetSubTypePayload
): Promise<ApiResponse<AssetSubType>> => {
  try {
    const response = await api.post('/asset-sub-types', assetSubTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating asset sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset sub type'
    );
  }
};

/**
 * Update existing asset sub type
 * @param id - Asset Sub Type ID
 * @param assetSubTypeData - Asset sub type update payload
 * @returns Promise<ApiResponse<AssetSubType>>
 */
export const updateAssetSubType = async (
  id: number,
  assetSubTypeData: UpdateAssetSubTypePayload
): Promise<ApiResponse<AssetSubType>> => {
  try {
    const response = await api.put(`/asset-sub-types/${id}`, assetSubTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating asset sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset sub type'
    );
  }
};

/**
 * Delete asset sub type
 * @param id - Asset Sub Type ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteAssetSubType = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/asset-sub-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting asset sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset sub type'
    );
  }
};

export type {
  GetAssetSubTypesParams,
  ManageAssetSubTypePayload,
  UpdateAssetSubTypePayload,
  PaginationMeta,
  AssetSubType,
};
