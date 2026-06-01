/**
 * @fileoverview Asset Brands Management Hooks with React Query and Toast Integration
 * @description Provides hooks for asset brands CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as assetBrandService from '../services/masters/AssetBrands';
import type { ApiResponse } from '../types/api.types';

export type {
  AssetBrand,
  ManageAssetBrandPayload,
  UpdateAssetBrandPayload,
  GetAssetBrandsParams,
} from '../services/masters/AssetBrands';

/**
 * Query keys for asset brand-related queries
 */
export const assetBrandQueryKeys = {
  all: ['asset-brands'] as const,
  lists: () => [...assetBrandQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...assetBrandQueryKeys.lists(), params] as const,
  details: () => [...assetBrandQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetBrandQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch asset brands with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with asset brands data
 */
export const useAssetBrands = (
  params?: assetBrandService.GetAssetBrandsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetBrandService.AssetBrand[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetBrandQueryKeys.list(params),
    queryFn: () => assetBrandService.fetchAssetBrands(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch asset brand by ID
 * @param id - Asset Brand ID
 * @param options - React Query options
 * @returns Query result with asset brand data
 */
export const useAssetBrand = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<assetBrandService.AssetBrand>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: assetBrandQueryKeys.detail(id),
    queryFn: () => assetBrandService.fetchAssetBrandById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset brand with automatic toast notifications
 * @returns Mutation object for creating asset brand
 */
export const useCreateAssetBrand = () => {
  return useApiMutation({
    mutationFn: assetBrandService.createAssetBrand,
    invalidateQueries: ['asset-brands'],
    loadingMessage: 'Creating asset brand...',
  });
};

/**
 * Hook to update asset brand with automatic toast notifications
 * @returns Mutation object for updating asset brand
 */
export const useUpdateAssetBrand = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & assetBrandService.UpdateAssetBrandPayload) =>
      assetBrandService.updateAssetBrand(id, data),
    invalidateQueries: ['asset-brands'],
    loadingMessage: 'Updating asset brand...',
  });
};

/**
 * Hook to delete asset brand with automatic toast notifications
 * @returns Mutation object for deleting asset brand
 */
export const useDeleteAssetBrand = () => {
  return useApiMutation({
    mutationFn: assetBrandService.deleteAssetBrand,
    invalidateQueries: ['asset-brands'],
    loadingMessage: 'Deleting asset brand...',
  });
};
