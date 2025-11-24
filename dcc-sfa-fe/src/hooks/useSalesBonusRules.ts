/**
 * @fileoverview Sales Bonus Rules Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Sales Bonus Rules CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as salesBonusRulesService from '../services/masters/SalesBonusRules';

export type {
  SalesBonusRule,
  ManageSalesBonusRulePayload,
  UpdateSalesBonusRulePayload,
  GetSalesBonusRulesParams,
} from '../services/masters/SalesBonusRules';

/**
 * Query keys for Sales Bonus Rules-related queries
 */
export const salesBonusRulesQueryKeys = {
  all: ['sales-bonus-rules'] as const,
  lists: () => [...salesBonusRulesQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...salesBonusRulesQueryKeys.lists(), params] as const,
  details: () => [...salesBonusRulesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...salesBonusRulesQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Sales Bonus Rules with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Sales Bonus Rules data
 */
export const useSalesBonusRules = (
  params?: salesBonusRulesService.GetSalesBonusRulesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<salesBonusRulesService.SalesBonusRule[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salesBonusRulesQueryKeys.list(params),
    queryFn: () => salesBonusRulesService.fetchSalesBonusRules(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Sales Bonus Rule by ID
 * @param id - Sales Bonus Rule ID
 * @param options - React Query options
 * @returns Query result with Sales Bonus Rule data
 */
export const useSalesBonusRuleById = (
  id: number,
  options?: Omit<
    UseQueryOptions<salesBonusRulesService.SalesBonusRule>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salesBonusRulesQueryKeys.detail(id),
    queryFn: () => salesBonusRulesService.fetchSalesBonusRuleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Sales Bonus Rule with automatic toast notifications
 * @returns Mutation object for creating Sales Bonus Rule
 */
export const useCreateSalesBonusRule = () => {
  return useApiMutation({
    mutationFn: salesBonusRulesService.createSalesBonusRule,
    invalidateQueries: ['sales-bonus-rules'],
    loadingMessage: 'Creating sales bonus rule...',
  });
};

/**
 * Hook to update Sales Bonus Rule with automatic toast notifications
 * @returns Mutation object for updating Sales Bonus Rule
 */
export const useUpdateSalesBonusRule = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: salesBonusRulesService.UpdateSalesBonusRulePayload;
    }) => salesBonusRulesService.updateSalesBonusRule(id, data),
    invalidateQueries: ['sales-bonus-rules'],
    loadingMessage: 'Updating sales bonus rule...',
  });
};

/**
 * Hook to delete Sales Bonus Rule with automatic toast notifications
 * @returns Mutation object for deleting Sales Bonus Rule
 */
export const useDeleteSalesBonusRule = () => {
  return useApiMutation({
    mutationFn: salesBonusRulesService.deleteSalesBonusRule,
    invalidateQueries: ['sales-bonus-rules'],
    loadingMessage: 'Deleting sales bonus rule...',
  });
};
