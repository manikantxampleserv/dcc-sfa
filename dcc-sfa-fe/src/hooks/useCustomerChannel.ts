import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import { useApiMutation } from './useApiMutation';
import * as customerChannelService from '../services/masters/CustomerChannel';

export type {
  CustomerChannel,
  ManageCustomerChannelPayload,
  UpdateCustomerChannelPayload,
  GetCustomerChannelsParams,
} from '../services/masters/CustomerChannel';

export const customerChannelQueryKeys = {
  all: ['customer-channel'] as const,
  lists: () => [...customerChannelQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...customerChannelQueryKeys.lists(), params] as const,
  details: () => [...customerChannelQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerChannelQueryKeys.details(), id] as const,
};

export const useCustomerChannels = (
  params?: customerChannelService.GetCustomerChannelsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<customerChannelService.CustomerChannel[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerChannelQueryKeys.list(params),
    queryFn: () => customerChannelService.fetchCustomerChannels(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCustomerChannelById = (
  id: number,
  options?: Omit<
    UseQueryOptions<customerChannelService.CustomerChannel>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: customerChannelQueryKeys.detail(id),
    queryFn: () => customerChannelService.fetchCustomerChannelById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCustomerChannel = () => {
  return useApiMutation({
    mutationFn: async (
      data: customerChannelService.ManageCustomerChannelPayload
    ) => {
      const response = await customerChannelService.createCustomerChannel(data);
      return response;
    },
    invalidateQueries: ['customer-channel'],
    loadingMessage: 'Creating outlet channel...',
  });
};

export const useUpdateCustomerChannel = () => {
  return useApiMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: customerChannelService.UpdateCustomerChannelPayload;
    }) => {
      const response = await customerChannelService.updateCustomerChannel(
        id,
        data
      );
      return response;
    },
    invalidateQueries: ['customer-channel'],
    loadingMessage: 'Updating outlet channel...',
  });
};

export const useDeleteCustomerChannel = () => {
  return useApiMutation({
    mutationFn: customerChannelService.deleteCustomerChannel,
    invalidateQueries: ['customer-channel'],
    loadingMessage: 'Deleting outlet channel...',
  });
};
