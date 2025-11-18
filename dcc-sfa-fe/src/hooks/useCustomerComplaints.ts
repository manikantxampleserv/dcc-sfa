/**
 * @fileoverview Customer Complaints Management Hooks with React Query and Toast Integration
 * @description Provides hooks for customer complaints CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as customerComplaintService from '../services/masters/CustomerComplaints';
import type { ApiResponse } from '../types/api.types';

export type {
  CustomerComplaint,
  GetCustomerComplaintsParams,
  ManageCustomerComplaintPayload,
  UpdateCustomerComplaintPayload,
} from '../services/masters/CustomerComplaints';

/**
 * Query keys for customer complaint-related queries
 */
export const customerComplaintQueryKeys = {
  all: ['customer-complaints'] as const,
  lists: () => [...customerComplaintQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...customerComplaintQueryKeys.lists(), params] as const,
  details: () => [...customerComplaintQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...customerComplaintQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch customer complaints with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with customer complaints data
 */
export const useCustomerComplaints = (
  params?: customerComplaintService.GetCustomerComplaintsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<customerComplaintService.CustomerComplaint[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerComplaintQueryKeys.list(params),
    queryFn: () => customerComplaintService.fetchCustomerComplaints(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch customer complaint by ID
 * @param id - Customer Complaint ID
 * @param options - React Query options
 * @returns Query result with customer complaint data
 */
export const useCustomerComplaint = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<customerComplaintService.CustomerComplaint>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerComplaintQueryKeys.detail(id),
    queryFn: () => customerComplaintService.fetchCustomerComplaintById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create customer complaint with automatic toast notifications
 * @returns Mutation object for creating customer complaint
 */
export const useCreateCustomerComplaint = () => {
  return useApiMutation({
    mutationFn: customerComplaintService.createCustomerComplaint,
    invalidateQueries: ['customer-complaints'],
    loadingMessage: 'Creating customer complaint...',
  });
};

/**
 * Hook to update customer complaint with automatic toast notifications
 * @returns Mutation object for updating customer complaint
 */
export const useUpdateCustomerComplaint = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
    } & customerComplaintService.UpdateCustomerComplaintPayload) =>
      customerComplaintService.updateCustomerComplaint(id, data),
    invalidateQueries: ['customer-complaints'],
    loadingMessage: 'Updating customer complaint...',
  });
};

/**
 * Hook to delete customer complaint with automatic toast notifications
 * @returns Mutation object for deleting customer complaint
 */
export const useDeleteCustomerComplaint = () => {
  return useApiMutation({
    mutationFn: customerComplaintService.deleteCustomerComplaint,
    invalidateQueries: ['customer-complaints'],
    loadingMessage: 'Deleting customer complaint...',
  });
};
