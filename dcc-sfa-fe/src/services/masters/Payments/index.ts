/**
 * @fileoverview Payment Collection Service with API Integration
 * @description Provides payment collection CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface PaymentLine {
  id: number;
  parent_id: number;
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
    status?: string;
  };
}

interface PaymentRefund {
  id: number;
  parent_id: number;
  refund_date?: string;
  amount: number;
  reason: string;
  reference_number?: string;
  method?: string;
  status?: string;
  notes?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  refund_lines?: RefundLine[];
}

interface RefundLine {
  id: number;
  parent_id: number;
  invoice_id: number;
  invoice_number?: string;
  invoice_date?: string;
  amount_refunded: number;
  notes?: string;
  invoice?: {
    id: number;
    invoice_number: string;
    total_amount: number;
    balance_due: number;
  };
}

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
  payment_lines?: PaymentLine[];
  payment_refunds?: PaymentRefund[];
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

// Payment Lines API Methods
interface CreatePaymentLinePayload {
  invoice_id: number;
  amount_applied: number;
  notes?: string;
}

interface UpdatePaymentLinePayload {
  invoice_id?: number;
  amount_applied?: number;
  notes?: string;
}

/**
 * Create payment line
 * @param paymentId - Payment ID
 * @param lineData - Payment line creation payload
 * @returns Promise<ApiResponse<PaymentLine>>
 */
export const createPaymentLine = async (
  paymentId: number,
  lineData: CreatePaymentLinePayload
): Promise<ApiResponse<PaymentLine>> => {
  try {
    const response = await api.post(`/payments/${paymentId}/lines`, lineData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment line:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment line'
    );
  }
};

/**
 * Get payment lines
 * @param paymentId - Payment ID
 * @returns Promise<ApiResponse<PaymentLine[]>>
 */
export const fetchPaymentLines = async (
  paymentId: number
): Promise<ApiResponse<PaymentLine[]>> => {
  try {
    const response = await api.get(`/payments/${paymentId}/lines`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment lines:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch payment lines'
    );
  }
};

/**
 * Delete payment line
 * @param paymentId - Payment ID
 * @param lineId - Payment line ID
 * @returns Promise<ApiResponse<void>>
 */
export const deletePaymentLine = async (
  paymentId: number,
  lineId: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/payments/${paymentId}/lines/${lineId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting payment line:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete payment line'
    );
  }
};

// Payment Refunds API Methods
interface CreatePaymentRefundPayload {
  refund_date?: string;
  amount: number;
  reason: string;
  reference_number?: string;
  method?: string;
  status?: string;
  notes?: string;
  createdby?: number;
  log_inst?: number;
}

interface UpdatePaymentRefundPayload {
  refund_date?: string;
  amount?: number;
  reason?: string;
  reference_number?: string;
  method?: string;
  status?: string;
  notes?: string;
  updatedby?: number;
}

/**
 * Create payment refund
 * @param paymentId - Payment ID
 * @param refundData - Payment refund creation payload
 * @returns Promise<ApiResponse<PaymentRefund>>
 */
export const createPaymentRefund = async (
  paymentId: number,
  refundData: CreatePaymentRefundPayload
): Promise<ApiResponse<PaymentRefund>> => {
  try {
    const response = await api.post(
      `/payments/${paymentId}/refunds`,
      refundData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment refund:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment refund'
    );
  }
};

/**
 * Get payment refunds
 * @param paymentId - Payment ID
 * @returns Promise<ApiResponse<PaymentRefund[]>>
 */
export const fetchPaymentRefunds = async (
  paymentId: number
): Promise<ApiResponse<PaymentRefund[]>> => {
  try {
    const response = await api.get(`/payments/${paymentId}/refunds`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment refunds:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch payment refunds'
    );
  }
};

/**
 * Update payment refund
 * @param paymentId - Payment ID
 * @param refundId - Payment refund ID
 * @param refundData - Payment refund update payload
 * @returns Promise<ApiResponse<PaymentRefund>>
 */
export const updatePaymentRefund = async (
  paymentId: number,
  refundId: number,
  refundData: UpdatePaymentRefundPayload
): Promise<ApiResponse<PaymentRefund>> => {
  try {
    const response = await api.put(
      `/payments/${paymentId}/refunds/${refundId}`,
      refundData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment refund:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update payment refund'
    );
  }
};

/**
 * Delete payment refund
 * @param paymentId - Payment ID
 * @param refundId - Payment refund ID
 * @returns Promise<ApiResponse<void>>
 */
export const deletePaymentRefund = async (
  paymentId: number,
  refundId: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(
      `/payments/${paymentId}/refunds/${refundId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting payment refund:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete payment refund'
    );
  }
};

export type {
  GetPaymentsParams,
  ManagePaymentPayload,
  UpdatePaymentPayload,
  PaymentStats,
  Payment,
  PaymentLine,
  PaymentRefund,
  RefundLine,
  CreatePaymentLinePayload,
  UpdatePaymentLinePayload,
  CreatePaymentRefundPayload,
  UpdatePaymentRefundPayload,
};
