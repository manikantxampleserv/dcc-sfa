import React from 'react';
import {
  FaBoxes,
  FaChartLine,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTruck,
  FaUsers,
} from 'react-icons/fa';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  useDashboardStatistics,
  useSalesPerformance,
  useTopProducts,
  useOrderStatus,
} from '../../../hooks/useExecutiveDashboard';

const ExecutiveDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStatistics();
  const { data: salesData, isLoading: salesLoading } = useSalesPerformance(30);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(
    30,
    5
  );
  const { data: orderStatus, isLoading: orderStatusLoading } = useOrderStatus();

  const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
  };

  const quickActions = [
    { title: 'New Order Entry', icon: FaClipboardList, color: 'blue' },
    { title: 'Delivery Scheduling', icon: FaTruck, color: 'green' },
    { title: 'Inventory Check', icon: FaBoxes, color: 'purple' },
    { title: 'Route Planning', icon: FaMapMarkerAlt, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: {
      [key: string]: {
        bg: string;
        text: string;
        icon: string;
        progress: string;
      };
    } = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
        progress: 'bg-blue-500',
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        icon: 'bg-pink-100',
        progress: 'bg-pink-500',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        icon: 'bg-cyan-100',
        progress: 'bg-cyan-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
        progress: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
        progress: 'bg-purple-500',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100',
        progress: 'bg-orange-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const stats_cards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders.value.toLocaleString() || '0',
      description: `+${stats?.totalOrders.growthPercentage || '0'}% This Month`,
      icon: FaShoppingCart,
      color: 'blue',
      progress: stats
        ? Math.min(
            (stats.totalOrders.thisMonth / stats.totalOrders.value) * 100,
            100
          )
        : 0,
    },
    {
      title: 'Sales Revenue',
      value: stats?.salesRevenue.formatted || '₹0.0L',
      description: `+${stats?.salesRevenue.growthPercentage || '0'}% vs Target`,
      icon: FaMoneyBillWave,
      color: 'green',
      progress: stats ? parseFloat(stats.salesRevenue.targetProgress) : 0,
    },
    {
      title: 'Deliveries',
      value: stats?.deliveries.value.toLocaleString() || '0',
      description: `${stats?.deliveries.successRate || '0'}% Success Rate`,
      icon: FaTruck,
      color: 'cyan',
      progress: stats ? parseFloat(stats.deliveries.successRate) : 0,
    },
    {
      title: 'Active Outlets',
      value: stats?.activeOutlets.value.toLocaleString() || '0',
      description: `+${stats?.activeOutlets.thisWeek || 0} New This Week`,
      icon: FaUsers,
      color: 'pink',
      progress: stats
        ? Math.min(
            (stats.activeOutlets.thisMonth / stats.activeOutlets.value) * 100,
            100
          )
        : 0,
    },
  ];

  const lineChartLabels = salesData?.labels || [];
  const lineChartValues = salesData?.sales || [];

  const pieChartData =
    orderStatus?.labels.map((label, index) => ({
      id: index,
      value: orderStatus.values[index],
      label,
    })) || [];

  // Check if charts have valid data
  const hasLineChartData =
    lineChartLabels.length > 0 && lineChartValues.length > 0;
  const hasPieChartData = pieChartData.length > 0;
  const hasBarChartData =
    topProducts &&
    topProducts.products.length > 0 &&
    topProducts.quantities.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1">
              Executive Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Track your sales performance, orders, and field operations
            </p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {stats?.salesRevenue.formatted || '₹0.0L'} Revenue MTD
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {stats?.totalOrders.value.toLocaleString() || '0'} Orders
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {stats?.deliveries.successRate || '0'}% Delivery Success
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats_cards.map(stat => {
          const colors = getColorClasses(stat.color);
          const isLoading = statsLoading;

          return (
            <div
              key={stat.title}
              className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
            >
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">
                      {stat.title}
                    </span>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.icon}`}
                    >
                      <stat.icon size={16} />
                    </div>
                  </div>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {stat.description}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colors.progress}`}
                      style={{ width: `${Math.min(stat.progress, 100)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const colors = getColorClasses(action.color);
          return (
            <button
              key={index}
              className={`${colors.bg} ${colors.text} p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left w-full`}
            >
              <div className="flex items-center gap-3">
                <div className={`${colors.icon} p-2 rounded-lg`}>
                  <action.icon size={20} />
                </div>
                <span className="font-medium">{action.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Performance & Trends
            </h3>
            {salesLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : hasLineChartData ? (
              <div className="h-72 w-full">
                <LineChart
                  height={300}
                  series={[
                    {
                      data: lineChartValues,
                      label: 'Daily Sales',
                      color: CHART_COLORS.primary,
                    },
                  ]}
                  xAxis={[
                    {
                      scaleType: 'point',
                      data: lineChartLabels,
                    },
                  ]}
                  margin={{ left: 50, right: 50, top: 30, bottom: 80 }}
                />
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                    <FaChartLine size={48} />
                  </div>
                  <span className="text-gray-500">No sales data available</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status
            </h3>
            {orderStatusLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : hasPieChartData ? (
              <div className="h-72 w-full flex items-center justify-center">
                <PieChart
                  height={280}
                  series={[
                    {
                      data: pieChartData,
                      innerRadius: 30,
                      outerRadius: 80,
                      paddingAngle: 2,
                      cornerRadius: 5,
                    },
                  ]}
                  margin={{ top: 20, bottom: 20 }}
                />
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                    <FaClipboardList size={48} />
                  </div>
                  <span className="text-gray-500">No order data available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasBarChartData && (
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products (Last 30 Days)
          </h3>
          {productsLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="h-72 w-full">
              <BarChart
                height={300}
                series={[
                  {
                    data: topProducts.quantities,
                    label: 'Units Sold',
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: topProducts.products,
                  },
                ]}
                margin={{ left: 50, right: 50, top: 30, bottom: 100 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
