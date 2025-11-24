/**
 * @fileoverview Asset Movement Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset movement CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as assetMovementService from '../services/masters/AssetMovement';

export type {
  AssetMovement,
  CreateAssetMovementPayload,
  UpdateAssetMovementPayload,
  AssetMovementQueryParams,
} from '../services/masters/AssetMovement';

/**
 * Query keys for asset movement-related queries
 */
export const assetMovementQueryKeys = {
  all: ['asset-movement'] as const,
  lists: () => [...assetMovementQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...assetMovementQueryKeys.lists(), params] as const,
  details: () => [...assetMovementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetMovementQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset movements with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset movements data
 */
export const useAssetMovements = (
  params?: assetMovementService.AssetMovementQueryParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetMovementService.AssetMovement[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetMovementQueryKeys.list(params),
    queryFn: () => assetMovementService.fetchAssetMovements(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset movement by ID
 * @param id - Asset Movement ID
 * @param options - React Query options
 * @returns Query result with asset movement data
 */
export const useAssetMovementById = (
  id: number,
  options?: Omit<
    UseQueryOptions<assetMovementService.AssetMovement>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetMovementQueryKeys.detail(id),
    queryFn: () => assetMovementService.fetchAssetMovementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset movement with automatic toast notifications
 * @returns Mutation object for creating asset movement
 */
export const useCreateAssetMovement = () => {
  return useApiMutation({
    mutationFn: assetMovementService.createAssetMovement,
    invalidateQueries: ['asset-movement'],
    loadingMessage: 'Creating asset movement...',
  });
};

/**
 * Hook to update asset movement with automatic toast notifications
 * @returns Mutation object for updating asset movement
 */
export const useUpdateAssetMovement = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: assetMovementService.UpdateAssetMovementPayload;
    }) => assetMovementService.updateAssetMovement(id, data),
    invalidateQueries: ['asset-movement'],
    loadingMessage: 'Updating asset movement...',
  });
};

/**
 * Hook to delete asset movement with automatic toast notifications
 * @returns Mutation object for deleting asset movement
 */
export const useDeleteAssetMovement = () => {
  return useApiMutation({
    mutationFn: assetMovementService.deleteAssetMovement,
    invalidateQueries: ['asset-movement'],
    loadingMessage: 'Deleting asset movement...',
  });
};
