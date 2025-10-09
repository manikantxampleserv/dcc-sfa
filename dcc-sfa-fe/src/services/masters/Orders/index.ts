import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface OrderItem {
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

interface Order {
  id: number;
  order_number: string;
  parent_id: number;
  salesperson_id: number;
  order_date?: string | null;
  delivery_date?: string | null;
  status?: string | null;
  priority?: string | null;
  order_type?: string | null;
  payment_method?: string | null;
  payment_terms?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  tax_amount?: number | null;
  shipping_amount?: number | null;
  total_amount?: number | null;
  notes?: string | null;
  shipping_address?: string | null;
  approval_status?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
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
  salesperson?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
  order_items?: OrderItem[];
  invoices?: {
    id: number;
    invoice_number: string;
    amount: number;
  }[];
}

interface ManageOrderPayload {
  order_number?: string;
  parent_id: number;
  salesperson_id: number;
  currency_id?: number;
  order_date?: string;
  delivery_date?: string;
  status?: string;
  priority?: string;
  order_type?: string;
  payment_method?: string;
  payment_terms?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  notes?: string;
  shipping_address?: string;
  approval_status?: string;
  approved_by?: number;
  is_active?: string;
  order_items?: OrderItem[];
}

interface UpdateOrderPayload {
  order_number?: string;
  parent_id?: number;
  salesperson_id?: number;
  currency_id?: number;
  order_date?: string;
  delivery_date?: string;
  status?: string;
  priority?: string;
  order_type?: string;
  payment_method?: string;
  payment_terms?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  notes?: string;
  shipping_address?: string;
  approval_status?: string;
  approved_by?: number;
  is_active?: string;
  order_items?: OrderItem[];
}

interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  order_type?: string;
  approval_status?: string;
  parent_id?: number;
  salesperson_id?: number;
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

interface OrderStats {
  total_orders: number;
  active_orders: number;
  inactive_orders: number;
  orders_this_month: number;
}

/**
 * Fetch all orders with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Order[]>>
 */
export const fetchOrders = async (
  params?: GetOrdersParams
): Promise<ApiResponse<Order[]>> => {
  try {
    const response = await axiosInstance.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch order by ID
 * @param id - Order ID
 * @returns Promise<ApiResponse<Order>>
 */
export const fetchOrderById = async (
  id: number
): Promise<ApiResponse<Order>> => {
  try {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new order (silent - no toast, used by React Query hooks)
 * @param orderData - Order creation payload
 * @returns Promise<ApiResponse<Order>>
 */
export const createOrder = async (
  orderData: ManageOrderPayload
): Promise<ApiResponse<Order>> => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

/**
 * Update existing order (silent - no toast, used by React Query hooks)
 * @param id - Order ID
 * @param orderData - Order update payload
 * @returns Promise<ApiResponse<Order>>
 */
export const updateOrder = async (
  id: number,
  orderData: UpdateOrderPayload
): Promise<ApiResponse<Order>> => {
  const response = await axiosInstance.put(`/orders/${id}`, orderData);
  return response.data;
};

/**
 * Delete order (silent - no toast, used by React Query hooks)
 * @param id - Order ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteOrder = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/orders/${id}`);
  return response.data;
};

export default {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};

export type {
  GetOrdersParams,
  ManageOrderPayload,
  UpdateOrderPayload,
  PaginationMeta,
  OrderStats,
  Order,
  OrderItem,
};
