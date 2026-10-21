/**
 * @fileoverview Promotional Materials Hooks with React Query and Toast Integration
 * @description Provides hooks for promotional materials master CRUD and outlet promotional items
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as promotionalMaterialsService from '../services/masters/PromotionalMaterials';

export type {
  PromotionalMaterial,
  CreatePromotionalMaterialPayload,
  UpdatePromotionalMaterialPayload,
  PromotionalMaterialQueryParams,
  PromotionalMaterialStats,
  OutletPromotionalMaterialsResponse,
} from '../services/masters/PromotionalMaterials';

/**
 * Query keys for promotional materials queries
 */
export const promotionalMaterialsQueryKeys = {
  all: ['promotional-materials'] as const,
  lists: () => [...promotionalMaterialsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...promotionalMaterialsQueryKeys.lists(), params] as const,
  details: () => [...promotionalMaterialsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...promotionalMaterialsQueryKeys.details(), id] as const,
  outlets: () => [...promotionalMaterialsQueryKeys.all, 'outlet'] as const,
  outlet: (outletId: number) =>
    [...promotionalMaterialsQueryKeys.outlets(), outletId] as const,
};

/**
 * Hook to fetch promotional materials list with pagination, search, and status filters
 */
export const usePromotionalMaterials = (
  params?: promotionalMaterialsService.PromotionalMaterialQueryParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: promotionalMaterialsQueryKeys.list(params),
    queryFn: () => promotionalMaterialsService.fetchPromotionalMaterials(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch single promotional material by ID
 */
export const usePromotionalMaterialById = (
  id: number,
  options?: Omit<
    UseQueryOptions<promotionalMaterialsService.PromotionalMaterial>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: promotionalMaterialsQueryKeys.detail(id),
    queryFn: () => promotionalMaterialsService.fetchPromotionalMaterialById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch promotional materials issued to a specific outlet
 */
export const useOutletPromotionalMaterials = (
  outletId: number,
  options?: Omit<
    UseQueryOptions<promotionalMaterialsService.OutletPromotionalMaterialsResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: promotionalMaterialsQueryKeys.outlet(outletId),
    queryFn: () =>
      promotionalMaterialsService.fetchOutletPromotionalMaterials(outletId),
    enabled: !!outletId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create a promotional material with automatic toast notification
 */
export const useCreatePromotionalMaterial = () => {
  return useApiMutation({
    mutationFn: (data: promotionalMaterialsService.CreatePromotionalMaterialPayload) =>
      promotionalMaterialsService.createPromotionalMaterial(data),
    invalidateQueries: ['promotional-materials'],
    loadingMessage: 'Creating promotional material...',
  });
};

/**
 * Hook to update a promotional material with automatic toast notification
 */
export const useUpdatePromotionalMaterial = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: promotionalMaterialsService.UpdatePromotionalMaterialPayload;
    }) => promotionalMaterialsService.updatePromotionalMaterial(id, data),
    invalidateQueries: ['promotional-materials'],
    loadingMessage: 'Updating promotional material...',
  });
};

/**
 * Hook to delete a promotional material with automatic toast notification
 */
export const useDeletePromotionalMaterial = () => {
  return useApiMutation({
    mutationFn: (id: number) =>
      promotionalMaterialsService.deletePromotionalMaterial(id),
    invalidateQueries: ['promotional-materials'],
    loadingMessage: 'Deleting promotional material...',
  });
};
