/**
 * @fileoverview Product Categories Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Product Categories CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productCategoriesService from '../services/masters/ProductCategories';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductCategory,
  ManageProductCategoryPayload,
  UpdateProductCategoryPayload,
  GetProductCategoriesParams,
  ProductCategoryDropdown,
  GetProductCategoriesDropdownParams,
} from '../services/masters/ProductCategories';

/**
 * Query keys for Product Categories-related queries
 */
export const productCategoriesQueryKeys = {
  all: ['product-categories'] as const,
  lists: () => [...productCategoriesQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...productCategoriesQueryKeys.lists(), params] as const,
  details: () => [...productCategoriesQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...productCategoriesQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Product Categories with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Product Categories data
 */
export const useProductCategories = (
  params?: productCategoriesService.GetProductCategoriesParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: productCategoriesQueryKeys.list(params),
    queryFn: () => productCategoriesService.fetchProductCategories(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Product Category by ID
 * @param id - Product Category ID
 * @param options - React Query options
 * @returns Query result with Product Category data
 */
export const useProductCategoryById = (
  id: number,
  options?: Omit<
    UseQueryOptions<productCategoriesService.ProductCategory>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productCategoriesQueryKeys.detail(id),
    queryFn: () => productCategoriesService.fetchProductCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Product Category with automatic toast notifications
 * @returns Mutation object for creating Product Category
 */
export const useCreateProductCategory = () => {
  return useApiMutation({
    mutationFn: productCategoriesService.createProductCategory,
    invalidateQueries: ['product-categories'],
    loadingMessage: 'Creating product category...',
  });
};

/**
 * Hook to update Product Category with automatic toast notifications
 * @returns Mutation object for updating Product Category
 */
export const useUpdateProductCategory = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: productCategoriesService.UpdateProductCategoryPayload;
    }) => productCategoriesService.updateProductCategory(id, data),
    invalidateQueries: ['product-categories'],
    loadingMessage: 'Updating product category...',
  });
};

/**
 * Hook to delete Product Category with automatic toast notifications
 * @returns Mutation object for deleting Product Category
 */
export const useDeleteProductCategory = () => {
  return useApiMutation({
    mutationFn: productCategoriesService.deleteProductCategory,
    invalidateQueries: ['product-categories'],
    loadingMessage: 'Deleting product category...',
  });
};

/**
 * Hook to fetch product categories for dropdowns (id, category_name only) with search support
 * @param params - Query parameters for search and category_id
 * @param options - React Query options
 * @returns Query result with product categories data
 */
export const useProductCategoriesDropdown = (
  params?: productCategoriesService.GetProductCategoriesDropdownParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productCategoriesService.ProductCategoryDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['product-categories', 'dropdown', params],
    queryFn: () => productCategoriesService.fetchProductCategoriesDropdown(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
