/**
 * @fileoverview Vehicles Management Hooks with React Query and Toast Integration
 * @description Provides hooks for vehicles CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as vehicleService from '../services/masters/Vehicles';
import type { ApiResponse } from '../types/api.types';

export type {
  Vehicle,
  ManageVehiclePayload,
  UpdateVehiclePayload,
  GetVehiclesParams,
} from '../services/masters/Vehicles';

/**
 * Query keys for vehicle-related queries
 */
export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...vehicleQueryKeys.lists(), params] as const,
  details: () => [...vehicleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...vehicleQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch vehicles with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with vehicles data
 */
export const useVehicles = (
  params?: vehicleService.GetVehiclesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<vehicleService.Vehicle[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: vehicleQueryKeys.list(params),
    queryFn: () => vehicleService.fetchVehicles(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch vehicle by ID
 * @param id - Vehicle ID
 * @param options - React Query options
 * @returns Query result with vehicle data
 */
export const useVehicle = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<vehicleService.Vehicle>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: vehicleQueryKeys.detail(id),
    queryFn: () => vehicleService.fetchVehicleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create vehicle with automatic toast notifications
 * @returns Mutation object for creating vehicle
 */
export const useCreateVehicle = () => {
  return useApiMutation({
    mutationFn: vehicleService.createVehicle,
    invalidateQueries: ['vehicles'],
    loadingMessage: 'Creating vehicle...',
  });
};

/**
 * Hook to update vehicle with automatic toast notifications
 * @returns Mutation object for updating vehicle
 */
export const useUpdateVehicle = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & vehicleService.UpdateVehiclePayload) =>
      vehicleService.updateVehicle(id, data),
    invalidateQueries: ['vehicles'],
    loadingMessage: 'Updating vehicle...',
  });
};

/**
 * Hook to delete vehicle with automatic toast notifications
 * @returns Mutation object for deleting vehicle
 */
export const useDeleteVehicle = () => {
  return useApiMutation({
    mutationFn: vehicleService.deleteVehicle,
    invalidateQueries: ['vehicles'],
    loadingMessage: 'Deleting vehicle...',
  });
};
