/**
 * @fileoverview Permission Management Hooks with React Query
 * @description Provides hooks for permission operations with automatic caching
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as permissionService from '../services/masters/Permissions';
import type { ApiResponse } from '../types/api.types';

export type {
  Permission,
  PermissionModule,
  GetPermissionsParams,
} from '../services/masters/Permissions';

/**
 * Query keys for permission-related queries
 */
export const permissionQueryKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...permissionQueryKeys.lists(), params] as const,
  details: () => [...permissionQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...permissionQueryKeys.details(), id] as const,
  modules: () => [...permissionQueryKeys.all, 'modules'] as const,
};

/**
 * Hook to fetch permissions with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with permissions data
 */
export const usePermissions = (
  params?: permissionService.GetPermissionsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<permissionService.Permission[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: permissionQueryKeys.list(params),
    queryFn: () => permissionService.fetchPermissions(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change often
    ...options,
  });
};

/**
 * Hook to fetch permissions grouped by module
 * @param options - React Query options
 * @returns Query result with permissions grouped by module
 */
export const usePermissionsByModule = (
  options?: Omit<
    UseQueryOptions<ApiResponse<permissionService.PermissionModule[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: permissionQueryKeys.modules(),
    queryFn: () => permissionService.fetchPermissionsByModule(),
    staleTime: 15 * 60 * 1000, // 15 minutes - module structure rarely changes
    ...options,
  });
};

/**
 * Hook to fetch a single permission by ID
 * @param id - Permission ID
 * @param options - React Query options
 * @returns Query result with permission data
 */
export const usePermission = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<permissionService.Permission>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: permissionQueryKeys.detail(id),
    queryFn: () => permissionService.fetchPermissionById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to create a new permission
 * @param options - Additional options for the mutation
 * @returns Mutation for creating permissions
 */
export const useCreatePermission = (options?: {
  onSuccess?: (
    data: ApiResponse<permissionService.Permission>,
    variables: Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>
  ) => void;
  onError?: (
    error: any,
    variables: Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: (permissionData: Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>) =>
      permissionService.createPermission(permissionData),
    loadingMessage: 'Creating permission...',
    invalidateQueries: ['permissions'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing permission
 * @param options - Additional options for the mutation
 * @returns Mutation for updating permissions
 */
export const useUpdatePermission = (options?: {
  onSuccess?: (
    data: ApiResponse<permissionService.Permission>,
    variables: { id: number; permissionData: Partial<Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>> }
  ) => void;
  onError?: (
    error: any,
    variables: { id: number; permissionData: Partial<Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>> }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: ({
      id,
      permissionData,
    }: {
      id: number;
      permissionData: Partial<Omit<permissionService.Permission, 'id' | 'created_at' | 'updated_at'>>;
    }) => permissionService.updatePermission(id, permissionData),
    loadingMessage: 'Updating permission...',
    invalidateQueries: ['permissions'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to delete a permission
 * @param options - Additional options for the mutation
 * @returns Mutation for deleting permissions
 */
export const useDeletePermission = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => permissionService.deletePermission(id),
    loadingMessage: 'Deleting permission...',
    invalidateQueries: ['permissions'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
