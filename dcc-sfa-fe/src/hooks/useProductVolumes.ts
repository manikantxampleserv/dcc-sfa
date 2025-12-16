import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as productVolumeService from '../services/masters/ProductVolumes';
import type { ApiResponse } from '../types/api.types';

export type {
  ProductVolume,
  ManageProductVolumePayload,
  UpdateProductVolumePayload,
  GetProductVolumesParams,
} from '../services/masters/ProductVolumes';

export const productVolumeQueryKeys = {
  all: ['product-volumes'] as const,
  lists: () => [...productVolumeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...productVolumeQueryKeys.lists(), params] as const,
  details: () => [...productVolumeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productVolumeQueryKeys.details(), id] as const,
};

export const useProductVolumes = (
  params?: productVolumeService.GetProductVolumesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<productVolumeService.ProductVolume[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productVolumeQueryKeys.list(params),
    queryFn: () => productVolumeService.fetchProductVolumes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProductVolume = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<productVolumeService.ProductVolume>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productVolumeQueryKeys.detail(id),
    queryFn: () => productVolumeService.fetchProductVolumeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateProductVolume = () => {
  return useApiMutation({
    mutationFn: productVolumeService.createProductVolume,
    invalidateQueries: ['product-volumes'],
    loadingMessage: 'Creating product volume...',
  });
};

export const useUpdateProductVolume = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & productVolumeService.UpdateProductVolumePayload) =>
      productVolumeService.updateProductVolume(id, data),
    invalidateQueries: ['product-volumes'],
    loadingMessage: 'Updating product volume...',
  });
};

export const useDeleteProductVolume = () => {
  return useApiMutation({
    mutationFn: productVolumeService.deleteProductVolume,
    invalidateQueries: ['product-volumes'],
    loadingMessage: 'Deleting product volume...',
  });
};
