import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Permission {
  id: number;
  name: string;
  description?: string | null;
  module: string;
  action: string;
  is_active: string;
  created_at?: string;
  updated_at?: string;
}

interface PermissionModule {
  module: string;
  permissions: Permission[];
}

interface GetPermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  module?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch all permissions with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Permission[]>>
 */
export const fetchPermissions = async (
  params?: GetPermissionsParams
): Promise<ApiResponse<Permission[]>> => {
  try {
    const response = await axiosInstance.get('/permissions', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch permissions grouped by module
 * @returns Promise<ApiResponse<PermissionModule[]>>
 */
export const fetchPermissionsByModule = async (): Promise<ApiResponse<PermissionModule[]>> => {
  try {
    const response = await axiosInstance.get('/permissions/by-module');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch permission by ID
 * @param id - Permission ID
 * @returns Promise<ApiResponse<Permission>>
 */
export const fetchPermissionById = async (id: number): Promise<ApiResponse<Permission>> => {
  try {
    const response = await axiosInstance.get(`/permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new permission
 * @param permissionData - Permission creation payload
 * @returns Promise<ApiResponse<Permission>>
 */
export const createPermission = async (
  permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Permission>> => {
  const response = await axiosInstance.post('/permissions', permissionData);
  return response.data;
};

/**
 * Update existing permission
 * @param id - Permission ID
 * @param permissionData - Permission update payload
 * @returns Promise<ApiResponse<Permission>>
 */
export const updatePermission = async (
  id: number,
  permissionData: Partial<Omit<Permission, 'id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<Permission>> => {
  const response = await axiosInstance.put(`/permissions/${id}`, permissionData);
  return response.data;
};

/**
 * Delete permission
 * @param id - Permission ID
 * @returns Promise<ApiResponse<void>>
 */
export const deletePermission = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/permissions/${id}`);
  return response.data;
};

export default {
  fetchPermissions,
  fetchPermissionsByModule,
  fetchPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};

export type {
  GetPermissionsParams,
  PaginationMeta,
  Permission,
  PermissionModule,
};
