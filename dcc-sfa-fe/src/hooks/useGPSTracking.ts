import { useQuery } from '@tanstack/react-query';
import {
  createGPSLog,
  fetchGPSTrackingData,
  fetchRealTimeGPSTracking,
  fetchUserGPSPath,
  type CreateGPSLogPayload,
  type GPSTrackingData,
  type GPSTrackingFilters,
  type RealTimeGPSData,
  type UserGPSPathData,
} from '../services/tracking/gpsTracking';
import {
  fetchRouteEffectiveness,
  type RouteEffectivenessFilters,
  type RouteEffectivenessData,
} from '../services/tracking/routeEffectiveness';
import { useApiMutation } from './useApiMutation';

export const gpsTrackingKeys = {
  all: ['gps-tracking'] as const,
  lists: () => [...gpsTrackingKeys.all, 'list'] as const,
  list: (filters?: GPSTrackingFilters) =>
    [...gpsTrackingKeys.lists(), filters] as const,
  realtime: () => [...gpsTrackingKeys.all, 'realtime'] as const,
  path: (
    userId: number,
    filters?: { start_date?: string; end_date?: string }
  ) => [...gpsTrackingKeys.all, 'path', userId, filters] as const,
  routeEffectiveness: (filters?: RouteEffectivenessFilters) =>
    [...gpsTrackingKeys.all, 'route-effectiveness', filters] as const,
};

/**
 * Hook to fetch GPS Tracking Data
 */
export const useGPSTrackingData = (
  filters?: GPSTrackingFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery<GPSTrackingData>({
    queryKey: gpsTrackingKeys.list(filters),
    queryFn: () => fetchGPSTrackingData(filters),
    staleTime: 3 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};

/**
 * Hook to fetch Real-Time GPS Tracking Data
 */
export const useRealTimeGPSTracking = (options?: { enabled?: boolean }) => {
  return useQuery<RealTimeGPSData>({
    queryKey: gpsTrackingKeys.realtime(),
    queryFn: () => fetchRealTimeGPSTracking(),
    staleTime: 30 * 1000,
    refetchInterval: options?.enabled !== false ? 30000 : false,
    enabled: options?.enabled !== false,
  });
};

/**
 * Hook to fetch User GPS Path
 */
export const useUserGPSPath = (
  userId: number,
  filters?: { start_date?: string; end_date?: string }
) => {
  return useQuery<UserGPSPathData>({
    queryKey: gpsTrackingKeys.path(userId, filters),
    queryFn: () => fetchUserGPSPath(userId, filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create GPS Log with automatic toast notifications
 * @returns Mutation object for creating GPS log
 */
export const useCreateGPSLog = () => {
  return useApiMutation({
    mutationFn: (data: CreateGPSLogPayload) => createGPSLog(data),
    invalidateQueries: [...Array.from(gpsTrackingKeys.realtime())],
    loadingMessage: 'Creating GPS log...',
  });
};

/**
 * Hook to fetch Route Effectiveness Data
 */
export const useRouteEffectiveness = (
  filters?: RouteEffectivenessFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery<RouteEffectivenessData>({
    queryKey: gpsTrackingKeys.routeEffectiveness(filters),
    queryFn: () => fetchRouteEffectiveness(filters),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};
