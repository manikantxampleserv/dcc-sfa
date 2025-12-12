import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Visit {
  id: number;
  customer_id: number;
  sales_person_id: number;
  route_id?: number | null;
  zones_id?: number | null;
  visit_date?: string | null;
  visit_time?: string | null;
  purpose?: string | null;
  status?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  duration?: number | null;
  start_latitude?: string | null;
  start_longitude?: string | null;
  end_latitude?: string | null;
  end_longitude?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  orders_created?: number | null;
  amount_collected?: string | null;
  visit_notes?: string | null;
  customer_feedback?: string | null;
  next_visit_date?: string | null;
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
    type?: string | null;
    contact_person?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    outstanding_amount: number;
    credit_limit: number;
    is_active: string;
  } | null;
  salesperson?: {
    id: number;
    name: string;
    email: string;
  } | null;
  route?: {
    id: number;
    name: string;
    code: string;
  } | null;
  zone?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

interface ManageVisitPayload {
  customer_id: number;
  sales_person_id: number;
  route_id?: number;
  zones_id?: number;
  visit_date?: string;
  visit_time?: string;
  purpose?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  start_latitude?: string;
  start_longitude?: string;
  end_latitude?: string;
  end_longitude?: string;
  check_in_time?: string;
  check_out_time?: string;
  orders_created?: number;
  amount_collected?: string;
  visit_notes?: string;
  customer_feedback?: string;
  next_visit_date?: string;
  is_active?: string;
}

interface UpdateVisitPayload {
  customer_id?: number;
  sales_person_id?: number;
  route_id?: number;
  zones_id?: number;
  visit_date?: string;
  visit_time?: string;
  purpose?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  start_latitude?: string;
  start_longitude?: string;
  end_latitude?: string;
  end_longitude?: string;
  check_in_time?: string;
  check_out_time?: string;
  orders_created?: number;
  amount_collected?: string;
  visit_notes?: string;
  customer_feedback?: string;
  next_visit_date?: string;
  is_active?: string;
}

interface GetVisitsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  customer_id?: number;
  sales_person_id?: number;
  route_id?: number;
  zones_id?: number;
  status?: string;
  visit_date?: string;
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

interface VisitStats {
  totalVisits: number;
  active_visits: number;
  inactive_visits: number;
  new_visits: number;
}

/**
 * Fetch all visits with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Visit[]>>
 */
export const fetchVisits = async (
  params?: GetVisitsParams
): Promise<ApiResponse<Visit[]>> => {
  try {
    const response = await axiosInstance.get('/reports/visits', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch visit by ID
 * @param id - Visit ID
 * @returns Promise<ApiResponse<Visit>>
 */
export const fetchVisitById = async (
  id: number
): Promise<ApiResponse<Visit>> => {
  try {
    const response = await axiosInstance.get(`/reports/visits/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new visit (silent - no toast, used by React Query hooks)
 * @param visitData - Visit creation payload
 * @returns Promise<ApiResponse<Visit>>
 */
export const createVisit = async (
  visitData: ManageVisitPayload
): Promise<ApiResponse<Visit>> => {
  const response = await axiosInstance.post('/visits', visitData);
  return response.data;
};

/**
 * Update existing visit (silent - no toast, used by React Query hooks)
 * @param id - Visit ID
 * @param visitData - Visit update payload
 * @returns Promise<ApiResponse<Visit>>
 */
export const updateVisit = async (
  id: number,
  visitData: UpdateVisitPayload
): Promise<ApiResponse<Visit>> => {
  const response = await axiosInstance.put(`/reports/visits/${id}`, visitData);
  return response.data;
};

/**
 * Delete visit (silent - no toast, used by React Query hooks)
 * @param id - Visit ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteVisit = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/reports/visits/${id}`);
  return response.data;
};

export default {
  fetchVisits,
  fetchVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
};

export type {
  GetVisitsParams,
  ManageVisitPayload,
  UpdateVisitPayload,
  PaginationMeta,
  VisitStats,
  Visit,
};
