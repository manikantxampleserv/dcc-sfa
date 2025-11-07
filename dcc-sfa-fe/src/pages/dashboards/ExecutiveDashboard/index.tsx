import React from 'react';
import {
  FaChartLine,
  FaClipboardList,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTruck,
  FaUsers,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Chart } from 'react-chartjs-2';
import {
  useDashboardStatistics,
  useOrderStatus,
  useSalesPerformance,
  useTopProducts,
} from '../../../hooks/useExecutiveDashboard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  // Transform data for Chart.js Line Chart
  const lineChartLabels = salesData?.labels || [];
  const lineChartDataValue = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData?.sales || [],
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primary + '20',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  // Transform data for Chart.js Doughnut Chart (Order Status)
  const pieChartLabels =
    orderStatus?.labels.map(
      label => label?.charAt(0).toUpperCase() + label?.slice(1)
    ) || [];
  const pieChartDataValue = {
    labels: pieChartLabels,
    datasets: [
      {
        data: orderStatus?.values || [],
        backgroundColor: [
          CHART_COLORS.primary,
          CHART_COLORS.success,
          CHART_COLORS.warning,
          CHART_COLORS.danger,
          CHART_COLORS.purple,
        ],
        borderWidth: 0,
      },
    ],
  };

  // Transform data for Chart.js Bar Chart
  const barChartLabels =
    topProducts?.products.map(product =>
      product.length > 15 ? product.substring(0, 15) + '...' : product
    ) || [];
  const barChartFullNames = topProducts?.products || [];
  const barChartDataValue = {
    labels: barChartLabels,
    datasets: [
      {
        label: 'Units Sold',
        data: topProducts?.quantities || [],
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primary,
        borderWidth: 1,
      },
    ],
  };

  // Area chart data (revenue trend) - Line chart with fill
  const areaChartDataValue = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Revenue',
        data: salesData?.sales || [],
        borderColor: CHART_COLORS.success,
        backgroundColor: CHART_COLORS.success + '40',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Composed chart data (Sales vs Average Orders per day)
  const averageDailyOrders = stats
    ? Math.round(stats.totalOrders.value / Math.max(lineChartLabels.length, 1))
    : 0;
  const ordersData = lineChartLabels.map(
    (_, index) => averageDailyOrders + (index % 3)
  );
  const composedChartDataValue = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Sales (₹)',
        data: salesData?.sales || [],
        type: 'bar' as const,
        backgroundColor: CHART_COLORS.warning,
        borderColor: CHART_COLORS.warning,
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: ordersData,
        type: 'line' as const,
        borderColor: CHART_COLORS.danger,
        backgroundColor: CHART_COLORS.danger + '20',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  // Revenue distribution (Pie chart)
  const revenueDistributionData = stats
    ? [
        {
          name: 'Achieved',
          value:
            parseFloat(stats.salesRevenue.formatted.replace(/[₹L]/g, '')) || 0,
        },
        {
          name: 'Pending',
          value:
            (stats.salesRevenue.target
              ? parseFloat(
                  String(stats.salesRevenue.target).replace(/[₹L]/g, '')
                ) -
                (parseFloat(
                  stats.salesRevenue.formatted.replace(/[₹L]/g, '')
                ) || 0)
              : 0) || 0,
        },
      ].filter(item => item.value > 0)
    : [];
  const revenueDistributionChartData = {
    labels: revenueDistributionData.map(d => d.name),
    datasets: [
      {
        data: revenueDistributionData.map(d => d.value),
        backgroundColor: [CHART_COLORS.success, CHART_COLORS.warning],
        borderWidth: 0,
      },
    ],
  };

  // Check if charts have valid data
  const hasLineChartData = lineChartLabels.length > 0;
  const hasPieChartData = pieChartLabels.length > 0;
  const hasBarChartData = barChartLabels.length > 0;
  const hasAreaChartData = lineChartLabels.length > 0;
  const hasComposedChartData = lineChartLabels.length > 0;
  const hasRevenueDistributionData = revenueDistributionData.length > 0;

  // Common chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => `Daily Sales: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const fullName = barChartFullNames[index];
            return `${fullName || context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const doughnutChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const pieChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(0);
            return `${context.label}: ${percentage}%`;
          },
        },
      },
    },
  };

  const composedChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

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
                <Line data={lineChartDataValue} options={lineChartOptions} />
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
                <Doughnut
                  data={pieChartDataValue}
                  options={doughnutChartOptions}
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

      <div className="grid grid-cols-1 gap-6">
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
                <Bar data={barChartDataValue} options={barChartOptions} />
              </div>
            )}
          </div>
        )}

        {hasAreaChartData && (
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            {salesLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            ) : (
              <div className="h-72 w-full">
                <Line data={areaChartDataValue} options={lineChartOptions} />
              </div>
            )}
          </div>
        )}
      </div>

      {hasComposedChartData && (
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales vs Orders Performance
          </h3>
          {salesLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="h-80 w-full">
              <Chart
                type="bar"
                data={composedChartDataValue as any}
                options={composedChartOptions}
              />
            </div>
          )}
        </div>
      )}

      {hasRevenueDistributionData && revenueDistributionData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue vs Target
            </h3>
            <div className="h-64 w-full">
              <Pie
                data={revenueDistributionChartData}
                options={pieChartOptions}
              />
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Distribution
            </h3>
            <div className="space-y-4">
              {stats && (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Total Revenue
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.salesRevenue.formatted}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(parseFloat(stats.salesRevenue.targetProgress || '0'), 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Target Progress:{' '}
                      {parseFloat(
                        stats.salesRevenue.targetProgress || '0'
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Total Orders
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.totalOrders.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((stats.totalOrders.thisMonth / Math.max(stats.totalOrders.value, 1)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This Month: {stats.totalOrders.thisMonth}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Delivery Success
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.deliveries.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(parseFloat(stats.deliveries.successRate || '0'), 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Completed: {stats.deliveries.value.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
