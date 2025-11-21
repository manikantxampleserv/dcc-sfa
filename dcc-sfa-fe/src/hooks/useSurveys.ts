/**
 * @fileoverview Survey React Query Hooks
 * @description Custom hooks for survey data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createOrUpdateSurvey,
  deleteSurvey,
  fetchSurveyById,
  fetchSurveys,
  publishSurvey,
  type GetSurveysParams,
  type ManageSurveyPayload,
  type Survey,
} from '../services/masters/Surveys';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

// Query Keys
export const surveyKeys = {
  all: ['surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (params: GetSurveysParams) => [...surveyKeys.lists(), params] as const,
  details: () => [...surveyKeys.all, 'detail'] as const,
  detail: (id: number) => [...surveyKeys.details(), id] as const,
};

/**
 * Hook to fetch surveys with pagination and filters
 */
export const useSurveys = (
  params?: GetSurveysParams,
  options?: Omit<UseQueryOptions<ApiResponse<Survey[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: surveyKeys.list(params || {}),
    queryFn: () => fetchSurveys(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single survey by ID
 */
export const useSurvey = (id: number) => {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => fetchSurveyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create or update a survey (unified)
 * If payload includes id, it will update; otherwise it will create
 */
export const useCreateOrUpdateSurvey = (options?: {
  onSuccess?: (data: any, variables: ManageSurveyPayload) => void;
  onError?: (error: any, variables: ManageSurveyPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createOrUpdateSurvey,
    loadingMessage: 'Saving survey...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: surveyKeys.detail(variables.id),
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a survey
 */
export const useDeleteSurvey = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteSurvey,
    loadingMessage: 'Deleting survey...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to publish/unpublish a survey
 */
export const usePublishSurvey = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: publishSurvey,
    loadingMessage: 'Publishing survey...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(variables),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetSurveysParams, ManageSurveyPayload, Survey };
