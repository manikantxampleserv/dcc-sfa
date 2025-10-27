/**
 * @fileoverview Asset Types Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset types CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as assetTypeService from '../services/masters/AssetTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  AssetType,
  ManageAssetTypePayload,
  UpdateAssetTypePayload,
  GetAssetTypesParams,
} from '../services/masters/AssetTypes';

/**
 * Query keys for asset type-related queries
 */
export const assetTypeQueryKeys = {
  all: ['asset-types'] as const,
  lists: () => [...assetTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...assetTypeQueryKeys.lists(), params] as const,
  details: () => [...assetTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetTypeQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset types with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset types data
 */
export const useAssetTypes = (
  params?: assetTypeService.GetAssetTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetTypeService.AssetType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetTypeQueryKeys.list(params),
    queryFn: () => assetTypeService.fetchAssetTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset type by ID
 * @param id - Asset Type ID
 * @param options - React Query options
 * @returns Query result with asset type data
 */
export const useAssetType = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetTypeService.AssetType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetTypeQueryKeys.detail(id),
    queryFn: () => assetTypeService.fetchAssetTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset type with automatic toast notifications
 * @returns Mutation object for creating asset type
 */
export const useCreateAssetType = () => {
  return useApiMutation({
    mutationFn: assetTypeService.createAssetType,
    invalidateQueries: ['asset-types'],
    loadingMessage: 'Creating asset type...',
  });
};

/**
 * Hook to update asset type with automatic toast notifications
 * @returns Mutation object for updating asset type
 */
export const useUpdateAssetType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & assetTypeService.UpdateAssetTypePayload) =>
      assetTypeService.updateAssetType(id, data),
    invalidateQueries: ['asset-types'],
    loadingMessage: 'Updating asset type...',
  });
};

/**
 * Hook to delete asset type with automatic toast notifications
 * @returns Mutation object for deleting asset type
 */
export const useDeleteAssetType = () => {
  return useApiMutation({
    mutationFn: assetTypeService.deleteAssetType,
    invalidateQueries: ['asset-types'],
    loadingMessage: 'Deleting asset type...',
  });
};
