import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as coolerTypeService from '../services/masters/CoolerTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  CoolerType,
  ManageCoolerTypePayload,
  UpdateCoolerTypePayload,
  GetCoolerTypesParams,
} from '../services/masters/CoolerTypes';

export const coolerTypeQueryKeys = {
  all: ['cooler-types'] as const,
  lists: () => [...coolerTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...coolerTypeQueryKeys.lists(), params] as const,
  details: () => [...coolerTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...coolerTypeQueryKeys.details(), id] as const,
  dropdown: () => [...coolerTypeQueryKeys.all, 'dropdown'] as const,
};

export const useCoolerTypes = (
  params?: coolerTypeService.GetCoolerTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<coolerTypeService.CoolerType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerTypeQueryKeys.list(params),
    queryFn: () => coolerTypeService.fetchCoolerTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCoolerType = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<coolerTypeService.CoolerType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerTypeQueryKeys.detail(id),
    queryFn: () => coolerTypeService.fetchCoolerTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCoolerType = () => {
  return useApiMutation({
    mutationFn: coolerTypeService.createCoolerType,
    invalidateQueries: ['cooler-types'],
    loadingMessage: 'Creating cooler type...',
  });
};

export const useUpdateCoolerType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & coolerTypeService.UpdateCoolerTypePayload) =>
      coolerTypeService.updateCoolerType(id, data),
    invalidateQueries: ['cooler-types'],
    loadingMessage: 'Updating cooler type...',
  });
};

export const useDeleteCoolerType = () => {
  return useApiMutation({
    mutationFn: coolerTypeService.deleteCoolerType,
    invalidateQueries: ['cooler-types'],
    loadingMessage: 'Deleting cooler type...',
  });
};

export const useCoolerTypesDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<{ id: number; name: string; code: string }[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerTypeQueryKeys.dropdown(),
    queryFn: () => coolerTypeService.fetchCoolerTypesDropdown(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};
