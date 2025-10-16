/**
 * @fileoverview Invoice Items React Query Hooks
 * @description Custom hooks for invoice items data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvoiceItem,
  deleteInvoiceItem,
  getInvoiceItems,
  updateInvoiceItem,
  bulkUpdateInvoiceItems,
  type InvoiceItem,
  type CreateInvoiceItemPayload,
  type UpdateInvoiceItemPayload,
  type BulkUpdateInvoiceItemsPayload,
} from '../services/masters/InvoiceItems';
import { useApiMutation } from './useApiMutation';

export const invoiceItemKeys = {
  all: ['invoice-items'] as const,
  lists: () => [...invoiceItemKeys.all, 'list'] as const,
  list: (invoiceId: number) => [...invoiceItemKeys.lists(), invoiceId] as const,
};

/**
 * Hook to fetch invoice items for an invoice
 */
export const useInvoiceItems = (
  invoiceId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: invoiceItemKeys.list(invoiceId),
    queryFn: () => getInvoiceItems(invoiceId),
    enabled: options?.enabled !== undefined ? options.enabled : !!invoiceId,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: 1, // Only retry once on failure
  });
};

/**
 * Hook to create a new invoice item
 */
export const useCreateInvoiceItem = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number } & CreateInvoiceItemPayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number } & CreateInvoiceItemPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      ...data
    }: { invoiceId: number } & CreateInvoiceItemPayload) =>
      createInvoiceItem(invoiceId, data),
    loadingMessage: 'Creating invoice item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceItemKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an invoice item
 */
export const useUpdateInvoiceItem = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number; itemId: number } & UpdateInvoiceItemPayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number; itemId: number } & UpdateInvoiceItemPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      itemId,
      ...data
    }: { invoiceId: number; itemId: number } & UpdateInvoiceItemPayload) =>
      updateInvoiceItem(invoiceId, itemId, data),
    loadingMessage: 'Updating invoice item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceItemKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete an invoice item
 */
export const useDeleteInvoiceItem = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number; itemId: number }
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number; itemId: number }
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      itemId,
    }: {
      invoiceId: number;
      itemId: number;
    }) => deleteInvoiceItem(invoiceId, itemId),
    loadingMessage: 'Deleting invoice item...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceItemKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to bulk update invoice items for an invoice
 */
export const useBulkUpdateInvoiceItems = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number } & BulkUpdateInvoiceItemsPayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number } & BulkUpdateInvoiceItemsPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      ...data
    }: { invoiceId: number } & BulkUpdateInvoiceItemsPayload) =>
      bulkUpdateInvoiceItems(invoiceId, data),
    loadingMessage: 'Updating invoice items...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceItemKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  InvoiceItem,
  CreateInvoiceItemPayload,
  UpdateInvoiceItemPayload,
  BulkUpdateInvoiceItemsPayload,
};
