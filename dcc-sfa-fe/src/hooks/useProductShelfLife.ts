import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productShelfLifeService from '../services/masters/ProductShelfLife';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductShelfLife,
  ManageProductShelfLifePayload,
  UpdateProductShelfLifePayload,
  GetProductShelfLifeParams,
} from '../services/masters/ProductShelfLife';

export const productShelfLifeQueryKeys = {
  all: ['product-shelf-life'] as const,
  lists: () => [...productShelfLifeQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...productShelfLifeQueryKeys.lists(), params] as const,
  details: () => [...productShelfLifeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productShelfLifeQueryKeys.details(), id] as const,
};

export const useProductShelfLife = (
  params?: productShelfLifeService.GetProductShelfLifeParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productShelfLifeService.ProductShelfLife[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productShelfLifeQueryKeys.list(params),
    queryFn: () => productShelfLifeService.fetchProductShelfLife(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductShelfLifeById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productShelfLifeService.ProductShelfLife>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productShelfLifeQueryKeys.detail(id),
    queryFn: () => productShelfLifeService.fetchProductShelfLifeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductShelfLife = () => {
  return useApiMutation({
    mutationFn: productShelfLifeService.createProductShelfLife,
    invalidateQueries: ['product-shelf-life'],
    loadingMessage: 'Creating product shelf life...',
  });
};

export const useUpdateProductShelfLife = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & productShelfLifeService.UpdateProductShelfLifePayload) =>
      productShelfLifeService.updateProductShelfLife(id, data),
    invalidateQueries: ['product-shelf-life'],
    loadingMessage: 'Updating product shelf life...',
  });
};

export const useDeleteProductShelfLife = () => {
  return useApiMutation({
    mutationFn: productShelfLifeService.deleteProductShelfLife,
    invalidateQueries: ['product-shelf-life'],
    loadingMessage: 'Deleting product shelf life...',
  });
};
