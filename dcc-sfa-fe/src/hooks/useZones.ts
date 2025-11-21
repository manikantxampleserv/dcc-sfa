/**
 * @fileoverview Zone React Query Hooks
 * @description Custom hooks for zone data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createZone,
  deleteZone,
  fetchZoneById,
  fetchZones,
  updateZone,
  type GetZonesParams,
  type ManageZonePayload,
  type UpdateZonePayload,
  type Zone,
} from '../services/masters/Zones';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const zoneKeys = {
  all: ['zones'] as const,
  lists: () => [...zoneKeys.all, 'list'] as const,
  list: (params: GetZonesParams) => [...zoneKeys.lists(), params] as const,
  details: () => [...zoneKeys.all, 'detail'] as const,
  detail: (id: number) => [...zoneKeys.details(), id] as const,
};

/**
 * Hook to fetch zones with pagination and filters
 */
export const useZones = (
  params?: GetZonesParams,
  options?: Omit<UseQueryOptions<ApiResponse<Zone[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: zoneKeys.list(params || {}),
    queryFn: () => fetchZones(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single zone by ID
 */
export const useZone = (id: number) => {
  return useQuery({
    queryKey: zoneKeys.detail(id),
    queryFn: () => fetchZoneById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new zone
 */
export const useCreateZone = (options?: {
  onSuccess?: (data: any, variables: ManageZonePayload) => void;
  onError?: (error: any, variables: ManageZonePayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createZone,
    loadingMessage: 'Creating zone...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch zones list
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing zone
 */
export const useUpdateZone = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateZonePayload
  ) => void;
  onError?: (error: any, variables: { id: number } & UpdateZonePayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ id, ...zoneData }: { id: number } & UpdateZonePayload) =>
      updateZone(id, zoneData),
    loadingMessage: 'Updating zone...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch zones list and specific zone
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: zoneKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a zone
 */
export const useDeleteZone = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteZone,
    loadingMessage: 'Deleting zone...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch zones list
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetZonesParams, ManageZonePayload, UpdateZonePayload, Zone };
