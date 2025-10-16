/**
 * @fileoverview Invoice Payment Lines Service
 * @description API service for managing invoice payment lines
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';

export interface PaymentLine {
  id?: number;
  parent_id: number;
  invoice_id: number;
  invoice_number?: string;
  invoice_date?: string;
  amount_applied: number;
  notes?: string;
  payments?: {
    id: number;
    payment_number: string;
    payment_date: string;
    method: string;
    total_amount: number;
    reference_number?: string;
    payments_customers?: {
      id: number;
      name: string;
      code: string;
    };
    users_payments_collected_byTousers?: {
      id: number;
      name: string;
      email: string;
    };
    currencies?: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface CreatePaymentLinePayload {
  payment_id: number;
  amount_applied: number;
  notes?: string;
}

export interface UpdatePaymentLinePayload {
  amount_applied?: number;
  notes?: string;
}

export interface BulkUpdatePaymentLinesPayload {
  paymentLines: PaymentLine[];
}

/**
 * Create a new payment line for an invoice
 */
export const createInvoicePaymentLine = async (
  invoiceId: number,
  data: CreatePaymentLinePayload
): Promise<{ success: boolean; message: string; data: PaymentLine }> => {
  const response = await api.post(`/invoices/${invoiceId}/payment-lines`, data);
  return response.data;
};

/**
 * Get all payment lines for an invoice
 */
export const getInvoicePaymentLines = async (
  invoiceId: number
): Promise<{ success: boolean; message: string; data: PaymentLine[] }> => {
  const response = await api.get(`/invoices/${invoiceId}/payment-lines`);
  return response.data;
};

/**
 * Update a payment line
 */
export const updateInvoicePaymentLine = async (
  invoiceId: number,
  lineId: number,
  data: UpdatePaymentLinePayload
): Promise<{ success: boolean; message: string; data: PaymentLine }> => {
  const response = await api.put(
    `/invoices/${invoiceId}/payment-lines/${lineId}`,
    data
  );
  return response.data;
};

/**
 * Delete a payment line
 */
export const deleteInvoicePaymentLine = async (
  invoiceId: number,
  lineId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/invoices/${invoiceId}/payment-lines/${lineId}`
  );
  return response.data;
};

/**
 * Bulk update payment lines for an invoice
 */
export const bulkUpdateInvoicePaymentLines = async (
  invoiceId: number,
  data: BulkUpdatePaymentLinesPayload
): Promise<{ success: boolean; message: string; data: PaymentLine[] }> => {
  const response = await api.put(`/invoices/${invoiceId}/payment-lines`, data);
  return response.data;
};
