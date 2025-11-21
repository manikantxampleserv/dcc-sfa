import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface RecentActivity {
  audit_logs: Array<{
    id: number;
    table_name: string;
    record_id: number;
    action: string;
    changed_at: string | null;
    ip_address: string | null;
    device_info: string | null;
  }>;
}

interface User {
  id: number;
  email: string;
  name: string;
  role_id: number;
  parent_id?: number | null;
  depot_id?: number | null;
  zone_id?: number | null;
  phone_number?: string | null;
  address?: string | null;
  employee_id?: string | null;
  joining_date?: string | null;
  reporting_to?: number | null;
  profile_image?: string | null;
  last_login?: string | null;
  is_active: string;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    description: string;
  } | null;
  company?: {
    id: number;
    name: string;
    code: string;
  } | null;
  depot?: {
    id: number;
    name: string;
    code: string;
  } | null;
  zone?: {
    id: number;
    name: string;
    code: string;
  } | null;
  reporting_manager?: {
    id: number;
    name: string;
    email: string;
  } | null;
  permissions?: string[];
  recent_activities?: RecentActivity;
}

interface ManageUserPayload {
  email: string;
  password: string;
  name: string;
  role_id: number;
  parent_id?: number;
  depot_id?: number;
  zone_id?: number;
  phone_number?: string;
  address?: string;
  employee_id?: string;
  joining_date?: string;
  reporting_to?: number;
  profile_image?: string;
  is_active?: string;
}

interface UpdateUserPayload {
  email?: string;
  password?: string;
  name?: string;
  role_id?: number;
  parent_id?: number;
  depot_id?: number;
  zone_id?: number;
  phone_number?: string;
  address?: string;
  employee_id?: string;
  joining_date?: string;
  reporting_to?: number;
  profile_image?: string;
  is_active?: string;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  role_id?: number;
  depot_id?: number;
  zone_id?: number;
}

interface UpdateProfilePayload {
  name?: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch all users with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<User[]>>
 */
export const fetchUsers = async (
  params?: GetUsersParams
): Promise<ApiResponse<User[]>> => {
  try {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch user by ID
 * @param id - User ID
 * @returns Promise<ApiResponse<User>>
 */
export const fetchUserById = async (id: number): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new user (silent - no toast, used by React Query hooks)
 * @param userData - User creation payload (supports both FormData and plain object)
 * @returns Promise<ApiResponse<User>>
 */
export const createUser = async (
  userData: ManageUserPayload | FormData
): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.post('/users', userData, {
    headers:
      userData instanceof FormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : {
            'Content-Type': 'application/json',
          },
  });
  return response.data;
};

/**
 * Update existing user (silent - no toast, used by React Query hooks)
 * @param id - User ID
 * @param userData - User update payload (supports both FormData and plain object)
 * @returns Promise<ApiResponse<User>>
 */
export const updateUser = async (
  id: number,
  userData: UpdateUserPayload | FormData
): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.put(`/users/${id}`, userData, {
    headers:
      userData instanceof FormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : {
            'Content-Type': 'application/json',
          },
  });
  return response.data;
};

/**
 * Delete user (silent - no toast, used by React Query hooks)
 * @param id - User ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

/**
 * Get user profile (current authenticated user)
 * @returns Promise<ApiResponse<User>>
 */
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile (silent - no toast, used by React Query hooks)
 * @param profileData - Profile update payload (supports both FormData and plain object)
 * @returns Promise<ApiResponse<User>>
 */
export const updateUserProfile = async (
  profileData: UpdateProfilePayload | FormData
): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.put('/users/me', profileData, {
    headers:
      profileData instanceof FormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : {
            'Content-Type': 'application/json',
          },
  });
  return response.data;
};

export interface UserDropdown {
  id: number;
  name: string;
  email: string;
}

export interface GetUsersDropdownParams {
  search?: string;
  user_id?: number;
}

export const fetchUsersDropdown = async (
  params?: GetUsersDropdownParams
): Promise<ApiResponse<UserDropdown[]>> => {
  try {
    const response = await axiosInstance.get('/users-dropdown', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
};

export type {
  GetUsersParams,
  ManageUserPayload,
  UpdateUserPayload,
  PaginationMeta,
  UpdateProfilePayload,
  User,
  RecentActivity,
};
