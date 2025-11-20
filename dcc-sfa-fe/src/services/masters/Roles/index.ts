import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Role {
  id: number;
  name: string;
  description?: string | null;
  user_id?: number | null;
  is_active: string;
  created_at?: string;
  updated_at?: string;
  permissions?: RolePermission[];
  user_role?: {
    id: number;
    name: string;
    email: string;
  }[];
  _count?: {
    user_role: number;
  };
}

interface RoleDropdown {
  id: number;
  name: string;
}

interface RolePermission {
  permission_id: number;
  is_active: string;
  permission?: {
    id: number;
    name: string;
    description?: string;
    module: string;
  };
}

interface ManageRolePayload {
  name: string;
  description?: string;
  user_id?: number;
  is_active?: string;
  permissions?: number[];
}

interface UpdateRolePayload {
  name?: string;
  description?: string;
  user_id?: number;
  is_active?: string;
  permissions?: number[];
}

interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  user_id?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch roles dropdown (id and name only, no pagination)
 * @returns Promise<ApiResponse<RoleDropdown[]>>
 */
export const fetchRolesDropdown = async (): Promise<
  ApiResponse<RoleDropdown[]>
> => {
  try {
    const response = await axiosInstance.get('/roles-dropdown');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all roles with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Role[]>>
 */
export const fetchRoles = async (
  params?: GetRolesParams
): Promise<ApiResponse<Role[]>> => {
  try {
    const response = await axiosInstance.get('/roles', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch role by ID
 * @param id - Role ID
 * @returns Promise<ApiResponse<Role>>
 */
export const fetchRoleById = async (id: number): Promise<ApiResponse<Role>> => {
  try {
    const response = await axiosInstance.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new role (silent - no toast, used by React Query hooks)
 * @param roleData - Role creation payload
 * @returns Promise<ApiResponse<Role>>
 */
export const createRole = async (
  roleData: ManageRolePayload
): Promise<ApiResponse<Role>> => {
  const response = await axiosInstance.post('/roles', roleData);
  return response.data;
};

/**
 * Update existing role (silent - no toast, used by React Query hooks)
 * @param id - Role ID
 * @param roleData - Role update payload
 * @returns Promise<ApiResponse<Role>>
 */
export const updateRole = async (
  id: number,
  roleData: UpdateRolePayload
): Promise<ApiResponse<Role>> => {
  const response = await axiosInstance.put(`/roles/${id}`, roleData);
  return response.data;
};

/**
 * Delete role (silent - no toast, used by React Query hooks)
 * @param id - Role ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteRole = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/roles/${id}`);
  return response.data;
};

export default {
  fetchRoles,
  fetchRolesDropdown,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
};

export type {
  GetRolesParams,
  ManageRolePayload,
  UpdateRolePayload,
  PaginationMeta,
  Role,
  RoleDropdown,
  RolePermission,
};
