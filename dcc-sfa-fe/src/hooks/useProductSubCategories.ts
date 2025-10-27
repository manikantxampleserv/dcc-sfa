/**
 * @fileoverview Product Sub Categories Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Product Sub Categories CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productSubCategoriesService from '../services/masters/ProductSubCategories';

export type {
  ProductSubCategory,
  ManageProductSubCategoryPayload,
  UpdateProductSubCategoryPayload,
  GetProductSubCategoriesParams,
} from '../services/masters/ProductSubCategories';

/**
 * Query keys for Product Sub Categories-related queries
 */
export const productSubCategoriesQueryKeys = {
  all: ['product-sub-categories'] as const,
  lists: () => [...productSubCategoriesQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...productSubCategoriesQueryKeys.lists(), params] as const,
  details: () => [...productSubCategoriesQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...productSubCategoriesQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Product Sub Categories with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Product Sub Categories data
 */
export const useProductSubCategories = (
  params?: productSubCategoriesService.GetProductSubCategoriesParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: productSubCategoriesQueryKeys.list(params),
    queryFn: () =>
      productSubCategoriesService.fetchProductSubCategories(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Product Sub Category by ID
 * @param id - Product Sub Category ID
 * @param options - React Query options
 * @returns Query result with Product Sub Category data
 */
export const useProductSubCategoryById = (
  id: number,
  options?: Omit<
    UseQueryOptions<productSubCategoriesService.ProductSubCategory>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productSubCategoriesQueryKeys.detail(id),
    queryFn: () => productSubCategoriesService.fetchProductSubCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Product Sub Category with automatic toast notifications
 * @returns Mutation object for creating Product Sub Category
 */
export const useCreateProductSubCategory = () => {
  return useApiMutation({
    mutationFn: productSubCategoriesService.createProductSubCategory,
    invalidateQueries: ['product-sub-categories'],
    loadingMessage: 'Creating product sub category...',
  });
};

/**
 * Hook to update Product Sub Category with automatic toast notifications
 * @returns Mutation object for updating Product Sub Category
 */
export const useUpdateProductSubCategory = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: productSubCategoriesService.UpdateProductSubCategoryPayload;
    }) => productSubCategoriesService.updateProductSubCategory(id, data),
    invalidateQueries: ['product-sub-categories'],
    loadingMessage: 'Updating product sub category...',
  });
};

/**
 * Hook to delete Product Sub Category with automatic toast notifications
 * @returns Mutation object for deleting Product Sub Category
 */
export const useDeleteProductSubCategory = () => {
  return useApiMutation({
    mutationFn: productSubCategoriesService.deleteProductSubCategory,
    invalidateQueries: ['product-sub-categories'],
    loadingMessage: 'Deleting product sub category...',
  });
};
