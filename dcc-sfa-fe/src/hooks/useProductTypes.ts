import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productTypeService from '../services/masters/ProductTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductType,
  ManageProductTypePayload,
  UpdateProductTypePayload,
  GetProductTypesParams,
} from '../services/masters/ProductTypes';

export const productTypeQueryKeys = {
  all: ['product-types'] as const,
  lists: () => [...productTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...productTypeQueryKeys.lists(), params] as const,
  details: () => [...productTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productTypeQueryKeys.details(), id] as const,
};

export const useProductTypes = (
  params?: productTypeService.GetProductTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productTypeService.ProductType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productTypeQueryKeys.list(params),
    queryFn: () => productTypeService.fetchProductTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductType = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productTypeService.ProductType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productTypeQueryKeys.detail(id),
    queryFn: () => productTypeService.fetchProductTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductType = () => {
  return useApiMutation({
    mutationFn: productTypeService.createProductType,
    invalidateQueries: ['product-types'],
    loadingMessage: 'Creating product type...',
  });
};

export const useUpdateProductType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & productTypeService.UpdateProductTypePayload) =>
      productTypeService.updateProductType(id, data),
    invalidateQueries: ['product-types'],
    loadingMessage: 'Updating product type...',
  });
};

export const useDeleteProductType = () => {
  return useApiMutation({
    mutationFn: productTypeService.deleteProductType,
    invalidateQueries: ['product-types'],
    loadingMessage: 'Deleting product type...',
  });
};
