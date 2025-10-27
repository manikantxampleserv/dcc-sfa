/**
 * @fileoverview Orders React Query Hooks
 * @description Custom hooks for orders data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  deleteOrder,
  fetchOrderById,
  fetchOrders,
  updateOrder,
  type GetOrdersParams,
  type ManageOrderPayload,
  type UpdateOrderPayload,
  type Order,
} from '../services/masters/Orders';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: GetOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to fetch orders with pagination and filters
 */
export const useOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => fetchOrders(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single order by ID
 */
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new order
 */
export const useCreateOrder = (options?: {
  onSuccess?: (data: any, variables: ManageOrderPayload) => void;
  onError?: (error: any, variables: ManageOrderPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createOrder,
    loadingMessage: 'Creating order...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing order
 */
export const useUpdateOrder = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateOrderPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateOrderPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ id, ...orderData }: { id: number } & UpdateOrderPayload) =>
      updateOrder(id, orderData),
    loadingMessage: 'Updating order...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete an order
 */
export const useDeleteOrder = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteOrder,
    loadingMessage: 'Deleting order...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type { GetOrdersParams, ManageOrderPayload, UpdateOrderPayload, Order };
