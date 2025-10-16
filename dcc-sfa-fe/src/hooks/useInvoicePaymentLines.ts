/**
 * @fileoverview Invoice Payment Lines React Query Hooks
 * @description Custom hooks for invoice payment lines data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvoicePaymentLine,
  deleteInvoicePaymentLine,
  getInvoicePaymentLines,
  updateInvoicePaymentLine,
  bulkUpdateInvoicePaymentLines,
  type PaymentLine,
  type CreatePaymentLinePayload,
  type UpdatePaymentLinePayload,
  type BulkUpdatePaymentLinesPayload,
} from '../services/masters/InvoicePaymentLines';
import { useApiMutation } from './useApiMutation';

export const invoicePaymentLineKeys = {
  all: ['invoice-payment-lines'] as const,
  lists: () => [...invoicePaymentLineKeys.all, 'list'] as const,
  list: (invoiceId: number) =>
    [...invoicePaymentLineKeys.lists(), invoiceId] as const,
};

/**
 * Hook to fetch payment lines for an invoice
 */
export const useInvoicePaymentLines = (
  invoiceId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: invoicePaymentLineKeys.list(invoiceId),
    queryFn: () => getInvoicePaymentLines(invoiceId),
    enabled: options?.enabled !== undefined ? options.enabled : !!invoiceId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    retry: 1,
  });
};

/**
 * Hook to create a new payment line for an invoice
 */
export const useCreateInvoicePaymentLine = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number } & CreatePaymentLinePayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number } & CreatePaymentLinePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      ...data
    }: { invoiceId: number } & CreatePaymentLinePayload) =>
      createInvoicePaymentLine(invoiceId, data),
    loadingMessage: 'Creating payment line...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentLineKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update a payment line
 */
export const useUpdateInvoicePaymentLine = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number; lineId: number } & UpdatePaymentLinePayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number; lineId: number } & UpdatePaymentLinePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      lineId,
      ...data
    }: { invoiceId: number; lineId: number } & UpdatePaymentLinePayload) =>
      updateInvoicePaymentLine(invoiceId, lineId, data),
    loadingMessage: 'Updating payment line...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentLineKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a payment line
 */
export const useDeleteInvoicePaymentLine = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number; lineId: number }
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number; lineId: number }
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      lineId,
    }: {
      invoiceId: number;
      lineId: number;
    }) => deleteInvoicePaymentLine(invoiceId, lineId),
    loadingMessage: 'Deleting payment line...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentLineKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to bulk update payment lines for an invoice
 */
export const useBulkUpdateInvoicePaymentLines = (options?: {
  onSuccess?: (
    data: any,
    variables: { invoiceId: number } & BulkUpdatePaymentLinesPayload
  ) => void;
  onError?: (
    error: any,
    variables: { invoiceId: number } & BulkUpdatePaymentLinesPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      invoiceId,
      ...data
    }: { invoiceId: number } & BulkUpdatePaymentLinesPayload) =>
      bulkUpdateInvoicePaymentLines(invoiceId, data),
    loadingMessage: 'Updating payment lines...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentLineKeys.list(variables.invoiceId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  PaymentLine,
  CreatePaymentLinePayload,
  UpdatePaymentLinePayload,
  BulkUpdatePaymentLinesPayload,
};
