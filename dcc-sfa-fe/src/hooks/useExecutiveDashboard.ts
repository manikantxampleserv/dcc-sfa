import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStatistics,
  getExecutiveDashboardOverview,
  getOrderStatus,
  getSalesPerformance,
  getTopProducts,
} from '../services/dashboards/executiveDashboard';

const CACHE_TIME = 3 * 60 * 1000;

/**
 * Hook to fetch consolidated executive dashboard data in a single request
 * @param {number} [period=30] - Time period in days
 * @param {number} [limit=5] - Limit for top products
 * @returns React Query result with consolidated dashboard data
 */
export const useExecutiveDashboardOverview = (
  period: number = 30,
  limit: number = 5
) => {
  return useQuery({
    queryKey: ['executiveDashboardOverview', period, limit],
    queryFn: () => getExecutiveDashboardOverview(period, limit),
    staleTime: CACHE_TIME,
  });
};

export const useDashboardStatistics = () => {
  return useQuery({
    queryKey: ['dashboardStatistics'],
    queryFn: getDashboardStatistics,
    staleTime: CACHE_TIME,
  });
};

export const useSalesPerformance = (period: number = 30) => {
  return useQuery({
    queryKey: ['salesPerformance', period],
    queryFn: () => getSalesPerformance(period),
    staleTime: CACHE_TIME,
  });
};

export const useTopProducts = (period: number = 30, limit: number = 5) => {
  return useQuery({
    queryKey: ['topProducts', period, limit],
    queryFn: () => getTopProducts(period, limit),
    staleTime: CACHE_TIME,
  });
};

export const useOrderStatus = () => {
  return useQuery({
    queryKey: ['orderStatus'],
    queryFn: getOrderStatus,
    staleTime: CACHE_TIME,
  });
};
