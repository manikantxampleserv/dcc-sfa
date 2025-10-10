/**
 * @fileoverview Custom React Query Mutation Hook with Toast Integration
 * @description Provides standardized mutation handling with automatic toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toastService from '../utils/toast';

/**
 * Configuration for API mutation with toast messages
 */
interface ApiMutationConfig<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  loadingMessage: string;
  invalidateQueries?: string[] | string[][];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
}

/**
 * Custom hook for API mutations with automatic toast notifications
 * @param config - Mutation configuration with toast messages
 * @returns React Query mutation with toast integration
 */
export const useApiMutation = <TData = any, TError = any, TVariables = any>(
  config: ApiMutationConfig<TData, TError, TVariables>
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: config.mutationFn,
    onMutate: () => {
      const toastId = toastService.loading(config.loadingMessage);
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.toastId) {
        const successMessage =
          (data as any)?.message || 'Operation completed successfully!';
        toastService.update(context.toastId, successMessage, 'success');
      }

      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
          });
        });
      }

      config.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      if (context?.toastId) {
        let errorMessage = 'Operation failed';

        // Extract error message from axios error response
        if ((error as any)?.response?.data) {
          const responseData = (error as any).response.data;
          errorMessage =
            responseData.error || responseData.message || errorMessage;
        } else if ((error as any)?.message) {
          errorMessage = (error as any).message;
        }

        toastService.update(context.toastId, errorMessage, 'error');
      }
      config.onError?.(error as TError, variables);
    },
  });

  return mutation;
};
