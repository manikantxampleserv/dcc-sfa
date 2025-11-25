import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as customerTypeService from '../services/masters/CustomerType';

export type {
  CustomerType,
  ManageCustomerTypePayload,
  UpdateCustomerTypePayload,
  GetCustomerTypesParams,
} from '../services/masters/CustomerType';

export const customerTypeQueryKeys = {
  all: ['customer-type'] as const,
  lists: () => [...customerTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...customerTypeQueryKeys.lists(), params] as const,
  details: () => [...customerTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerTypeQueryKeys.details(), id] as const,
};

export const useCustomerTypes = (
  params?: customerTypeService.GetCustomerTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<customerTypeService.CustomerType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerTypeQueryKeys.list(params),
    queryFn: () => customerTypeService.fetchCustomerTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCustomerTypeById = (
  id: number,
  options?: Omit<
    UseQueryOptions<customerTypeService.CustomerType>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerTypeQueryKeys.detail(id),
    queryFn: () => customerTypeService.fetchCustomerTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCustomerType = () => {
  return useApiMutation({
    mutationFn: async (data: customerTypeService.ManageCustomerTypePayload) => {
      const response = await customerTypeService.createCustomerType(data);
      return response;
    },
    invalidateQueries: ['customer-type'],
    loadingMessage: 'Creating customer type...',
  });
};

export const useUpdateCustomerType = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: customerTypeService.UpdateCustomerTypePayload;
    }) => {
      const response = await customerTypeService.updateCustomerType(id, data);
      return response;
    },
    invalidateQueries: ['customer-type'],
    loadingMessage: 'Updating customer type...',
  });
};

export const useDeleteCustomerType = () => {
  return useApiMutation({
    mutationFn: customerTypeService.deleteCustomerType,
    invalidateQueries: ['customer-type'],
    loadingMessage: 'Deleting customer type...',
  });
};
