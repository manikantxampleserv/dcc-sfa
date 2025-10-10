/**
 * @fileoverview Currency Service with API Integration
 * @description Provides currency CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol?: string | null;
  exchange_rate_to_base?: number | null;
  is_base: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  credit_notes?: { id: number; note_number: string; amount: number }[];
  invoices?: { id: number; invoice_number: string; amount: number }[];
  payments?: { id: number; payment_number: string; amount: number }[];
  orders?: { id: number; order_number: string; total_amount: number }[];
}

interface ManageCurrencyPayload {
  name: string;
  code?: string;
  symbol?: string;
  exchange_rate_to_base?: number;
  is_base?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateCurrencyPayload {
  name?: string;
  symbol?: string;
  exchange_rate_to_base?: number;
  is_base?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetCurrenciesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Fetch currencies with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Currency[]>>
 */
export const fetchCurrencies = async (
  params?: GetCurrenciesParams
): Promise<ApiResponse<Currency[]>> => {
  try {
    const response = await api.get('/currencies', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching currencies:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch currencies'
    );
  }
};

/**
 * Fetch currency by ID
 * @param id - Currency ID
 * @returns Promise<ApiResponse<Currency>>
 */
export const fetchCurrencyById = async (
  id: number
): Promise<ApiResponse<Currency>> => {
  try {
    const response = await api.get(`/currencies/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching currency:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch currency'
    );
  }
};

/**
 * Create new currency
 * @param currencyData - Currency creation payload
 * @returns Promise<ApiResponse<Currency>>
 */
export const createCurrency = async (
  currencyData: ManageCurrencyPayload
): Promise<ApiResponse<Currency>> => {
  try {
    const response = await api.post('/currencies', currencyData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating currency:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create currency'
    );
  }
};

/**
 * Update existing currency
 * @param id - Currency ID
 * @param currencyData - Currency update payload
 * @returns Promise<ApiResponse<Currency>>
 */
export const updateCurrency = async (
  id: number,
  currencyData: UpdateCurrencyPayload
): Promise<ApiResponse<Currency>> => {
  try {
    const response = await api.put(`/currencies/${id}`, currencyData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating currency:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update currency'
    );
  }
};

/**
 * Delete currency
 * @param id - Currency ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteCurrency = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/currencies/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting currency:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete currency'
    );
  }
};

export type {
  GetCurrenciesParams,
  ManageCurrencyPayload,
  UpdateCurrencyPayload,
  PaginationMeta,
  Currency,
};
