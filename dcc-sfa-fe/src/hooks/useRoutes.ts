/**
 * @fileoverview Route React Query Hooks
 * @description Custom hooks for route data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createRoute,
  deleteRoute,
  fetchRouteById,
  fetchRoutes,
  updateRoute,
  type GetRoutesParams,
  type ManageRoutePayload,
  type UpdateRoutePayload,
  type Route,
} from '../services/masters/Routes';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const routeKeys = {
  all: ['routes'] as const,
  lists: () => [...routeKeys.all, 'list'] as const,
  list: (params: GetRoutesParams) => [...routeKeys.lists(), params] as const,
  details: () => [...routeKeys.all, 'detail'] as const,
  detail: (id: number) => [...routeKeys.details(), id] as const,
};

/**
 * Hook to fetch routes with pagination and filters
 */
export const useRoutes = (
  params?: GetRoutesParams,
  options?: Omit<UseQueryOptions<ApiResponse<Route[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: routeKeys.list(params || {}),
    queryFn: () => fetchRoutes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single route by ID
 */
export const useRoute = (id: number) => {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => fetchRouteById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new route
 */
export const useCreateRoute = (options?: {
  onSuccess?: (data: any, variables: ManageRoutePayload) => void;
  onError?: (error: any, variables: ManageRoutePayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createRoute,
    loadingMessage: 'Creating route...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch routes list
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing route
 */
export const useUpdateRoute = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateRoutePayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateRoutePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ id, ...routeData }: { id: number } & UpdateRoutePayload) =>
      updateRoute(id, routeData),
    loadingMessage: 'Updating route...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch routes list and specific route
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: routeKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a route
 */
export const useDeleteRoute = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteRoute,
    loadingMessage: 'Deleting route...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetRoutesParams, ManageRoutePayload, UpdateRoutePayload, Route };
