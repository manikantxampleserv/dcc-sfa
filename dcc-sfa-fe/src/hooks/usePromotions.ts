import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  fetchPromotions,
  fetchPromotionById,
  type GetPromotionsParams,
  type Promotion,
  type CreatePromotionPayload,
  type UpdatePromotionPayload,
} from '../services/masters/Promotions';
import type { ApiResponse } from '../types/api.types';
import { useApiMutation } from './useApiMutation';
import * as promotionService from '../services/masters/Promotions';

export const promotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (params?: GetPromotionsParams) =>
    [...promotionKeys.lists(), params] as const,
  details: () => [...promotionKeys.all, 'detail'] as const,
  detail: (id: number) => [...promotionKeys.details(), id] as const,
};

export const usePromotions = (
  params?: GetPromotionsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Promotion[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => fetchPromotions(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePromotion = (
  id: number | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<Promotion>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: promotionKeys.detail(id!),
    queryFn: () => fetchPromotionById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreatePromotion = (options?: {
  onSuccess?: (data: any, variables: CreatePromotionPayload) => void;
  onError?: (error: any, variables: CreatePromotionPayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: promotionService.createPromotion,
    loadingMessage: 'Creating promotion...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      if (data?.data?.id) {
        queryClient.invalidateQueries({
          queryKey: promotionKeys.detail(data.data.id),
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useUpdatePromotion = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdatePromotionPayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdatePromotionPayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: promotionService.UpdatePromotionPayload;
    }) => promotionService.updatePromotion(id, data),
    loadingMessage: 'Updating promotion...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeletePromotion = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: promotionService.deletePromotion,
    loadingMessage: 'Deleting promotion...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignChannels = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: string[]) => void;
    onError?: (error: any, variables: string[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (channels: string[]) =>
      promotionService.assignChannels(promotionId, channels),
    loadingMessage: 'Assigning channels...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignDepots = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number[]) => void;
    onError?: (error: any, variables: number[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (depot_ids: number[]) =>
      promotionService.assignDepots(promotionId, depot_ids),
    loadingMessage: 'Assigning depots...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignSalespersons = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number[]) => void;
    onError?: (error: any, variables: number[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (salesperson_ids: number[]) =>
      promotionService.assignSalespersons(promotionId, salesperson_ids),
    loadingMessage: 'Assigning salespersons...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignRoutes = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number[]) => void;
    onError?: (error: any, variables: number[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (route_ids: number[]) =>
      promotionService.assignRoutes(promotionId, route_ids),
    loadingMessage: 'Assigning routes...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignCustomerCategories = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number[]) => void;
    onError?: (error: any, variables: number[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (customer_category_ids: number[]) =>
      promotionService.assignCustomerCategories(
        promotionId,
        customer_category_ids
      ),
    loadingMessage: 'Assigning customer categories...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignCustomerExclusions = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number[]) => void;
    onError?: (error: any, variables: number[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (customer_ids: number[]) =>
      promotionService.assignCustomerExclusions(promotionId, customer_ids),
    loadingMessage: 'Assigning customer exclusions...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useCreateCondition = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (conditionData: any) =>
      promotionService.createCondition(promotionId, conditionData),
    loadingMessage: 'Creating condition...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useUpdateCondition = (
  promotionId: number,
  options?: {
    onSuccess?: (
      data: any,
      variables: { conditionId: number; data: any }
    ) => void;
    onError?: (
      error: any,
      variables: { conditionId: number; data: any }
    ) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ conditionId, data }: { conditionId: number; data: any }) =>
      promotionService.updateCondition(promotionId, conditionId, data),
    loadingMessage: 'Updating condition...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeleteCondition = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number) => void;
    onError?: (error: any, variables: number) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (conditionId: number) =>
      promotionService.deleteCondition(promotionId, conditionId),
    loadingMessage: 'Deleting condition...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useAssignConditionProducts = (
  promotionId: number,
  conditionId: number,
  options?: {
    onSuccess?: (data: any, variables: any[]) => void;
    onError?: (error: any, variables: any[]) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (products: any[]) =>
      promotionService.assignConditionProducts(
        promotionId,
        conditionId,
        products
      ),
    loadingMessage: 'Assigning condition products...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useCreateLevel = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (levelData: any) =>
      promotionService.createLevel(promotionId, levelData),
    loadingMessage: 'Creating level...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useUpdateLevel = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: { levelId: number; data: any }) => void;
    onError?: (error: any, variables: { levelId: number; data: any }) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ levelId, data }: { levelId: number; data: any }) =>
      promotionService.updateLevel(promotionId, levelId, data),
    loadingMessage: 'Updating level...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeleteLevel = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: number) => void;
    onError?: (error: any, variables: number) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (levelId: number) =>
      promotionService.deleteLevel(promotionId, levelId),
    loadingMessage: 'Deleting level...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useCreateBenefit = (
  promotionId: number,
  levelId: number,
  options?: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (benefitData: any) =>
      promotionService.createBenefit(promotionId, levelId, benefitData),
    loadingMessage: 'Creating benefit...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useUpdateBenefit = (
  promotionId: number,
  levelId: number,
  options?: {
    onSuccess?: (
      data: any,
      variables: { benefitId: number; data: any }
    ) => void;
    onError?: (error: any, variables: { benefitId: number; data: any }) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ benefitId, data }: { benefitId: number; data: any }) =>
      promotionService.updateBenefit(promotionId, levelId, benefitId, data),
    loadingMessage: 'Updating benefit...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useDeleteBenefit = (
  promotionId: number,
  levelId: number,
  options?: {
    onSuccess?: (data: any, variables: number) => void;
    onError?: (error: any, variables: number) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (benefitId: number) =>
      promotionService.deleteBenefit(promotionId, levelId, benefitId),
    loadingMessage: 'Deleting benefit...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useActivatePromotion = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: () => promotionService.activatePromotion(promotionId),
    loadingMessage: 'Activating promotion...',
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useDeactivatePromotion = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: () => promotionService.deactivatePromotion(promotionId),
    loadingMessage: 'Deactivating promotion...',
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useCalculateEligiblePromotions = (options?: {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: any, variables: any) => void;
}) => {
  return useApiMutation({
    mutationFn: promotionService.calculateEligiblePromotions,
    loadingMessage: 'Calculating eligible promotions...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useApplyPromotion = (options?: {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: any, variables: any) => void;
}) => {
  return useApiMutation({
    mutationFn: promotionService.applyPromotion,
    loadingMessage: 'Applying promotion...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useSettlePeriodPromotion = (
  promotionId: number,
  options?: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (data: any) =>
      promotionService.settlePeriodPromotion(promotionId, data),
    loadingMessage: 'Settling period promotion...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(promotionId),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export const useActivePromotionsReport = (
  params?: {
    platform?: string;
    depot_id?: number;
    start_date?: string;
    end_date?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...promotionKeys.all, 'report', 'active', params] as const,
    queryFn: () => promotionService.getActivePromotionsReport(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePromotionTrackingReport = (
  params?: {
    promotion_id?: number;
    action_type?: string;
    start_date?: string;
    end_date?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...promotionKeys.all, 'report', 'tracking', params] as const,
    queryFn: () => promotionService.getPromotionTrackingReport(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePromotionUsageReport = (
  promotionId: number,
  params?: {
    start_date?: string;
    end_date?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [
      ...promotionKeys.all,
      'report',
      'usage',
      promotionId,
      params,
    ] as const,
    queryFn: () =>
      promotionService.getPromotionUsageReport(promotionId, params),
    enabled: !!promotionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCustomerQualifiedReport = (
  params?: {
    promotion_id: number;
    start_date?: string;
    end_date?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [
      ...promotionKeys.all,
      'report',
      'customer-qualified',
      params,
    ] as const,
    queryFn: () => promotionService.getCustomerQualifiedReport(params),
    enabled: !!params?.promotion_id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePromotionPerformanceReport = (
  params?: {
    start_date?: string;
    end_date?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...promotionKeys.all, 'report', 'performance', params] as const,
    queryFn: () => promotionService.getPromotionPerformanceReport(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export type {
  GetPromotionsParams,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  Promotion,
};
