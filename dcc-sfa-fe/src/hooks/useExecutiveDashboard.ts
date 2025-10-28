import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStatistics,
  getSalesPerformance,
  getTopProducts,
  getOrderStatus,
} from '../services/dashboards/executiveDashboard';

const CACHE_TIME = 3 * 60 * 1000; // 3 minutes

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
