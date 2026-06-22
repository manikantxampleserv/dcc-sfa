import { MenuItem, Chip, Tooltip, Avatar, Skeleton } from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
} from 'chart.js';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  RotateCcw,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import {
  useGradingStats,
  usePendingGradingRequests,
  useProcessGradingRequest,
} from '../../../hooks/useGradingDashboard';
import type { PendingGradingRequest } from '../../../services/dashboards/gradingDashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const GradingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'upgrade' | 'downgrade' | 'no_change'
  >('all');

  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: isFetchingStats,
  } = useGradingStats();
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isFetching: isFetchingRequests,
  } = usePendingGradingRequests({
    search,
    page,
    limit,
    change_type: typeFilter,
  });

  const processRequestMutation = useProcessGradingRequest();

  const handleAction = (requestId: number, action: 'approve' | 'reject') =>
    processRequestMutation.mutate({ requestId, action });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const HeaderSkeleton = () => (
    <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-100 mb-4">
      <div className="flex flex-row justify-between items-center">
        <div className="flex-1">
          <Skeleton variant="text" width={280} height={32} className="!mb-2" />
          <Skeleton variant="text" width={400} height={20} />
        </div>
      </div>
    </div>
  );

  const StatsCardSkeleton = () => (
    <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="text" width={64} height={32} />
        </div>
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          className="!bg-gray-100"
        />
      </div>
    </div>
  );

  const ChartSkeleton = ({ height = 250 }: { height?: number }) => (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between w-10">
            {[1, 2, 3, 4].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={30}
                height={12}
                className="!bg-gray-100"
              />
            ))}
          </div>
          <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-between gap-2 px-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="12%"
                style={{ height: `${40 + (i % 3) * 20}%` }}
                className="!bg-gray-100 !rounded-t"
              />
            ))}
          </div>
          <div className="absolute left-10 right-0 bottom-0 h-8 flex items-center justify-between px-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={40}
                height={12}
                className="!bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DoughnutChartSkeleton = () => (
    <div className="h-[250px] w-full flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <Skeleton
          variant="circular"
          width={180}
          height={180}
          className="!bg-gray-100"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-[100px] h-[100px]" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Skeleton
            variant="rectangular"
            width={12}
            height={12}
            className="!rounded"
          />
          <Skeleton variant="text" width={60} height={14} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton
            variant="rectangular"
            width={12}
            height={12}
            className="!rounded"
          />
          <Skeleton variant="text" width={60} height={14} />
        </div>
      </div>
    </div>
  );

  const isLoading = statsLoading || requestsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <Skeleton
              variant="text"
              width={180}
              height={24}
              className="!mb-4"
            />
            <DoughnutChartSkeleton />
          </div>
          <div className="md:col-span-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <Skeleton
              variant="text"
              width={150}
              height={24}
              className="!mb-4"
            />
            <ChartSkeleton height={250} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex justify-between mb-4">
            <Skeleton
              variant="rectangular"
              width={320}
              height={40}
              className="!rounded-lg"
            />
            <Skeleton
              variant="rectangular"
              width={192}
              height={40}
              className="!rounded-lg"
            />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex items-center gap-4 py-2 border-b border-gray-50"
              >
                <Skeleton
                  variant="rectangular"
                  width={40}
                  height={40}
                  className="!rounded-lg"
                />
                <div className="flex-1">
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="20%" height={14} />
                </div>
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  className="!rounded-full"
                />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  className="!rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const tableData = requestsData?.data || [];

  const stats = {
    total: statsData?.pending ?? 0,
    to_grade: statsData?.pending_upgrades ?? 0,
    to_degrade: statsData?.pending_downgrades ?? 0,
    processed: (statsData?.changed ?? 0) + (statsData?.retained ?? 0),
  };

  const doughnutData = {
    labels: ['Upgrades', 'Downgrades'],
    datasets: [
      {
        data: [stats.to_grade, stats.to_degrade],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: statsData?.category_distribution.map(cd => cd.categoryName) ?? [],
    datasets: [
      {
        label: 'Current Outlets',
        data:
          statsData?.category_distribution.map(cd => cd.customerCount) ?? [],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  const columns: TableColumn<PendingGradingRequest>[] = [
    {
      id: 'category_grading_customers.name',
      label: 'Outlet',
      sortable: true,
      render: (_, row) => (
        <div
          className="flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors group"
          onClick={() =>
            navigate(`/masters/outlets/${row.category_grading_customers.id}`)
          }
        >
          <Avatar
            variant="rounded"
            className="!bg-primary-50 !text-primary-600 group-hover:!bg-primary-100 transition-colors !w-10 !h-10"
          >
            <Store className="w-5 h-5" />
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {row.category_grading_customers.name}
            </div>
            <div className="text-xs text-gray-500">
              {row.category_grading_customers.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'current_category_id',
      label: 'Current',
      sortable: true,
      render: (_, row) => {
        const categoryName =
          row.customer_category_grading_current_category?.category_name ||
          'Unassigned';
        return <Chip label={categoryName} variant="filled" />;
      },
    },
    {
      id: 'upcoming_category_id',
      label: 'Upcoming',
      sortable: true,
      render: (_, row) => {
        const categoryName =
          row.customer_category_grading_upcoming_category?.category_name ||
          'Unknown';

        let icon = null;
        let color: 'success' | 'error' | 'info' = 'info';

        if (row.change_type === 'upgrade') {
          icon = <ArrowUpCircle className="w-4 h-4 text-green-500" />;
          color = 'success';
        } else if (row.change_type === 'downgrade') {
          icon = <ArrowDownCircle className="w-4 h-4 text-red-500" />;
          color = 'error';
        } else if (row.change_type === 'no_change') {
          icon = <CheckCircle2 className="w-4 h-4 text-primary-500" />;
          color = 'info';
        }

        return (
          <div className="flex flex-row items-center gap-2">
            {icon}
            <Chip label={categoryName} color={color} variant="filled" />
          </div>
        );
      },
    },
    {
      id: 'reason',
      label: 'Condition & Performance',
      hideable: true,
      render: (_, row) => {
        const conditions =
          row.customer_category_grading_upcoming_category
            ?.customer_category_condition_customer_category || [];
        return (
          <div className="space-y-1">
            {conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {conditions.map(cond => (
                  <Tooltip
                    key={cond.id}
                    title={cond.condition_description || ''}
                    arrow
                    placement="top"
                  >
                    <Chip
                      label={`${cond.condition_type.replace(/_/g, ' ')} ${cond.condition_operator} ${cond.threshold_value}`}
                      size="small"
                      variant="outlined"
                      className="!text-[10px] !h-5"
                    />
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed">
                {row.reason || 'No performance data available'}
              </div>
            )}
            {row.notes && (
              <div className="text-xs text-primary-600 font-medium italic">
                Notes: {row.notes}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (status: string) => {
        const statusMap: Record<
          string,
          { label: string; color: 'warning' | 'success' | 'error' | 'default' }
        > = {
          P: { label: 'Pending', color: 'warning' },
          C: { label: 'Changed', color: 'success' },
          R: { label: 'Retained', color: 'default' },
        };
        const mappedStatus = statusMap[status] || {
          label: status,
          color: 'default',
        };

        return (
          <Chip
            label={mappedStatus.label}
            color={mappedStatus.color}
            className="!capitalize"
            variant="filled"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => {
        if (row.status !== 'P') {
          return <span className="text-xs italic text-gray-400">Actioned</span>;
        }
        return (
          <div className="flex flex-row items-center justify-center gap-2">
            <Button
              size="small"
              variant="outlined"
              startIcon={<RotateCcw className="w-3 h-3" />}
              onClick={() => handleAction(row.id, 'reject')}
              disabled={processRequestMutation.isPending}
              className="!text-[11px] !py-1"
            >
              Retain
            </Button>
            <Button
              size="small"
              variant="contained"
              color={
                row.change_type === 'upgrade'
                  ? 'success'
                  : row.change_type === 'downgrade'
                    ? 'error'
                    : 'primary'
              }
              startIcon={<CheckCircle2 className="w-3 h-3" />}
              onClick={() => handleAction(row.id, 'approve')}
              disabled={processRequestMutation.isPending}
              className="!text-[11px] !py-1"
            >
              {row.change_type === 'no_change' ? 'Same' : 'Change'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="!font-bold text-xl !text-gray-900">
            Grading Insights Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Intelligent analysis of outlet performance for category adjustment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Analysis Total"
          value={stats.total}
          icon={<RotateCcw className="w-6 h-6" />}
          color="blue"
          isLoading={isFetchingStats}
        />
        <StatsCard
          title="Eligible Upgrades"
          value={stats.to_grade}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isFetchingStats}
        />
        <StatsCard
          title="Risk Alerts"
          value={stats.to_degrade}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
          isLoading={isFetchingStats}
        />
        <StatsCard
          title="Completed Review"
          value={stats.processed}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="purple"
          isLoading={isFetchingStats}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full">
          <h3 className="text-base font-bold mb-4 text-gray-900">
            Adjustment Distribution
          </h3>
          <div className="h-[250px] flex justify-center items-center">
            <Doughnut
              data={doughnutData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="md:col-span-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full">
          <h3 className="text-base font-bold mb-4 text-gray-900">
            Category Summary
          </h3>
          <div className="h-[250px]">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      <Table
        data={tableData}
        getRowId={row => row.id}
        tableId="grading-dashboard-table"
        initialOrder="asc"
        stickyHeader
        columns={columns}
        loading={isFetchingRequests}
        totalCount={requestsData?.pagination?.total_count || 0}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage="No pending category reminders found."
        actions={
          <div className="flex justify-between flex-1 items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Outlets..."
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                className="!w-80"
              />
              <Select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="!w-48"
                disableClearable
              >
                <MenuItem value="all">All Type</MenuItem>
                <MenuItem value="upgrade">Upgrades</MenuItem>
                <MenuItem value="downgrade">Downgrades</MenuItem>
                <MenuItem value="no_change">No Change</MenuItem>
              </Select>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default GradingDashboard;
