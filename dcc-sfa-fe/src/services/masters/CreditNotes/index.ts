import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface CreditNoteItem {
  id?: number;
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

interface CreditNote {
  id: number;
  credit_note_number: string;
  parent_id: number;
  products_id?: number | null;
  customer_id: number;
  credit_note_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  reason?: string | null;
  payment_method?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  tax_amount?: number | null;
  shipping_amount?: number | null;
  total_amount?: number | null;
  amount_applied?: number | null;
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
  } | null;
  product?: {
    id: number;
    name: string;
  } | null;
  creditNoteItems?: CreditNoteItem[];
}

interface ManageCreditNotePayload {
  parent_id: number;
  products_id?: number;
  customer_id: number;
  currency_id?: number;
  credit_note_date?: string;
  due_date?: string;
  status?: string;
  reason?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  amount_applied?: number;
  balance_due?: number;
  notes?: string;
  billing_address?: string;
  is_active?: string;
  creditNoteItems?: CreditNoteItem[];
}

interface UpdateCreditNotePayload {
  parent_id?: number;
  products_id?: number;
  customer_id?: number;
  currency_id?: number;
  credit_note_date?: string;
  due_date?: string;
  status?: string;
  reason?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  amount_applied?: number;
  balance_due?: number;
  notes?: string;
  billing_address?: string;
  is_active?: string;
  creditNoteItems?: CreditNoteItem[];
}

interface GetCreditNotesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  parent_id?: number;
  customer_id?: number;
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

interface CreditNoteStats {
  total_credit_notes: number;
  active_credit_notes: number;
  inactive_credit_notes: number;
  new_credit_notes_this_month: number;
}

/**
 * Fetch all credit notes with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<CreditNote[]>>
 */
export const fetchCreditNotes = async (
  params?: GetCreditNotesParams
): Promise<ApiResponse<CreditNote[]>> => {
  try {
    const response = await axiosInstance.get('/transaction/credit-notes', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch credit note by ID
 * @param id - Credit Note ID
 * @returns Promise<ApiResponse<CreditNote>>
 */
export const fetchCreditNoteById = async (
  id: number
): Promise<ApiResponse<CreditNote>> => {
  try {
    const response = await axiosInstance.get(`/transaction/credit-notes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new credit note (silent - no toast, used by React Query hooks)
 * @param creditNoteData - Credit note creation payload
 * @returns Promise<ApiResponse<CreditNote>>
 */
export const createCreditNote = async (
  creditNoteData: ManageCreditNotePayload
): Promise<ApiResponse<CreditNote>> => {
  const response = await axiosInstance.post(
    '/transaction/credit-notes',
    creditNoteData
  );
  return response.data;
};

/**
 * Update existing credit note (silent - no toast, used by React Query hooks)
 * @param id - Credit Note ID
 * @param creditNoteData - Credit note update payload
 * @returns Promise<ApiResponse<CreditNote>>
 */
export const updateCreditNote = async (
  id: number,
  creditNoteData: UpdateCreditNotePayload
): Promise<ApiResponse<CreditNote>> => {
  const response = await axiosInstance.post('/transaction/credit-notes', {
    ...creditNoteData,
    id,
  });
  return response.data;
};

/**
 * Delete credit note (silent - no toast, used by React Query hooks)
 * @param id - Credit Note ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteCreditNote = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(
    `/transaction/credit-notes/${id}`
  );
  return response.data;
};

export default {
  fetchCreditNotes,
  fetchCreditNoteById,
  createCreditNote,
  updateCreditNote,
  deleteCreditNote,
};

export type {
  GetCreditNotesParams,
  ManageCreditNotePayload,
  UpdateCreditNotePayload,
  PaginationMeta,
  CreditNoteStats,
  CreditNote,
  CreditNoteItem,
};
