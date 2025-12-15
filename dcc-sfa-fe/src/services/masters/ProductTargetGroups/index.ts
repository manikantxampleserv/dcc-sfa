import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductTargetGroup {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductTargetGroupPayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductTargetGroupPayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductTargetGroupsParams {
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

export const fetchProductTargetGroups = async (
  params?: GetProductTargetGroupsParams
): Promise<ApiResponse<ProductTargetGroup[]>> => {
  try {
    const response = await api.get('/product-target-groups', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product target groups:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product target groups'
    );
  }
};

export const fetchProductTargetGroupById = async (
  id: number
): Promise<ApiResponse<ProductTargetGroup>> => {
  try {
    const response = await api.get(`/product-target-groups/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product target group'
    );
  }
};

export const createProductTargetGroup = async (
  productTargetGroupData: ManageProductTargetGroupPayload
): Promise<ApiResponse<ProductTargetGroup>> => {
  try {
    const response = await api.post(
      '/product-target-groups',
      productTargetGroupData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating product target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product target group'
    );
  }
};

export const updateProductTargetGroup = async (
  id: number,
  productTargetGroupData: UpdateProductTargetGroupPayload
): Promise<ApiResponse<ProductTargetGroup>> => {
  try {
    const response = await api.put(
      `/product-target-groups/${id}`,
      productTargetGroupData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating product target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product target group'
    );
  }
};

export const deleteProductTargetGroup = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-target-groups/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product target group:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product target group'
    );
  }
};

export type {
  GetProductTargetGroupsParams,
  ManageProductTargetGroupPayload,
  UpdateProductTargetGroupPayload,
  PaginationMeta,
  ProductTargetGroup,
};
