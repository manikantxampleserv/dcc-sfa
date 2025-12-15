import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productWebOrderService from '../services/masters/ProductWebOrders';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductWebOrder,
  ManageProductWebOrderPayload,
  UpdateProductWebOrderPayload,
  GetProductWebOrdersParams,
} from '../services/masters/ProductWebOrders';

export const productWebOrderQueryKeys = {
  all: ['product-web-orders'] as const,
  lists: () => [...productWebOrderQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...productWebOrderQueryKeys.lists(), params] as const,
  details: () => [...productWebOrderQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productWebOrderQueryKeys.details(), id] as const,
};

export const useProductWebOrders = (
  params?: productWebOrderService.GetProductWebOrdersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productWebOrderService.ProductWebOrder[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productWebOrderQueryKeys.list(params),
    queryFn: () => productWebOrderService.fetchProductWebOrders(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductWebOrder = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productWebOrderService.ProductWebOrder>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productWebOrderQueryKeys.detail(id),
    queryFn: () => productWebOrderService.fetchProductWebOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductWebOrder = () => {
  return useApiMutation({
    mutationFn: productWebOrderService.createProductWebOrder,
    invalidateQueries: ['product-web-orders'],
    loadingMessage: 'Creating product web order...',
  });
};

export const useUpdateProductWebOrder = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & productWebOrderService.UpdateProductWebOrderPayload) =>
      productWebOrderService.updateProductWebOrder(id, data),
    invalidateQueries: ['product-web-orders'],
    loadingMessage: 'Updating product web order...',
  });
};

export const useDeleteProductWebOrder = () => {
  return useApiMutation({
    mutationFn: productWebOrderService.deleteProductWebOrder,
    invalidateQueries: ['product-web-orders'],
    loadingMessage: 'Deleting product web order...',
  });
};
