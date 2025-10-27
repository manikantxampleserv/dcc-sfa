/**
 * @fileoverview Payment Collection Management Hooks with React Query and Toast Integration
 * @description Provides hooks for payment collection CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as paymentService from '../services/masters/Payments';
import type { ApiResponse } from '../types/api.types';

export type {
  Payment,
  ManagePaymentPayload,
  UpdatePaymentPayload,
  GetPaymentsParams,
  PaymentStats,
  PaymentLine,
  PaymentRefund,
  RefundLine,
  CreatePaymentLinePayload,
  UpdatePaymentLinePayload,
  CreatePaymentRefundPayload,
  UpdatePaymentRefundPayload,
} from '../services/masters/Payments';

/**
 * Query keys for payment-related queries
 */
export const paymentQueryKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...paymentQueryKeys.lists(), params] as const,
  details: () => [...paymentQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...paymentQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch payments with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with payments data
 */
export const usePayments = (
  params?: paymentService.GetPaymentsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<paymentService.Payment[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: paymentQueryKeys.list(params),
    queryFn: () => paymentService.fetchPayments(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch payment by ID
 * @param id - Payment ID
 * @param options - React Query options
 * @returns Query result with payment data
 */
export const usePayment = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<paymentService.Payment>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: () => paymentService.fetchPaymentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create payment with automatic toast notifications
 * @returns Mutation object for creating payment
 */
export const useCreatePayment = () => {
  return useApiMutation({
    mutationFn: paymentService.createPayment,
    invalidateQueries: ['payments'],
    loadingMessage: 'Creating payment...',
  });
};

/**
 * Hook to update payment with automatic toast notifications
 * @returns Mutation object for updating payment
 */
export const useUpdatePayment = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & paymentService.UpdatePaymentPayload) =>
      paymentService.updatePayment(id, data),
    invalidateQueries: ['payments'],
    loadingMessage: 'Updating payment...',
  });
};

/**
 * Hook to delete payment with automatic toast notifications
 * @returns Mutation object for deleting payment
 */
export const useDeletePayment = () => {
  return useApiMutation({
    mutationFn: paymentService.deletePayment,
    invalidateQueries: ['payments'],
    loadingMessage: 'Deleting payment...',
  });
};

// Payment Lines Hooks
/**
 * Hook to fetch payment lines
 * @param paymentId - Payment ID
 * @param options - React Query options
 * @returns Query result with payment lines data
 */
export const usePaymentLines = (
  paymentId: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<paymentService.PaymentLine[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...paymentQueryKeys.detail(paymentId), 'lines'],
    queryFn: () => paymentService.fetchPaymentLines(paymentId),
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create payment line with automatic toast notifications
 * @returns Mutation object for creating payment line
 */
export const useCreatePaymentLine = () => {
  return useApiMutation({
    mutationFn: ({
      paymentId,
      ...data
    }: { paymentId: number } & paymentService.CreatePaymentLinePayload) =>
      paymentService.createPaymentLine(paymentId, data),
    invalidateQueries: ['payments'],
    loadingMessage: 'Creating payment line...',
  });
};

/**
 * Hook to delete payment line with automatic toast notifications
 * @returns Mutation object for deleting payment line
 */
export const useDeletePaymentLine = () => {
  return useApiMutation({
    mutationFn: ({
      paymentId,
      lineId,
    }: {
      paymentId: number;
      lineId: number;
    }) => paymentService.deletePaymentLine(paymentId, lineId),
    invalidateQueries: ['payments'],
    loadingMessage: 'Deleting payment line...',
  });
};

// Payment Refunds Hooks
/**
 * Hook to fetch payment refunds
 * @param paymentId - Payment ID
 * @param options - React Query options
 * @returns Query result with payment refunds data
 */
export const usePaymentRefunds = (
  paymentId: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<paymentService.PaymentRefund[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...paymentQueryKeys.detail(paymentId), 'refunds'],
    queryFn: () => paymentService.fetchPaymentRefunds(paymentId),
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create payment refund with automatic toast notifications
 * @returns Mutation object for creating payment refund
 */
export const useCreatePaymentRefund = () => {
  return useApiMutation({
    mutationFn: ({
      paymentId,
      ...data
    }: { paymentId: number } & paymentService.CreatePaymentRefundPayload) =>
      paymentService.createPaymentRefund(paymentId, data),
    invalidateQueries: ['payments'],
    loadingMessage: 'Creating payment refund...',
  });
};

/**
 * Hook to update payment refund with automatic toast notifications
 * @returns Mutation object for updating payment refund
 */
export const useUpdatePaymentRefund = () => {
  return useApiMutation({
    mutationFn: ({
      paymentId,
      refundId,
      ...data
    }: {
      paymentId: number;
      refundId: number;
    } & paymentService.UpdatePaymentRefundPayload) =>
      paymentService.updatePaymentRefund(paymentId, refundId, data),
    invalidateQueries: ['payments'],
    loadingMessage: 'Updating payment refund...',
  });
};

/**
 * Hook to delete payment refund with automatic toast notifications
 * @returns Mutation object for deleting payment refund
 */
export const useDeletePaymentRefund = () => {
  return useApiMutation({
    mutationFn: ({
      paymentId,
      refundId,
    }: {
      paymentId: number;
      refundId: number;
    }) => paymentService.deletePaymentRefund(paymentId, refundId),
    invalidateQueries: ['payments'],
    loadingMessage: 'Deleting payment refund...',
  });
};
