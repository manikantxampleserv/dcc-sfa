/**
 * @fileoverview User Management Hooks with React Query and Toast Integration
 * @description Provides hooks for user CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as userService from '../services/masters/Users';
import type { ApiResponse } from '../types/api.types';

export type {
  User,
  ManageUserPayload,
  UpdateUserPayload,
  UpdateProfilePayload,
  GetUsersParams,
} from '../services/masters/Users';

/**
 * Query keys for user-related queries
 */
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
};

/**
 * Hook to fetch users with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with users data
 */
export const useUsers = (
  params?: userService.GetUsersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<userService.User[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => userService.fetchUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single user by ID
 * @param id - User ID
 * @param options - React Query options
 * @returns Query result with user data
 */
export const useUser = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<userService.User>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => userService.fetchUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch current user profile
 * @param options - React Query options
 * @returns Query result with user profile data
 */
export const useUserProfile = (
  options?: Omit<
    UseQueryOptions<ApiResponse<userService.User>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: () => userService.getUserProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};

/**
 * Hook to fetch current user profile for header/navigation
 * @returns Query result with user profile data optimized for header usage
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: () => userService.getUserProfile(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    select: (data) => data?.data, // Extract just the user data
  });
};

/**
 * Hook to create a new user
 * @param options - Additional options for the mutation
 * @returns Mutation for creating users
 */
export const useCreateUser = (options?: {
  onSuccess?: (
    data: ApiResponse<userService.User>,
    variables: userService.ManageUserPayload | FormData
  ) => void;
  onError?: (
    error: any,
    variables: userService.ManageUserPayload | FormData
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: (userData: userService.ManageUserPayload | FormData) =>
      userService.createUser(userData),
    loadingMessage: 'Creating user...',
    invalidateQueries: ['users'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing user
 * @param options - Additional options for the mutation
 * @returns Mutation for updating users
 */
export const useUpdateUser = (options?: {
  onSuccess?: (
    data: ApiResponse<userService.User>,
    variables: {
      id: number;
      userData: userService.UpdateUserPayload | FormData;
    }
  ) => void;
  onError?: (
    error: any,
    variables: {
      id: number;
      userData: userService.UpdateUserPayload | FormData;
    }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: number;
      userData: userService.UpdateUserPayload | FormData;
    }) => userService.updateUser(id, userData),
    loadingMessage: 'Updating user...',
    invalidateQueries: ['users'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to delete a user
 * @param options - Additional options for the mutation
 * @returns Mutation for deleting users
 */
export const useDeleteUser = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    loadingMessage: 'Deleting user...',
    invalidateQueries: ['users'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update user profile
 * @param options - Additional options for the mutation
 * @returns Mutation for updating user profile
 */
export const useUpdateUserProfile = (options?: {
  onSuccess?: (
    data: ApiResponse<userService.User>,
    variables: userService.UpdateProfilePayload
  ) => void;
  onError?: (error: any, variables: userService.UpdateProfilePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (profileData: userService.UpdateProfilePayload) =>
      userService.updateUserProfile(profileData),
    loadingMessage: 'Updating profile...',
    invalidateQueries: ['users'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
