/**
 * @fileoverview Product Sub Categories Service with API Integration
 * @description Provides Product Sub Categories CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductSubCategory {
  id: number;
  sub_category_name: string;
  product_category_id: number;
  description?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_category?: {
    id: number;
    category_name: string;
  } | null;
}

interface ManageProductSubCategoryPayload {
  sub_category_name: string;
  product_category_id: number;
  description?: string;
  is_active?: string;
}

interface UpdateProductSubCategoryPayload {
  sub_category_name?: string;
  product_category_id?: number;
  description?: string;
  is_active?: string;
}

interface GetProductSubCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  product_category_id?: number;
}

/**
 * Fetch Product Sub Categories with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Product Sub Categories data
 */
export const fetchProductSubCategories = async (
  params?: GetProductSubCategoriesParams
): Promise<ApiResponse<ProductSubCategory[]>> => {
  try {
    const response = await api.get('/product-sub-categories', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product sub categories:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product sub categories'
    );
  }
};

/**
 * Fetch Product Sub Category by ID
 * @param id - Product Sub Category ID
 * @returns Promise resolving to Product Sub Category data
 */
export const fetchProductSubCategoryById = async (
  id: number
): Promise<ProductSubCategory> => {
  try {
    const response = await api.get(`/product-sub-categories/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching product sub category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product sub category'
    );
  }
};

/**
 * Create a new Product Sub Category
 * @param data - Product Sub Category data
 * @returns Promise resolving to created Product Sub Category
 */
export const createProductSubCategory = async (
  data: ManageProductSubCategoryPayload
): Promise<ProductSubCategory> => {
  try {
    const response = await api.post('/product-sub-categories', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating product sub category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product sub category'
    );
  }
};

/**
 * Update an existing Product Sub Category
 * @param id - Product Sub Category ID
 * @param data - Updated Product Sub Category data
 * @returns Promise resolving to updated Product Sub Category
 */
export const updateProductSubCategory = async (
  id: number,
  data: UpdateProductSubCategoryPayload
): Promise<ProductSubCategory> => {
  try {
    const response = await api.put(`/product-sub-categories/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating product sub category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product sub category'
    );
  }
};

/**
 * Delete a Product Sub Category (soft delete)
 * @param id - Product Sub Category ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteProductSubCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/product-sub-categories/${id}`);
  } catch (error: any) {
    console.error('Error deleting product sub category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product sub category'
    );
  }
};

// Export types
export type {
  ProductSubCategory,
  ManageProductSubCategoryPayload,
  UpdateProductSubCategoryPayload,
  GetProductSubCategoriesParams,
};
