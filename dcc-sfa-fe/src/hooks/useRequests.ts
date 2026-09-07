/**
 * @fileoverview Requests Management Hooks with React Query
 * @description Provides hooks for requests operations with automatic caching
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as requestService from '../services/requests';
import type { ApiResponse } from '../types/api.types';

export type {
  Request,
  GetRequestsByUsersParams,
  TakeActionOnRequestPayload,
  RequestType,
} from '../services/requests';

/**
 * Query keys for request-related queries
 */
export const requestQueryKeys = {
  all: ['requests'] as const,
  lists: () => [...requestQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...requestQueryKeys.lists(), params] as const,
  byUsers: (params?: any) =>
    [...requestQueryKeys.all, 'by-users', params] as const,
  byUsersWithoutPermission: (params?: any) =>
    [...requestQueryKeys.all, 'by-users-without-permission', params] as const,
  details: () => [...requestQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...requestQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch requests by users (for approvers)
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with requests data
 */
export const useRequestsByUsers = (
  params?: requestService.GetRequestsByUsersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<requestService.Request[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: requestQueryKeys.byUsers(params),
    queryFn: () => requestService.fetchRequestsByUsers(params),
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook to fetch requests by users (for approvers) without permission check
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with requests data
 */
export const useRequestsByUsersWithoutPermission = (
  params?: requestService.GetRequestsByUsersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<requestService.Request[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: requestQueryKeys.byUsersWithoutPermission(params),
    queryFn: () => requestService.fetchRequestsByUsersWithoutPermission(params),
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook to take action on a request (approve or reject)
 * @returns Mutation object for taking action on request
 */
export const useTakeActionOnRequest = () => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: requestService.takeActionOnRequest,
    invalidateQueries: [
      'requests',
      'reconciliation',
      'orders',
      'van-inventory',
      'asset-movements',
      'customers',
      'approval-workflows',
      'workflow',
      'dashboard-statistics',
    ],
    loadingMessage: 'Processing request...',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
      queryClient.refetchQueries({ queryKey: requestQueryKeys.all });
    },
  });
};

/**
 * Hook to fetch request types
 * @param options - React Query options
 * @returns Query result with request types data
 */
export const useRequestTypes = (
  options?: Omit<
    UseQueryOptions<ApiResponse<requestService.RequestType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...requestQueryKeys.all, 'types'] as const,
    queryFn: () => requestService.fetchRequestTypes(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};
