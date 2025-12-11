import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface Product {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category_id: number;
  sub_category_id: number;
  brand_id: number;
  unit_of_measurement: number;
  base_price?: number | null;
  tax_rate?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  route_type_id?: number | null;
  outlet_group_id?: number | null;
  tracking_type?: string | null;
  batch_lots?: { id: number; batch_number: string; quantity: number }[];
  inventory_stock?: {
    id: number;
    location_id: number;
    current_stock: number;
  }[];
  price_history?: { id: number; price: number; effective_date: Date }[];
  order_items?: {
    id: number;
    order_id: number;
    quantity: number;
    price: number;
  }[];
  product_brand: { id: number; name: string; code: string; logo: string };
  product_unit: { id: number; name: string };
  product_category: { id: number; category_name: string };
  product_sub_category: { id: number; sub_category_name: string };
  route_type?: { id: number; name: string } | null;
  outlet_group?: { id: number; name: string; code: string } | null;
}

interface ManageProductPayload {
  name: string;
  description?: string;
  category_id: number;
  sub_category_id: number;
  brand_id: number;
  unit_of_measurement: number;
  base_price?: number;
  tax_rate?: number;
  route_type_id?: number;
  outlet_group_id?: number;
  tracking_type?: 'None' | 'Batch' | 'Serial';
  is_active?: string;
}

interface UpdateProductPayload {
  name?: string;
  description?: string;
  category_id?: number;
  sub_category_id?: number;
  brand_id?: number;
  unit_of_measurement?: number;
  base_price?: number;
  tax_rate?: number;
  route_type_id?: number;
  outlet_group_id?: number;
  tracking_type?: string;
  is_active?: string;
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: number;
  brand_id?: number;
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

interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  new_products_this_month: number;
}

/**
 * Fetch all products with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Product[]>>
 */
export const fetchProducts = async (
  params?: GetProductsParams
): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch product by ID
 * @param id - Product ID
 * @returns Promise<ApiResponse<Product>>
 */
export const fetchProductById = async (
  id: number
): Promise<ApiResponse<Product>> => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new product (silent - no toast, used by React Query hooks)
 * @param productData - Product creation payload
 * @returns Promise<ApiResponse<Product>>
 */
export const createProduct = async (
  productData: ManageProductPayload
): Promise<ApiResponse<Product>> => {
  const response = await axiosInstance.post('/products', productData);
  return response.data;
};

/**
 * Update existing product (silent - no toast, used by React Query hooks)
 * @param id - Product ID
 * @param productData - Product update payload
 * @returns Promise<ApiResponse<Product>>
 */
export const updateProduct = async (
  id: number,
  productData: UpdateProductPayload
): Promise<ApiResponse<Product>> => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Delete product (silent - no toast, used by React Query hooks)
 * @param id - Product ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteProduct = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

export interface ProductDropdown {
  id: number;
  name: string;
  code: string;
}

export interface GetProductsDropdownParams {
  search?: string;
  product_id?: number;
}

export const fetchProductsDropdown = async (
  params?: GetProductsDropdownParams
): Promise<ApiResponse<ProductDropdown[]>> => {
  try {
    const response = await axiosInstance.get('/products-dropdown', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export type {
  GetProductsParams,
  ManageProductPayload,
  UpdateProductPayload,
  PaginationMeta,
  ProductStats,
  Product,
};
