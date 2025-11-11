/**
 * @fileoverview Van Inventory Items React Query Hooks
 * @description Custom hooks for van inventory items data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVanInventoryItem,
  deleteVanInventoryItem,
  getVanInventoryItems,
  updateVanInventoryItem,
  bulkUpdateVanInventoryItems,
  type VanInventoryItem,
  type CreateVanInventoryItemPayload,
  type UpdateVanInventoryItemPayload,
  type BulkUpdateVanInventoryItemsPayload,
} from '../services/masters/VanInventoryItems';
import { useApiMutation } from './useApiMutation';

export const vanInventoryItemKeys = {
  all: ['van-inventory-items'] as const,
  lists: () => [...vanInventoryItemKeys.all, 'list'] as const,
  list: (vanInventoryId: number) =>
    [...vanInventoryItemKeys.lists(), vanInventoryId] as const,
};

/**
 * Hook to fetch van inventory items for a van inventory
 */
export const useVanInventoryItems = (
  vanInventoryId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: vanInventoryItemKeys.list(vanInventoryId),
    queryFn: () => getVanInventoryItems(vanInventoryId),
    enabled:
      options?.enabled !== undefined ? options.enabled : !!vanInventoryId,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: 1, // Only retry once on failure
  });
};

/**
 * Hook to create a new van inventory item
 */
export const useCreateVanInventoryItem = (options?: {
  onSuccess?: (
    data: any,
    variables: { vanInventoryId: number } & CreateVanInventoryItemPayload
  ) => void;
  onError?: (
    error: any,
    variables: { vanInventoryId: number } & CreateVanInventoryItemPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      vanInventoryId,
      ...data
    }: { vanInventoryId: number } & CreateVanInventoryItemPayload) =>
      createVanInventoryItem(vanInventoryId, data),
    loadingMessage: 'Creating van inventory item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vanInventoryItemKeys.list(variables.vanInventoryId),
      });
      queryClient.invalidateQueries({
        queryKey: ['van-inventory', variables.vanInventoryId],
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update a van inventory item
 */
export const useUpdateVanInventoryItem = (options?: {
  onSuccess?: (
    data: any,
    variables: {
      vanInventoryId: number;
      itemId: number;
    } & UpdateVanInventoryItemPayload
  ) => void;
  onError?: (
    error: any,
    variables: {
      vanInventoryId: number;
      itemId: number;
    } & UpdateVanInventoryItemPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      vanInventoryId,
      itemId,
      ...data
    }: {
      vanInventoryId: number;
      itemId: number;
    } & UpdateVanInventoryItemPayload) =>
      updateVanInventoryItem(vanInventoryId, itemId, data),
    loadingMessage: 'Updating van inventory item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vanInventoryItemKeys.list(variables.vanInventoryId),
      });
      queryClient.invalidateQueries({
        queryKey: ['van-inventory', variables.vanInventoryId],
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a van inventory item
 */
export const useDeleteVanInventoryItem = (options?: {
  onSuccess?: (
    data: any,
    variables: { vanInventoryId: number; itemId: number }
  ) => void;
  onError?: (
    error: any,
    variables: { vanInventoryId: number; itemId: number }
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      vanInventoryId,
      itemId,
    }: {
      vanInventoryId: number;
      itemId: number;
    }) => deleteVanInventoryItem(vanInventoryId, itemId),
    loadingMessage: 'Deleting van inventory item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vanInventoryItemKeys.list(variables.vanInventoryId),
      });
      queryClient.invalidateQueries({
        queryKey: ['van-inventory', variables.vanInventoryId],
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to bulk update van inventory items for a van inventory
 */
export const useBulkUpdateVanInventoryItems = (options?: {
  onSuccess?: (
    data: any,
    variables: { vanInventoryId: number } & BulkUpdateVanInventoryItemsPayload
  ) => void;
  onError?: (
    error: any,
    variables: { vanInventoryId: number } & BulkUpdateVanInventoryItemsPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      vanInventoryId,
      ...data
    }: { vanInventoryId: number } & BulkUpdateVanInventoryItemsPayload) =>
      bulkUpdateVanInventoryItems(vanInventoryId, data),
    loadingMessage: 'Updating van inventory items...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vanInventoryItemKeys.list(variables.vanInventoryId),
      });
      queryClient.invalidateQueries({
        queryKey: ['van-inventory', variables.vanInventoryId],
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  VanInventoryItem,
  CreateVanInventoryItemPayload,
  UpdateVanInventoryItemPayload,
  BulkUpdateVanInventoryItemsPayload,
};
