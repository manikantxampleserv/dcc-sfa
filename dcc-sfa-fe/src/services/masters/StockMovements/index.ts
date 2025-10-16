/**
 * @fileoverview Stock Movements Service with API Integration
 * @description Provides stock movements CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface StockMovement {
  id: number;
  product_id: number;
  batch_id?: number | null;
  serial_id?: number | null;
  movement_type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  from_location_id?: number | null;
  to_location_id?: number | null;
  quantity: number;
  movement_date?: string | null;
  remarks?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  van_inventory_id?: number | null;

  product?: {
    id: number;
    name: string;
    code: string;
  } | null;

  from_location?: {
    id: number;
    name: string;
  } | null;

  to_location?: {
    id: number;
    name: string;
  } | null;

  van_inventory?: {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
  } | null;
}

interface ManageStockMovementPayload {
  id?: number;
  product_id: number;
  batch_id?: number | null;
  serial_id?: number | null;
  movement_type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  from_location_id?: number | null;
  to_location_id?: number | null;
  quantity: number;
  movement_date?: string | null;
  remarks?: string | null;
  van_inventory_id?: number | null;
  is_active?: string;
}

interface UpdateStockMovementPayload {
  product_id?: number;
  batch_id?: number | null;
  serial_id?: number | null;
  movement_type?: string;
  reference_type?: string | null;
  reference_id?: number | null;
  from_location_id?: number | null;
  to_location_id?: number | null;
  quantity?: number;
  movement_date?: string | null;
  remarks?: string | null;
  van_inventory_id?: number | null;
  is_active?: string;
}

interface GetStockMovementsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  movement_type?: string;
  product_id?: number;
  from_location_id?: number;
  to_location_id?: number;
  van_inventory_id?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface StockMovementStats {
  total_stock_movements: number;
  active_stock_movements: number;
  inactive_stock_movements: number;
  stock_movements_this_month: number;
  total_in_movements: number;
  total_out_movements: number;
  total_transfer_movements: number;
}

/**
 * Fetch stock movements with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<StockMovement[]>>
 */
export const fetchStockMovements = async (
  params?: GetStockMovementsParams
): Promise<ApiResponse<StockMovement[]>> => {
  try {
    const response = await api.get('/stock-movements', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch stock movements'
    );
  }
};

/**
 * Fetch stock movement by ID
 * @param id - Stock Movement ID
 * @returns Promise<ApiResponse<StockMovement>>
 */
export const fetchStockMovementById = async (
  id: number
): Promise<ApiResponse<StockMovement>> => {
  try {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch stock movement'
    );
  }
};

/**
 * Create or update stock movement (upsert)
 * @param movementData - Stock Movement payload
 * @returns Promise<ApiResponse<StockMovement>>
 */
export const upsertStockMovement = async (
  movementData: ManageStockMovementPayload
): Promise<ApiResponse<StockMovement>> => {
  try {
    const response = await api.post('/stock-movements', movementData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to save stock movement'
    );
  }
};

/**
 * Update stock movement
 * @param id - Stock Movement ID
 * @param movementData - Stock Movement payload
 * @returns Promise<ApiResponse<StockMovement>>
 */
export const updateStockMovement = async (
  id: number,
  movementData: UpdateStockMovementPayload
): Promise<ApiResponse<StockMovement>> => {
  try {
    const response = await api.put(`/stock-movements/${id}`, movementData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to update stock movement'
    );
  }
};

/**
 * Delete stock movement
 * @param id - Stock Movement ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteStockMovement = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/stock-movements/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete stock movement'
    );
  }
};

export type {
  GetStockMovementsParams,
  ManageStockMovementPayload,
  UpdateStockMovementPayload,
  PaginationMeta,
  StockMovement,
  StockMovementStats,
};
