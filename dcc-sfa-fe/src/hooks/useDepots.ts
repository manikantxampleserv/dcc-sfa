/**
 * @fileoverview Depot Management Hooks with React Query and Toast Integration
 * @description Provides hooks for depot CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as depotService from '../services/masters/Depots';
import type { ApiResponse } from '../types/api.types';

export type {
  Depot,
  ManageDepotPayload,
  UpdateDepotPayload,
  GetDepotsParams,
} from '../services/masters/Depots';

/**
 * Query keys for depot-related queries
 */
export const depotQueryKeys = {
  all: ['depots'] as const,
  lists: () => [...depotQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...depotQueryKeys.lists(), params] as const,
  details: () => [...depotQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...depotQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch depots with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with depots data
 */
export const useDepots = (
  params?: depotService.GetDepotsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<depotService.Depot[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: depotQueryKeys.list(params),
    queryFn: () => depotService.fetchDepots(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch depot by ID
 * @param id - Depot ID
 * @param options - React Query options
 * @returns Query result with depot data
 */
export const useDepot = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<depotService.Depot>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: depotQueryKeys.detail(id),
    queryFn: () => depotService.fetchDepotById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create depot with automatic toast notifications
 * @returns Mutation object for creating depot
 */
export const useCreateDepot = () => {
  return useApiMutation({
    mutationFn: depotService.createDepot,
    invalidateQueries: ['depots'],
    loadingMessage: 'Creating depot...',
  });
};

/**
 * Hook to update depot with automatic toast notifications
 * @returns Mutation object for updating depot
 */
export const useUpdateDepot = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & depotService.UpdateDepotPayload) =>
      depotService.updateDepot(id, data),
    invalidateQueries: ['depots'],
    loadingMessage: 'Updating depot...',
  });
};

/**
 * Hook to delete depot with automatic toast notifications
 * @returns Mutation object for deleting depot
 */
export const useDeleteDepot = () => {
  return useApiMutation({
    mutationFn: depotService.deleteDepot,
    invalidateQueries: ['depots'],
    loadingMessage: 'Deleting depot...',
  });
};
