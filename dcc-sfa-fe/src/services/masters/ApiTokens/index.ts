import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface ApiToken {
  id: number;
  user_id: number;
  token: string;
  token_type?: string | null;
  issued_at?: Date | null;
  expires_at?: Date | null;
  is_revoked?: boolean | null;
  device_id?: string | null;
  ip_address?: string | null;
  is_active: string;
  log_inst?: number | null;
  created_by: number;
  created_date?: Date | null;
  updated_by?: number | null;
  updated_date?: Date | null;
  users_api_tokens_user_idTousers?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GetApiTokensParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  isRevoked?: string;
  userId?: string;
}

export interface PaginationMeta {
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

export interface ApiTokenStats {
  total_tokens: number;
  active_tokens: number;
  revoked_tokens: number;
  expired_tokens: number;
}

export const fetchApiTokens = async (
  params?: GetApiTokensParams
): Promise<ApiResponse<ApiToken[]>> => {
  try {
    const response = await axiosInstance.get('/api-tokens', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchApiTokenById = async (
  id: number
): Promise<ApiResponse<ApiToken>> => {
  try {
    const response = await axiosInstance.get(`/api-tokens/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const revokeApiToken = async (
  id: number
): Promise<ApiResponse<ApiToken>> => {
  const response = await axiosInstance.patch(`/api-tokens/${id}/revoke`);
  return response.data;
};

export const activateApiToken = async (
  id: number
): Promise<ApiResponse<ApiToken>> => {
  const response = await axiosInstance.patch(`/api-tokens/${id}/activate`);
  return response.data;
};

export const deactivateApiToken = async (
  id: number
): Promise<ApiResponse<ApiToken>> => {
  const response = await axiosInstance.patch(`/api-tokens/${id}/deactivate`);
  return response.data;
};

export const deleteApiToken = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/api-tokens/${id}`);
  return response.data;
};

export const revokeAllUserTokens = async (
  userId: number
): Promise<ApiResponse<{ revokedCount: number }>> => {
  const response = await axiosInstance.patch(
    `/api-tokens/user/${userId}/revoke-all`
  );
  return response.data;
};

export default {
  fetchApiTokens,
  fetchApiTokenById,
  revokeApiToken,
  activateApiToken,
  deactivateApiToken,
  deleteApiToken,
  revokeAllUserTokens,
};
