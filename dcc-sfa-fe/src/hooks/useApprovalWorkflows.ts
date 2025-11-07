/**
 * @fileoverview Approval Workflows Management Hooks with React Query and Toast Integration
 * @description Provides hooks for approval workflow operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import {
  useQuery,
  type UseQueryOptions,
  useQueryClient,
} from '@tanstack/react-query';
import {
  approvalWorkflowsService,
  type ApprovalWorkflowFilters,
  type ApprovalWorkflow,
} from '../services/approvalWorkflows';
import { useApiMutation } from './useApiMutation';
import { orderKeys } from './useOrders';

export type {
  ApprovalWorkflow,
  ApprovalWorkflowFilters,
} from '../services/approvalWorkflows';

/**
 * Query keys for approval workflow-related queries
 */
export const approvalWorkflowQueryKeys = {
  all: ['approval-workflows'] as const,
  lists: () => [...approvalWorkflowQueryKeys.all, 'list'] as const,
  list: (params?: ApprovalWorkflowFilters) =>
    [...approvalWorkflowQueryKeys.lists(), params] as const,
  details: () => [...approvalWorkflowQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...approvalWorkflowQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch approval workflows with pagination and filters
 * @param filters - Optional filters for workflows
 * @param options - React Query options
 * @returns Query result with approval workflows data
 */
export const useApprovalWorkflows = (
  filters?: ApprovalWorkflowFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.list(filters),
    queryFn: () => approvalWorkflowsService.getApprovalWorkflows(filters),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch approval workflow by ID
 * @param id - Approval Workflow ID
 * @param options - React Query options
 * @returns Query result with approval workflow data
 */
export const useApprovalWorkflow = (
  id: number,
  options?: Omit<UseQueryOptions<ApprovalWorkflow>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: approvalWorkflowQueryKeys.detail(id),
    queryFn: () => approvalWorkflowsService.getApprovalWorkflowById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to approve a workflow step with automatic toast notifications
 * @returns Mutation object for approving workflow step
 */
export const useApproveWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      stepId,
      comments,
    }: {
      id: number;
      stepId?: number;
      comments?: string;
    }) => approvalWorkflowsService.approveWorkflowStep(id, stepId, comments),
    invalidateQueries: ['approval-workflows', 'orders'],
    loadingMessage: 'Approving workflow step...',
    onSuccess: () => {
      // Invalidate orders to reflect updated approval status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

/**
 * Hook to reject a workflow step with automatic toast notifications
 * @returns Mutation object for rejecting workflow step
 */
export const useRejectWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      stepId,
      rejectionReason,
    }: {
      id: number;
      stepId?: number;
      rejectionReason: string;
    }) =>
      approvalWorkflowsService.rejectWorkflowStep(id, rejectionReason, stepId),
    invalidateQueries: ['approval-workflows', 'orders'],
    loadingMessage: 'Rejecting workflow step...',
    onSuccess: () => {
      // Invalidate orders to reflect updated approval status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};
