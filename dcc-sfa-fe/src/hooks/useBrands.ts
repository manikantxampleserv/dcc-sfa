/**
 * @fileoverview Brands Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Brands CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as brandsService from '../services/masters/Brands';

export type {
  Brand,
  ManageBrandPayload,
  UpdateBrandPayload,
  GetBrandsParams,
} from '../services/masters/Brands';

/**
 * Query keys for Brands-related queries
 */
export const brandsQueryKeys = {
  all: ['brands'] as const,
  lists: () => [...brandsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...brandsQueryKeys.lists(), params] as const,
  details: () => [...brandsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...brandsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Brands with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Brands data
 */
export const useBrands = (
  params?: brandsService.GetBrandsParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: brandsQueryKeys.list(params),
    queryFn: () => brandsService.fetchBrands(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Brand by ID
 * @param id - Brand ID
 * @param options - React Query options
 * @returns Query result with Brand data
 */
export const useBrandById = (
  id: number,
  options?: Omit<UseQueryOptions<brandsService.Brand>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: brandsQueryKeys.detail(id),
    queryFn: () => brandsService.fetchBrandById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Brand with automatic toast notifications
 * @returns Mutation object for creating Brand
 */
export const useCreateBrand = () => {
  return useApiMutation({
    mutationFn: brandsService.createBrand,
    invalidateQueries: ['brands'],
    loadingMessage: 'Creating brand...',
  });
};

/**
 * Hook to update Brand with automatic toast notifications
 * @returns Mutation object for updating Brand
 */
export const useUpdateBrand = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: brandsService.UpdateBrandPayload;
    }) => brandsService.updateBrand(id, data),
    invalidateQueries: ['brands'],
    loadingMessage: 'Updating brand...',
  });
};

/**
 * Hook to delete Brand with automatic toast notifications
 * @returns Mutation object for deleting Brand
 */
export const useDeleteBrand = () => {
  return useApiMutation({
    mutationFn: brandsService.deleteBrand,
    invalidateQueries: ['brands'],
    loadingMessage: 'Deleting brand...',
  });
};
