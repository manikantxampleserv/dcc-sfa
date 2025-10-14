/**
 * @fileoverview Sales Bonus Rules Service with API Integration
 * @description Provides Sales Bonus Rules CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface SalesBonusRule {
  id: number;
  sales_target_id: number;
  achievement_min_percent: number;
  achievement_max_percent: number;
  bonus_amount?: number | null;
  bonus_percent?: number | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_targets?: {
    id: number;
    sales_target_group_id: number;
    product_category_id: number;
    target_quantity: number;
    target_amount?: number | null;
    start_date: string;
    end_date: string;
    sales_targets_groups?: {
      id: number;
      group_name: string;
      description?: string | null;
    } | null;
    sales_targets_product_categories?: {
      id: number;
      category_name: string;
      description?: string | null;
    } | null;
  } | null;
}

interface ManageSalesBonusRulePayload {
  sales_target_id: number;
  achievement_min_percent: number;
  achievement_max_percent: number;
  bonus_amount?: number;
  bonus_percent?: number;
  is_active?: string;
}

interface UpdateSalesBonusRulePayload {
  sales_target_id?: number;
  achievement_min_percent?: number;
  achievement_max_percent?: number;
  bonus_amount?: number;
  bonus_percent?: number;
  is_active?: string;
}

interface GetSalesBonusRulesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetch Sales Bonus Rules with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Sales Bonus Rules data
 */
export const fetchSalesBonusRules = async (
  params?: GetSalesBonusRulesParams
): Promise<ApiResponse<SalesBonusRule[]>> => {
  try {
    const response = await api.get('/sales-bonus-rule', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales bonus rules:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales bonus rules'
    );
  }
};

/**
 * Fetch Sales Bonus Rule by ID
 * @param id - Sales Bonus Rule ID
 * @returns Promise resolving to Sales Bonus Rule data
 */
export const fetchSalesBonusRuleById = async (
  id: number
): Promise<SalesBonusRule> => {
  try {
    const response = await api.get(`/sales-bonus-rule/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching sales bonus rule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales bonus rule'
    );
  }
};

/**
 * Create a new Sales Bonus Rule
 * @param data - Sales Bonus Rule data
 * @returns Promise resolving to created Sales Bonus Rule
 */
export const createSalesBonusRule = async (
  data: ManageSalesBonusRulePayload
): Promise<SalesBonusRule> => {
  try {
    const response = await api.post('/sales-bonus-rule', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating sales bonus rule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create sales bonus rule'
    );
  }
};

/**
 * Update an existing Sales Bonus Rule
 * @param id - Sales Bonus Rule ID
 * @param data - Updated Sales Bonus Rule data
 * @returns Promise resolving to updated Sales Bonus Rule
 */
export const updateSalesBonusRule = async (
  id: number,
  data: UpdateSalesBonusRulePayload
): Promise<SalesBonusRule> => {
  try {
    const response = await api.put(`/sales-bonus-rule/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating sales bonus rule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update sales bonus rule'
    );
  }
};

/**
 * Delete a Sales Bonus Rule
 * @param id - Sales Bonus Rule ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteSalesBonusRule = async (id: number): Promise<void> => {
  try {
    await api.delete(`/sales-bonus-rule/${id}`);
  } catch (error: any) {
    console.error('Error deleting sales bonus rule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete sales bonus rule'
    );
  }
};

// Export types
export type {
  SalesBonusRule,
  ManageSalesBonusRulePayload,
  UpdateSalesBonusRulePayload,
  GetSalesBonusRulesParams,
};
