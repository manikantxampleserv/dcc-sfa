/**
 * @fileoverview Currency React Query Hooks
 * @description Custom hooks for currency data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createCurrency,
  deleteCurrency,
  fetchCurrencyById,
  fetchCurrencies,
  updateCurrency,
  type GetCurrenciesParams,
  type ManageCurrencyPayload,
  type UpdateCurrencyPayload,
  type Currency,
} from '../services/masters/Currencies';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

export const currencyKeys = {
  all: ['currencies'] as const,
  lists: () => [...currencyKeys.all, 'list'] as const,
  list: (params: GetCurrenciesParams) =>
    [...currencyKeys.lists(), params] as const,
  details: () => [...currencyKeys.all, 'detail'] as const,
  detail: (id: number) => [...currencyKeys.details(), id] as const,
};

/**
 * Hook to fetch currencies with pagination and filters
 */
export const useCurrencies = (
  params?: GetCurrenciesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Currency[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: currencyKeys.list(params || {}),
    queryFn: () => fetchCurrencies(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single currency by ID
 */
export const useCurrency = (id: number) => {
  return useQuery({
    queryKey: currencyKeys.detail(id),
    queryFn: () => fetchCurrencyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new currency
 */
export const useCreateCurrency = (options?: {
  onSuccess?: (data: any, variables: ManageCurrencyPayload) => void;
  onError?: (error: any, variables: ManageCurrencyPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createCurrency,
    loadingMessage: 'Creating currency...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing currency
 */
export const useUpdateCurrency = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateCurrencyPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateCurrencyPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...currencyData
    }: { id: number } & UpdateCurrencyPayload) =>
      updateCurrency(id, currencyData),
    loadingMessage: 'Updating currency...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: currencyKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a currency
 */
export const useDeleteCurrency = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteCurrency,
    loadingMessage: 'Deleting currency...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch currencies list
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetCurrenciesParams,
  ManageCurrencyPayload,
  UpdateCurrencyPayload,
  Currency,
};
