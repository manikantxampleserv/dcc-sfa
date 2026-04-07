/**
 * @fileoverview Asset Brands Service with API Integration
 * @description Provides asset brands CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface AssetBrand {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: string;
  createdby: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  asset_count?: number;
}

interface ManageAssetBrandPayload {
  name: string;
  code?: string;
  description?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateAssetBrandPayload {
  name?: string;
  code?: string;
  description?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetAssetBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

/**
 * Fetch asset brands with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<AssetBrand[]>>
 */
export const fetchAssetBrands = async (
  params?: GetAssetBrandsParams
): Promise<ApiResponse<AssetBrand[]>> => {
  try {
    const response = await api.get('/asset-master-brands', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset brands:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset brands'
    );
  }
};

/**
 * Fetch asset brand by ID
 * @param id - Asset Brand ID
 * @returns Promise<ApiResponse<AssetBrand>>
 */
export const fetchAssetBrandById = async (
  id: number
): Promise<ApiResponse<AssetBrand>> => {
  try {
    const response = await api.get(`/asset-master-brands/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching asset brand:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch asset brand'
    );
  }
};

/**
 * Create new asset brand
 * @param assetBrandData - Asset brand creation payload
 * @returns Promise<ApiResponse<AssetBrand>>
 */
export const createAssetBrand = async (
  assetBrandData: ManageAssetBrandPayload
): Promise<ApiResponse<AssetBrand>> => {
  try {
    const response = await api.post('/asset-master-brands', assetBrandData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating asset brand:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create asset brand'
    );
  }
};

/**
 * Update existing asset brand
 * @param id - Asset Brand ID
 * @param assetBrandData - Asset brand update payload
 * @returns Promise<ApiResponse<AssetBrand>>
 */
export const updateAssetBrand = async (
  id: number,
  assetBrandData: UpdateAssetBrandPayload
): Promise<ApiResponse<AssetBrand>> => {
  try {
    const response = await api.put(`/asset-master-brands/${id}`, assetBrandData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating asset brand:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update asset brand'
    );
  }
};

/**
 * Delete asset brand
 * @param id - Asset Brand ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteAssetBrand = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/asset-master-brands/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting asset brand:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete asset brand'
    );
  }
};

export type {
  GetAssetBrandsParams,
  ManageAssetBrandPayload,
  UpdateAssetBrandPayload,
  AssetBrand,
};
