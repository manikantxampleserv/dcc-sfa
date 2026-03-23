import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as regionService from '../services/masters/Region';

export type {
  Region,
  ManageRegionPayload,
  UpdateRegionPayload,
  GetRegionsParams,
} from '../services/masters/Region';

export const regionQueryKeys = {
  all: ['region'] as const,
  lists: () => [...regionQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...regionQueryKeys.lists(), params] as const,
  details: () => [...regionQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...regionQueryKeys.details(), id] as const,
};

export const useRegions = (
  params?: regionService.GetRegionsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<regionService.Region[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: regionQueryKeys.list(params),
    queryFn: () => regionService.fetchRegions(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useRegionById = (
  id: number,
  options?: Omit<
    UseQueryOptions<regionService.Region>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: regionQueryKeys.detail(id),
    queryFn: () => regionService.fetchRegionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateRegion = () => {
  return useApiMutation({
    mutationFn: async (data: regionService.ManageRegionPayload) => {
      const response = await regionService.createRegion(data);
      return response;
    },
    invalidateQueries: ['region'],
    loadingMessage: 'Creating region...',
  });
};

export const useUpdateRegion = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: regionService.UpdateRegionPayload;
    }) => {
      const response = await regionService.updateRegion(id, data);
      return response;
    },
    invalidateQueries: ['region'],
    loadingMessage: 'Updating region...',
  });
};

export const useDeleteRegion = () => {
  return useApiMutation({
    mutationFn: regionService.deleteRegion,
    invalidateQueries: ['region'],
    loadingMessage: 'Deleting region...',
  });
};
