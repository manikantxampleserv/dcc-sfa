import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Customer {
  id: number;
  name: string;
  code: string;
  zones_id?: number | null;
  type?: string | null;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  credit_limit?: string | null;
  outstanding_amount: string;
  route_id?: number | null;
  salesperson_id?: number | null;
  last_visit_date?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_zones?: {
    id: number;
    name: string;
    code: string;
  } | null;
  customer_routes?: {
    id: number;
    name: string;
    code: string;
  } | null;
  customer_users?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface ManageCustomerPayload {
  name: string;
  zones_id?: number;
  type?: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
  credit_limit?: string;
  outstanding_amount?: string;
  route_id?: number;
  salesperson_id?: number;
  last_visit_date?: string;
  is_active?: string;
}

interface UpdateCustomerPayload {
  name?: string;
  zones_id?: number;
  type?: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
  credit_limit?: string;
  outstanding_amount?: string;
  route_id?: number;
  salesperson_id?: number;
  last_visit_date?: string;
  is_active?: string;
}

interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  type?: string;
  zones_id?: number;
  route_id?: number;
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

interface CustomerStats {
  new_customers_this_month: number;
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  distributors: number;
  retailers: number;
  wholesellers: number;
  total_credit_limit: string;
  total_outstanding_amount: string;
}

/**
 * Fetch all customers with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Customer[]>>
 */
export const fetchCustomers = async (
  params?: GetCustomersParams
): Promise<ApiResponse<Customer[]>> => {
  try {
    const response = await axiosInstance.get('/customers', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch customer by ID
 * @param id - Customer ID
 * @returns Promise<ApiResponse<Customer>>
 */
export const fetchCustomerById = async (
  id: number
): Promise<ApiResponse<Customer>> => {
  try {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new customer (silent - no toast, used by React Query hooks)
 * @param customerData - Customer creation payload
 * @returns Promise<ApiResponse<Customer>>
 */
export const createCustomer = async (
  customerData: ManageCustomerPayload
): Promise<ApiResponse<Customer>> => {
  const response = await axiosInstance.post('/customers', customerData);
  return response.data;
};

/**
 * Update existing customer (silent - no toast, used by React Query hooks)
 * @param id - Customer ID
 * @param customerData - Customer update payload
 * @returns Promise<ApiResponse<Customer>>
 */
export const updateCustomer = async (
  id: number,
  customerData: UpdateCustomerPayload
): Promise<ApiResponse<Customer>> => {
  const response = await axiosInstance.put(`/customers/${id}`, customerData);
  return response.data;
};

/**
 * Delete customer (silent - no toast, used by React Query hooks)
 * @param id - Customer ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteCustomer = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response.data;
};

export interface CustomerDropdown {
  id: number;
  name: string;
  code: string;
}

export interface GetCustomersDropdownParams {
  search?: string;
  customer_id?: number;
}

export const fetchCustomersDropdown = async (
  params?: GetCustomersDropdownParams
): Promise<ApiResponse<CustomerDropdown[]>> => {
  try {
    const response = await axiosInstance.get('/customers-dropdown', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

export type {
  GetCustomersParams,
  ManageCustomerPayload,
  UpdateCustomerPayload,
  PaginationMeta,
  CustomerStats,
  Customer,
};
