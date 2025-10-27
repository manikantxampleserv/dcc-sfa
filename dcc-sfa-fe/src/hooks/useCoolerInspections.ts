import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as coolerInspectionService from '../services/masters/CoolerInspections';
import type { ApiResponse } from '../types/api.types';

export type {
  CoolerInspection,
  CreateCoolerInspectionPayload,
  UpdateCoolerInspectionPayload,
  CoolerInspectionQueryParams,
  CoolerInspectionStats,
} from '../services/masters/CoolerInspections';

/**
 * Query keys for cooler inspection-related queries
 */
export const coolerInspectionQueryKeys = {
  all: ['cooler-inspections'] as const,
  lists: () => [...coolerInspectionQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...coolerInspectionQueryKeys.lists(), params] as const,
  details: () => [...coolerInspectionQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...coolerInspectionQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch cooler inspections with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with cooler inspections data
 */
export const useCoolerInspections = (
  params?: coolerInspectionService.CoolerInspectionQueryParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<coolerInspectionService.CoolerInspection[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerInspectionQueryKeys.list(params),
    queryFn: () => coolerInspectionService.fetchCoolerInspections(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch cooler inspection by ID
 * @param id - Cooler Inspection ID
 * @param options - React Query options
 * @returns Query result with cooler inspection data
 */
export const useCoolerInspection = (
  id: number,
  options?: Omit<
    UseQueryOptions<coolerInspectionService.CoolerInspection>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerInspectionQueryKeys.detail(id),
    queryFn: () => coolerInspectionService.fetchCoolerInspectionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create cooler inspection with automatic toast notifications
 * @returns Mutation object for creating cooler inspection
 */
export const useCreateCoolerInspection = () => {
  return useApiMutation({
    mutationFn: coolerInspectionService.createCoolerInspection,
    invalidateQueries: ['cooler-inspections'],
    loadingMessage: 'Creating cooler inspection...',
  });
};

/**
 * Hook to update cooler inspection with automatic toast notifications
 * @returns Mutation object for updating cooler inspection
 */
export const useUpdateCoolerInspection = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & coolerInspectionService.UpdateCoolerInspectionPayload) =>
      coolerInspectionService.updateCoolerInspection(id, data),
    invalidateQueries: ['cooler-inspections'],
    loadingMessage: 'Updating cooler inspection...',
  });
};

/**
 * Hook to delete cooler inspection with automatic toast notifications
 * @returns Mutation object for deleting cooler inspection
 */
export const useDeleteCoolerInspection = () => {
  return useApiMutation({
    mutationFn: coolerInspectionService.deleteCoolerInspection,
    invalidateQueries: ['cooler-inspections'],
    loadingMessage: 'Deleting cooler inspection...',
  });
};

export type StatusOption = coolerInspectionService.StatusOption;

export const useUpdateCoolerInspectionStatus = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      status,
      value,
    }: {
      id: number;
      status: string;
      value: string;
    }) =>
      coolerInspectionService.updateCoolerInspectionStatus(id, status, value),
    invalidateQueries: ['cooler-inspections'],
    loadingMessage: 'Updating cooler inspection status...',
  });
};

export const useCoolerInspectionStatusOptions = (
  options?: Omit<
    UseQueryOptions<coolerInspectionService.StatusOption[]>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...coolerInspectionQueryKeys.all, 'status-options'],
    queryFn: coolerInspectionService.fetchCoolerInspectionStatusOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};
