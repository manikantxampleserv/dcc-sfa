/**
 * @fileoverview Sales Target Groups React Query Hooks
 * @description Custom hooks for sales target groups data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createSalesTargetGroup,
  deleteSalesTargetGroup,
  fetchSalesTargetGroupById,
  fetchSalesTargetGroups,
  updateSalesTargetGroup,
  type GetSalesTargetGroupsParams,
  type ManageSalesTargetGroupPayload,
  type SalesTargetGroup,
  type UpdateSalesTargetGroupPayload,
} from '../services/masters/SalesTargetGroups';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const salesTargetGroupKeys = {
  all: ['salesTargetGroups'] as const,
  lists: () => [...salesTargetGroupKeys.all, 'list'] as const,
  list: (params: GetSalesTargetGroupsParams) =>
    [...salesTargetGroupKeys.lists(), params] as const,
  details: () => [...salesTargetGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...salesTargetGroupKeys.details(), id] as const,
};

/**
 * Hook to fetch sales target groups with pagination and filters
 */
export const useSalesTargetGroups = (
  params?: GetSalesTargetGroupsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalesTargetGroup[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salesTargetGroupKeys.list(params || {}),
    queryFn: () => fetchSalesTargetGroups(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single sales target group by ID
 */
export const useSalesTargetGroup = (id: number) => {
  return useQuery({
    queryKey: salesTargetGroupKeys.detail(id),
    queryFn: () => fetchSalesTargetGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new sales target group
 */
export const useCreateSalesTargetGroup = (options?: {
  onSuccess?: (data: any, variables: ManageSalesTargetGroupPayload) => void;
  onError?: (error: any, variables: ManageSalesTargetGroupPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createSalesTargetGroup,
    loadingMessage: 'Creating sales target group...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales target groups list
      queryClient.invalidateQueries({ queryKey: salesTargetGroupKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing sales target group
 */
export const useUpdateSalesTargetGroup = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateSalesTargetGroupPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateSalesTargetGroupPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...groupData
    }: { id: number } & UpdateSalesTargetGroupPayload) =>
      updateSalesTargetGroup(id, groupData),
    loadingMessage: 'Updating sales target group...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales target groups list and specific group
      queryClient.invalidateQueries({ queryKey: salesTargetGroupKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: salesTargetGroupKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a sales target group
 */
export const useDeleteSalesTargetGroup = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteSalesTargetGroup,
    loadingMessage: 'Deleting sales target group...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales target groups list
      queryClient.invalidateQueries({ queryKey: salesTargetGroupKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetSalesTargetGroupsParams,
  ManageSalesTargetGroupPayload,
  SalesTargetGroup,
  UpdateSalesTargetGroupPayload,
};
