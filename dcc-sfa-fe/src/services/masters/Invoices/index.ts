import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface InvoiceItem {
  id?: number;
  parent_id?: number;
  product_id: number;
  product_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  parent_id: number;
  customer_id: number;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  payment_method?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  tax_amount?: number | null;
  shipping_amount?: number | null;
  total_amount?: number | null;
  amount_paid?: number | null;
  balance_due?: number | null;
  notes?: string | null;
  billing_address?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  currency_id?: number | null;
  // Related data
  currency?: {
    id: number;
    code: string;
    name: string;
  } | null;
  customer?: {
    id: number;
    name: string;
    code: string;
    type: string;
  } | null;
  order?: {
    id: number;
    order_number: string;
    status: string;
  } | null;
  invoice_items?: InvoiceItem[];
  payment_lines?: {
    id: number;
    amount_applied: number;
    payment_id: number;
  }[];
}

interface ManageInvoicePayload {
  invoice_number?: string;
  parent_id: number;
  customer_id: number;
  currency_id?: number;
  invoice_date?: string;
  due_date?: string;
  status?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_due?: number;
  notes?: string;
  billing_address?: string;
  is_active?: string;
  invoice_items?: InvoiceItem[];
}

interface UpdateInvoicePayload {
  invoice_number?: string;
  parent_id?: number;
  customer_id?: number;
  currency_id?: number;
  invoice_date?: string;
  due_date?: string;
  status?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_due?: number;
  notes?: string;
  billing_address?: string;
  is_active?: string;
  invoice_items?: InvoiceItem[];
}

interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_method?: string;
  customer_id?: number;
  parent_id?: number;
  invoice_date_from?: string;
  invoice_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  is_active?: string;
}

interface PaginationMeta {
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

interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  invoices_this_month: number;
  amount_this_month: number;
  overdue_invoices: number;
  overdue_amount: number;
}

/**
 * Fetch all invoices with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Invoice[]>>
 */
export const fetchInvoices = async (
  params?: GetInvoicesParams
): Promise<ApiResponse<Invoice[]>> => {
  try {
    const response = await axiosInstance.get('/invoices', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch invoice by ID
 * @param id - Invoice ID
 * @returns Promise<ApiResponse<Invoice>>
 */
export const fetchInvoiceById = async (
  id: number
): Promise<ApiResponse<Invoice>> => {
  try {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new invoice (silent - no toast, used by React Query hooks)
 * @param invoiceData - Invoice creation payload
 * @returns Promise<ApiResponse<Invoice>>
 */
export const createInvoice = async (
  invoiceData: ManageInvoicePayload
): Promise<ApiResponse<Invoice>> => {
  const response = await axiosInstance.post('/invoices', invoiceData);
  return response.data;
};

/**
 * Update existing invoice (silent - no toast, used by React Query hooks)
 * @param id - Invoice ID
 * @param invoiceData - Invoice update payload
 * @returns Promise<ApiResponse<Invoice>>
 */
export const updateInvoice = async (
  id: number,
  invoiceData: UpdateInvoicePayload
): Promise<ApiResponse<Invoice>> => {
  const response = await axiosInstance.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

/**
 * Delete invoice (silent - no toast, used by React Query hooks)
 * @param id - Invoice ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteInvoice = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/invoices/${id}`);
  return response.data;
};

export default {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};

export type {
  GetInvoicesParams,
  ManageInvoicePayload,
  UpdateInvoicePayload,
  PaginationMeta,
  InvoiceStats,
  Invoice,
  InvoiceItem,
};
