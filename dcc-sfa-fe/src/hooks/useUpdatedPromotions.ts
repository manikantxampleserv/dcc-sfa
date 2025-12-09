import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'types/api.types';
import {
  createUpdatedPromotion,
  deleteUpdatedPromotion,
  fetchUpdatedPromotionById,
  fetchUpdatedPromotions,
  updateUpdatedPromotion,
  type CreateUpdatedPromotionPayload,
  type GetUpdatedPromotionsParams,
  type UpdateUpdatedPromotionPayload,
  type UpdatedPromotion,
} from '../services/masters/UpdatedPromotions';
import { useApiMutation } from './useApiMutation';

export const updatedPromotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...updatedPromotionKeys.all, 'list'] as const,
  list: (params?: GetUpdatedPromotionsParams) =>
    [...updatedPromotionKeys.lists(), params] as const,
  details: () => [...updatedPromotionKeys.all, 'detail'] as const,
  detail: (id: number | null) =>
    [...updatedPromotionKeys.details(), id] as const,
};

export const useUpdatedPromotions = (
  params?: GetUpdatedPromotionsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<UpdatedPromotion[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: updatedPromotionKeys.list(params),
    queryFn: () => fetchUpdatedPromotions(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUpdatedPromotion = (
  id: number | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<UpdatedPromotion>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: updatedPromotionKeys.detail(id),
    queryFn: () => fetchUpdatedPromotionById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateUpdatedPromotion = () => {
  return useApiMutation({
    mutationFn: (data: CreateUpdatedPromotionPayload) =>
      createUpdatedPromotion(data),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Saving...',
  });
};

export const useUpdateUpdatedPromotion = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUpdatedPromotionPayload;
    }) => updateUpdatedPromotion(id, data),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Saving...',
  });
};

export const useDeleteUpdatedPromotion = () => {
  return useApiMutation({
    mutationFn: (id: number) => deleteUpdatedPromotion(id),
    invalidateQueries: [['promotions']],
    loadingMessage: 'Deleting...',
  });
};

export type {
  CreateUpdatedPromotionPayload,
  GetUpdatedPromotionsParams,
  UpdateUpdatedPromotionPayload,
  UpdatedPromotion,
};
