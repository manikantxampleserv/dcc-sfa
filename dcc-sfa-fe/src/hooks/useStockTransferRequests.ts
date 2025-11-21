/**
 * @fileoverview Stock Transfer Requests React Query Hooks
 * @description Custom hooks for stock transfer requests data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  upsertStockTransferRequest,
  deleteStockTransferRequest,
  fetchStockTransferRequestById,
  fetchStockTransferRequests,
  type GetStockTransferRequestsParams,
  type ManageStockTransferRequestPayload,
  type StockTransferRequest,
  type UpdateStockTransferRequestPayload,
} from '../services/masters/StockTransferRequests';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

// Query Keys
export const stockTransferRequestKeys = {
  all: ['stockTransferRequests'] as const,
  lists: () => [...stockTransferRequestKeys.all, 'list'] as const,
  list: (params: GetStockTransferRequestsParams) =>
    [...stockTransferRequestKeys.lists(), params] as const,
  details: () => [...stockTransferRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockTransferRequestKeys.details(), id] as const,
};

/**
 * Hook to fetch stock transfer requests with pagination and filters
 */
export const useStockTransferRequests = (
  params?: GetStockTransferRequestsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<StockTransferRequest[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: stockTransferRequestKeys.list(params || {}),
    queryFn: () => fetchStockTransferRequests(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single stock transfer request by ID
 */
export const useStockTransferRequest = (id: number) => {
  return useQuery({
    queryKey: stockTransferRequestKeys.detail(id),
    queryFn: () => fetchStockTransferRequestById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create or update a stock transfer request (upsert)
 */
export const useUpsertStockTransferRequest = (options?: {
  onSuccess?: (data: any, variables: ManageStockTransferRequestPayload) => void;
  onError?: (error: any, variables: ManageStockTransferRequestPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: upsertStockTransferRequest,
    loadingMessage: 'Saving stock transfer request...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch stock transfer requests list
      queryClient.invalidateQueries({
        queryKey: stockTransferRequestKeys.lists(),
      });

      // If updating, also invalidate the specific request
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: stockTransferRequestKeys.detail(variables.id),
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a stock transfer request
 */
export const useDeleteStockTransferRequest = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteStockTransferRequest,
    loadingMessage: 'Deleting stock transfer request...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch stock transfer requests list
      queryClient.invalidateQueries({
        queryKey: stockTransferRequestKeys.lists(),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetStockTransferRequestsParams,
  ManageStockTransferRequestPayload,
  StockTransferRequest,
  UpdateStockTransferRequestPayload,
};
