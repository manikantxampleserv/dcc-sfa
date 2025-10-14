/**
 * @fileoverview Sales Target Groups Service with API Integration
 * @description Provides sales target groups CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface SalesTargetGroupMember {
  id?: number;
  sales_person_id: number;
  is_active: string;
  sales_person?: {
    id: number;
    name: string;
    email: string;
  };
}

interface SalesTargetGroup {
  id: number;
  group_name: string;
  description?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_target_group_members?: SalesTargetGroupMember[];
  sales_targets_groups?: any[];
}

interface ManageSalesTargetGroupPayload {
  group_name: string;
  description?: string;
  is_active?: string;
  salesTargetMember?: SalesTargetGroupMember[];
}

interface UpdateSalesTargetGroupPayload {
  group_name?: string;
  description?: string;
  is_active?: string;
  salesTargetMember?: SalesTargetGroupMember[];
}

interface GetSalesTargetGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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
 * Fetch sales target groups with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<SalesTargetGroup[]>>
 */
export const fetchSalesTargetGroups = async (
  params?: GetSalesTargetGroupsParams
): Promise<ApiResponse<SalesTargetGroup[]>> => {
  try {
    const response = await api.get('/sales-target-groups', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales target groups:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales target groups'
    );
  }
};

/**
 * Fetch sales target group by ID
 * @param id - Sales Target Group ID
 * @returns Promise<ApiResponse<SalesTargetGroup>>
 */
export const fetchSalesTargetGroupById = async (
  id: number
): Promise<ApiResponse<SalesTargetGroup>> => {
  try {
    const response = await api.get(`/sales-target-groups/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sales target group'
    );
  }
};

/**
 * Create new sales target group
 * @param groupData - Sales Target Group creation payload
 * @returns Promise<ApiResponse<SalesTargetGroup>>
 */
export const createSalesTargetGroup = async (
  groupData: ManageSalesTargetGroupPayload
): Promise<ApiResponse<SalesTargetGroup>> => {
  try {
    const response = await api.post('/sales-target-groups', groupData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating sales target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create sales target group'
    );
  }
};

/**
 * Update existing sales target group
 * @param id - Sales Target Group ID
 * @param groupData - Sales Target Group update payload
 * @returns Promise<ApiResponse<SalesTargetGroup>>
 */
export const updateSalesTargetGroup = async (
  id: number,
  groupData: UpdateSalesTargetGroupPayload
): Promise<ApiResponse<SalesTargetGroup>> => {
  try {
    const response = await api.post(`/sales-target-groups`, {
      ...groupData,
      id,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating sales target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update sales target group'
    );
  }
};

/**
 * Delete sales target group
 * @param id - Sales Target Group ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteSalesTargetGroup = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/sales-target-groups/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting sales target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete sales target group'
    );
  }
};

export type {
  GetSalesTargetGroupsParams,
  ManageSalesTargetGroupPayload,
  UpdateSalesTargetGroupPayload,
  PaginationMeta,
  SalesTargetGroup,
  SalesTargetGroupMember,
};
