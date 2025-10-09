/**
 * @fileoverview Login History Service with API Integration
 * @description Provides login history CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface LoginHistory {
  id: number;
  user_id: number;
  login_time?: string | null;
  logout_time?: string | null;
  ip_address?: string | null;
  device_info?: string | null;
  os_info?: string | null;
  app_version?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  login_status?: string | null;
  failure_reason?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface ManageLoginHistoryPayload {
  user_id: number;
  login_time?: string;
  logout_time?: string;
  ip_address?: string;
  device_info?: string;
  os_info?: string;
  app_version?: string;
  location_latitude?: number;
  location_longitude?: number;
  login_status?: string;
  failure_reason?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateLoginHistoryPayload {
  user_id?: number;
  login_time?: string;
  logout_time?: string;
  ip_address?: string;
  device_info?: string;
  os_info?: string;
  app_version?: string;
  location_latitude?: number;
  location_longitude?: number;
  login_status?: string;
  failure_reason?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetLoginHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  login_status?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface LoginHistoryStatistics {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  today_logins: number;
}

/**
 * Fetch login history with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<LoginHistory[]>>
 */
export const fetchLoginHistory = async (
  params?: GetLoginHistoryParams
): Promise<
  ApiResponse<LoginHistory[]> & { statistics?: LoginHistoryStatistics }
> => {
  try {
    const response = await api.get('/login-history', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching login history:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch login history'
    );
  }
};

/**
 * Fetch login history by ID
 * @param id - Login History ID
 * @returns Promise<ApiResponse<LoginHistory>>
 */
export const fetchLoginHistoryById = async (
  id: number
): Promise<ApiResponse<LoginHistory>> => {
  try {
    const response = await api.get(`/login-history/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching login history:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch login history'
    );
  }
};

/**
 * Create new login history
 * @param loginHistoryData - Login history creation payload
 * @returns Promise<ApiResponse<LoginHistory>>
 */
export const createLoginHistory = async (
  loginHistoryData: ManageLoginHistoryPayload
): Promise<ApiResponse<LoginHistory>> => {
  try {
    const response = await api.post('/login-history', loginHistoryData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating login history:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create login history'
    );
  }
};

/**
 * Update existing login history
 * @param id - Login History ID
 * @param loginHistoryData - Login history update payload
 * @returns Promise<ApiResponse<LoginHistory>>
 */
export const updateLoginHistory = async (
  id: number,
  loginHistoryData: UpdateLoginHistoryPayload
): Promise<ApiResponse<LoginHistory>> => {
  try {
    const response = await api.put(`/login-history/${id}`, loginHistoryData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating login history:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update login history'
    );
  }
};

/**
 * Delete login history
 * @param id - Login History ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteLoginHistory = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/login-history/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting login history:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete login history'
    );
  }
};

export type {
  GetLoginHistoryParams,
  ManageLoginHistoryPayload,
  UpdateLoginHistoryPayload,
  PaginationMeta,
  LoginHistoryStatistics,
  LoginHistory,
};
