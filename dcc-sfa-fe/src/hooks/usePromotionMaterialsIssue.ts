import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  createPromotionMaterialsIssue,
  deletePromotionMaterialsIssue,
  getPromotionMaterialsIssueById,
  getPromotionMaterialsIssues,
  updatePromotionMaterialsIssue,
  type CreatePromotionMaterialsIssuePayload,
  type UpdatePromotionMaterialsIssuePayload,
} from '../services/transactions/PromotionMaterialsIssue';

export const PROMOTION_MATERIALS_ISSUE_QUERY_KEYS = {
  all: ['promotionMaterialsIssues'] as const,
  lists: () => [...PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    depot_id?: number;
  }) => [...PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.lists(), filters] as const,
  details: () =>
    [...PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) =>
    [...PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.details(), id] as const,
};

export const usePromotionMaterialsIssues = (
  page = 1,
  limit = 10,
  search = '',
  status = '',
  depot_id?: number
) => {
  return useQuery({
    queryKey: PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.list({
      page,
      limit,
      search,
      status,
      depot_id,
    }),
    queryFn: () =>
      getPromotionMaterialsIssues(page, limit, search, status, depot_id),
  });
};

export const usePromotionMaterialsIssue = (id: number) => {
  return useQuery({
    queryKey: PROMOTION_MATERIALS_ISSUE_QUERY_KEYS.detail(id),
    queryFn: () => getPromotionMaterialsIssueById(id),
    enabled: !!id,
  });
};

export const useCreatePromotionMaterialsIssue = () => {
  return useApiMutation({
    mutationFn: (data: CreatePromotionMaterialsIssuePayload) =>
      createPromotionMaterialsIssue(data),
    invalidateQueries: ['promotionMaterialsIssues'],
    loadingMessage: 'Creating Promotion Materials Issue...',
  });
};

export const useUpdatePromotionMaterialsIssue = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePromotionMaterialsIssuePayload;
    }) => updatePromotionMaterialsIssue(id, data),
    invalidateQueries: ['promotionMaterialsIssues'],
    loadingMessage: 'Updating Promotion Materials Issue...',
  });
};

export const useDeletePromotionMaterialsIssue = () => {
  return useApiMutation({
    mutationFn: (id: number) => deletePromotionMaterialsIssue(id),
    invalidateQueries: ['promotionMaterialsIssues'],
    loadingMessage: 'Deleting Promotion Materials Issue...',
  });
};
