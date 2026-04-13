/**
 * @fileoverview Price Lists Service with API Integration
 * @description Provides price lists CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface PriceList {
  id: number;
  name: string;
  description?: string | null;
  customer_id?: number | null;
  route_id?: number | null;
  depot_id?: number | null;
  base_pricelist_id?: number | null;
  factor?: string | number | null;
  customer_category_id?: number | null;
  is_default: string;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  pricelist_item?: PriceListItem[];
  route_pricelist?: RoutePriceList[];
  pricelists_customer?: {
    id: number;
    name: string;
    code: string;
  };
  pricelists_route?: {
    id: number;
    name: string;
  };
  pricelists_depot?: {
    id: number;
    name: string;
  };
  base_pricelist?: {
    id: number;
    name: string;
  };
}

interface PriceListItem {
  id: number;
  pricelist_id: number;
  product_id: number;
  unit_price: string;
  uom?: string | null;
  discount_percent?: string | null;
  tax_percent?: string | null;
  sub_unit_price?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
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
  special_prices?: SpecialPrice[];
}

interface SpecialPrice {
  id?: number;
  pricelist_item_id?: number;
  valid_from?: string | null;
  valid_to?: string | null;
  route_id?: number | null;
  customer_id?: number | null;
  customer_category_id?: number | null;
  sale_price: string | number;
  sale_sub_unit_price?: string | number | null;
  tax_percent?: string | number | null;
  discount_percent?: string | number | null;
  is_active?: string;
}

interface RoutePriceList {
  id: number;
  route_id?: number | null;
  depot_id?: number | null;
  customer_id?: number | null;
  customer_category_id?: number | null;
  pricelist_id: number;
  effective_from?: string | null;
  effective_to?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

interface ManagePriceListPayload {
  name: string;
  description?: string;
  customer_id?: number | null;
  route_id?: number | null;
  depot_id?: number | null;
  base_pricelist_id?: number | null;
  factor?: string | number | null;
  customer_category_id?: number | null;
  is_default?: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: string;
  pricelist_item?: Partial<PriceListItem>[];
}

interface UpdatePriceListPayload {
  name?: string;
  description?: string;
  customer_id?: number | null;
  route_id?: number | null;
  depot_id?: number | null;
  base_pricelist_id?: number | null;
  factor?: string | number | null;
  customer_category_id?: number | null;
  is_default?: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: string;
  pricelist_item?: Partial<PriceListItem>[];
}

interface GetPriceListsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_default?: string;
  depot_id?: number;
  route_id?: number;
  customer_id?: number;
  customer_category_id?: number;
  from_date?: string;
  to_date?: string;
  include_items?: boolean;
}

/**
 * Fetch price lists with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with price lists data
 */
export const fetchPriceLists = async (
  params?: GetPriceListsParams
): Promise<ApiResponse<PriceList[]>> => {
  try {
    const response = await api.get('/price-lists', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching price lists:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch price lists'
    );
  }
};

/**
 * Fetch price list by ID
 * @param id - Price List ID
 * @returns Promise resolving to price list data
 */
export const fetchPriceListById = async (id: number): Promise<PriceList> => {
  try {
    const response = await api.get(`/price-lists/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching price list:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch price list'
    );
  }
};

/**
 * Create a new price list
 * @param data - Price list data
 * @returns Promise resolving to created price list
 */
export const createPriceList = async (
  data: ManagePriceListPayload
): Promise<PriceList> => {
  try {
    const response = await api.post('/price-lists', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating price list:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create price list'
    );
  }
};

/**
 * Update an existing price list
 * @param id - Price list ID
 * @param data - Updated price list data
 * @returns Promise resolving to updated price list
 */
export const updatePriceList = async (
  id: number,
  data: UpdatePriceListPayload
): Promise<PriceList> => {
  try {
    const response = await api.post(`/price-lists`, { id, ...data });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating price list:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update price list'
    );
  }
};

/**
 * Delete a price list
 * @param id - Price list ID
 * @returns Promise resolving when deletion is complete
 */
export const deletePriceList = async (id: number): Promise<void> => {
  try {
    await api.delete(`/price-lists/${id}`);
  } catch (error: any) {
    console.error('Error deleting price list:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete price list'
    );
  }
};

// Export types
export type {
  PriceList,
  PriceListItem,
  SpecialPrice,
  RoutePriceList,
  ManagePriceListPayload,
  UpdatePriceListPayload,
  GetPriceListsParams,
};
