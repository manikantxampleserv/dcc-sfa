/**
 * @fileoverview Role Management Hooks with React Query and Toast Integration
 * @description Provides hooks for role CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as roleService from '../services/masters/Roles';
import type { ApiResponse } from '../types/api.types';

export type {
  Role,
  RoleDropdown,
  ManageRolePayload,
  UpdateRolePayload,
  GetRolesParams,
  RolePermission,
} from '../services/masters/Roles';

/**
 * Query keys for role-related queries
 */
export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...roleQueryKeys.lists(), params] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch roles dropdown (id and name only, no pagination)
 * @param options - React Query options
 * @returns Query result with roles dropdown data
 */
export const useRolesDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<roleService.RoleDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...roleQueryKeys.all, 'dropdown'] as const,
    queryFn: () => roleService.fetchRolesDropdown(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch roles with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with roles data
 */
export const useRoles = (
  params?: roleService.GetRolesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<roleService.Role[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: roleQueryKeys.list(params),
    queryFn: () => roleService.fetchRoles(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single role by ID
 * @param id - Role ID
 * @param options - React Query options
 * @returns Query result with role data
 */
export const useRole = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<roleService.Role>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: roleQueryKeys.detail(id),
    queryFn: () => roleService.fetchRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create a new role
 * @param options - Additional options for the mutation
 * @returns Mutation for creating roles
 */
export const useCreateRole = (options?: {
  onSuccess?: (
    data: ApiResponse<roleService.Role>,
    variables: roleService.ManageRolePayload
  ) => void;
  onError?: (error: any, variables: roleService.ManageRolePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (roleData: roleService.ManageRolePayload) =>
      roleService.createRole(roleData),
    loadingMessage: 'Creating role...',
    invalidateQueries: ['roles'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing role
 * @param options - Additional options for the mutation
 * @returns Mutation for updating roles
 */
export const useUpdateRole = (options?: {
  onSuccess?: (
    data: ApiResponse<roleService.Role>,
    variables: { id: number; roleData: roleService.UpdateRolePayload }
  ) => void;
  onError?: (
    error: any,
    variables: { id: number; roleData: roleService.UpdateRolePayload }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: ({
      id,
      roleData,
    }: {
      id: number;
      roleData: roleService.UpdateRolePayload;
    }) => roleService.updateRole(id, roleData),
    loadingMessage: 'Updating role...',
    invalidateQueries: ['roles'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to delete a role
 * @param options - Additional options for the mutation
 * @returns Mutation for deleting roles
 */
export const useDeleteRole = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    loadingMessage: 'Deleting role...',
    invalidateQueries: ['roles'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
