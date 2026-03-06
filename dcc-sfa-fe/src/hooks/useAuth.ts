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
 * Hook for forgot password (send reset link/OTP)
 */
export const useForgotPassword = (options?: {
  onSuccess?: (data: any, variables: string) => void;
  onError?: (error: any, variables: string) => void;
}) => {
  return useApiMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    loadingMessage: 'Sending reset link...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook for reset password with OTP
 */
export const useResetPassword = (options?: {
  onSuccess?: (
    data: any,
    variables: { resetToken: string; newPassword: string }
  ) => void;
  onError?: (
    error: any,
    variables: { resetToken: string; newPassword: string }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: { resetToken: string; newPassword: string }) =>
      authService.resetPassword(payload),
    loadingMessage: 'Resetting password...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useVerifyResetOtp = (options?: {
  onSuccess?: (data: any, variables: { email: string; otp: string }) => void;
  onError?: (error: any, variables: { email: string; otp: string }) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      authService.verifyResetOtp(payload),
    loadingMessage: 'Verifying code...',
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
