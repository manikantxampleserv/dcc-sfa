import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductShelfLife {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductShelfLifePayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductShelfLifePayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductShelfLifeParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const fetchProductShelfLife = async (
  params?: GetProductShelfLifeParams
): Promise<ApiResponse<ProductShelfLife[]>> => {
  try {
    const response = await api.get('/product-shelf-life', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product shelf life:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product shelf life'
    );
  }
};

export const fetchProductShelfLifeById = async (
  id: number
): Promise<ApiResponse<ProductShelfLife>> => {
  try {
    const response = await api.get(`/product-shelf-life/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product shelf life:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product shelf life'
    );
  }
};

export const createProductShelfLife = async (
  shelfLifeData: ManageProductShelfLifePayload
): Promise<ApiResponse<ProductShelfLife>> => {
  try {
    const response = await api.post('/product-shelf-life', shelfLifeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product shelf life:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product shelf life'
    );
  }
};

export const updateProductShelfLife = async (
  id: number,
  shelfLifeData: UpdateProductShelfLifePayload
): Promise<ApiResponse<ProductShelfLife>> => {
  try {
    const response = await api.put(`/product-shelf-life/${id}`, shelfLifeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product shelf life:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product shelf life'
    );
  }
};

export const deleteProductShelfLife = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-shelf-life/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product shelf life:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product shelf life'
    );
  }
};

export type {
  GetProductShelfLifeParams,
  ManageProductShelfLifePayload,
  UpdateProductShelfLifePayload,
  ProductShelfLife,
};
