import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  workflowService,
  type WorkflowActionPayload,
} from '../services/workflow';

/**
 * Hook to get workflow steps for a return request
 * @param requestId - The ID of the return request
 * @returns React Query result with workflow steps
 */
export const useWorkflowSteps = (requestId: number) => {
  return useQuery({
    queryKey: ['workflow-steps', requestId],
    queryFn: () => workflowService.getWorkflowSteps(requestId),
    enabled: !!requestId,
  });
};

/**
 * Hook to get workflow templates
 * @returns React Query result with workflow templates
 */
export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => workflowService.getWorkflowTemplates(),
  });
};

/**
 * Hook to execute workflow action
 * @returns React Query mutation for executing workflow actions
 */
export const useExecuteWorkflowAction = () => {
  return useApiMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: number;
      payload: WorkflowActionPayload;
    }) => workflowService.executeWorkflowAction(requestId, payload),
    invalidateQueries: ['workflow-steps', 'return-request', 'return-requests'],
    loadingMessage: 'Executing workflow action...',
  });
};

/**
 * Hook to apply workflow template
 * @returns React Query mutation for applying workflow templates
 */
export const useApplyWorkflowTemplate = () => {
  return useApiMutation({
    mutationFn: ({
      requestId,
      templateId,
    }: {
      requestId: number;
      templateId: string;
    }) => workflowService.applyWorkflowTemplate(requestId, templateId),
    invalidateQueries: ['workflow-steps', 'return-request'],
    loadingMessage: 'Applying workflow template...',
  });
};

/**
 * Hook to execute full workflow flow
 * @returns React Query mutation for executing full workflow flow
 */
export const useExecuteFullWorkflowFlow = () => {
  return useApiMutation({
    mutationFn: ({
      requestId,
      templateId,
    }: {
      requestId: number;
      templateId?: string;
    }) => workflowService.executeFullWorkflowFlow(requestId, templateId),
    invalidateQueries: ['workflow-steps', 'return-request', 'return-requests'],
    loadingMessage: 'Executing full workflow flow...',
  });
};

/**
 * Hook to reject return request with reason
 * @returns React Query mutation for rejecting return request
 */
export const useRejectReturnRequest = () => {
  return useApiMutation({
    mutationFn: ({
      requestId,
      rejectionReason,
    }: {
      requestId: number;
      rejectionReason: string;
    }) => workflowService.rejectReturnRequest(requestId, rejectionReason),
    invalidateQueries: ['workflow-steps', 'return-request', 'return-requests'],
    loadingMessage: 'Rejecting return request...',
  });
};

/**
 * Hook to execute next workflow step
 * @returns React Query mutation for executing next workflow step
 */
export const useExecuteNextWorkflowStep = () => {
  return useApiMutation({
    mutationFn: ({ requestId }: { requestId: number }) =>
      workflowService.executeNextWorkflowStep(requestId),
    invalidateQueries: ['workflow-steps', 'return-request', 'return-requests'],
    loadingMessage: 'Executing next workflow step...',
  });
};
