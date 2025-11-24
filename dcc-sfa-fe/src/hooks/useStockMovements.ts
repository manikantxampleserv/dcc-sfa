/**
 * @fileoverview Stock Movements React Query Hooks
 * @description Custom hooks for stock movements data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  upsertStockMovement,
  updateStockMovement,
  deleteStockMovement,
  fetchStockMovementById,
  fetchStockMovements,
  type GetStockMovementsParams,
  type ManageStockMovementPayload,
  type StockMovement,
  type UpdateStockMovementPayload,
} from '../services/masters/StockMovements';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

// Query Keys
export const stockMovementKeys = {
  all: ['stockMovements'] as const,
  lists: () => [...stockMovementKeys.all, 'list'] as const,
  list: (params: GetStockMovementsParams) =>
    [...stockMovementKeys.lists(), params] as const,
  details: () => [...stockMovementKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockMovementKeys.details(), id] as const,
};

/**
 * Hook to fetch stock movements with pagination and filters
 */
export const useStockMovements = (
  params?: GetStockMovementsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<StockMovement[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: stockMovementKeys.list(params || {}),
    queryFn: () => fetchStockMovements(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single stock movement by ID
 */
export const useStockMovement = (id: number) => {
  return useQuery({
    queryKey: stockMovementKeys.detail(id),
    queryFn: () => fetchStockMovementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create or update a stock movement (upsert)
 */
export const useUpsertStockMovement = (options?: {
  onSuccess?: (data: any, variables: ManageStockMovementPayload) => void;
  onError?: (error: any, variables: ManageStockMovementPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: upsertStockMovement,
    loadingMessage: 'Saving stock movement...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch stock movements list
      queryClient.invalidateQueries({
        queryKey: stockMovementKeys.lists(),
      });

      // If updating, also invalidate the specific movement
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: stockMovementKeys.detail(variables.id),
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update a stock movement
 */
export const useUpdateStockMovement = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number; data: UpdateStockMovementPayload }
  ) => void;
  onError?: (
    error: any,
    variables: { id: number; data: UpdateStockMovementPayload }
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateStockMovementPayload;
    }) => updateStockMovement(id, data),
    loadingMessage: 'Updating stock movement...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch stock movements list
      queryClient.invalidateQueries({
        queryKey: stockMovementKeys.lists(),
      });

      // Invalidate the specific movement
      queryClient.invalidateQueries({
        queryKey: stockMovementKeys.detail(variables.id),
      });

      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a stock movement
 */
export const useDeleteStockMovement = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteStockMovement,
    loadingMessage: 'Deleting stock movement...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch stock movements list
      queryClient.invalidateQueries({
        queryKey: stockMovementKeys.lists(),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetStockMovementsParams,
  ManageStockMovementPayload,
  StockMovement,
  UpdateStockMovementPayload,
};
