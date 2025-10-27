/**
 * @fileoverview Delivery Schedules Management Hooks with React Query and Toast Integration
 * @description Provides hooks for delivery schedules CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as deliveryScheduleService from '../services/masters/DeliverySchedules';
import type { ApiResponse } from '../types/api.types';

export type {
  DeliverySchedule,
  ManageDeliverySchedulePayload,
  UpdateDeliverySchedulePayload,
  GetDeliverySchedulesParams,
  DeliveryScheduleStats,
} from '../services/masters/DeliverySchedules';

/**
 * Query keys for delivery schedule-related queries
 */
export const deliveryScheduleQueryKeys = {
  all: ['delivery-schedules'] as const,
  lists: () => [...deliveryScheduleQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...deliveryScheduleQueryKeys.lists(), params] as const,
  details: () => [...deliveryScheduleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...deliveryScheduleQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch delivery schedules with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with delivery schedules data
 */
export const useDeliverySchedules = (
  params?: deliveryScheduleService.GetDeliverySchedulesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<deliveryScheduleService.DeliverySchedule[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: deliveryScheduleQueryKeys.list(params),
    queryFn: () => deliveryScheduleService.fetchDeliverySchedules(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch delivery schedule by ID
 * @param id - Delivery Schedule ID
 * @param options - React Query options
 * @returns Query result with delivery schedule data
 */
export const useDeliverySchedule = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<deliveryScheduleService.DeliverySchedule>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: deliveryScheduleQueryKeys.detail(id),
    queryFn: () => deliveryScheduleService.fetchDeliveryScheduleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create delivery schedule with automatic toast notifications
 * @returns Mutation object for creating delivery schedule
 */
export const useCreateDeliverySchedule = () => {
  return useApiMutation({
    mutationFn: deliveryScheduleService.createDeliverySchedule,
    invalidateQueries: ['delivery-schedules'],
    loadingMessage: 'Creating delivery schedule...',
  });
};

/**
 * Hook to update delivery schedule with automatic toast notifications
 * @returns Mutation object for updating delivery schedule
 */
export const useUpdateDeliverySchedule = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & deliveryScheduleService.UpdateDeliverySchedulePayload) =>
      deliveryScheduleService.updateDeliverySchedule(id, data),
    invalidateQueries: ['delivery-schedules'],
    loadingMessage: 'Updating delivery schedule...',
  });
};

/**
 * Hook to delete delivery schedule with automatic toast notifications
 * @returns Mutation object for deleting delivery schedule
 */
export const useDeleteDeliverySchedule = () => {
  return useApiMutation({
    mutationFn: deliveryScheduleService.deleteDeliverySchedule,
    invalidateQueries: ['delivery-schedules'],
    loadingMessage: 'Deleting delivery schedule...',
  });
};
