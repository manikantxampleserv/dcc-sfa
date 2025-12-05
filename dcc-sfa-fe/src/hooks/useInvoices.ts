/**
 * @fileoverview Invoices React Query Hooks
 * @description Custom hooks for invoices data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createInvoice,
  deleteInvoice,
  fetchInvoiceById,
  fetchInvoices,
  updateInvoice,
  type GetInvoicesParams,
  type ManageInvoicePayload,
  type UpdateInvoicePayload,
  type Invoice,
} from '../services/masters/Invoices';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from 'types/api.types';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params: GetInvoicesParams) =>
    [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
};

/**
 * Hook to fetch invoices with pagination and filters
 */
export const useInvoices = (
  params?: GetInvoicesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Invoice[]>>,
    'queryKey' | 'queryFn' | 'staleTime'
  >
) => {
  return useQuery({
    queryKey: invoiceKeys.list(params || {}),
    queryFn: () => fetchInvoices(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single invoice by ID
 */
export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoiceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new invoice
 */
export const useCreateInvoice = (options?: {
  onSuccess?: (data: any, variables: ManageInvoicePayload) => void;
  onError?: (error: any, variables: ManageInvoicePayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createInvoice,
    loadingMessage: 'Creating invoice...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing invoice
 */
export const useUpdateInvoice = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateInvoicePayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateInvoicePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...invoiceData
    }: { id: number } & UpdateInvoicePayload) => updateInvoice(id, invoiceData),
    loadingMessage: 'Updating invoice...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete an invoice
 */
export const useDeleteInvoice = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteInvoice,
    loadingMessage: 'Deleting invoice...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetInvoicesParams,
  ManageInvoicePayload,
  UpdateInvoicePayload,
  Invoice,
};
