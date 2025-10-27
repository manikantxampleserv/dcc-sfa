/**
 * @fileoverview Warehouses Management Hooks with React Query and Toast Integration
 * @description Provides hooks for warehouses CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as warehouseService from '../services/masters/Warehouses';
import type { ApiResponse } from '../types/api.types';

export type {
  Warehouse,
  ManageWarehousePayload,
  UpdateWarehousePayload,
  GetWarehousesParams,
} from '../services/masters/Warehouses';

/**
 * Query keys for warehouse-related queries
 */
export const warehouseQueryKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...warehouseQueryKeys.lists(), params] as const,
  details: () => [...warehouseQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...warehouseQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch warehouses with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with warehouses data
 */
export const useWarehouses = (
  params?: warehouseService.GetWarehousesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<warehouseService.Warehouse[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: warehouseQueryKeys.list(params),
    queryFn: () => warehouseService.fetchWarehouses(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch warehouse by ID
 * @param id - Warehouse ID
 * @param options - React Query options
 * @returns Query result with warehouse data
 */
export const useWarehouse = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<warehouseService.Warehouse>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: warehouseQueryKeys.detail(id),
    queryFn: () => warehouseService.fetchWarehouseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create warehouse with automatic toast notifications
 * @returns Mutation object for creating warehouse
 */
export const useCreateWarehouse = () => {
  return useApiMutation({
    mutationFn: warehouseService.createWarehouse,
    invalidateQueries: ['warehouses'],
    loadingMessage: 'Creating warehouse...',
  });
};

/**
 * Hook to update warehouse with automatic toast notifications
 * @returns Mutation object for updating warehouse
 */
export const useUpdateWarehouse = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & warehouseService.UpdateWarehousePayload) =>
      warehouseService.updateWarehouse(id, data),
    invalidateQueries: ['warehouses'],
    loadingMessage: 'Updating warehouse...',
  });
};

/**
 * Hook to delete warehouse with automatic toast notifications
 * @returns Mutation object for deleting warehouse
 */
export const useDeleteWarehouse = () => {
  return useApiMutation({
    mutationFn: warehouseService.deleteWarehouse,
    invalidateQueries: ['warehouses'],
    loadingMessage: 'Deleting warehouse...',
  });
};
