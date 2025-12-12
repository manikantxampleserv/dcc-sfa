/**
 * @fileoverview Visit React Query Hooks
 * @description Custom hooks for visit data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVisit,
  deleteVisit,
  fetchVisitById,
  fetchVisits,
  updateVisit,
  type GetVisitsParams,
  type ManageVisitPayload,
  type UpdateVisitPayload,
  type Visit,
} from '../services/masters/Visits';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const visitKeys = {
  all: ['visits'] as const,
  lists: () => [...visitKeys.all, 'list'] as const,
  list: (params: GetVisitsParams) => [...visitKeys.lists(), params] as const,
  details: () => [...visitKeys.all, 'detail'] as const,
  detail: (id: number) => [...visitKeys.details(), id] as const,
};

/**
 * Hook to fetch visits with pagination and filters
 */
export const useVisits = (
  params?: GetVisitsParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: visitKeys.list(params || {}),
    queryFn: () => fetchVisits(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook to fetch a single visit by ID
 */
export const useVisit = (id: number) => {
  return useQuery({
    queryKey: visitKeys.detail(id),
    queryFn: () => fetchVisitById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new visit
 */
export const useCreateVisit = (options?: {
  onSuccess?: (data: any, variables: ManageVisitPayload) => void;
  onError?: (error: any, variables: ManageVisitPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createVisit,
    loadingMessage: 'Creating visit...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch visits list
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing visit
 */
export const useUpdateVisit = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateVisitPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateVisitPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ id, ...visitData }: { id: number } & UpdateVisitPayload) =>
      updateVisit(id, visitData),
    loadingMessage: 'Updating visit...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch visits list and specific visit
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: visitKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a visit
 */
export const useDeleteVisit = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteVisit,
    loadingMessage: 'Deleting visit...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch visits list
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetVisitsParams, ManageVisitPayload, UpdateVisitPayload, Visit };
