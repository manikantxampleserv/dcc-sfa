/**
 * @fileoverview Payment Collection Service with API Integration
 * @description Provides payment collection CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Payment {
  id: number;
  payment_number: string;
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  currency_id?: number;
  customer?: {
    id: number;
    name: string;
    code: string;
  };
  collected_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  currency?: {
    id: number;
    name: string;
    code: string;
  };
  payment_lines?: {
    id: number;
    invoice_id: number;
    invoice_number?: string;
    invoice_date?: string;
    amount_applied: number;
    notes?: string;
    invoice?: {
      id: number;
      invoice_number: string;
      total_amount: number;
      balance_due: number;
    };
  }[];
}

interface ManagePaymentPayload {
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  currency_id?: number;
  payment_lines?: {
    invoice_id: number;
    amount_applied: number;
    notes?: string;
  }[];
}

interface UpdatePaymentPayload {
  customer_id?: number;
  payment_date?: string;
  collected_by?: number;
  method?: string;
  reference_number?: string;
  total_amount?: number;
  notes?: string;
  currency_id?: number;
  payment_lines?: {
    invoice_id: number;
    amount_applied: number;
    notes?: string;
  }[];
  updatedby?: number;
}

interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: number;
  collected_by?: number;
  method?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  currency_id?: number;
  is_active?: string;
}

interface PaymentStats {
  total_payments: number;
  total_amount: number;
  payments_this_month: number;
  amount_this_month: number;
  pending_collections: number;
  overdue_amount: number;
}

/**
 * Fetch payments with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Payment[]>>
 */
export const fetchPayments = async (
  params?: GetPaymentsParams
): Promise<ApiResponse<Payment[]>> => {
  try {
    const response = await api.get('/payments', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch payments'
    );
  }
};

/**
 * Fetch payment by ID
 * @param id - Payment ID
 * @returns Promise<ApiResponse<Payment>>
 */
export const fetchPaymentById = async (
  id: number
): Promise<ApiResponse<Payment>> => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment');
  }
};

/**
 * Create new payment
 * @param paymentData - Payment creation payload
 * @returns Promise<ApiResponse<Payment>>
 */
export const createPayment = async (
  paymentData: ManagePaymentPayload
): Promise<ApiResponse<Payment>> => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment'
    );
  }
};

/**
 * Update existing payment
 * @param id - Payment ID
 * @param paymentData - Payment update payload
 * @returns Promise<ApiResponse<Payment>>
 */
export const updatePayment = async (
  id: number,
  paymentData: UpdatePaymentPayload
): Promise<ApiResponse<Payment>> => {
  try {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update payment'
    );
  }
};

/**
 * Delete payment
 * @param id - Payment ID
 * @returns Promise<ApiResponse<void>>
 */
export const deletePayment = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete payment'
    );
  }
};

/**
 * Get payment statistics
 * @param filters - Filter parameters
 * @returns Promise<ApiResponse<PaymentStats>>
 */
export const fetchPaymentStats = async (
  filters?: any
): Promise<ApiResponse<PaymentStats>> => {
  try {
    const response = await api.get('/payments/stats', { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch payment statistics'
    );
  }
};

export type {
  GetPaymentsParams,
  ManagePaymentPayload,
  UpdatePaymentPayload,
  PaymentStats,
  Payment,
};
