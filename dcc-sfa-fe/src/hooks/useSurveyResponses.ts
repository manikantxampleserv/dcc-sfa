/**
 * @fileoverview Survey Responses React Query Hooks
 * @description Custom hooks for survey response data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createOrUpdateSurveyResponse,
  deleteSurveyResponse,
  fetchSurveyResponseById,
  fetchSurveyResponses,
  type CreateOrUpdateSurveyResponsePayload,
  type GetSurveyResponsesParams,
  type SurveyResponse,
} from '../services/reports/SurveyResponses';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

// Query Keys
export const surveyResponseKeys = {
  all: ['survey-responses'] as const,
  lists: () => [...surveyResponseKeys.all, 'list'] as const,
  list: (params: GetSurveyResponsesParams) =>
    [...surveyResponseKeys.lists(), params] as const,
  details: () => [...surveyResponseKeys.all, 'detail'] as const,
  detail: (id: number) => [...surveyResponseKeys.details(), id] as const,
};

/**
 * Hook to fetch survey responses with pagination and filters
 */
export const useSurveyResponses = (
  params?: GetSurveyResponsesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SurveyResponse[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: surveyResponseKeys.list(params || {}),
    queryFn: () => fetchSurveyResponses(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single survey response by ID
 */
export const useSurveyResponse = (id: number) => {
  return useQuery({
    queryKey: surveyResponseKeys.detail(id),
    queryFn: () => fetchSurveyResponseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create or update a survey response (unified)
 */
export const useCreateOrUpdateSurveyResponse = (options?: {
  onSuccess?: (
    data: any,
    variables: CreateOrUpdateSurveyResponsePayload
  ) => void;
  onError?: (
    error: any,
    variables: CreateOrUpdateSurveyResponsePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createOrUpdateSurveyResponse,
    loadingMessage: 'Saving survey response...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyResponseKeys.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: surveyResponseKeys.detail(variables.id),
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a survey response
 */
export const useDeleteSurveyResponse = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteSurveyResponse,
    loadingMessage: 'Deleting survey response...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyResponseKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetSurveyResponsesParams,
  CreateOrUpdateSurveyResponsePayload,
  SurveyResponse,
};
