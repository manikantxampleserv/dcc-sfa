import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductFlavour {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductFlavourPayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductFlavourPayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductFlavoursParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const fetchProductFlavours = async (
  params?: GetProductFlavoursParams
): Promise<ApiResponse<ProductFlavour[]>> => {
  try {
    const response = await api.get('/product-flavours', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product flavours:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product flavours'
    );
  }
};

export const fetchProductFlavourById = async (
  id: number
): Promise<ApiResponse<ProductFlavour>> => {
  try {
    const response = await api.get(`/product-flavours/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product flavour:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product flavour'
    );
  }
};

export const createProductFlavour = async (
  flavourData: ManageProductFlavourPayload
): Promise<ApiResponse<ProductFlavour>> => {
  try {
    const response = await api.post('/product-flavours', flavourData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product flavour:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product flavour'
    );
  }
};

export const updateProductFlavour = async (
  id: number,
  flavourData: UpdateProductFlavourPayload
): Promise<ApiResponse<ProductFlavour>> => {
  try {
    const response = await api.put(`/product-flavours/${id}`, flavourData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product flavour:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product flavour'
    );
  }
};

export const deleteProductFlavour = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-flavours/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product flavour:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product flavour'
    );
  }
};

export type {
  GetProductFlavoursParams,
  ManageProductFlavourPayload,
  UpdateProductFlavourPayload,
  ProductFlavour,
};
