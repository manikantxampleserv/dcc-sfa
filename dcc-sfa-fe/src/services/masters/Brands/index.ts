/**
 * @fileoverview Brands Service with API Integration
 * @description Provides Brands CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Brand {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  logo?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

interface ManageBrandPayload {
  name: string;
  description?: string;
  is_active?: string;
}

interface UpdateBrandPayload {
  name?: string;
  description?: string;
  is_active?: string;
}

interface GetBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetch Brands with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Brands data
 */
export const fetchBrands = async (
  params?: GetBrandsParams
): Promise<ApiResponse<Brand[]>> => {
  try {
    const response = await api.get('/brands', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch brands');
  }
};

/**
 * Fetch Brand by ID
 * @param id - Brand ID
 * @returns Promise resolving to Brand data
 */
export const fetchBrandById = async (id: number): Promise<Brand> => {
  try {
    const response = await api.get(`/brands/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching brand:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch brand');
  }
};

/**
 * Create a new Brand
 * @param data - Brand data
 * @returns Promise resolving to created Brand
 */
export const createBrand = async (data: ManageBrandPayload): Promise<Brand> => {
  try {
    const response = await api.post('/brands', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating brand:', error);
    throw new Error(error.response?.data?.message || 'Failed to create brand');
  }
};

/**
 * Update an existing Brand
 * @param id - Brand ID
 * @param data - Updated Brand data
 * @returns Promise resolving to updated Brand
 */
export const updateBrand = async (
  id: number,
  data: UpdateBrandPayload
): Promise<Brand> => {
  try {
    const response = await api.put(`/brands/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating brand:', error);
    throw new Error(error.response?.data?.message || 'Failed to update brand');
  }
};

/**
 * Delete a Brand (soft delete)
 * @param id - Brand ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteBrand = async (id: number): Promise<void> => {
  try {
    await api.delete(`/brands/${id}`);
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete brand');
  }
};

// Export types
export type { Brand, ManageBrandPayload, UpdateBrandPayload, GetBrandsParams };
