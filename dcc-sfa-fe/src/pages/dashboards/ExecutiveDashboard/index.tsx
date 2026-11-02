import {
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { Avatar, Button, Skeleton } from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useAuditLogs } from 'hooks/useAuditLogs';
import { useCurrency } from 'hooks/useCurrency';
import { useExecutiveDashboardOverview } from 'hooks/useExecutiveDashboard';
import { useRequestsByUsersWithoutPermission } from 'hooks/useRequests';
import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import type { AuditLogData } from 'services/auditLogs';
import type { Request } from 'services/requests';
import ApprovalModal from 'shared/ApprovalModal';
import { formatDateTime } from 'utils/dateUtils';

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
  const navigate = useNavigate();
  const { data: dashboardOverview, isLoading: dashboardLoading } =
    useExecutiveDashboardOverview(30, 5);

  const stats = dashboardOverview?.statistics;
  const salesData = dashboardOverview?.salesPerformance;
  const topProducts = dashboardOverview?.topProducts;
  const orderStatus = dashboardOverview?.orderStatus;

  const { data: pendingApprovals, isLoading: approvalsLoading } =
    useRequestsByUsersWithoutPermission({
      page: 1,
      limit: 10,
      status: 'P',
    });
  const { data: auditLogs, isLoading: auditLogsLoading } = useAuditLogs({
    page: 1,
    limit: 5,
  });
  const { formatCurrency } = useCurrency();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');

  const handleApproveClick = (request: Request) => {
    setSelectedRequest(request);
    setModalType('approve');
    setApprovalModalOpen(true);
  };

  const handleRejectClick = (request: Request) => {
    setSelectedRequest(request);
    setModalType('reject');
    setApprovalModalOpen(true);
  };

  const handleModalClose = () => {
    setApprovalModalOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 200);
  };

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
        iconText: string;
        progress: string;
      };
    } = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
        iconText: 'text-blue-600',
        progress: 'bg-blue-500',
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        icon: 'bg-pink-100',
        iconText: 'text-pink-600',
        progress: 'bg-pink-500',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        icon: 'bg-cyan-100',
        iconText: 'text-cyan-600',
        progress: 'bg-cyan-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
        iconText: 'text-green-600',
        progress: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
        iconText: 'text-purple-600',
        progress: 'bg-purple-500',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100',
        iconText: 'text-orange-600',
        progress: 'bg-orange-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const stats_cards = [
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices.value.toLocaleString() || '0',
      description: `${stats?.totalInvoices.growthPercentage || '0'}% This Month`,
      icon: ReceiptIcon,
      color: 'blue',
      progress: stats
        ? Math.min(
            (stats.totalInvoices.thisMonth / stats.totalInvoices.value) * 100,
            100
          )
        : 0,
    },
    {
      title: 'Sales Revenue',
      value: formatCurrency(
        stats?.salesRevenue.value || 0,
        stats?.salesRevenue.formatted
      ),
      description: `${stats?.salesRevenue.growthPercentage || '0'}% vs Target`,
      icon: AttachMoneyIcon,
      color: 'green',
      progress: stats ? parseFloat(stats.salesRevenue.targetProgress) : 0,
    },
    {
      title: 'Active Outlets',
      value: stats?.activeOutlets.value.toLocaleString() || '0',
      description: `${stats?.activeOutlets.thisWeek || 0} New This Week`,
      icon: PeopleIcon,
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
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#14b8a6',
          '#f97316',
          '#6366f1',
        ],
        borderWidth: 0,
      },
    ],
  };

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

  const invoicesData =
    salesData?.invoices || new Array(lineChartLabels.length).fill(0);
  const composedChartDataValue = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Sales',
        data: salesData?.sales || [],
        backgroundColor: 'rgba(255, 99, 132, 0.45)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderRadius: 2,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Invoices',
        data: invoicesData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        borderRadius: 2,
        borderSkipped: false,
        yAxisID: 'y1',
      },
    ],
  };

  const hasLineChartData = lineChartLabels.length > 0;
  const hasPieChartData = pieChartLabels.length > 0;
  const hasAreaChartData = lineChartLabels.length > 0;
  const hasComposedChartData = lineChartLabels.length > 0;
  const hasTopProductsData =
    barChartLabels.length > 0 &&
    (topProducts?.quantities || []).some(qty => Number(qty) > 0);

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
          label: (context: any) =>
            `Daily Sales: ${formatCurrency(context.parsed.y)}`,
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

  const topProductsDoughnutOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const fullName = barChartFullNames[index];
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${fullName || context.label}: ${context.parsed.toLocaleString()} Units (${percentage}%)`;
          },
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
            return `${context.label}: ${context.parsed} Invoices (${percentage}%)`;
          },
        },
      },
    },
  };

  const composedChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: false,
          boxWidth: 32,
          boxHeight: 14,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            if (datasetLabel === 'Invoices') {
              return `${datasetLabel}: ${value?.toLocaleString?.() ?? value} Invoices`;
            }
            return `${datasetLabel}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sales Amount',
          font: { size: 12, weight: 'bold' as const },
        },
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Invoices Count',
          font: { size: 12, weight: 'bold' as const },
        },
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const isLoading = dashboardLoading || approvalsLoading || auditLogsLoading;

  // Stats Card Skeleton Component
  const StatsCardSkeleton = () => (
    <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          className="!bg-gray-200"
        />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <Skeleton variant="text" width={100} height={32} />
        <Skeleton variant="text" width={140} height={16} />
      </div>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={8}
        className="!rounded-full !bg-gray-200"
      />
    </div>
  );

  // Chart Skeleton Component
  const ChartSkeleton = ({ height = 288 }: { height?: number }) => (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="absolute inset-0 flex flex-col">
        {/* Chart Area */}
        <div className="flex-1 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between w-12">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={40}
                height={12}
                className="!bg-gray-200"
              />
            ))}
          </div>

          {/* Chart bars/lines */}
          <div className="absolute left-12 right-0 top-0 bottom-12 flex items-end justify-between gap-2 px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="8%"
                style={{
                  height: `${60 + (i % 3) * 15}%`,
                }}
                className="!bg-gray-200 !rounded-t"
              />
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute left-12 right-0 bottom-0 h-12 flex items-center justify-between px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={30}
                height={12}
                className="!bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DoughnutChartSkeleton = () => (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <Skeleton
          variant="circular"
          width={200}
          height={200}
          className="!bg-gray-200"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            className="!bg-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton
              variant="rectangular"
              width={12}
              height={12}
              className="!bg-gray-200 !rounded"
            />
            <Skeleton variant="text" width={80} height={14} />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Revenue Trend & Invoices by Salesman */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
              <Skeleton
                variant="text"
                width={150}
                height={24}
                className="!mb-4"
              />
              <ChartSkeleton height={288} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
              <Skeleton
                variant="text"
                width={180}
                height={24}
                className="!mb-4"
              />
              <DoughnutChartSkeleton />
            </div>
          </div>
        </div>

        {/* Top Selling Products & Pending Approvals */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
              <Skeleton
                variant="text"
                width={220}
                height={24}
                className="!mb-4"
              />
              <DoughnutChartSkeleton />
            </div>
          </div>
          <div className="col-span-2">
            <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  className="!rounded"
                />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={10}
                      className="!mb-2"
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={10}
                      className="!mb-3"
                    />
                    <div className="flex gap-2">
                      <Skeleton variant="rectangular" width={80} height={12} />
                      <Skeleton variant="rectangular" width={80} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Composed Chart */}
        <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
          <Skeleton variant="text" width={250} height={24} className="!mb-4" />
          <ChartSkeleton height={320} />
        </div>

        {/* Sales Performance & Activity Logs */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
            <Skeleton
              variant="text"
              width={250}
              height={24}
              className="!mb-4"
            />
            <ChartSkeleton height={288} />
          </div>
          <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <Skeleton variant="text" width={160} height={24} />
              <Skeleton
                variant="rectangular"
                width={72}
                height={28}
                className="!rounded"
              />
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-start gap-2 pb-3">
                  <Skeleton
                    variant="rounded"
                    width={32}
                    height={32}
                    className="!rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={16}
                      className="!mb-1"
                    />
                    <Skeleton variant="text" width="40%" height={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats_cards.map(stat => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.title}
              className="bg-white shadow-sm p-5 rounded-lg border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </span>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.icon} ${colors.iconText}`}
                >
                  <stat.icon sx={{ fontSize: 20 }} />
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {hasAreaChartData && (
            <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Trend
              </h3>
              {dashboardLoading ? (
                <ChartSkeleton height={288} />
              ) : (
                <div className="h-72 w-full">
                  <Line data={areaChartDataValue} options={lineChartOptions} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invoices by Salesman
            </h3>
            {dashboardLoading ? (
              <DoughnutChartSkeleton />
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
                    <AssignmentIcon sx={{ fontSize: 48 }} />
                  </div>
                  <span className="text-gray-500">
                    No invoice data available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products (Last 30 Days)
          </h3>
          {dashboardLoading ? (
            <ChartSkeleton height={288} />
          ) : hasTopProductsData ? (
            <div className="h-72 w-full flex items-center justify-center">
              <Doughnut
                data={barChartDataValue}
                options={topProductsDoughnutOptions}
              />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center flex flex-col justify-center items-center gap-2">
                <AssignmentIcon className="!text-5xl rounded-lg p-2 bg-blue-200 text-blue-500" />
                <span className="text-gray-500">
                  No top selling products available
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm col-span-2 p-5 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Approvals
            </h3>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/workflows/approvals')}
            >
              View All
            </Button>
          </div>
          {approvalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    className="!mb-2"
                  />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={16}
                    className="!mb-3"
                  />
                  <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingApprovals?.data && pendingApprovals.data.length > 0 ? (
            <div className="space-y-2 max-h-72 hide-scrollbar overflow-y-auto">
              {pendingApprovals.data.map(request => {
                const requesterName =
                  request.requester?.name || `User #${request.requester_id}`;
                const requestTypeLabel = request.request_type
                  .replace(/_/g, ' ')
                  .replace(
                    /\w\S*/g,
                    txt => txt.charAt(0) + txt.substr(1).toLowerCase()
                  );

                const getReferenceNumber = (req: Request): string => {
                  if (req.reference_details) {
                    if (
                      req.request_type === 'ORDER_APPROVAL' &&
                      req.reference_details.order_number
                    ) {
                      return req.reference_details.order_number;
                    }
                    if (
                      req.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
                      req.reference_details.movement_number
                    ) {
                      return req.reference_details.movement_number;
                    }
                    if (
                      req.request_type === 'LOCATION_RESET' &&
                      req.reference_details.customer_code
                    ) {
                      return req.reference_details.customer_code;
                    }
                  }

                  if (req.request_data) {
                    try {
                      const data = JSON.parse(req.request_data);
                      if (req.request_type === 'CUSTOMER_CREATION') {
                        return (
                          data.customer_data?.code ||
                          req.reference_details?.customer_code ||
                          `NEW-CUST-${req.id}`
                        );
                      }
                      if (req.request_type === 'LOCATION_RESET') {
                        return (
                          data.customer_code ||
                          req.reference_details?.customer_code ||
                          `LOC-${req.reference_id || req.id}`
                        );
                      }
                    } catch (e) {
                      console.error('Error parsing request data:', e);
                    }
                  }

                  return req.reference_id
                    ? `#${req.reference_id}`
                    : `REQ-${req.id}`;
                };

                const referenceNumber = getReferenceNumber(request);

                const approvalStatus =
                  request.approvals?.[0]?.status || request.status;

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex justify-between items-center gap-2 flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 text-sm">
                          {referenceNumber}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs leading-tight block mb-3">
                      <span className="font-medium text-gray-800">
                        {requesterName}
                      </span>{' '}
                      has requested{' '}
                      <span className="font-medium text-gray-800">
                        {requestTypeLabel}
                      </span>
                      {request.request_type === 'ORDER_APPROVAL' && (
                        <>
                          {' '}
                          for order{' '}
                          <span className="font-semibold text-blue-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'ASSET_MOVEMENT_APPROVAL' && (
                        <>
                          {' '}
                          for asset movement{' '}
                          <span className="font-semibold text-green-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'CUSTOMER_CREATION' && (
                        <>
                          {' '}
                          for new customer{' '}
                          <span className="font-semibold text-purple-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'LOCATION_RESET' && (
                        <>
                          {' '}
                          for relocation{' '}
                          <span className="font-semibold text-orange-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {request.createdate && (
                          <span className="text-gray-500 text-xs">
                            {formatDateTime(request.createdate.toString())}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={() => handleApproveClick(request)}
                          disabled={
                            approvalStatus?.toUpperCase() !== 'P' &&
                            approvalStatus?.toUpperCase() !== 'PENDING'
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={() => handleRejectClick(request)}
                          disabled={
                            approvalStatus?.toUpperCase() !== 'P' &&
                            approvalStatus?.toUpperCase() !== 'PENDING'
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center flex flex-col justify-center items-center gap-2">
                <AssignmentIcon className="!text-5xl rounded-lg p-2 bg-blue-200 text-blue-500" />
                <span className="text-gray-500">No pending approvals</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sales vs Invoices Performance
        </h3>
        {dashboardLoading ? (
          <ChartSkeleton height={320} />
        ) : hasComposedChartData ? (
          <div className="h-80 w-full">
            <Bar
              data={composedChartDataValue as any}
              options={composedChartOptions}
            />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center flex flex-col justify-center items-center gap-2">
              <AssignmentIcon className="!text-5xl rounded-lg p-2 bg-blue-200 text-blue-500" />
              <span className="text-gray-500">
                No performance data available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sales Performance & Trends and Activity Logs Side by Side */}
      <div className="grid grid-cols-1  gap-4">
        {/* Sales Performance & Trends */}
        {hasLineChartData && (
          <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Performance & Trends
            </h3>
            {dashboardLoading ? (
              <ChartSkeleton height={288} />
            ) : (
              <div className="h-72 w-full">
                <Line data={lineChartDataValue} options={lineChartOptions} />
              </div>
            )}
          </div>
        )}

        {auditLogs?.logs && auditLogs.logs.length > 0 && (
          <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Recent Activity Logs
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {auditLogs.logs.length}
                </span>
              </div>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/reports/audit-logs')}
                sx={{
                  textTransform: 'none',
                  fontSize: '12px',
                  height: '28px',
                  px: 1.5,
                }}
              >
                View All
              </Button>
            </div>

            {auditLogsLoading ? (
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-start gap-2 pb-3">
                    <Skeleton
                      variant="rounded"
                      width={32}
                      height={32}
                      className="!rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                        className="!mb-1"
                      />
                      <Skeleton variant="text" width="40%" height={13} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-h-80 hide-scrollbar overflow-y-auto space-y-2">
                {auditLogs.logs.slice(0, 5).map((log: AuditLogData) => (
                  <div
                    key={log.id}
                    className="flex items-start border-b border-gray-200 pb-2 gap-2 hover:bg-gray-50/70 transition-colors"
                  >
                    <Avatar
                      src={log.user_avatar || undefined}
                      alt={log.user_name?.trim()}
                      className="!rounded !bg-blue-100 !text-blue-600 !w-10 !h-10"
                    >
                      {log.user_name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm text-gray-700 font-semibold">
                        <span className="font-normal text-[#52a477]">
                          {log.user_name}
                        </span>{' '}
                        <span className="text-gray-500 font-normal">
                          {log.action === 'CREATE'
                            ? 'created'
                            : log.action === 'UPDATE'
                              ? 'updated'
                              : 'deleted'}
                        </span>{' '}
                        <span className="font-medium text-gray-800 capitalize">
                          {log.table_name?.replaceAll('_', ' ')}
                        </span>
                      </p>
                      <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap leading-tight">
                        {log.record_name ? (
                          <span className="text-gray-500 truncate max-w-[280px]">
                            {log.record_name}
                          </span>
                        ) : log.record_id ? (
                          <span className="font-mono text-gray-400">
                            #{log.record_id}
                          </span>
                        ) : null}
                        {(log.record_name || log.record_id) && (
                          <span className="text-gray-300">•</span>
                        )}
                        <span className="text-gray-400">
                          {formatDateTime(log.changed_at.toString())}
                        </span>
                        {(log.employee_id || log.user_email) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 truncate max-w-[150px]">
                              {log.employee_id || log.user_email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Approval Modal */}
      <ApprovalModal
        open={approvalModalOpen}
        onClose={handleModalClose}
        request={selectedRequest}
        type={modalType}
      />
    </div>
  );
};

export default ExecutiveDashboard;
