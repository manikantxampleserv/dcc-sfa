/**
 * @fileoverview Asset Types Service with API Integration
 * @description Provides asset types CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface AssetType {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageAssetTypePayload {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateAssetTypePayload {
  name?: string;
  description?: string;
  category?: string;
  brand?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetAssetTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  category?: string;
  brand?: string;
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
 * Fetch asset types with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<AssetType[]>>
 */
export const fetchAssetTypes = async (
  params?: GetAssetTypesParams
): Promise<ApiResponse<AssetType[]>> => {
  try {
    const response = await api.get('/asset-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset types'
    );
  }
};

/**
 * Fetch asset type by ID
 * @param id - Asset Type ID
 * @returns Promise<ApiResponse<AssetType>>
 */
export const fetchAssetTypeById = async (
  id: number
): Promise<ApiResponse<AssetType>> => {
  try {
    const response = await api.get(`/asset-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset type'
    );
  }
};

/**
 * Create new asset type
 * @param assetTypeData - Asset type creation payload
 * @returns Promise<ApiResponse<AssetType>>
 */
export const createAssetType = async (
  assetTypeData: ManageAssetTypePayload
): Promise<ApiResponse<AssetType>> => {
  try {
    const response = await api.post('/asset-types', assetTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating asset type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset type'
    );
  }
};

/**
 * Update existing asset type
 * @param id - Asset Type ID
 * @param assetTypeData - Asset type update payload
 * @returns Promise<ApiResponse<AssetType>>
 */
export const updateAssetType = async (
  id: number,
  assetTypeData: UpdateAssetTypePayload
): Promise<ApiResponse<AssetType>> => {
  try {
    const response = await api.put(`/asset-types/${id}`, assetTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating asset type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset type'
    );
  }
};

/**
 * Delete asset type
 * @param id - Asset Type ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteAssetType = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/asset-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting asset type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset type'
    );
  }
};

export type {
  GetAssetTypesParams,
  ManageAssetTypePayload,
  UpdateAssetTypePayload,
  PaginationMeta,
  AssetType,
};
