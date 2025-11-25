import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as customerCategoryService from '../services/masters/CustomerCategory';

export type {
  CustomerCategory,
  CustomerCategoryCondition,
  ManageCustomerCategoryPayload,
  UpdateCustomerCategoryPayload,
  GetCustomerCategoriesParams,
} from '../services/masters/CustomerCategory';

export const customerCategoryQueryKeys = {
  all: ['customer-category'] as const,
  lists: () => [...customerCategoryQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...customerCategoryQueryKeys.lists(), params] as const,
  details: () => [...customerCategoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...customerCategoryQueryKeys.details(), id] as const,
};

export const useCustomerCategories = (
  params?: customerCategoryService.GetCustomerCategoriesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<customerCategoryService.CustomerCategory[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerCategoryQueryKeys.list(params),
    queryFn: () => customerCategoryService.fetchCustomerCategories(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCustomerCategoryById = (
  id: number,
  options?: Omit<
    UseQueryOptions<customerCategoryService.CustomerCategory>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerCategoryQueryKeys.detail(id),
    queryFn: () => customerCategoryService.fetchCustomerCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCustomerCategory = () => {
  return useApiMutation({
    mutationFn: customerCategoryService.createCustomerCategory,
    invalidateQueries: ['customer-category'],
    loadingMessage: 'Creating customer category...',
  });
};

export const useUpdateCustomerCategory = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: customerCategoryService.UpdateCustomerCategoryPayload;
    }) => customerCategoryService.updateCustomerCategory(id, data),
    invalidateQueries: ['customer-category'],
    loadingMessage: 'Updating customer category...',
  });
};

export const useDeleteCustomerCategory = () => {
  return useApiMutation({
    mutationFn: customerCategoryService.deleteCustomerCategory,
    invalidateQueries: ['customer-category'],
    loadingMessage: 'Deleting customer category...',
  });
};

