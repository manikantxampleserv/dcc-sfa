/**
 * @fileoverview Van Inventory Service with API Integration
 * @description Provides van inventory CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface VanInventory {
  id: number;
  user_id: number;
  product_id: number;
  batch_id?: number | null;
  serial_no_id?: number | null;
  quantity?: number | null;
  reserved_quantity?: number | null;
  available_quantity?: number | null;
  last_updated?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product?: {
    id: number;
    name: string;
    code: string;
  } | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  batch?: {
    id: number;
    batch_number: string;
    quantity: number;
  } | null;
  serial_number?: {
    id: number;
    serial_number: string;
    status: string;
  } | null;
}

interface ManageVanInventoryPayload {
  user_id: number;
  product_id: number;
  batch_id?: number | null;
  serial_no_id?: number | null;
  quantity?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  is_active?: string;
  createdby?: number;
}

interface UpdateVanInventoryPayload {
  user_id?: number;
  product_id?: number;
  batch_id?: number | null;
  serial_no_id?: number | null;
  quantity?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  is_active?: string;
  updatedby?: number;
}

interface GetVanInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  user_id?: number;
  product_id?: number;
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
 * Fetch van inventory with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<VanInventory[]>>
 */
export const fetchVanInventory = async (
  params?: GetVanInventoryParams
): Promise<ApiResponse<VanInventory[]>> => {
  try {
    const response = await api.get('/van-inventory', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching van inventory:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch van inventory'
    );
  }
};

/**
 * Fetch van inventory by ID
 * @param id - Van Inventory ID
 * @returns Promise<ApiResponse<VanInventory>>
 */
export const fetchVanInventoryById = async (
  id: number
): Promise<ApiResponse<VanInventory>> => {
  try {
    const response = await api.get(`/van-inventory/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching van inventory:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch van inventory'
    );
  }
};

/**
 * Create new van inventory
 * @param vanInventoryData - Van inventory creation payload
 * @returns Promise<ApiResponse<VanInventory>>
 */
export const createVanInventory = async (
  vanInventoryData: ManageVanInventoryPayload
): Promise<ApiResponse<VanInventory>> => {
  try {
    const response = await api.post('/van-inventory', vanInventoryData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating van inventory:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create van inventory'
    );
  }
};

/**
 * Update existing van inventory
 * @param id - Van Inventory ID
 * @param vanInventoryData - Van inventory update payload
 * @returns Promise<ApiResponse<VanInventory>>
 */
export const updateVanInventory = async (
  id: number,
  vanInventoryData: UpdateVanInventoryPayload
): Promise<ApiResponse<VanInventory>> => {
  try {
    const response = await api.put(`/van-inventory/${id}`, vanInventoryData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating van inventory:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update van inventory'
    );
  }
};

/**
 * Delete van inventory
 * @param id - Van Inventory ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteVanInventory = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/van-inventory/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting van inventory:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete van inventory'
    );
  }
};

export type {
  GetVanInventoryParams,
  ManageVanInventoryPayload,
  UpdateVanInventoryPayload,
  PaginationMeta,
  VanInventory,
};
