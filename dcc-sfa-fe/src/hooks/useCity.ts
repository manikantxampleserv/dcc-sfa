import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as cityService from '../services/masters/City';

export type {
  City,
  ManageCityPayload,
  UpdateCityPayload,
  GetCitiesParams,
} from '../services/masters/City';

export const cityQueryKeys = {
  all: ['city'] as const,
  lists: () => [...cityQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...cityQueryKeys.lists(), params] as const,
  details: () => [...cityQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...cityQueryKeys.details(), id] as const,
};

export const useCities = (
  params?: cityService.GetCitiesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<cityService.City[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: cityQueryKeys.list(params),
    queryFn: () => cityService.fetchCities(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCityById = (
  id: number,
  options?: Omit<
    UseQueryOptions<cityService.City>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: cityQueryKeys.detail(id),
    queryFn: () => cityService.fetchCityById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCity = () => {
  return useApiMutation({
    mutationFn: async (data: cityService.ManageCityPayload) => {
      const response = await cityService.createCity(data);
      return response;
    },
    invalidateQueries: ['city'],
    loadingMessage: 'Creating city...',
  });
};

export const useUpdateCity = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: cityService.UpdateCityPayload;
    }) => {
      const response = await cityService.updateCity(id, data);
      return response;
    },
    invalidateQueries: ['city'],
    loadingMessage: 'Updating city...',
  });
};

export const useDeleteCity = () => {
  return useApiMutation({
    mutationFn: cityService.deleteCity,
    invalidateQueries: ['city'],
    loadingMessage: 'Deleting city...',
  });
};
