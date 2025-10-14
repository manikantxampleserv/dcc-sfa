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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
