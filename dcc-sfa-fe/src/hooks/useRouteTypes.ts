import { useQuery } from '@tanstack/react-query';
import {
  fetchRouteTypes,
  type RouteType,
} from '../services/masters/RouteTypes';
import type { ApiResponse } from '../types/api.types';

// Query Keys
export const routeTypeKeys = {
  all: ['routeTypes'] as const,
  lists: () => [...routeTypeKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all route types
 * @returns Query result with route types data
 */
export const useRouteTypes = () => {
  return useQuery<ApiResponse<RouteType[]>>({
    queryKey: routeTypeKeys.lists(),
    queryFn: () => fetchRouteTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export type { RouteType };
