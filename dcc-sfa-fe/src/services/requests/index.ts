/**
 * @fileoverview Requests Service with API Integration
 * @description Provides requests CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface Request {
  id: number;
  requester_id: number;
  request_type: string;
  request_data: string | null;
  status: string;
  reference_id: number | null;
  overall_status: string | null;
  createdate: Date | null;
  createdby: number;
  updatedate: Date | null;
  updatedby: number | null;
  log_inst: number | null;
  requester?: {
    id: number;
    name: string;
    email: string;
  } | null;
  reference_details?: {
    order_number?: string;
    customer_name?: string;
    customer_code?: string;
    customer_phone?: string;
    salesperson_name?: string;
    salesperson_email?: string;
    total_amount?: string;
    order_date?: string;
    delivery_date?: string;
    payment_method?: string;
    status?: string;
    notes?: string;
  } | null;
  approvals?: {
    id: number;
    approver_id: number;
    sequence: number;
    status: string;
    remarks: string | null;
    action_at: Date | null;
    approver: {
      id: number;
      name: string;
      email: string;
    } | null;
  }[];
}

export interface GetRequestsByUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  request_type?: string;
  status?: string;
  requester_id?: number;
}

export interface TakeActionOnRequestPayload {
  request_id: number;
  approval_id: number;
  action: 'A' | 'R'; // A for Approve, R for Reject
  remarks?: string;
}

export interface RequestType {
  value: string;
  label: string;
}

/**
 * Fetch requests by users (for approvers)
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Request[]>>
 */
export const fetchRequestsByUsers = async (
  params?: GetRequestsByUsersParams
): Promise<ApiResponse<Request[]>> => {
  try {
    const response = await api.get('/requests-by-users', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching requests by users:', error);
    throw error;
  }
};

/**
 * Fetch requests by users (for approvers) without permission check
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Request[]>>
 */
export const fetchRequestsByUsersWithoutPermission = async (
  params?: GetRequestsByUsersParams
): Promise<ApiResponse<Request[]>> => {
  try {
    const response = await api.get('/requests-by-users-without-permission', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      'Error fetching requests by users without permission:',
      error
    );
    throw error;
  }
};

/**
 * Take action on a request (approve or reject)
 * @param payload - Action payload
 * @returns Promise<ApiResponse<Request>>
 */
export const takeActionOnRequest = async (
  payload: TakeActionOnRequestPayload
): Promise<ApiResponse<Request>> => {
  try {
    const response = await api.post('/requests/action', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error taking action on request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to take action on request'
    );
  }
};

/**
 * Fetch available request types
 * @returns Promise<ApiResponse<RequestType[]>>
 */
export const fetchRequestTypes = async (): Promise<
  ApiResponse<RequestType[]>
> => {
  try {
    const response = await api.get('/approval-setup/request-types');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching request types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch request types'
    );
  }
};
