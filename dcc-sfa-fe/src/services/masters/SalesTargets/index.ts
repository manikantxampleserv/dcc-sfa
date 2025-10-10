/**
 * @fileoverview Sales Targets Service with API Integration
 * @description Provides Sales Targets CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface SalesTarget {
  id: number;
  sales_target_group_id: number;
  product_category_id: number;
  target_quantity: number;
  target_amount?: number | null;
  start_date: string;
  end_date: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_target_group?: {
    id: number;
    group_name: string;
    description?: string | null;
  } | null;
  product_category?: {
    id: number;
    category_name: string;
    description?: string | null;
  } | null;
}

interface ManageSalesTargetPayload {
  sales_target_group_id: number;
  product_category_id: number;
  target_quantity: number;
  target_amount?: number;
  start_date: string;
  end_date: string;
  is_active?: string;
}

interface UpdateSalesTargetPayload {
  sales_target_group_id?: number;
  product_category_id?: number;
  target_quantity?: number;
  target_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active?: string;
}

interface GetSalesTargetsParams {
  page?: number;
  limit?: number;
  search?: string;
  sales_target_group_id?: number;
  product_category_id?: number;
  is_active?: string;
}

/**
 * Fetch Sales Targets with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Sales Targets data
 */
export const fetchSalesTargets = async (
  params?: GetSalesTargetsParams
): Promise<ApiResponse<SalesTarget[]>> => {
  try {
    const response = await api.get('/sales-targets', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales targets:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales targets'
    );
  }
};

/**
 * Fetch Sales Target by ID
 * @param id - Sales Target ID
 * @returns Promise resolving to Sales Target data
 */
export const fetchSalesTargetById = async (
  id: number
): Promise<SalesTarget> => {
  try {
    const response = await api.get(`/sales-targets/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching sales target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales target'
    );
  }
};

/**
 * Create a new Sales Target
 * @param data - Sales Target data
 * @returns Promise resolving to created Sales Target
 */
export const createSalesTarget = async (
  data: ManageSalesTargetPayload
): Promise<SalesTarget> => {
  try {
    const response = await api.post('/sales-targets', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating sales target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create sales target'
    );
  }
};

/**
 * Update an existing Sales Target
 * @param id - Sales Target ID
 * @param data - Updated Sales Target data
 * @returns Promise resolving to updated Sales Target
 */
export const updateSalesTarget = async (
  id: number,
  data: UpdateSalesTargetPayload
): Promise<SalesTarget> => {
  try {
    const response = await api.put(`/sales-targets/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating sales target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update sales target'
    );
  }
};

/**
 * Delete a Sales Target (soft delete)
 * @param id - Sales Target ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteSalesTarget = async (id: number): Promise<void> => {
  try {
    await api.delete(`/sales-targets/${id}`);
  } catch (error: any) {
    console.error('Error deleting sales target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete sales target'
    );
  }
};

// Export types
export type {
  SalesTarget,
  ManageSalesTargetPayload,
  UpdateSalesTargetPayload,
  GetSalesTargetsParams,
};
