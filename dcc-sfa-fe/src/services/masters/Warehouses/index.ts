/**
 * @fileoverview Warehouses Service with API Integration
 * @description Provides warehouses CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Warehouse {
  id: number;
  name: string;
  type?: string | null;
  location?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageWarehousePayload {
  name: string;
  type?: string;
  location?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateWarehousePayload {
  name?: string;
  type?: string;
  location?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetWarehousesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  type?: string;
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
 * Fetch warehouses with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Warehouse[]>>
 */
export const fetchWarehouses = async (
  params?: GetWarehousesParams
): Promise<ApiResponse<Warehouse[]>> => {
  try {
    const response = await api.get('/warehouses', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch warehouses'
    );
  }
};

/**
 * Fetch warehouse by ID
 * @param id - Warehouse ID
 * @returns Promise<ApiResponse<Warehouse>>
 */
export const fetchWarehouseById = async (
  id: number
): Promise<ApiResponse<Warehouse>> => {
  try {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouse:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch warehouse'
    );
  }
};

/**
 * Create new warehouse
 * @param warehouseData - Warehouse creation payload
 * @returns Promise<ApiResponse<Warehouse>>
 */
export const createWarehouse = async (
  warehouseData: ManageWarehousePayload
): Promise<ApiResponse<Warehouse>> => {
  try {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create warehouse'
    );
  }
};

/**
 * Update existing warehouse
 * @param id - Warehouse ID
 * @param warehouseData - Warehouse update payload
 * @returns Promise<ApiResponse<Warehouse>>
 */
export const updateWarehouse = async (
  id: number,
  warehouseData: UpdateWarehousePayload
): Promise<ApiResponse<Warehouse>> => {
  try {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating warehouse:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update warehouse'
    );
  }
};

/**
 * Delete warehouse
 * @param id - Warehouse ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteWarehouse = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete warehouse'
    );
  }
};

export type {
  GetWarehousesParams,
  ManageWarehousePayload,
  UpdateWarehousePayload,
  PaginationMeta,
  Warehouse,
};
