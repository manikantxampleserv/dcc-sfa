/**
 * @fileoverview Return Requests Service with API Integration
 * @description Provides return requests CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ReturnRequest {
  id: number;
  customer_id: number;
  product_id: number;
  serial_id?: number | null;
  return_date?: string | null;
  reason?: string | null;
  status?: string | null;
  approved_by?: number | null;
  approved_date?: string | null;
  resolution_notes?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer?: {
    id: number;
    name: string;
    code: string;
  } | null;
  product?: {
    id: number;
    name: string;
    code: string;
  } | null;
  serial_number?: {
    id: number;
    serial_no: string;
  } | null;
  approved_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  workflow_steps?: {
    id: number;
    step: string;
    status: string;
    remarks?: string;
    action_by?: number;
    action_date?: string;
    action_user?: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

interface ManageReturnRequestPayload {
  customer_id: number;
  product_id: number;
  serial_id?: number;
  return_date?: string;
  reason?: string;
  status?: string;
  approved_by?: number;
  approved_date?: string;
  resolution_notes?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateReturnRequestPayload {
  customer_id?: number;
  product_id?: number;
  serial_id?: number;
  return_date?: string;
  reason?: string;
  status?: string;
  approved_by?: number;
  approved_date?: string;
  resolution_notes?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetReturnRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_id?: number;
  product_id?: number;
  is_active?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ReturnRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  new_requests_this_month: number;
}

/**
 * Fetch return requests with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<ReturnRequest[]>>
 */
export const fetchReturnRequests = async (
  params?: GetReturnRequestsParams
): Promise<ApiResponse<ReturnRequest[]>> => {
  try {
    const response = await api.get('/return-requests', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching return requests:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch return requests'
    );
  }
};

/**
 * Fetch return request by ID
 * @param id - Return Request ID
 * @returns Promise<ApiResponse<ReturnRequest>>
 */
export const fetchReturnRequestById = async (
  id: number
): Promise<ApiResponse<ReturnRequest>> => {
  try {
    const response = await api.get(`/return-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching return request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch return request'
    );
  }
};

/**
 * Create new return request
 * @param returnRequestData - Return request creation payload
 * @returns Promise<ApiResponse<ReturnRequest>>
 */
export const createReturnRequest = async (
  returnRequestData: ManageReturnRequestPayload
): Promise<ApiResponse<ReturnRequest>> => {
  try {
    const response = await api.post('/return-requests', returnRequestData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating return request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create return request'
    );
  }
};

/**
 * Update existing return request
 * @param id - Return Request ID
 * @param returnRequestData - Return request update payload
 * @returns Promise<ApiResponse<ReturnRequest>>
 */
export const updateReturnRequest = async (
  id: number,
  returnRequestData: UpdateReturnRequestPayload
): Promise<ApiResponse<ReturnRequest>> => {
  try {
    const response = await api.put(`/return-requests/${id}`, returnRequestData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating return request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update return request'
    );
  }
};

/**
 * Delete return request
 * @param id - Return Request ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteReturnRequest = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/return-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting return request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete return request'
    );
  }
};

export type {
  GetReturnRequestsParams,
  ManageReturnRequestPayload,
  UpdateReturnRequestPayload,
  PaginationMeta,
  ReturnRequest,
  ReturnRequestStats,
};
