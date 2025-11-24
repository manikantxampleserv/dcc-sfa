/**
 * @fileoverview OutletGroup React Query Hooks
 * @description Custom hooks for outlet group data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createOutletGroup,
  deleteOutletGroup,
  fetchOutletGroupById,
  fetchOutletGroups,
  updateOutletGroup,
  type GetOutletGroupsParams,
  type ManageOutletGroupPayload,
  type UpdateOutletGroupPayload,
  type OutletGroup,
} from '../services/masters/OutletGroups';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const outletGroupKeys = {
  all: ['outletGroups'] as const,
  lists: () => [...outletGroupKeys.all, 'list'] as const,
  list: (params: GetOutletGroupsParams) =>
    [...outletGroupKeys.lists(), params] as const,
  details: () => [...outletGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...outletGroupKeys.details(), id] as const,
};

/**
 * Hook to fetch outlet groups with pagination and filters
 */
export const useOutletGroups = (
  params?: GetOutletGroupsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<OutletGroup[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: outletGroupKeys.list(params || {}),
    queryFn: () => fetchOutletGroups(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single outlet group by ID
 */
export const useOutletGroup = (id: number) => {
  return useQuery({
    queryKey: outletGroupKeys.detail(id),
    queryFn: () => fetchOutletGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new outlet group
 */
export const useCreateOutletGroup = (options?: {
  onSuccess?: (data: any, variables: ManageOutletGroupPayload) => void;
  onError?: (error: any, variables: ManageOutletGroupPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createOutletGroup,
    loadingMessage: 'Creating outlet group...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: outletGroupKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing outlet group
 */
export const useUpdateOutletGroup = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateOutletGroupPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateOutletGroupPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...outletGroupData
    }: { id: number } & UpdateOutletGroupPayload) =>
      updateOutletGroup(id, outletGroupData),
    loadingMessage: 'Updating outlet group...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: outletGroupKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: outletGroupKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete an outlet group
 */
export const useDeleteOutletGroup = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteOutletGroup,
    loadingMessage: 'Deleting outlet group...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: outletGroupKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetOutletGroupsParams,
  ManageOutletGroupPayload,
  UpdateOutletGroupPayload,
  OutletGroup,
};
