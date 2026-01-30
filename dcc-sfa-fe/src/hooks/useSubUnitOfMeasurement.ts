/**
 * @fileoverview Sub Unit of Measurement Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Sub Unit of Measurement CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as subUnitOfMeasurementService from '../services/masters/SubUnitOfMeasurement';

export type {
  SubUnitOfMeasurement,
  ManageSubUnitOfMeasurementPayload,
  UpdateSubUnitOfMeasurementPayload,
  GetSubUnitOfMeasurementsParams,
} from '../services/masters/SubUnitOfMeasurement';

/**
 * Query keys for Sub Unit of Measurement-related queries
 */
export const subUnitOfMeasurementQueryKeys = {
  all: ['sub-unit-of-measurements'] as const,
  lists: () => [...subUnitOfMeasurementQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...subUnitOfMeasurementQueryKeys.lists(), params] as const,
  details: () => [...subUnitOfMeasurementQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...subUnitOfMeasurementQueryKeys.details(), id] as const,
  lookup: () => [...subUnitOfMeasurementQueryKeys.all, 'lookup'] as const,
};

/**
 * Hook to fetch Sub Unit of Measurements with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Sub Unit of Measurements data
 */
export const useSubUnitOfMeasurements = (
  params?: subUnitOfMeasurementService.GetSubUnitOfMeasurementsParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: subUnitOfMeasurementQueryKeys.list(params),
    queryFn: () =>
      subUnitOfMeasurementService.fetchSubUnitOfMeasurements(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Sub Unit of Measurement by ID
 * @param id - Sub Unit of Measurement ID
 * @param options - React Query options
 * @returns Query result with Sub Unit of Measurement data
 */
export const useSubUnitOfMeasurementById = (
  id: number,
  options?: Omit<
    UseQueryOptions<subUnitOfMeasurementService.SubUnitOfMeasurement>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: subUnitOfMeasurementQueryKeys.detail(id),
    queryFn: () => subUnitOfMeasurementService.fetchSubUnitOfMeasurementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Units of Measurement for dropdown
 * @param options - React Query options
 * @returns Query result with Units of Measurement data
 */
export const useUnitsOfMeasurementLookup = (
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...subUnitOfMeasurementQueryKeys.lookup(), 'units-of-measurement'],
    queryFn: subUnitOfMeasurementService.fetchUnitsOfMeasurementLookup,
    staleTime: 15 * 60 * 1000, // 15 minutes cache for lookup data
    ...options,
  });
};

/**
 * Hook to fetch Products for dropdown
 * @param options - React Query options
 * @returns Query result with Products data
 */
export const useProductsLookup = (
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...subUnitOfMeasurementQueryKeys.lookup(), 'products'],
    queryFn: subUnitOfMeasurementService.fetchProductsLookup,
    staleTime: 15 * 60 * 1000, // 15 minutes cache for lookup data
    ...options,
  });
};

/**
 * Hook to create Sub Unit of Measurement with automatic toast notifications
 * @returns Mutation object for creating Sub Unit of Measurement
 */
export const useCreateSubUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: subUnitOfMeasurementService.createSubUnitOfMeasurement,
    invalidateQueries: ['sub-unit-of-measurements'],
    loadingMessage: 'Creating sub unit of measurement...',
  });
};

/**
 * Hook to update Sub Unit of Measurement with automatic toast notifications
 * @returns Mutation object for updating Sub Unit of Measurement
 */
export const useUpdateSubUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: subUnitOfMeasurementService.UpdateSubUnitOfMeasurementPayload;
    }) => subUnitOfMeasurementService.updateSubUnitOfMeasurement(id, data),
    invalidateQueries: ['sub-unit-of-measurements'],
    loadingMessage: 'Updating sub unit of measurement...',
  });
};

/**
 * Hook to delete Sub Unit of Measurement with automatic toast notifications
 * @returns Mutation object for deleting Sub Unit of Measurement
 */
export const useDeleteSubUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: subUnitOfMeasurementService.deleteSubUnitOfMeasurement,
    invalidateQueries: ['sub-unit-of-measurements'],
    loadingMessage: 'Deleting sub unit of measurement...',
  });
};
