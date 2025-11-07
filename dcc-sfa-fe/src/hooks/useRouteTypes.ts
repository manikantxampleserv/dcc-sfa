/**
 * @fileoverview Route Types Management Hooks with React Query and Toast Integration
 * @description Provides hooks for route types CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as routeTypeService from '../services/masters/RouteTypes';

export type {
  RouteType,
  CreateRouteTypePayload,
  UpdateRouteTypePayload,
  RouteTypeQueryParams,
} from '../services/masters/RouteTypes';

/**
 * Query keys for route type-related queries
 */
export const routeTypeKeys = {
  all: ['routeTypes'] as const,
  lists: () => [...routeTypeKeys.all, 'list'] as const,
  list: (params?: any) => [...routeTypeKeys.lists(), params] as const,
  details: () => [...routeTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...routeTypeKeys.details(), id] as const,
};

/**
 * Hook to fetch route types with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with route types data
 */
export const useRouteTypes = (
  params?: routeTypeService.RouteTypeQueryParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: routeTypeKeys.list(params),
    queryFn: () => routeTypeService.fetchRouteTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch route type by ID
 * @param id - Route Type ID
 * @param options - React Query options
 * @returns Query result with route type data
 */
export const useRouteType = (
  id: number,
  options?: Omit<
    UseQueryOptions<routeTypeService.RouteType>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: routeTypeKeys.detail(id),
    queryFn: () => routeTypeService.fetchRouteTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create route type with automatic toast notifications
 * @returns Mutation object for creating route type
 */
export const useCreateRouteType = () => {
  return useApiMutation({
    mutationFn: (data: routeTypeService.CreateRouteTypePayload) =>
      routeTypeService.createRouteType(data),
    invalidateQueries: ['routeTypes'],
    loadingMessage: 'Creating route type...',
  });
};

/**
 * Hook to update route type with automatic toast notifications
 * @returns Mutation object for updating route type
 */
export const useUpdateRouteType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: routeTypeService.UpdateRouteTypePayload;
    }) => routeTypeService.updateRouteType(id, data),
    invalidateQueries: ['routeTypes'],
    loadingMessage: 'Updating route type...',
  });
};

/**
 * Hook to delete route type with automatic toast notifications
 * @returns Mutation object for deleting route type
 */
export const useDeleteRouteType = () => {
  return useApiMutation({
    mutationFn: routeTypeService.deleteRouteType,
    invalidateQueries: ['routeTypes'],
    loadingMessage: 'Deleting route type...',
  });
};
