/**
 * @fileoverview Asset Maintenance Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset maintenance CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as assetMaintenanceService from '../services/masters/AssetMaintenance';

export type {
  AssetMaintenance,
  CreateAssetMaintenancePayload,
  UpdateAssetMaintenancePayload,
  AssetMaintenanceQueryParams,
} from '../services/masters/AssetMaintenance';

/**
 * Query keys for asset maintenance-related queries
 */
export const assetMaintenanceQueryKeys = {
  all: ['asset-maintenance'] as const,
  lists: () => [...assetMaintenanceQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...assetMaintenanceQueryKeys.lists(), params] as const,
  details: () => [...assetMaintenanceQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetMaintenanceQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset maintenances with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset maintenances data
 */
export const useAssetMaintenances = (
  params?: assetMaintenanceService.AssetMaintenanceQueryParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetMaintenanceService.AssetMaintenance[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetMaintenanceQueryKeys.list(params),
    queryFn: () => assetMaintenanceService.fetchAssetMaintenances(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset maintenance by ID
 * @param id - Asset Maintenance ID
 * @param options - React Query options
 * @returns Query result with asset maintenance data
 */
export const useAssetMaintenanceById = (
  id: number,
  options?: Omit<
    UseQueryOptions<assetMaintenanceService.AssetMaintenance>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetMaintenanceQueryKeys.detail(id),
    queryFn: () => assetMaintenanceService.fetchAssetMaintenanceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset maintenance with automatic toast notifications
 * @returns Mutation object for creating asset maintenance
 */
export const useCreateAssetMaintenance = () => {
  return useApiMutation({
    mutationFn: assetMaintenanceService.createAssetMaintenance,
    invalidateQueries: ['asset-maintenance'],
    loadingMessage: 'Creating asset maintenance...',
  });
};

/**
 * Hook to update asset maintenance with automatic toast notifications
 * @returns Mutation object for updating asset maintenance
 */
export const useUpdateAssetMaintenance = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: assetMaintenanceService.UpdateAssetMaintenancePayload;
    }) => assetMaintenanceService.updateAssetMaintenance(id, data),
    invalidateQueries: ['asset-maintenance'],
    loadingMessage: 'Updating asset maintenance...',
  });
};

/**
 * Hook to delete asset maintenance with automatic toast notifications
 * @returns Mutation object for deleting asset maintenance
 */
export const useDeleteAssetMaintenance = () => {
  return useApiMutation({
    mutationFn: assetMaintenanceService.deleteAssetMaintenance,
    invalidateQueries: ['asset-maintenance'],
    loadingMessage: 'Deleting asset maintenance...',
  });
};
