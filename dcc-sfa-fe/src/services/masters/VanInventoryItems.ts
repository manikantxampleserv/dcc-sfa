/**
 * @fileoverview Van Inventory Items Service
 * @description API service for managing van inventory items
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';

export interface VanInventoryItem {
  id?: number;
  parent_id: number;
  product_id: number;
  product_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  product?: {
    id: number;
    name: string;
    code: string;
    unit_of_measurement?: string;
  };
  van_inventory_items_products?: {
    id: number;
    name: string;
    code: string;
    description?: string;
    category_id?: number;
    sub_category_id?: number;
    brand_id?: number;
    unit_of_measurement?: number;
    base_price?: string;
    tax_rate?: string;
    is_active?: string;
    createdate?: string;
    createdby?: number;
    updatedate?: string;
    updatedby?: number;
    log_inst?: number;
    product_unit_of_measurement?: {
      id: number;
      name: string;
      description?: string;
      category?: string;
      symbol?: string;
      is_active?: string;
      createdate?: string;
      createdby?: number;
      updatedate?: string;
      updatedby?: number;
      log_inst?: number;
    };
  };
}

export interface CreateVanInventoryItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
}

export interface UpdateVanInventoryItemPayload {
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
}

export interface BulkUpdateVanInventoryItemsPayload {
  vanInventoryItems: VanInventoryItem[];
}

/**
 * Create a new van inventory item
 */
export const createVanInventoryItem = async (
  vanInventoryId: number,
  data: CreateVanInventoryItemPayload
): Promise<{ success: boolean; message: string; data: VanInventoryItem }> => {
  const response = await api.post(
    `/van-inventory/${vanInventoryId}/items`,
    data
  );
  return response.data;
};

/**
 * Get all van inventory items for a van inventory
 */
export const getVanInventoryItems = async (
  vanInventoryId: number
): Promise<{ success: boolean; message: string; data: VanInventoryItem[] }> => {
  const response = await api.get(`/van-inventory/${vanInventoryId}/items`);
  return response.data;
};

/**
 * Update a van inventory item
 */
export const updateVanInventoryItem = async (
  vanInventoryId: number,
  itemId: number,
  data: UpdateVanInventoryItemPayload
): Promise<{ success: boolean; message: string; data: VanInventoryItem }> => {
  const response = await api.put(
    `/van-inventory/${vanInventoryId}/items/${itemId}`,
    data
  );
  return response.data;
};

/**
 * Delete a van inventory item
 */
export const deleteVanInventoryItem = async (
  vanInventoryId: number,
  itemId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/van-inventory/${vanInventoryId}/items/${itemId}`
  );
  return response.data;
};

/**
 * Bulk update van inventory items for a van inventory
 */
export const bulkUpdateVanInventoryItems = async (
  vanInventoryId: number,
  data: BulkUpdateVanInventoryItemsPayload
): Promise<{ success: boolean; message: string; data: VanInventoryItem[] }> => {
  const response = await api.put(
    `/van-inventory/${vanInventoryId}/items`,
    data
  );
  return response.data;
};
