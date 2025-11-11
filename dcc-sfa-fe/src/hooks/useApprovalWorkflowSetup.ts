/**
 * @fileoverview Approval Workflow Setup Management Hooks with React Query and Toast Integration
 * @description Provides hooks for approval workflow setup operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  approvalWorkflowSetupService,
  type ApprovalWorkflowSetupFilters,
  type ApprovalWorkflowSetup,
  type CreateApprovalWorkflowSetupPayload,
} from '../services/approvalWorkflowSetup';

export type {
  ApprovalWorkflowSetup,
  ApprovalWorkflowSetupGrouped,
  ApprovalWorkflowSetupFilters,
  CreateApprovalWorkflowSetupPayload,
} from '../services/approvalWorkflowSetup';

/**
 * Query keys for approval workflow setup-related queries
 */
export const approvalWorkflowSetupQueryKeys = {
  all: ['approval-workflow-setup'] as const,
  lists: () => [...approvalWorkflowSetupQueryKeys.all, 'list'] as const,
  list: (params?: ApprovalWorkflowSetupFilters) =>
    [...approvalWorkflowSetupQueryKeys.lists(), params] as const,
  details: () => [...approvalWorkflowSetupQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...approvalWorkflowSetupQueryKeys.details(), id] as const,
  byRequest: (requestType: string, zoneId?: number, depotId?: number) =>
    [
      ...approvalWorkflowSetupQueryKeys.all,
      'by-request',
      requestType,
      zoneId,
      depotId,
    ] as const,
  zones: (requestType: string) =>
    [...approvalWorkflowSetupQueryKeys.all, 'zones', requestType] as const,
  depots: (requestType: string) =>
    [...approvalWorkflowSetupQueryKeys.all, 'depots', requestType] as const,
};

/**
 * Hook to fetch approval workflow setups with pagination and filters
 * @param filters - Optional filters for workflows
 * @param options - React Query options
 * @returns Query result with approval workflow setups data
 */
export const useApprovalWorkflowSetups = (
  filters?: ApprovalWorkflowSetupFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowSetupQueryKeys.list(filters),
    queryFn: () =>
      approvalWorkflowSetupService.getApprovalWorkflowSetups(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch approval workflow setup by ID
 * @param id - Approval Workflow Setup ID
 * @param options - React Query options
 * @returns Query result with approval workflow setup data
 */
export const useApprovalWorkflowSetup = (
  id: number,
  options?: Omit<UseQueryOptions<ApprovalWorkflowSetup>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowSetupQueryKeys.detail(id),
    queryFn: () =>
      approvalWorkflowSetupService.getApprovalWorkflowSetupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch approval workflow setups by request type
 * @param requestType - The request type
 * @param zoneId - Optional zone ID
 * @param depotId - Optional depot ID
 * @param options - React Query options
 * @returns Query result with approval workflow setups data
 */
export const useApprovalWorkflowSetupsByRequest = (
  requestType: string,
  zoneId?: number,
  depotId?: number,
  options?: Omit<
    UseQueryOptions<ApprovalWorkflowSetup[]>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: approvalWorkflowSetupQueryKeys.byRequest(
      requestType,
      zoneId,
      depotId
    ),
    queryFn: () =>
      approvalWorkflowSetupService.getApprovalWorkflowSetupsByRequest(
        requestType,
        zoneId,
        depotId
      ),
    enabled: !!requestType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch zones with workflows for a request type
 * @param requestType - The request type
 * @param options - React Query options
 * @returns Query result with zones data
 */
export const useZonesWithWorkflows = (
  requestType: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowSetupQueryKeys.zones(requestType),
    queryFn: () =>
      approvalWorkflowSetupService.getZonesWithWorkflows(requestType),
    enabled: !!requestType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch depots with workflows for a request type
 * @param requestType - The request type
 * @param options - React Query options
 * @returns Query result with depots data
 */
export const useDepotsWithWorkflows = (
  requestType: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowSetupQueryKeys.depots(requestType),
    queryFn: () =>
      approvalWorkflowSetupService.getDepotsWithWorkflows(requestType),
    enabled: !!requestType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create approval workflow setup(s) with automatic toast notifications
 * @returns Mutation object for creating workflow setup
 */
export const useCreateApprovalWorkflowSetup = () => {
  return useApiMutation({
    mutationFn: (
      data:
        | CreateApprovalWorkflowSetupPayload
        | CreateApprovalWorkflowSetupPayload[]
    ) => approvalWorkflowSetupService.createApprovalWorkflowSetup(data),
    invalidateQueries: ['approval-workflow-setup'],
    loadingMessage: 'Creating approval workflow setup...',
  });
};

/**
 * Hook to update approval workflow setup with automatic toast notifications
 * @returns Mutation object for updating workflow setup
 */
export const useUpdateApprovalWorkflowSetup = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateApprovalWorkflowSetupPayload>;
    }) => approvalWorkflowSetupService.updateApprovalWorkflowSetup(id, data),
    invalidateQueries: ['approval-workflow-setup'],
    loadingMessage: 'Updating approval workflow setup...',
  });
};

/**
 * Hook to delete approval workflow setup by request type with automatic toast notifications
 * @returns Mutation object for deleting workflow setup
 */
export const useDeleteApprovalWorkflowSetupByRequestType = () => {
  return useApiMutation({
    mutationFn: (requestType: string) =>
      approvalWorkflowSetupService.deleteApprovalWorkflowSetupByRequestType(
        requestType
      ),
    invalidateQueries: ['approval-workflow-setup'],
    loadingMessage: 'Deleting approval workflow setup...',
  });
};

/**
 * Hook to delete multiple approval workflow setups with automatic toast notifications
 * @returns Mutation object for deleting workflow setups
 */
export const useDeleteApprovalWorkflowSetups = () => {
  return useApiMutation({
    mutationFn: (ids: number[]) =>
      approvalWorkflowSetupService.deleteApprovalWorkflowSetups(ids),
    invalidateQueries: ['approval-workflow-setup'],
    loadingMessage: 'Deleting approval workflow setups...',
  });
};
