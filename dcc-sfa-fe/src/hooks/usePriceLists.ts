/**
 * @fileoverview Price Lists Management Hooks with React Query and Toast Integration
 * @description Provides hooks for price lists CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as priceListsService from '../services/masters/PriceLists';

export type {
  PriceList,
  PriceListItem,
  RoutePriceList,
  ManagePriceListPayload,
  UpdatePriceListPayload,
  GetPriceListsParams,
} from '../services/masters/PriceLists';

/**
 * Query keys for price lists-related queries
 */
export const priceListsQueryKeys = {
  all: ['price-lists'] as const,
  lists: () => [...priceListsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...priceListsQueryKeys.lists(), params] as const,
  details: () => [...priceListsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...priceListsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch price lists with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with price lists data
 */
export const usePriceLists = (
  params?: priceListsService.GetPriceListsParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: priceListsQueryKeys.list(params),
    queryFn: () => priceListsService.fetchPriceLists(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch price list by ID
 * @param id - Price List ID
 * @param options - React Query options
 * @returns Query result with price list data
 */
export const usePriceListById = (
  id: number,
  options?: Omit<
    UseQueryOptions<priceListsService.PriceList>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: priceListsQueryKeys.detail(id),
    queryFn: () => priceListsService.fetchPriceListById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create price list with automatic toast notifications
 * @returns Mutation object for creating price list
 */
export const useCreatePriceList = () => {
  return useApiMutation({
    mutationFn: priceListsService.createPriceList,
    invalidateQueries: ['price-lists'],
    loadingMessage: 'Creating price list...',
  });
};

/**
 * Hook to update price list with automatic toast notifications
 * @returns Mutation object for updating price list
 */
export const useUpdatePriceList = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: priceListsService.UpdatePriceListPayload;
    }) => priceListsService.updatePriceList(id, data),
    invalidateQueries: ['price-lists'],
    loadingMessage: 'Updating price list...',
  });
};

/**
 * Hook to delete price list with automatic toast notifications
 * @returns Mutation object for deleting price list
 */
export const useDeletePriceList = () => {
  return useApiMutation({
    mutationFn: priceListsService.deletePriceList,
    invalidateQueries: ['price-lists'],
    loadingMessage: 'Deleting price list...',
  });
};
