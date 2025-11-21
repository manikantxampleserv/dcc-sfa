import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchApiTokens,
  fetchApiTokenById,
  revokeApiToken,
  activateApiToken,
  deactivateApiToken,
  deleteApiToken,
  revokeAllUserTokens,
  type GetApiTokensParams,
  type ApiToken,
} from '../services/masters/ApiTokens';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export const apiTokenKeys = {
  all: ['api-tokens'] as const,
  lists: () => [...apiTokenKeys.all, 'list'] as const,
  list: (params: GetApiTokensParams) =>
    [...apiTokenKeys.lists(), params] as const,
  details: () => [...apiTokenKeys.all, 'detail'] as const,
  detail: (id: number) => [...apiTokenKeys.details(), id] as const,
};

export const useApiTokens = (
  params?: GetApiTokensParams,
  options?: Omit<UseQueryOptions<ApiResponse<ApiToken[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: apiTokenKeys.list(params || {}),
    queryFn: () => fetchApiTokens(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useApiToken = (id: number) => {
  return useQuery({
    queryKey: apiTokenKeys.detail(id),
    queryFn: () => fetchApiTokenById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRevokeApiToken = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: revokeApiToken,
    loadingMessage: 'Revoking token...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: apiTokenKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: apiTokenKeys.detail(variables),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useActivateApiToken = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: activateApiToken,
    loadingMessage: 'Activating token...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: apiTokenKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: apiTokenKeys.detail(variables),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeactivateApiToken = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deactivateApiToken,
    loadingMessage: 'Deactivating token...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: apiTokenKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: apiTokenKeys.detail(variables),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeleteApiToken = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteApiToken,
    loadingMessage: 'Deleting token...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: apiTokenKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useRevokeAllUserTokens = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: revokeAllUserTokens,
    loadingMessage: 'Revoking all user tokens...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: apiTokenKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetApiTokensParams, ApiToken };
