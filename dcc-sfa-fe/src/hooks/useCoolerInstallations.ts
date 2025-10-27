import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as coolerInstallationService from '../services/masters/CoolerInstallations';
import type { ApiResponse } from '../types/api.types';

export type {
  CoolerInstallation,
  CreateCoolerInstallationPayload,
  UpdateCoolerInstallationPayload,
  CoolerInstallationQueryParams,
  CoolerInstallationStats,
  StatusOption,
} from '../services/masters/CoolerInstallations';

/**
 * Query keys for cooler installation-related queries
 */
export const coolerInstallationQueryKeys = {
  all: ['cooler-installations'] as const,
  lists: () => [...coolerInstallationQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...coolerInstallationQueryKeys.lists(), params] as const,
  details: () => [...coolerInstallationQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...coolerInstallationQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch cooler installations with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with cooler installations data
 */
export const useCoolerInstallations = (
  params?: coolerInstallationService.CoolerInstallationQueryParams,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<coolerInstallationService.CoolerInstallation[]>
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerInstallationQueryKeys.list(params),
    queryFn: () => coolerInstallationService.fetchCoolerInstallations(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch cooler installation by ID
 * @param id - Cooler Installation ID
 * @param options - React Query options
 * @returns Query result with cooler installation data
 */
export const useCoolerInstallation = (
  id: number,
  options?: Omit<
    UseQueryOptions<coolerInstallationService.CoolerInstallation>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerInstallationQueryKeys.detail(id),
    queryFn: () => coolerInstallationService.fetchCoolerInstallationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create cooler installation with automatic toast notifications
 * @returns Mutation object for creating cooler installation
 */
export const useCreateCoolerInstallation = () => {
  return useApiMutation({
    mutationFn: coolerInstallationService.createCoolerInstallation,
    invalidateQueries: ['cooler-installations'],
    loadingMessage: 'Creating cooler installation...',
  });
};

/**
 * Hook to update cooler installation with automatic toast notifications
 * @returns Mutation object for updating cooler installation
 */
export const useUpdateCoolerInstallation = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & coolerInstallationService.UpdateCoolerInstallationPayload) =>
      coolerInstallationService.updateCoolerInstallation(id, data),
    invalidateQueries: ['cooler-installations'],
    loadingMessage: 'Updating cooler installation...',
  });
};

/**
 * Hook to delete cooler installation with automatic toast notifications
 * @returns Mutation object for deleting cooler installation
 */
export const useDeleteCoolerInstallation = () => {
  return useApiMutation({
    mutationFn: coolerInstallationService.deleteCoolerInstallation,
    invalidateQueries: ['cooler-installations'],
    loadingMessage: 'Deleting cooler installation...',
  });
};

/**
 * Hook to update cooler status with automatic toast notifications
 * @returns Mutation object for updating cooler status
 */
export const useUpdateCoolerStatus = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      status,
      value,
    }: {
      id: number;
      status: string;
      value: string;
    }) => coolerInstallationService.updateCoolerStatus(id, status, value),
    invalidateQueries: ['cooler-installations'],
    loadingMessage: 'Updating cooler status...',
  });
};

/**
 * Hook to fetch cooler status options
 * @param options - React Query options
 * @returns Query result with status options
 */
export const useCoolerStatusOptions = (
  options?: Omit<
    UseQueryOptions<coolerInstallationService.StatusOption[]>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...coolerInstallationQueryKeys.all, 'status-options'],
    queryFn: coolerInstallationService.fetchCoolerStatusOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};
