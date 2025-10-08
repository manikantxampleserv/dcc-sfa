import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface OutletGroup {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  discount_percentage?: number | null;
  credit_terms?: number | null;
  payment_terms?: string | null;
  price_group?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  members?: { id: number; customer_id: number; group_id: number }[];
}

interface CustomerGroupMember {
  customer_id: number;
  is_active?: string;
  joined_at?: Date;
}

interface ManageOutletGroupPayload {
  name: string;
  description?: string;
  discount_percentage?: number;
  credit_terms?: number;
  payment_terms?: string;
  price_group?: string;
  is_active?: string;
  customerGroups?: CustomerGroupMember[];
}

interface UpdateOutletGroupPayload {
  name?: string;
  description?: string;
  discount_percentage?: number;
  credit_terms?: number;
  payment_terms?: string;
  price_group?: string;
  is_active?: string;
  customerGroups?: CustomerGroupMember[];
}

interface GetOutletGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

interface PaginationMeta {
  requestDuration: number;
  timestamp: string;
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OutletGroupStats {
  total_groups: number;
  active_groups: number;
  inactive_groups: number;
}

/**
 * Fetch all outlet groups with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<OutletGroup[]>>
 */
export const fetchOutletGroups = async (
  params?: GetOutletGroupsParams
): Promise<ApiResponse<OutletGroup[]>> => {
  try {
    const response = await axiosInstance.get('/customer-groups', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch outlet group by ID
 * @param id - OutletGroup ID
 * @returns Promise<ApiResponse<OutletGroup>>
 */
export const fetchOutletGroupById = async (
  id: number
): Promise<ApiResponse<OutletGroup>> => {
  try {
    const response = await axiosInstance.get(`/customer-groups/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new outlet group (silent - no toast, used by React Query hooks)
 * @param outletGroupData - OutletGroup creation payload
 * @returns Promise<ApiResponse<OutletGroup>>
 */
export const createOutletGroup = async (
  outletGroupData: ManageOutletGroupPayload
): Promise<ApiResponse<OutletGroup>> => {
  const response = await axiosInstance.post(
    '/customer-groups',
    outletGroupData
  );
  return response.data;
};

/**
 * Update existing outlet group (silent - no toast, used by React Query hooks)
 * @param id - OutletGroup ID
 * @param outletGroupData - OutletGroup update payload
 * @returns Promise<ApiResponse<OutletGroup>>
 */
export const updateOutletGroup = async (
  id: number,
  outletGroupData: UpdateOutletGroupPayload
): Promise<ApiResponse<OutletGroup>> => {
  const response = await axiosInstance.put(
    `/customer-groups/${id}`,
    outletGroupData
  );
  return response.data;
};

/**
 * Delete outlet group (silent - no toast, used by React Query hooks)
 * @param id - OutletGroup ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteOutletGroup = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/customer-groups/${id}`);
  return response.data;
};

export default {
  fetchOutletGroups,
  fetchOutletGroupById,
  createOutletGroup,
  updateOutletGroup,
  deleteOutletGroup,
};

export type {
  GetOutletGroupsParams,
  ManageOutletGroupPayload,
  UpdateOutletGroupPayload,
  PaginationMeta,
  OutletGroupStats,
  OutletGroup,
  CustomerGroupMember,
};
