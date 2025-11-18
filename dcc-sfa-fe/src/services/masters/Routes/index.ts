import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Route {
  id: number;
  parent_id: number;
  depot_id: number;
  name: string;
  code: string;
  description?: string | null;
  salesperson_id?: number | null;
  start_location?: string | null;
  end_location?: string | null;
  estimated_distance?: string | null; // API returns string
  estimated_time?: number | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_routes?: Array<{
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
    is_active: string;
  }>;
  routes_depots?: {
    id: number;
    name: string;
    code: string;
  } | null;
  routes_zones?: {
    id: number;
    name: string;
  } | null;
  routes_salesperson?: {
    id: number;
    name: string;
    email: string;
  } | null;
  routes_route_type?: {
    id: number;
    name: string;
  } | null;
  visit_routes?: Array<{
    id: number;
    customer_id: number;
    sales_person_id: number;
    visit_date?: string | null;
    visit_time?: string | null;
    purpose?: string | null;
    status?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    duration?: number | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    orders_created?: number | null;
    amount_collected?: string | null;
    visit_notes?: string | null;
    customer_feedback?: string | null;
    next_visit_date?: string | null;
    is_active: string;
    createdate?: string | null;
    visit_customers?: { id: number; name: string; code: string } | null;
    visits_salesperson?: { id: number; name: string; email: string } | null;
  }>;
}

interface ManageRoutePayload {
  parent_id: number;
  depot_id: number;
  name: string;
  description?: string;
  salesperson_id?: number;
  start_location?: string;
  end_location?: string;
  estimated_distance?: number;
  estimated_time?: number;
  is_active?: string;
}

interface UpdateRoutePayload {
  parent_id?: number;
  depot_id?: number;
  name?: string;
  description?: string;
  salesperson_id?: number;
  start_location?: string;
  end_location?: string;
  estimated_distance?: number;
  estimated_time?: number;
  is_active?: string;
}

interface GetRoutesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  parent_id?: number;
  depot_id?: number;
  salesperson_id?: number;
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

interface RouteStats {
  total_routes: number;
  active_routes: number;
  inactive_routes: number;
  routes_this_month: number;
}

/**
 * Fetch all routes with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Route[]>>
 */
export const fetchRoutes = async (
  params?: GetRoutesParams
): Promise<ApiResponse<Route[]>> => {
  try {
    const response = await axiosInstance.get('/routes', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch route by ID
 * @param id - Route ID
 * @returns Promise<ApiResponse<Route>>
 */
export const fetchRouteById = async (
  id: number
): Promise<ApiResponse<Route>> => {
  try {
    const response = await axiosInstance.get(`/routes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new route (silent - no toast, used by React Query hooks)
 * @param routeData - Route creation payload
 * @returns Promise<ApiResponse<Route>>
 */
export const createRoute = async (
  routeData: ManageRoutePayload
): Promise<ApiResponse<Route>> => {
  const response = await axiosInstance.post('/routes', routeData);
  return response.data;
};

/**
 * Update existing route (silent - no toast, used by React Query hooks)
 * @param id - Route ID
 * @param routeData - Route update payload
 * @returns Promise<ApiResponse<Route>>
 */
export const updateRoute = async (
  id: number,
  routeData: UpdateRoutePayload
): Promise<ApiResponse<Route>> => {
  const response = await axiosInstance.put(`/routes/${id}`, routeData);
  return response.data;
};

/**
 * Delete route (silent - no toast, used by React Query hooks)
 * @param id - Route ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteRoute = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/routes/${id}`);
  return response.data;
};

export default {
  fetchRoutes,
  fetchRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};

export type {
  GetRoutesParams,
  ManageRoutePayload,
  UpdateRoutePayload,
  PaginationMeta,
  RouteStats,
  Route,
};
