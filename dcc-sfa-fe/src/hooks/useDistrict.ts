import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as districtService from '../services/masters/District';

export type {
  District,
  ManageDistrictPayload,
  UpdateDistrictPayload,
  GetDistrictsParams,
} from '../services/masters/District';

export const districtQueryKeys = {
  all: ['district'] as const,
  lists: () => [...districtQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...districtQueryKeys.lists(), params] as const,
  details: () => [...districtQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...districtQueryKeys.details(), id] as const,
};

export const useDistricts = (
  params?: districtService.GetDistrictsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<districtService.District[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: districtQueryKeys.list(params),
    queryFn: () => districtService.fetchDistricts(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useDistrictById = (
  id: number,
  options?: Omit<
    UseQueryOptions<districtService.District>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: districtQueryKeys.detail(id),
    queryFn: () => districtService.fetchDistrictById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateDistrict = () => {
  return useApiMutation({
    mutationFn: async (data: districtService.ManageDistrictPayload) => {
      const response = await districtService.createDistrict(data);
      return response;
    },
    invalidateQueries: ['district'],
    loadingMessage: 'Creating district...',
  });
};

export const useUpdateDistrict = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: districtService.UpdateDistrictPayload;
    }) => {
      const response = await districtService.updateDistrict(id, data);
      return response;
    },
    invalidateQueries: ['district'],
    loadingMessage: 'Updating district...',
  });
};

export const useDeleteDistrict = () => {
  return useApiMutation({
    mutationFn: districtService.deleteDistrict,
    invalidateQueries: ['district'],
    loadingMessage: 'Deleting district...',
  });
};
