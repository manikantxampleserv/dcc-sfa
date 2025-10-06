/**
 * @fileoverview Customer React Query Hooks
 * @description Custom hooks for customer data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCustomer,
  deleteCustomer,
  fetchCustomerById,
  fetchCustomers,
  updateCustomer,
  type GetCustomersParams,
  type ManageCustomerPayload,
  type UpdateCustomerPayload,
  type Customer,
} from '../services/masters/Customers';
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
export const useCustomers = (params?: GetCustomersParams) => {
  return useQuery({
    queryKey: customerKeys.list(params || {}),
    queryFn: () => fetchCustomers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // Invalidate and refetch customers list
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
      // Invalidate and refetch customers list and specific customer
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
      // Invalidate and refetch customers list
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
