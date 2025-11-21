/**
 * @fileoverview Competitor Activity Management Hooks with React Query and Toast Integration
 * @description Provides hooks for competitor activity CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as competitorActivityService from '../services/masters/CompetitorActivity';

export type {
  CompetitorActivity,
  CreateCompetitorActivityPayload,
  UpdateCompetitorActivityPayload,
  CompetitorActivityQueryParams,
} from '../services/masters/CompetitorActivity';

/**
 * Query keys for competitor activity-related queries
 */
export const competitorActivityQueryKeys = {
  all: ['competitor-activity'] as const,
  lists: () => [...competitorActivityQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...competitorActivityQueryKeys.lists(), params] as const,
  details: () => [...competitorActivityQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...competitorActivityQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch competitor activities with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with competitor activities data
 */
export const useCompetitorActivities = (
  params?: competitorActivityService.CompetitorActivityQueryParams,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<competitorActivityService.CompetitorActivity[]>
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: competitorActivityQueryKeys.list(params),
    queryFn: () => competitorActivityService.fetchCompetitorActivities(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch competitor activity by ID
 * @param id - Competitor Activity ID
 * @param options - React Query options
 * @returns Query result with competitor activity data
 */
export const useCompetitorActivityById = (
  id: number,
  options?: Omit<
    UseQueryOptions<competitorActivityService.CompetitorActivity>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: competitorActivityQueryKeys.detail(id),
    queryFn: () => competitorActivityService.fetchCompetitorActivityById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create competitor activity with automatic toast notifications
 * @returns Mutation object for creating competitor activity
 */
export const useCreateCompetitorActivity = () => {
  return useApiMutation({
    mutationFn: competitorActivityService.createCompetitorActivity,
    invalidateQueries: ['competitor-activity'],
    loadingMessage: 'Creating competitor activity...',
  });
};

/**
 * Hook to update competitor activity with automatic toast notifications
 * @returns Mutation object for updating competitor activity
 */
export const useUpdateCompetitorActivity = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: competitorActivityService.UpdateCompetitorActivityPayload;
    }) => competitorActivityService.updateCompetitorActivity(id, data),
    invalidateQueries: ['competitor-activity'],
    loadingMessage: 'Updating competitor activity...',
  });
};

/**
 * Hook to delete competitor activity with automatic toast notifications
 * @returns Mutation object for deleting competitor activity
 */
export const useDeleteCompetitorActivity = () => {
  return useApiMutation({
    mutationFn: competitorActivityService.deleteCompetitorActivity,
    invalidateQueries: ['competitor-activity'],
    loadingMessage: 'Deleting competitor activity...',
  });
};
