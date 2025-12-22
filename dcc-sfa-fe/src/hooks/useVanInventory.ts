/**
 * @fileoverview Van Inventory Management Hooks with React Query and Toast Integration
 * @description Provides hooks for van inventory CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as vanInventoryService from '../services/masters/VanInventory';
import type { ApiResponse } from '../types/api.types';

export type {
  VanInventory,
  ManageVanInventoryPayload,
  UpdateVanInventoryPayload,
  GetVanInventoryParams,
  ProductBatch,
  ProductBatchesResponse,
} from '../services/masters/VanInventory';

/**
 * Query keys for van inventory-related queries
 */
export const vanInventoryQueryKeys = {
  all: ['van-inventory'] as const,
  lists: () => [...vanInventoryQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...vanInventoryQueryKeys.lists(), params] as const,
  details: () => [...vanInventoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...vanInventoryQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch van inventory with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with van inventory data
 */
export const useVanInventory = (
  params?: vanInventoryService.GetVanInventoryParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<vanInventoryService.VanInventory[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: vanInventoryQueryKeys.list(params),
    queryFn: () => vanInventoryService.fetchVanInventory(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch van inventory by ID
 * @param id - Van Inventory ID
 * @param options - React Query options
 * @returns Query result with van inventory data
 */
export const useVanInventoryById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<vanInventoryService.VanInventory>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: vanInventoryQueryKeys.detail(id),
    queryFn: () => vanInventoryService.fetchVanInventoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create van inventory with automatic toast notifications
 * @returns Mutation object for creating van inventory
 */
export const useCreateVanInventory = () => {
  return useApiMutation({
    mutationFn: vanInventoryService.createVanInventory,
    invalidateQueries: ['van-inventory'],
    loadingMessage: 'Creating van inventory...',
  });
};

/**
 * Hook to update van inventory with automatic toast notifications
 * @returns Mutation object for updating van inventory
 */
export const useUpdateVanInventory = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & vanInventoryService.UpdateVanInventoryPayload) =>
      vanInventoryService.updateVanInventory(id, data),
    invalidateQueries: ['van-inventory'],
    loadingMessage: 'Updating van inventory...',
  });
};

/**
 * Hook to fetch product batches for a specific product
 * @param productId - Product ID to fetch batches for
 * @param options - Query options for filtering and sorting
 * @returns Query object with product batches data
 */
export const useProductBatches = (
  productId: number,
  options?: {
    loading_type?: 'L' | 'U';
    include_expired?: boolean;
    sort_by?:
      | 'expiry_date'
      | 'remaining_quantity'
      | 'batch_number'
      | 'manufacturing_date';
  },
  queryOptions?: UseQueryOptions<
    ApiResponse<vanInventoryService.ProductBatchesResponse>
  >
) => {
  return useQuery({
    queryKey: ['product-batches', productId, options],
    queryFn: () => vanInventoryService.getProductBatches(productId, options),
    enabled: !!productId,
    ...queryOptions,
  });
};

/**
 * Hook to delete van inventory with automatic toast notifications
 * @returns Mutation object for deleting van inventory
 */
export const useDeleteVanInventory = () => {
  return useApiMutation({
    mutationFn: vanInventoryService.deleteVanInventory,
    invalidateQueries: ['van-inventory'],
    loadingMessage: 'Deleting van inventory...',
  });
};
