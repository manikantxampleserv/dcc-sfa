/**
 * @fileoverview Return Requests Management Hooks with React Query and Toast Integration
 * @description Provides hooks for return requests CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as returnRequestService from '../services/masters/ReturnRequests';
import type { ApiResponse } from '../types/api.types';

export type {
  ReturnRequest,
  ManageReturnRequestPayload,
  UpdateReturnRequestPayload,
  GetReturnRequestsParams,
  ReturnRequestStats,
} from '../services/masters/ReturnRequests';

/**
 * Query keys for return request-related queries
 */
export const returnRequestQueryKeys = {
  all: ['return-requests'] as const,
  lists: () => [...returnRequestQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...returnRequestQueryKeys.lists(), params] as const,
  details: () => [...returnRequestQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...returnRequestQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch return requests with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with return requests data
 */
export const useReturnRequests = (
  params?: returnRequestService.GetReturnRequestsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<returnRequestService.ReturnRequest[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: returnRequestQueryKeys.list(params),
    queryFn: () => returnRequestService.fetchReturnRequests(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch return request by ID
 * @param id - Return Request ID
 * @param options - React Query options
 * @returns Query result with return request data
 */
export const useReturnRequest = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<returnRequestService.ReturnRequest>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: returnRequestQueryKeys.detail(id),
    queryFn: () => returnRequestService.fetchReturnRequestById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create return request with automatic toast notifications
 * @returns Mutation object for creating return request
 */
export const useCreateReturnRequest = () => {
  return useApiMutation({
    mutationFn: returnRequestService.createReturnRequest,
    invalidateQueries: ['return-requests'],
    loadingMessage: 'Creating return request...',
  });
};

/**
 * Hook to update return request with automatic toast notifications
 * @returns Mutation object for updating return request
 */
export const useUpdateReturnRequest = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & returnRequestService.UpdateReturnRequestPayload) =>
      returnRequestService.updateReturnRequest(id, data),
    invalidateQueries: ['return-requests'],
    loadingMessage: 'Updating return request...',
  });
};

/**
 * Hook to delete return request with automatic toast notifications
 * @returns Mutation object for deleting return request
 */
export const useDeleteReturnRequest = () => {
  return useApiMutation({
    mutationFn: returnRequestService.deleteReturnRequest,
    invalidateQueries: ['return-requests'],
    loadingMessage: 'Deleting return request...',
  });
};
