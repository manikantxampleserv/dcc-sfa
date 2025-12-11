/**
 * @fileoverview Product Categories Service with API Integration
 * @description Provides Product Categories CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductCategory {
  id: number;
  category_name: string;
  description?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

interface ManageProductCategoryPayload {
  category_name: string;
  description?: string;
  is_active?: string;
}

interface UpdateProductCategoryPayload {
  category_name?: string;
  description?: string;
  is_active?: string;
}

interface GetProductCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

/**
 * Fetch Product Categories with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Product Categories data
 */
export const fetchProductCategories = async (
  params?: GetProductCategoriesParams
): Promise<ApiResponse<ProductCategory[]>> => {
  try {
    const response = await api.get('/product-categories', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product categories:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product categories'
    );
  }
};

/**
 * Fetch Product Category by ID
 * @param id - Product Category ID
 * @returns Promise resolving to Product Category data
 */
export const fetchProductCategoryById = async (
  id: number
): Promise<ProductCategory> => {
  try {
    const response = await api.get(`/product-categories/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching product category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product category'
    );
  }
};

/**
 * Create a new Product Category
 * @param data - Product Category data
 * @returns Promise resolving to created Product Category
 */
export const createProductCategory = async (
  data: ManageProductCategoryPayload
): Promise<ProductCategory> => {
  try {
    const response = await api.post('/product-categories', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating product category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product category'
    );
  }
};

/**
 * Update an existing Product Category
 * @param id - Product Category ID
 * @param data - Updated Product Category data
 * @returns Promise resolving to updated Product Category
 */
export const updateProductCategory = async (
  id: number,
  data: UpdateProductCategoryPayload
): Promise<ProductCategory> => {
  try {
    const response = await api.put(`/product-categories/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating product category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product category'
    );
  }
};

/**
 * Delete a Product Category (soft delete)
 * @param id - Product Category ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteProductCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/product-categories/${id}`);
  } catch (error: any) {
    console.error('Error deleting product category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product category'
    );
  }
};

export interface ProductCategoryDropdown {
  id: number;
  category_name: string;
}

export interface GetProductCategoriesDropdownParams {
  search?: string;
  category_id?: number;
}

export const fetchProductCategoriesDropdown = async (
  params?: GetProductCategoriesDropdownParams
): Promise<ApiResponse<ProductCategoryDropdown[]>> => {
  try {
    const response = await api.get('/product-categories-dropdown', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product categories dropdown:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product categories dropdown'
    );
  }
};

// Export types
export type {
  ProductCategory,
  ManageProductCategoryPayload,
  UpdateProductCategoryPayload,
  GetProductCategoriesParams,
};
