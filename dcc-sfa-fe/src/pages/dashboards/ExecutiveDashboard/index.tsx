import React, { useState } from 'react';
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
import { PieChart } from '@mui/x-charts/PieChart';
import {
  useDashboardStatistics,
  useSalesPerformance,
  useTopProducts,
  useOrderStatus,
} from '../../../hooks/useExecutiveDashboard';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import type { Position } from '@mui/x-charts';

const ExecutiveDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: stats } = useDashboardStatistics();
  const { data: salesData, isLoading: salesLoading } = useSalesPerformance(30);
  const { data: topProductsApi, isLoading: productsLoading } = useTopProducts(
    30,
    6
  );
  const { data: orderStatusApi, isLoading: orderStatusLoading } =
    useOrderStatus();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    page: 1,
    limit: 5,
  });

  const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
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
      value: stats?.salesRevenue.formatted || '₹0.0XP',
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

  const salesTrendData =
    salesData?.labels.map((label, index) => ({
      date: label,
      sales: salesData.sales[index],
      orders: Math.floor(salesData.sales[index] / 1000),
    })) || [];

  const orderStatusData =
    orderStatusApi?.labels.map((label: string, index: number) => ({
      name: label,
      value: orderStatusApi.values[index],
      color:
        label.toLowerCase().includes('delivered') ||
        label.toLowerCase().includes('complete')
          ? '#10b981'
          : label.toLowerCase().includes('pending')
            ? '#ef4444'
            : label.toLowerCase().includes('processing') ||
                label.toLowerCase().includes('transit')
              ? '#3b82f6'
              : '#f59e0b',
    })) || [];

  const topProducts =
    topProductsApi?.products.map((product, index) => ({
      product,
      units: topProductsApi.quantities[index],
      revenue: topProductsApi.quantities[index] * 150,
      trend: 15.2 + index * 2,
    })) || [];

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

  const quickActions = [
    { title: 'New Order Entry', icon: FaClipboardList, color: 'blue' },
    { title: 'Delivery Scheduling', icon: FaTruck, color: 'green' },
    { title: 'Inventory Check', icon: FaBoxes, color: 'purple' },
    { title: 'Route Planning', icon: FaMapMarkerAlt, color: 'orange' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
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
          Česká Republika{' '}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats_cards.map(stat => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.title}
              className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
            >
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
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

      {/* Charts Grid - Professional Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Sales Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Performance & Trends
              </h3>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            {salesLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : salesTrendData.length > 0 ? (
              <div className="h-80">
                <LineChart
                  height={320}
                  series={[
                    {
                      data: salesTrendData.map(d => d.sales),
                      label: 'Sales',
                      color: CHART_COLORS.success,
                    },
                    {
                      data: salesTrendData.map(d => d.orders),
                      label: 'Orders',
                      color: CHART_COLORS.primary,
                    },
                  ]}
                  xAxis={[
                    {
                      scaleType: 'point',
                      data: salesTrendData.map(d => d.date),
                    },
                  ]}
                  margin={{ left: 60, right: 30, top: 30, bottom: 80 }}
                  slotProps={{
                    legend: { position: 'bottom' as Position },
                  }}
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FaChartLine
                    className="mx-auto text-gray-300 mb-2"
                    size={48}
                  />
                  <span className="text-gray-500">No sales data available</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Chart - 4 columns */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Distribution
            </h3>
            {orderStatusLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : orderStatusData.length > 0 ? (
              <div className="h-80 flex items-center justify-center">
                <PieChart
                  series={[
                    {
                      data: orderStatusData.map((d: any) => ({
                        id: d.name,
                        value: d.value,
                        label: d.name,
                      })),
                      innerRadius: 40,
                      outerRadius: 90,
                      paddingAngle: 3,
                      cornerRadius: 5,
                    },
                  ]}
                  width={350}
                  height={320}
                  margin={{ top: 20, bottom: 60 }}
                  slotProps={{
                    legend: { position: 'bottom' as Position },
                  }}
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FaShoppingCart
                    className="mx-auto text-gray-300 mb-2"
                    size={48}
                  />
                  <span className="text-gray-500">No order data available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Products & Activity */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Products - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          {(topProducts.length > 0 || productsLoading) && (
            <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Selling Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Product
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Units Sold
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Revenue
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <div className="animate-pulse text-gray-400">
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((product, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {product.product}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {product.units.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            ₹{product.revenue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-green-600 font-medium text-sm">
                              +{product.trend.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity - 4 columns */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>

            {auditLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : auditData && auditData.logs && auditData.logs.length > 0 ? (
              <div className="space-y-2">
                {auditData.logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                        log.action === 'CREATE'
                          ? 'bg-green-500'
                          : log.action === 'UPDATE'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                      }`}
                    >
                      {log.action.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {log.user_name || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {log.table_name} •{' '}
                        {new Date(log.changed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaClipboardList
                  className="mx-auto text-gray-300 mb-2"
                  size={32}
                />
                <p className="text-gray-500 text-sm">No activity available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
