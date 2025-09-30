import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  is_active: string;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
}

interface ManageRolePermissionPayload {
  role_id: number;
  permission_id: number;
  is_active?: string;
}

interface UpdateRolePermissionPayload {
  role_id?: number;
  permission_id?: number;
  is_active?: string;
}

interface GetRolePermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  role_id?: number;
  permission_id?: number;
}

interface RolePermissionStats {
  total_role_permissions: number;
  active_role_permissions: number;
  inactive_role_permissions: number;
  new_role_permissions: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch all role permissions with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<RolePermission[]>>
 */
export const fetchRolePermissions = async (
  params?: GetRolePermissionsParams
): Promise<ApiResponse<RolePermission[]>> => {
  try {
    const response = await axiosInstance.get('/all/role-permissions', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch role permission by ID
 * @param id - Role permission ID
 * @returns Promise<ApiResponse<RolePermission>>
 */
export const fetchRolePermissionById = async (
  id: number
): Promise<ApiResponse<RolePermission>> => {
  try {
    const response = await axiosInstance.get(`/role-permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new role permission (silent - no toast, used by React Query hooks)
 * @param rolePermissionData - Role permission creation payload
 * @returns Promise<ApiResponse<RolePermission>>
 */
export const createRolePermission = async (
  rolePermissionData: ManageRolePermissionPayload
): Promise<ApiResponse<RolePermission>> => {
  const response = await axiosInstance.post(
    '/role-permissions',
    rolePermissionData
  );
  return response.data;
};

/**
 * Update existing role permission (silent - no toast, used by React Query hooks)
 * @param id - Role permission ID
 * @param rolePermissionData - Role permission update payload
 * @returns Promise<ApiResponse<RolePermission>>
 */
export const updateRolePermission = async (
  id: number,
  rolePermissionData: UpdateRolePermissionPayload
): Promise<ApiResponse<RolePermission>> => {
  const response = await axiosInstance.put(
    `/role-permissions/${id}`,
    rolePermissionData
  );
  return response.data;
};

/**
 * Delete role permission (silent - no toast, used by React Query hooks)
 * @param id - Role permission ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteRolePermission = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/role-permissions/${id}`);
  return response.data;
};

export default {
  fetchRolePermissions,
  fetchRolePermissionById,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
};

export type {
  GetRolePermissionsParams,
  ManageRolePermissionPayload,
  UpdateRolePermissionPayload,
  PaginationMeta,
  RolePermission,
  RolePermissionStats,
};
