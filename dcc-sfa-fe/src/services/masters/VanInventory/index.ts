/**
 * @fileoverview Van Inventory Service with API Integration
 * @description Provides van inventory CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface VanInventoryItem {
  id: number;
  parent_id: number;
  product_id: number;
  product_name?: string | null;
  quantity: number;
  unit_price: string;
  discount_amount?: string | null;
  tax_amount?: string | null;
  total_amount?: string | null;
  notes?: string | null;
  batch_lot_id?: number | null;
  batch_number?: string | null;
  lot_number?: string | null;
  remaining_quantity?: number | null;
  total_quantity?: number | null;
  product_remaining_quantity?: number | null;
  batch_total_remaining_quantity?: number | null;
  unit?: string | null;
  expiry_date?: string | null;
}

interface VanInventory {
  id: number;
  user_id: number;
  status: string;
  loading_type: string;
  document_date?: string | null;
  last_updated?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  vehicle_id?: number | null;
  location_type?: string | null;
  location_id?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  vehicle?: {
    id: number;
    vehicle_number: string;
    type: string;
  } | null;
  items?: VanInventoryItem[] | null;
}

interface VanInventoryItemPayload {
  product_id: number;
  product_name?: string | null;
  quantity: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string | null;
  id?: number;
}

interface ManageVanInventoryPayload {
  id?: number;
  user_id: number;
  loading_type: string;
  status: string;
  document_date?: string;
  vehicle_id?: number | null;
  location_type?: string;
  location_id?: number | null;
  is_active?: string;
  van_inventory_items?: VanInventoryItemPayload[];
  inventoryItems?: VanInventoryItemPayload[];
}

interface UpdateVanInventoryPayload {
  user_id?: number;
  loading_type?: string;
  status?: string;
  document_date?: string;
  vehicle_id?: number | null;
  location_type?: string;
  location_id?: number | null;
  is_active?: string;
  van_inventory_items?: VanInventoryItemPayload[];
  inventoryItems?: VanInventoryItemPayload[];
}

interface GetVanInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  user_id?: number;
  product_id?: number;
  vehicle_id?: number;
  location_type?: string;
  location_id?: number;
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
    const response = await api.post(`/van-inventory`, {
      id,
      ...vanInventoryData,
    });
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

// Product Batches Interface
export interface ProductBatch {
  product_batch_id: number;
  product_batch_quantity: number;
  product_batch_created_date: string;
  product_batch_created_by: string;
  product_batch_updated_date: string;
  product_batch_updated_by: string;
  product_batch_is_active: string;

  batch_lot_id: number;
  batch_number: string;
  lot_number?: string | null;
  manufacturing_date: string;
  expiry_date: string;
  batch_total_quantity: number;
  batch_remaining_quantity: number;

  supplier_name?: string | null;
  purchase_price?: number | null;
  quality_grade?: string | null;
  storage_location?: string | null;

  days_until_expiry: number;
  is_expired: boolean;
  is_expiring_soon: boolean;
  availability_status: string;
}

export interface ProductBatchesResponse {
  product: {
    id: number;
    name: string;
    code: string;
  };
  batches: ProductBatch[];
  stats: {
    total_batches: number;
    available_batches: number;
    expiring_soon_batches: number;
    expired_batches: number;
    out_of_stock_batches: number;
    total_available_quantity: number;
    total_product_batch_quantity: number;
  };
}

// Get Product Batches Function
export const getProductBatches = async (
  productId: number,
  options?: {
    loading_type?: 'L' | 'U';
    include_expired?: boolean;
    sort_by?:
      | 'expiry_date'
      | 'remaining_quantity'
      | 'batch_number'
      | 'manufacturing_date';
  }
): Promise<ApiResponse<ProductBatchesResponse>> => {
  try {
    const params = new URLSearchParams();

    if (options?.loading_type) {
      params.append('loading_type', options.loading_type);
    }
    if (options?.include_expired) {
      params.append('include_expired', 'true');
    }
    if (options?.sort_by) {
      params.append('sort_by', options.sort_by);
    }

    const response = await api.get(
      `/products/${productId}/batches?${params.toString()}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product batches:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product batches'
    );
  }
};

export type {
  GetVanInventoryParams,
  ManageVanInventoryPayload,
  UpdateVanInventoryPayload,
  PaginationMeta,
  VanInventory,
  VanInventoryItem,
  VanInventoryItemPayload,
};
