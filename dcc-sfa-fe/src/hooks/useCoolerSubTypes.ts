import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as coolerSubTypeService from '../services/masters/CoolerSubTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  CoolerSubType,
  ManageCoolerSubTypePayload,
  UpdateCoolerSubTypePayload,
  GetCoolerSubTypesParams,
} from '../services/masters/CoolerSubTypes';

export const coolerSubTypeQueryKeys = {
  all: ['cooler-sub-types'] as const,
  lists: () => [...coolerSubTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...coolerSubTypeQueryKeys.lists(), params] as const,
  details: () => [...coolerSubTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...coolerSubTypeQueryKeys.details(), id] as const,
  dropdown: () => [...coolerSubTypeQueryKeys.all, 'dropdown'] as const,
};

export const useCoolerSubTypes = (
  params?: coolerSubTypeService.GetCoolerSubTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<coolerSubTypeService.CoolerSubType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerSubTypeQueryKeys.list(params),
    queryFn: () => coolerSubTypeService.fetchCoolerSubTypes(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCoolerSubType = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<coolerSubTypeService.CoolerSubType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: coolerSubTypeQueryKeys.detail(id),
    queryFn: () => coolerSubTypeService.fetchCoolerSubTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCoolerSubType = () => {
  return useApiMutation({
    mutationFn: coolerSubTypeService.createCoolerSubType,
    invalidateQueries: ['cooler-sub-types'],
    loadingMessage: 'Creating cooler sub type...',
  });
};

export const useUpdateCoolerSubType = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & coolerSubTypeService.UpdateCoolerSubTypePayload) =>
      coolerSubTypeService.updateCoolerSubType(id, data),
    invalidateQueries: ['cooler-sub-types'],
    loadingMessage: 'Updating cooler sub type...',
  });
};

export const useDeleteCoolerSubType = () => {
  return useApiMutation({
    mutationFn: coolerSubTypeService.deleteCoolerSubType,
    invalidateQueries: ['cooler-sub-types'],
    loadingMessage: 'Deleting cooler sub type...',
  });
};

export const useCoolerSubTypesDropdown = (
  cooler_type_id?: number,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<
        { id: number; name: string; code: string; cooler_type_id: number }[]
      >
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...coolerSubTypeQueryKeys.dropdown(), cooler_type_id],
    queryFn: () =>
      coolerSubTypeService.fetchCoolerSubTypesDropdown(cooler_type_id),
    staleTime: 10 * 60 * 1000,
    enabled: true,
    ...options,
  });
};
