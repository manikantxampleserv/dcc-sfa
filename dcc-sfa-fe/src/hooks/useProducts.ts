/**
 * @fileoverview Product React Query Hooks
 * @description Custom hooks for product data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
  type GetProductsParams,
  type ManageProductPayload,
  type UpdateProductPayload,
  type Product,
} from '../services/masters/Products';
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
export const useProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000,
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
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetProductsParams,
  ManageProductPayload,
  UpdateProductPayload,
  Product,
};
