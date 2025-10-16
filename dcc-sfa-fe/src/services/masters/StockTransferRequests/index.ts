/**
 * @fileoverview Stock Transfer Requests Service with API Integration
 * @description Provides stock transfer requests CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface StockTransferLine {
  id?: number;
  product_id: number;
  batch_id?: number | null;
  quantity: number;
}

interface StockTransferRequest {
  id: number;
  request_number: string;
  source_type: string;
  source_id: number;
  destination_type: string;
  destination_id: number;
  requested_by: number;
  requested_at?: string | null;
  status?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;

  requested_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;

  approved_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;

  transfer_lines?: StockTransferLine[];

  source?: {
    id: number;
    name: string;
    type: string;
    location: string;
    is_active: string;
  } | null;

  destination?: {
    id: number;
    name: string;
    type: string;
    location: string;
    is_active: string;
  } | null;
}

interface ManageStockTransferRequestPayload {
  id?: number;
  source_type: string;
  source_id: number;
  destination_type: string;
  destination_id: number;
  requested_by: number;
  status?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  is_active?: string;
  stock_transfer_lines?: StockTransferLine[];
}

interface UpdateStockTransferRequestPayload {
  source_type?: string;
  source_id?: number;
  destination_type?: string;
  destination_id?: number;
  requested_by?: number;
  status?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  is_active?: string;
  stock_transfer_lines?: StockTransferLine[];
}

interface GetStockTransferRequestsParams {
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

interface StockTransferRequestStats {
  total_stock_transfer_requests: number;
  active_stock_transfer_requests: number;
  inactive_stock_transfer_requests: number;
  stock_transfer_requests_this_month: number;
}

/**
 * Fetch stock transfer requests with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<StockTransferRequest[]>>
 */
export const fetchStockTransferRequests = async (
  params?: GetStockTransferRequestsParams
): Promise<ApiResponse<StockTransferRequest[]>> => {
  try {
    const response = await api.get('/stock-transfer-requests', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching stock transfer requests:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch stock transfer requests'
    );
  }
};

/**
 * Fetch stock transfer request by ID
 * @param id - Stock Transfer Request ID
 * @returns Promise<ApiResponse<StockTransferRequest>>
 */
export const fetchStockTransferRequestById = async (
  id: number
): Promise<ApiResponse<StockTransferRequest>> => {
  try {
    const response = await api.get(`/stock-transfer-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching stock transfer request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch stock transfer request'
    );
  }
};

/**
 * Create or update stock transfer request (upsert)
 * @param requestData - Stock Transfer Request payload
 * @returns Promise<ApiResponse<StockTransferRequest>>
 */
export const upsertStockTransferRequest = async (
  requestData: ManageStockTransferRequestPayload
): Promise<ApiResponse<StockTransferRequest>> => {
  try {
    const response = await api.post('/stock-transfer-requests', requestData);
    return response.data;
  } catch (error: any) {
    console.error('Error upserting stock transfer request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to save stock transfer request'
    );
  }
};

/**
 * Delete stock transfer request
 * @param id - Stock Transfer Request ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteStockTransferRequest = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/stock-transfer-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting stock transfer request:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete stock transfer request'
    );
  }
};

export type {
  GetStockTransferRequestsParams,
  ManageStockTransferRequestPayload,
  UpdateStockTransferRequestPayload,
  PaginationMeta,
  StockTransferRequest,
  StockTransferLine,
  StockTransferRequestStats,
};
