/**
 * @fileoverview Product React Query Hooks
 * @description Custom hooks for product data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  fetchProductsDropdown,
  updateProduct,
  type GetProductsParams,
  type GetProductsDropdownParams,
  type ManageProductPayload,
  type UpdateProductPayload,
  type Product,
  type ProductDropdown,
} from '../services/masters/Products';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: GetProductsParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * Hook to fetch products with pagination and filters
 */
export const useProducts = (
  params?: GetProductsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Product[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = (options?: {
  onSuccess?: (data: any, variables: ManageProductPayload) => void;
  onError?: (error: any, variables: ManageProductPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createProduct,
    loadingMessage: 'Creating product...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateProductPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateProductPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...productData
    }: { id: number } & UpdateProductPayload) => updateProduct(id, productData),
    loadingMessage: 'Updating product...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch products list and specific product
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteProduct,
    loadingMessage: 'Deleting product...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to fetch products for dropdowns (id, name, code only) with search support
 * @param params - Query parameters for search and product_id
 * @param options - React Query options
 * @returns Query result with products data
 */
export const useProductsDropdown = (
  params?: GetProductsDropdownParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<ProductDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['products', 'dropdown', params],
    queryFn: () => fetchProductsDropdown(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export type {
  GetProductsParams,
  GetProductsDropdownParams,
  ManageProductPayload,
  UpdateProductPayload,
  Product,
  ProductDropdown,
};
