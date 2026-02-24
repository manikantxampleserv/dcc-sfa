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
  route_type_id?: number | null;
  salespersons?: Array<{
    id: number;
    role: string;
    is_active: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  start_location?: string | null;
  end_location?: string | null;
  estimated_distance?: string | null;
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
  route_depots?: {
    id: number;
    name: string;
    code: string;
  } | null;
  route_zones?: {
    id: number;
    name: string;
    code: string;
  } | null;
  routes_salesperson?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string | null;
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

interface RouteAssignment {
  id: number;
  name: string;
  email: string;
  profile_image?: string | null;
  depot_id?: number | null;
  zone_id?: number | null;
  assigned_routes: Array<{
    id: number;
    name?: string | null;
    code?: string | null;
  }>;
  assigned_routes_count?: number;
}

interface ManageRoutePayload {
  parent_id: number;
  depot_id: number;
  name: string;
  description?: string;
  salespersons?: Array<{
    user_id: number;
    role?: string;
  }>;
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
  salespersons?: Array<{
    user_id: number;
    role?: string;
  }>;
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
  status?: string;
  parent_id?: number;
  depot_id?: number;
  salesperson_id?: number;
}

interface GetRouteAssignmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  depot_id?: number;
  zone_id?: number;
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
 * @param force - Force delete
 * @returns Promise<ApiResponse<void>>
 */
export const deleteRoute = async (id: number, force?: string) => {
  const response = await axiosInstance({
    method: 'DELETE',
    url: `/routes/${id}`,
    data: { force: force || undefined }, // Always include force in request body
  });
  return response.data;
};

export const fetchRouteAssignments = async (
  params?: GetRouteAssignmentsParams
): Promise<ApiResponse<RouteAssignment[]>> => {
  const response = await axiosInstance.get('/route-assignments', { params });
  return response.data;
};

export const fetchRouteAssignmentsByUser = async (
  userId: number
): Promise<ApiResponse<RouteAssignment>> => {
  const response = await axiosInstance.get(`/route-assignments/${userId}`);
  return response.data;
};

export const setRouteAssignmentsForUser = async (
  userId: number,
  route_ids: number[]
): Promise<ApiResponse<RouteAssignment>> => {
  const response = await axiosInstance.post(`/route-assignments/${userId}`, {
    route_ids,
  });
  return response.data;
};

export default {
  fetchRoutes,
  fetchRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  fetchRouteAssignments,
  fetchRouteAssignmentsByUser,
  setRouteAssignmentsForUser,
};

export type {
  GetRoutesParams,
  GetRouteAssignmentsParams,
  ManageRoutePayload,
  UpdateRoutePayload,
  PaginationMeta,
  RouteStats,
  Route,
  RouteAssignment,
};
