/**
 * @fileoverview Asset Sub Types Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset sub types CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as assetSubTypeService from '../services/masters/AssetSubTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  AssetSubType,
  ManageAssetSubTypePayload,
  UpdateAssetSubTypePayload,
  GetAssetSubTypesParams,
} from '../services/masters/AssetSubTypes';

/**
 * Query keys for asset sub type-related queries
 */
export const assetSubTypeQueryKeys = {
  all: ['asset-sub-types'] as const,
  lists: () => [...assetSubTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...assetSubTypeQueryKeys.lists(), params] as const,
  details: () => [...assetSubTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetSubTypeQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset sub types with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset sub types data
 */
export const useAssetSubTypes = (
  params?: assetSubTypeService.GetAssetSubTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetSubTypeService.AssetSubType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetSubTypeQueryKeys.list(params),
    queryFn: () => assetSubTypeService.fetchAssetSubTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset sub type by ID
 * @param id - Asset Sub Type ID
 * @param options - React Query options
 * @returns Query result with asset sub type data
 */
export const useAssetSubType = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetSubTypeService.AssetSubType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetSubTypeQueryKeys.detail(id),
    queryFn: () => assetSubTypeService.fetchAssetSubTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset sub type with automatic toast notifications
 * @returns Mutation object for creating asset sub type
 */
export const useCreateAssetSubType = () => {
  return useApiMutation({
    mutationFn: assetSubTypeService.createAssetSubType,
    invalidateQueries: ['asset-sub-types'],
    loadingMessage: 'Creating asset sub type...',
  });
};

/**
 * Hook to update asset sub type with automatic toast notifications
 * @returns Mutation object for updating asset sub type
 */
export const useUpdateAssetSubType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & assetSubTypeService.UpdateAssetSubTypePayload) =>
      assetSubTypeService.updateAssetSubType(id, data),
    invalidateQueries: ['asset-sub-types'],
    loadingMessage: 'Updating asset sub type...',
  });
};

/**
 * Hook to delete asset sub type with automatic toast notifications
 * @returns Mutation object for deleting asset sub type
 */
export const useDeleteAssetSubType = () => {
  return useApiMutation({
    mutationFn: assetSubTypeService.deleteAssetSubType,
    invalidateQueries: ['asset-sub-types'],
    loadingMessage: 'Deleting asset sub type...',
  });
};
