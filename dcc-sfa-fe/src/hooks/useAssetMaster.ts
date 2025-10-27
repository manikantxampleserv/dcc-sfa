/**
 * @fileoverview Asset Master Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset master CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as assetMasterService from '../services/masters/AssetMaster';

export type {
  AssetMaster,
  CreateAssetMasterPayload,
  UpdateAssetMasterPayload,
  AssetMasterQueryParams,
} from '../services/masters/AssetMaster';

/**
 * Query keys for asset master-related queries
 */
export const assetMasterQueryKeys = {
  all: ['asset-master'] as const,
  lists: () => [...assetMasterQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...assetMasterQueryKeys.lists(), params] as const,
  details: () => [...assetMasterQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetMasterQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset master with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset master data
 */
export const useAssetMaster = (
  params?: assetMasterService.AssetMasterQueryParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: assetMasterQueryKeys.list(params),
    queryFn: () => assetMasterService.fetchAssetMaster(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset master by ID
 * @param id - Asset Master ID
 * @param options - React Query options
 * @returns Query result with asset master data
 */
export const useAssetMasterById = (
  id: number,
  options?: Omit<
    UseQueryOptions<assetMasterService.AssetMaster>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetMasterQueryKeys.detail(id),
    queryFn: () => assetMasterService.fetchAssetMasterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset master with automatic toast notifications
 * @returns Mutation object for creating asset master
 */
export const useCreateAssetMaster = () => {
  return useApiMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: assetMasterService.CreateAssetMasterPayload;
      images?: File[];
    }) => assetMasterService.createAssetMaster(data, images),
    invalidateQueries: ['asset-master'],
    loadingMessage: 'Creating asset...',
  });
};

/**
 * Hook to update asset master with automatic toast notifications
 * @returns Mutation object for updating asset master
 */
export const useUpdateAssetMaster = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: assetMasterService.UpdateAssetMasterPayload;
    }) => assetMasterService.updateAssetMaster(id, data),
    invalidateQueries: ['asset-master'],
    loadingMessage: 'Updating asset...',
  });
};

/**
 * Hook to delete asset master with automatic toast notifications
 * @returns Mutation object for deleting asset master
 */
export const useDeleteAssetMaster = () => {
  return useApiMutation({
    mutationFn: assetMasterService.deleteAssetMaster,
    invalidateQueries: ['asset-master'],
    loadingMessage: 'Deleting asset...',
  });
};
