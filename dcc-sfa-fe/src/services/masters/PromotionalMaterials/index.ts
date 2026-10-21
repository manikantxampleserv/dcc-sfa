/**
 * @fileoverview Promotional Materials Service
 * @description API service for managing promotional materials master and outlet promotional items
 * @version 1.0.0
 */

import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface PromotionalMaterial {
  id: number;
  code: string;
  name: string;
  uom: string;
  default_unit_value: number | null;
  description?: string | null;
  is_active: string;
  createdby?: number;
  createdate?: string;
  updatedby?: number | null;
  updatedate?: string | null;
}

export interface CreatePromotionalMaterialPayload {
  code?: string;
  name: string;
  uom?: string;
  default_unit_value?: number | null;
  description?: string | null;
  is_active?: string;
}

export interface UpdatePromotionalMaterialPayload {
  code?: string;
  name?: string;
  uom?: string;
  default_unit_value?: number | null;
  description?: string | null;
  is_active?: string;
}

export interface PromotionalMaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PromotionalMaterialStats {
  total_materials: number;
  active_materials: number;
  inactive_materials: number;
}

export interface OutletPromotionalMaterialsResponse {
  outlet: {
    id: number;
    name: string;
    code: string;
    depot_id?: number | null;
  };
  stats: {
    approved_issues_count: number;
    total_pieces_issued: number;
    total_value_issued: number;
    pending_approval_count: number;
  };
  issued_items: Array<{
    material_id: number;
    material_code: string;
    material_name: string;
    uom: string;
    total_quantity: number;
    total_value: number;
    last_issued_date: string | null;
  }>;
  issue_history: Array<{
    id: number;
    gin_number: string;
    issue_date: string;
    campaign_reference: string | null;
    depot_name: string;
    total_items_count: number;
    total_quantity: number;
    total_value: number;
    approval_status: string;
    notes: string | null;
    items: Array<{
      id: number;
      material_id: number | null;
      material_name: string;
      material_code: string;
      uom: string;
      quantity: number;
      unit_value: number;
      total_value: number;
    }>;
  }>;
}

/**
 * Fetches promotional materials with pagination and filtering
 */
export const fetchPromotionalMaterials = async (
  params?: PromotionalMaterialQueryParams
): Promise<
  ApiResponse<PromotionalMaterial[]> & { stats: PromotionalMaterialStats }
> => {
  try {
    const response = await axiosInstance.get('/promotional-materials', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching promotional materials:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch promotional materials'
    );
  }
};

/**
 * Fetches a single promotional material by ID
 */
export const fetchPromotionalMaterialById = async (
  id: number
): Promise<PromotionalMaterial> => {
  try {
    const response = await axiosInstance.get(`/promotional-materials/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching promotional material:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch promotional material'
    );
  }
};

/**
 * Creates a new promotional material
 */
export const createPromotionalMaterial = async (
  data: CreatePromotionalMaterialPayload
): Promise<PromotionalMaterial> => {
  try {
    const response = await axiosInstance.post('/promotional-materials', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating promotional material:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create promotional material'
    );
  }
};

/**
 * Updates an existing promotional material
 */
export const updatePromotionalMaterial = async (
  id: number,
  data: UpdatePromotionalMaterialPayload
): Promise<PromotionalMaterial> => {
  try {
    const response = await axiosInstance.put(
      `/promotional-materials/${id}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating promotional material:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update promotional material'
    );
  }
};

/**
 * Deletes a promotional material
 */
export const deletePromotionalMaterial = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/promotional-materials/${id}`);
  } catch (error: any) {
    console.error('Error deleting promotional material:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete promotional material'
    );
  }
};

/**
 * Fetches promotional materials summary and history for a specific outlet
 */
export const fetchOutletPromotionalMaterials = async (
  outletId: number
): Promise<OutletPromotionalMaterialsResponse> => {
  try {
    const response = await axiosInstance.get(
      `/promotional-materials/outlet/${outletId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching outlet promotional materials:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to fetch outlet promotional materials'
    );
  }
};
