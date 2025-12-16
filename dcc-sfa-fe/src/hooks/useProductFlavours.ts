import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productFlavourService from '../services/masters/ProductFlavours';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductFlavour,
  ManageProductFlavourPayload,
  UpdateProductFlavourPayload,
  GetProductFlavoursParams,
} from '../services/masters/ProductFlavours';

export const productFlavourQueryKeys = {
  all: ['product-flavours'] as const,
  lists: () => [...productFlavourQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...productFlavourQueryKeys.lists(), params] as const,
  details: () => [...productFlavourQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productFlavourQueryKeys.details(), id] as const,
};

export const useProductFlavours = (
  params?: productFlavourService.GetProductFlavoursParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productFlavourService.ProductFlavour[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productFlavourQueryKeys.list(params),
    queryFn: () => productFlavourService.fetchProductFlavours(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductFlavour = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productFlavourService.ProductFlavour>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productFlavourQueryKeys.detail(id),
    queryFn: () => productFlavourService.fetchProductFlavourById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductFlavour = () => {
  return useApiMutation({
    mutationFn: productFlavourService.createProductFlavour,
    invalidateQueries: ['product-flavours'],
    loadingMessage: 'Creating product flavour...',
  });
};

export const useUpdateProductFlavour = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & productFlavourService.UpdateProductFlavourPayload) =>
      productFlavourService.updateProductFlavour(id, data),
    invalidateQueries: ['product-flavours'],
    loadingMessage: 'Updating product flavour...',
  });
};

export const useDeleteProductFlavour = () => {
  return useApiMutation({
    mutationFn: productFlavourService.deleteProductFlavour,
    invalidateQueries: ['product-flavours'],
    loadingMessage: 'Deleting product flavour...',
  });
};
