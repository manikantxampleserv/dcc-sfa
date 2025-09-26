/**
 * @fileoverview Authentication Hooks with React Query and Toast Integration
 * @description Provides hooks for authentication operations with automatic toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useApiMutation } from './useApiMutation';
import authService, { type LoginRequest } from '../services/auth/authService';

/**
 * Hook for user login
 * @param options - Additional options for the mutation
 * @returns Mutation for login operation
 */
export const useLogin = (options?: {
  onSuccess?: (data: any, variables: LoginRequest) => void;
  onError?: (error: any, variables: LoginRequest) => void;
}) => {
  return useApiMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    loadingMessage: 'Signing in...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook for user logout
 * @param options - Additional options for the mutation
 * @returns Mutation for logout operation
 */
export const useLogout = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  return useApiMutation<void, any, void>({
    mutationFn: () => authService.logout(),
    loadingMessage: 'Signing out...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
