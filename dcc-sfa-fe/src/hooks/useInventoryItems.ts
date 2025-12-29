/**
 * @fileoverview Inventory Items Management Hooks with React Query
 * @description Provides hooks for inventory items operations with automatic caching
 * @author DCC-SFA Team
 * @version 1.2.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchAllSalespersonsInventory,
  fetchSalespersonInventory,
  type AllSalespersonsResponse,
  type GetSalespersonInventoryParams,
  type SingleSalespersonResponse,
} from '../services/masters/VanInventoryItems';

export type GetInventoryItemsParams = GetSalespersonInventoryParams & {
  salesperson_id?: number;
};

export const inventoryItemsQueryKeys = {
  all: ['inventory-items'] as const,
  lists: () => [...inventoryItemsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...inventoryItemsQueryKeys.lists(), params] as const,
  details: () => [...inventoryItemsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventoryItemsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch inventory items - returns either all salespersons summary or single salesperson details
 */
export const useInventoryItems = (
  params?: GetInventoryItemsParams,
  options?: Omit<
    UseQueryOptions<AllSalespersonsResponse | SingleSalespersonResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: inventoryItemsQueryKeys.list(params),
    queryFn: async (): Promise<
      AllSalespersonsResponse | SingleSalespersonResponse
    > => {
      const apiParams: GetSalespersonInventoryParams = {
        page: params?.page,
        limit: params?.limit,
        product_id: params?.product_id,
        include_expired_batches: params?.include_expired_batches,
        batch_status: params?.batch_status,
        serial_status: params?.serial_status,
      };

      if (params?.salesperson_id) {
        // Single salesperson - detailed view
        return await fetchSalespersonInventory(
          params.salesperson_id,
          apiParams
        );
      } else {
        // All salespersons - summary view
        return await fetchAllSalespersonsInventory(apiParams);
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch single salesperson inventory by ID
 */
export const useInventoryItemById = (
  salespersonId: number,
  options?: Omit<
    UseQueryOptions<SingleSalespersonResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: inventoryItemsQueryKeys.detail(salespersonId),
    queryFn: async (): Promise<SingleSalespersonResponse> => {
      return await fetchSalespersonInventory(salespersonId);
    },
    enabled: !!salespersonId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Re-export types for convenience
export type {
  AllSalespersonsResponse,
  SalespersonInventoryData,
  SalespersonSummary,
  SingleSalespersonResponse,
} from '../services/masters/VanInventoryItems';
