import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as gradingDashboardService from '../services/dashboards/gradingDashboard';
import { useApiMutation } from './useApiMutation';

const CACHE_TIME = 3 * 60 * 1000; // 3 minutes

// Define a more specific type for the params
interface PendingRequestsParams {
  page?: number;
  limit?: number;
  change_type?: 'all' | 'upgrade' | 'downgrade' | 'no_change';
  search?: string;
}

export const gradingDashboardQueryKeys = {
  stats: ['gradingDashboardStats'] as const,
  pendingRequests: (params: PendingRequestsParams) =>
    ['pendingGradingRequests', params] as const,
};

/**
 * Hook to fetch grading dashboard statistics.
 */
export const useGradingStats = () => {
  return useQuery({
    queryKey: gradingDashboardQueryKeys.stats,
    queryFn: gradingDashboardService.getGradingStats,
    staleTime: CACHE_TIME,
  });
};

/**
 * Hook to fetch pending grading requests with pagination and filters.
 */
export const usePendingGradingRequests = (params: PendingRequestsParams) => {
  return useQuery({
    queryKey: gradingDashboardQueryKeys.pendingRequests(params),
    queryFn: () => gradingDashboardService.getPendingGradingRequests(params),
    staleTime: CACHE_TIME,
  });
};

/**
 * Hook to process a grading request (approve/reject).
 */
export const useProcessGradingRequest = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: gradingDashboardService.processGradingRequest,
    onSuccess: () => {
      // Invalidate both stats and all pending requests queries
      queryClient.invalidateQueries({
        queryKey: gradingDashboardQueryKeys.stats,
      });
      queryClient.invalidateQueries({
        queryKey: ['pendingGradingRequests'],
      });
    },
    loadingMessage: 'Processing request...',
    successMessage: 'Request processed successfully!',
  });
};
