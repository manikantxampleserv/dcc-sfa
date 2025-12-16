import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductType {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductTypePayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductTypePayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductTypesParams {
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

export const fetchProductTypes = async (
  params?: GetProductTypesParams
): Promise<ApiResponse<ProductType[]>> => {
  try {
    const response = await api.get('/product-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product types'
    );
  }
};

export const fetchProductTypeById = async (
  id: number
): Promise<ApiResponse<ProductType>> => {
  try {
    const response = await api.get(`/product-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product type'
    );
  }
};

export const createProductType = async (
  productTypeData: ManageProductTypePayload
): Promise<ApiResponse<ProductType>> => {
  try {
    const response = await api.post('/product-types', productTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product type'
    );
  }
};

export const updateProductType = async (
  id: number,
  productTypeData: UpdateProductTypePayload
): Promise<ApiResponse<ProductType>> => {
  try {
    const response = await api.put(`/product-types/${id}`, productTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product type'
    );
  }
};

export const deleteProductType = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product type'
    );
  }
};

interface ProductTypeDropdown {
  id: number;
  name: string;
  code: string;
}

interface GetProductTypesDropdownParams {
  search?: string;
  product_type_id?: number;
}

export const fetchProductTypesDropdown = async (
  params?: GetProductTypesDropdownParams
): Promise<ApiResponse<ProductTypeDropdown[]>> => {
  try {
    const response = await api.get('/product-types-dropdown', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product types dropdown:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product types dropdown'
    );
  }
};

export type {
  GetProductTypesParams,
  GetProductTypesDropdownParams,
  ManageProductTypePayload,
  UpdateProductTypePayload,
  PaginationMeta,
  ProductType,
  ProductTypeDropdown,
};
