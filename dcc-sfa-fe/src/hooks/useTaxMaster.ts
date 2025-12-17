import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as taxMasterService from '../services/masters/TaxMaster';

export type {
  TaxMaster,
  ManageTaxMasterPayload,
  UpdateTaxMasterPayload,
  GetTaxMastersParams,
} from '../services/masters/TaxMaster';

export const taxMasterQueryKeys = {
  all: ['tax-master'] as const,
  lists: () => [...taxMasterQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...taxMasterQueryKeys.lists(), params] as const,
  details: () => [...taxMasterQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...taxMasterQueryKeys.details(), id] as const,
};

export const useTaxMasters = (
  params?: taxMasterService.GetTaxMastersParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<taxMasterService.TaxMaster[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: taxMasterQueryKeys.list(params),
    queryFn: () => taxMasterService.fetchTaxMasters(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTaxMasterById = (
  id: number,
  options?: Omit<
    UseQueryOptions<taxMasterService.TaxMaster>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: taxMasterQueryKeys.detail(id),
    queryFn: () => taxMasterService.fetchTaxMasterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTaxMaster = () => {
  return useApiMutation({
    mutationFn: async (data: taxMasterService.ManageTaxMasterPayload) => {
      const response = await taxMasterService.createTaxMaster(data);
      return response;
    },
    invalidateQueries: ['tax-master'],
    loadingMessage: 'Creating tax master...',
  });
};

export const useUpdateTaxMaster = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: taxMasterService.UpdateTaxMasterPayload;
    }) => {
      const response = await taxMasterService.updateTaxMaster(id, data);
      return response;
    },
    invalidateQueries: ['tax-master'],
    loadingMessage: 'Updating tax master...',
  });
};

export const useDeleteTaxMaster = () => {
  return useApiMutation({
    mutationFn: taxMasterService.deleteTaxMaster,
    invalidateQueries: ['tax-master'],
    loadingMessage: 'Deleting tax master...',
  });
};
