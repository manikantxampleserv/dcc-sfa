/**
 * @fileoverview KPI Targets Management Hooks with React Query and Toast Integration
 * @description Provides hooks for KPI targets CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as kpiTargetsService from '../services/masters/KpiTargets';

export type {
  KpiTarget,
  ManageKpiTargetPayload,
  UpdateKpiTargetPayload,
  GetKpiTargetsParams,
} from '../services/masters/KpiTargets';

/**
 * Query keys for KPI targets-related queries
 */
export const kpiTargetsQueryKeys = {
  all: ['kpi-targets'] as const,
  lists: () => [...kpiTargetsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...kpiTargetsQueryKeys.lists(), params] as const,
  details: () => [...kpiTargetsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...kpiTargetsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch KPI targets with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with KPI targets data
 */
export const useKpiTargets = (
  params?: kpiTargetsService.GetKpiTargetsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<kpiTargetsService.KpiTarget[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kpiTargetsQueryKeys.list(params),
    queryFn: () => kpiTargetsService.fetchKpiTargets(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch KPI target by ID
 * @param id - KPI target ID
 * @param options - React Query options
 * @returns Query result with KPI target data
 */
export const useKpiTargetById = (
  id: number,
  options?: Omit<
    UseQueryOptions<kpiTargetsService.KpiTarget>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kpiTargetsQueryKeys.detail(id),
    queryFn: () => kpiTargetsService.fetchKpiTargetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create KPI target with automatic toast notifications
 * @returns Mutation object for creating KPI target
 */
export const useCreateKpiTarget = () => {
  return useApiMutation({
    mutationFn: kpiTargetsService.createKpiTarget,
    invalidateQueries: ['kpi-targets'],
    loadingMessage: 'Creating KPI target...',
  });
};

/**
 * Hook to update KPI target with automatic toast notifications
 * @returns Mutation object for updating KPI target
 */
export const useUpdateKpiTarget = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: kpiTargetsService.UpdateKpiTargetPayload;
    }) => kpiTargetsService.updateKpiTarget(id, data),
    invalidateQueries: ['kpi-targets'],
    loadingMessage: 'Updating KPI target...',
  });
};

/**
 * Hook to delete KPI target with automatic toast notifications
 * @returns Mutation object for deleting KPI target
 */
export const useDeleteKpiTarget = () => {
  return useApiMutation({
    mutationFn: kpiTargetsService.deleteKpiTarget,
    invalidateQueries: ['kpi-targets'],
    loadingMessage: 'Deleting KPI target...',
  });
};
