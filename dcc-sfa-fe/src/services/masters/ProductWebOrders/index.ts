import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductWebOrder {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductWebOrderPayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductWebOrderPayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductWebOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const fetchProductWebOrders = async (
  params?: GetProductWebOrdersParams
): Promise<ApiResponse<ProductWebOrder[]>> => {
  try {
    const response = await api.get('/product-web-orders', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product web orders:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product web orders'
    );
  }
};

export const fetchProductWebOrderById = async (
  id: number
): Promise<ApiResponse<ProductWebOrder>> => {
  try {
    const response = await api.get(`/product-web-orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product web order:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product web order'
    );
  }
};

export const createProductWebOrder = async (
  productWebOrderData: ManageProductWebOrderPayload
): Promise<ApiResponse<ProductWebOrder>> => {
  try {
    const response = await api.post('/product-web-orders', productWebOrderData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product web order:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product web order'
    );
  }
};

export const updateProductWebOrder = async (
  id: number,
  productWebOrderData: UpdateProductWebOrderPayload
): Promise<ApiResponse<ProductWebOrder>> => {
  try {
    const response = await api.put(
      `/product-web-orders/${id}`,
      productWebOrderData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating product web order:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product web order'
    );
  }
};

export const deleteProductWebOrder = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-web-orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product web order:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product web order'
    );
  }
};

export type {
  GetProductWebOrdersParams,
  ManageProductWebOrderPayload,
  UpdateProductWebOrderPayload,
  PaginationMeta,
  ProductWebOrder,
};
