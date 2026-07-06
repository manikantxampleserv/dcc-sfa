import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as reconciliationService from '../services/masters/Reconciliation';
import type { ApiResponse } from '../types/api.types';

export type {
  ReconciliationRecord,
  ReconciliationItem,
  GetReconciliationParams,
  SaveReconciliationPayload,
} from '../services/masters/Reconciliation';

export const reconciliationQueryKeys = {
  all: ['reconciliation'] as const,
  lists: () => [...reconciliationQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...reconciliationQueryKeys.lists(), params] as const,
  detail: (id: number) =>
    [...reconciliationQueryKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch the list of reconciliations (one per salesman load)
 */
export const useReconciliations = (
  params?: reconciliationService.GetReconciliationParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<reconciliationService.ReconciliationRecord[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: reconciliationQueryKeys.list(params),
    queryFn: () => reconciliationService.fetchReconciliations(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch loaded products (items) for a specific reconciliation
 */
export const useReconciliationById = (
  id: number | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<reconciliationService.ReconciliationItem[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: reconciliationQueryKeys.detail(id!),
    queryFn: () => reconciliationService.fetchReconciliationById(id!),
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to save reconciliation items
 */
export const useSaveReconciliation = () => {
  return useApiMutation({
    mutationFn: reconciliationService.saveReconciliations,
    invalidateQueries: ['reconciliation'],
    loadingMessage: 'Saving reconciliation data...',
  });
};

/**
 * Hook to export reconciliation settlement sheet to Excel
 */
export const useExportReconciliation = () => {
  return useApiMutation({
    mutationFn: reconciliationService.exportReconciliationExcel,
    loadingMessage: 'Exporting settlement sheet...',
    successMessage: 'Settlement sheet exported successfully!',
  });
};

/**
 * Hook to export reconciliation settlement sheet to PDF
 */
export const useExportReconciliationPdf = () => {
  return useApiMutation({
    mutationFn: reconciliationService.exportReconciliationPdf,
    loadingMessage: 'Exporting settlement sheet to PDF...',
    successMessage: 'Settlement sheet exported to PDF successfully!',
  });
};
