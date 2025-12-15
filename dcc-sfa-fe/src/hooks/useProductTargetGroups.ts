import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productTargetGroupService from '../services/masters/ProductTargetGroups';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductTargetGroup,
  ManageProductTargetGroupPayload,
  UpdateProductTargetGroupPayload,
  GetProductTargetGroupsParams,
} from '../services/masters/ProductTargetGroups';

export const productTargetGroupQueryKeys = {
  all: ['product-target-groups'] as const,
  lists: () => [...productTargetGroupQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...productTargetGroupQueryKeys.lists(), params] as const,
  details: () => [...productTargetGroupQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...productTargetGroupQueryKeys.details(), id] as const,
};

export const useProductTargetGroups = (
  params?: productTargetGroupService.GetProductTargetGroupsParams,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<productTargetGroupService.ProductTargetGroup[]>
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productTargetGroupQueryKeys.list(params),
    queryFn: () => productTargetGroupService.fetchProductTargetGroups(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductTargetGroup = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productTargetGroupService.ProductTargetGroup>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productTargetGroupQueryKeys.detail(id),
    queryFn: () => productTargetGroupService.fetchProductTargetGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductTargetGroup = () => {
  return useApiMutation({
    mutationFn: productTargetGroupService.createProductTargetGroup,
    invalidateQueries: ['product-target-groups'],
    loadingMessage: 'Creating product target group...',
  });
};

export const useUpdateProductTargetGroup = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & productTargetGroupService.UpdateProductTargetGroupPayload) =>
      productTargetGroupService.updateProductTargetGroup(id, data),
    invalidateQueries: ['product-target-groups'],
    loadingMessage: 'Updating product target group...',
  });
};

export const useDeleteProductTargetGroup = () => {
  return useApiMutation({
    mutationFn: productTargetGroupService.deleteProductTargetGroup,
    invalidateQueries: ['product-target-groups'],
    loadingMessage: 'Deleting product target group...',
  });
};
