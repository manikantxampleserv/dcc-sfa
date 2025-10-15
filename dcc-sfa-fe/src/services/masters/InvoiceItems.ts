/**
 * @fileoverview Invoice Items Service
 * @description API service for managing invoice items
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';

export interface InvoiceItem {
  id?: number;
  parent_id: number;
  product_id: number;
  product_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  product?: {
    id: number;
    name: string;
    code: string;
    unit_of_measurement?: string;
  };
  invoice_items_products?: {
    id: number;
    name: string;
    code: string;
    description?: string;
    category_id?: number;
    sub_category_id?: number;
    brand_id?: number;
    unit_of_measurement?: number;
    base_price?: string;
    tax_rate?: string;
    is_active?: string;
    createdate?: string;
    createdby?: number;
    updatedate?: string;
    updatedby?: number;
    log_inst?: number;
    product_unit_of_measurement?: {
      id: number;
      name: string;
      description?: string;
      category?: string;
      symbol?: string;
      is_active?: string;
      createdate?: string;
      createdby?: number;
      updatedate?: string;
      updatedby?: number;
      log_inst?: number;
    };
  };
}

export interface CreateInvoiceItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
}

export interface UpdateInvoiceItemPayload {
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
}

export interface BulkUpdateInvoiceItemsPayload {
  invoiceItems: InvoiceItem[];
}

/**
 * Create a new invoice item
 */
export const createInvoiceItem = async (
  invoiceId: number,
  data: CreateInvoiceItemPayload
): Promise<{ success: boolean; message: string; data: InvoiceItem }> => {
  const response = await api.post(`/invoices/${invoiceId}/items`, data);
  return response.data;
};

/**
 * Get all invoice items for an invoice
 */
export const getInvoiceItems = async (
  invoiceId: number
): Promise<{ success: boolean; message: string; data: InvoiceItem[] }> => {
  const response = await api.get(`/invoices/${invoiceId}/items`);
  return response.data;
};

/**
 * Update an invoice item
 */
export const updateInvoiceItem = async (
  invoiceId: number,
  itemId: number,
  data: UpdateInvoiceItemPayload
): Promise<{ success: boolean; message: string; data: InvoiceItem }> => {
  const response = await api.put(
    `/invoices/${invoiceId}/items/${itemId}`,
    data
  );
  return response.data;
};

/**
 * Delete an invoice item
 */
export const deleteInvoiceItem = async (
  invoiceId: number,
  itemId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/invoices/${invoiceId}/items/${itemId}`);
  return response.data;
};

/**
 * Bulk update invoice items for an invoice
 */
export const bulkUpdateInvoiceItems = async (
  invoiceId: number,
  data: BulkUpdateInvoiceItemsPayload
): Promise<{ success: boolean; message: string; data: InvoiceItem[] }> => {
  const response = await api.put(`/invoices/${invoiceId}/items`, data);
  return response.data;
};
