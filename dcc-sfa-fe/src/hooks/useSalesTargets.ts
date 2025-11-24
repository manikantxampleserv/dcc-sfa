/**
 * @fileoverview Sales Targets Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Sales Targets CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as salesTargetsService from '../services/masters/SalesTargets';

export type {
  SalesTarget,
  ManageSalesTargetPayload,
  UpdateSalesTargetPayload,
  GetSalesTargetsParams,
} from '../services/masters/SalesTargets';

/**
 * Query keys for Sales Targets-related queries
 */
export const salesTargetsQueryKeys = {
  all: ['sales-targets'] as const,
  lists: () => [...salesTargetsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...salesTargetsQueryKeys.lists(), params] as const,
  details: () => [...salesTargetsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...salesTargetsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Sales Targets with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Sales Targets data
 */
export const useSalesTargets = (
  params?: salesTargetsService.GetSalesTargetsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<salesTargetsService.SalesTarget[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salesTargetsQueryKeys.list(params),
    queryFn: () => salesTargetsService.fetchSalesTargets(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Sales Target by ID
 * @param id - Sales Target ID
 * @param options - React Query options
 * @returns Query result with Sales Target data
 */
export const useSalesTargetById = (
  id: number,
  options?: Omit<
    UseQueryOptions<salesTargetsService.SalesTarget>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salesTargetsQueryKeys.detail(id),
    queryFn: () => salesTargetsService.fetchSalesTargetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Sales Target with automatic toast notifications
 * @returns Mutation object for creating Sales Target
 */
export const useCreateSalesTarget = () => {
  return useApiMutation({
    mutationFn: salesTargetsService.createSalesTarget,
    invalidateQueries: ['sales-targets'],
    loadingMessage: 'Creating sales target...',
  });
};

/**
 * Hook to update Sales Target with automatic toast notifications
 * @returns Mutation object for updating Sales Target
 */
export const useUpdateSalesTarget = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: salesTargetsService.UpdateSalesTargetPayload;
    }) => salesTargetsService.updateSalesTarget(id, data),
    invalidateQueries: ['sales-targets'],
    loadingMessage: 'Updating sales target...',
  });
};

/**
 * Hook to delete Sales Target with automatic toast notifications
 * @returns Mutation object for deleting Sales Target
 */
export const useDeleteSalesTarget = () => {
  return useApiMutation({
    mutationFn: salesTargetsService.deleteSalesTarget,
    invalidateQueries: ['sales-targets'],
    loadingMessage: 'Deleting sales target...',
  });
};
