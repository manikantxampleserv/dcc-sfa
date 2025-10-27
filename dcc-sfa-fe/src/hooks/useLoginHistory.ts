/**
 * @fileoverview Login History Management Hooks with React Query and Toast Integration
 * @description Provides hooks for login history CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as loginHistoryService from '../services/masters/LoginHistory';
import type { ApiResponse } from '../types/api.types';

export type {
  LoginHistory,
  ManageLoginHistoryPayload,
  UpdateLoginHistoryPayload,
  GetLoginHistoryParams,
} from '../services/masters/LoginHistory';

/**
 * Query keys for login history-related queries
 */
export const loginHistoryQueryKeys = {
  all: ['login-history'] as const,
  lists: () => [...loginHistoryQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...loginHistoryQueryKeys.lists(), params] as const,
  details: () => [...loginHistoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...loginHistoryQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch login history with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with login history data
 */
export const useLoginHistory = (
  params?: loginHistoryService.GetLoginHistoryParams,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<loginHistoryService.LoginHistory[]> & {
        statistics?: loginHistoryService.LoginHistoryStatistics;
      }
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: loginHistoryQueryKeys.list(params),
    queryFn: () => loginHistoryService.fetchLoginHistory(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch login history by ID
 * @param id - Login History ID
 * @param options - React Query options
 * @returns Query result with login history data
 */
export const useLoginHistoryById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<loginHistoryService.LoginHistory>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: loginHistoryQueryKeys.detail(id),
    queryFn: () => loginHistoryService.fetchLoginHistoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create login history with automatic toast notifications
 * @returns Mutation object for creating login history
 */
export const useCreateLoginHistory = () => {
  return useApiMutation({
    mutationFn: loginHistoryService.createLoginHistory,
    invalidateQueries: ['login-history'],
    loadingMessage: 'Creating login history...',
  });
};

/**
 * Hook to update login history with automatic toast notifications
 * @returns Mutation object for updating login history
 */
export const useUpdateLoginHistory = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & loginHistoryService.UpdateLoginHistoryPayload) =>
      loginHistoryService.updateLoginHistory(id, data),
    invalidateQueries: ['login-history'],
    loadingMessage: 'Updating login history...',
  });
};

/**
 * Hook to delete login history with automatic toast notifications
 * @returns Mutation object for deleting login history
 */
export const useDeleteLoginHistory = () => {
  return useApiMutation({
    mutationFn: loginHistoryService.deleteLoginHistory,
    invalidateQueries: ['login-history'],
    loadingMessage: 'Deleting login history...',
  });
};
