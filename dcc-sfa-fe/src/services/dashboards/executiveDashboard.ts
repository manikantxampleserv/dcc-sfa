import api from '../../configs/axio.config';

export interface DashboardStatistics {
  totalOrders: {
    value: number;
    thisMonth: number;
    growthPercentage: string;
  };
  salesRevenue: {
    value: number;
    formatted: string;
    growthPercentage: string;
    target: number;
    targetProgress: string;
  };
  deliveries: {
    value: number;
    thisMonth: number;
    successRate: string;
  };
  activeOutlets: {
    value: number;
    thisMonth: number;
    thisWeek: number;
  };
}

export interface SalesPerformanceData {
  labels: string[];
  sales: number[];
  period: number;
}

export interface TopProductsData {
  products: string[];
  quantities: number[];
}

export interface OrderStatusData {
  labels: string[];
  values: number[];
}

/**
 * Fetch dashboard statistics
 */
export const getDashboardStatistics =
  async (): Promise<DashboardStatistics> => {
    const response = await api.get('/dashboard/statistics');
    return response.data.data;
  };

/**
 * Fetch sales performance data
 */
export const getSalesPerformance = async (
  period: number = 30
): Promise<SalesPerformanceData> => {
  const response = await api.get('/dashboard/sales-performance', {
    params: { period },
  });
  return response.data.data;
};

/**
 * Fetch top products data
 */
export const getTopProducts = async (
  period: number = 30,
  limit: number = 5
): Promise<TopProductsData> => {
  const response = await api.get('/dashboard/top-products', {
    params: { period, limit },
  });
  return response.data.data;
};

/**
 * Fetch order status distribution
 */
export const getOrderStatus = async (): Promise<OrderStatusData> => {
  const response = await api.get('/dashboard/order-status');
  return response.data.data;
};
