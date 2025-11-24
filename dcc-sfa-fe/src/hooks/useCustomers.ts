/**
 * @fileoverview Customer React Query Hooks
 * @description Custom hooks for customer data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createCustomer,
  deleteCustomer,
  fetchCustomerById,
  fetchCustomers,
  fetchCustomersDropdown,
  updateCustomer,
  type GetCustomersParams,
  type ManageCustomerPayload,
  type UpdateCustomerPayload,
  type Customer,
  type CustomerDropdown,
} from '../services/masters/Customers';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: GetCustomersParams) =>
    [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

/**
 * Hook to fetch customers with pagination and filters
 */
export const useCustomers = (
  params?: GetCustomersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Customer[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerKeys.list(params || {}),
    queryFn: () => fetchCustomers(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single customer by ID
 */
export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch customers for dropdowns (id, name, code only) with search support
 * @param params - Query parameters for search and customer_id
 * @param options - React Query options
 * @returns Query result with customers data
 */
export const useCustomersDropdown = (
  params?: { search?: string; customer_id?: number },
  options?: Omit<
    import('@tanstack/react-query').UseQueryOptions<
      import('../types/api.types').ApiResponse<CustomerDropdown[]>
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['customers', 'dropdown', params],
    queryFn: () => fetchCustomersDropdown(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create a new customer
 */
export const useCreateCustomer = (options?: {
  onSuccess?: (data: any, variables: ManageCustomerPayload) => void;
  onError?: (error: any, variables: ManageCustomerPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createCustomer,
    loadingMessage: 'Creating customer...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing customer
 */
export const useUpdateCustomer = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateCustomerPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateCustomerPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...customerData
    }: { id: number } & UpdateCustomerPayload) =>
      updateCustomer(id, customerData),
    loadingMessage: 'Updating customer...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a customer
 */
export const useDeleteCustomer = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteCustomer,
    loadingMessage: 'Deleting customer...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetCustomersParams,
  ManageCustomerPayload,
  UpdateCustomerPayload,
  Customer,
};
