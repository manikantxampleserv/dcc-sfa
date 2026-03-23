import { MenuItem, Chip } from '@mui/material';
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

const OutletCategoryReminders: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<'all' | 'upgrade' | 'downgrade'>(
    'all'
  );

  const { data: statsData, isFetching: isFetchingStats } = useGradingStats();
  const { data: requestsData, isFetching: isFetchingRequests } =
    usePendingGradingRequests({
      search,
      page,
      limit,
      change_type: typeFilter,
    });

  const processRequestMutation = useProcessGradingRequest();

  const handleAction = (requestId: number, action: 'approve' | 'reject') => {
    processRequestMutation.mutate({ requestId, action });
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const filteredData = requestsData?.data?.filter(
    item =>
      item.category_grading_customers.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.category_grading_customers.code
        .toLowerCase()
        .includes(search.toLowerCase())
  );

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
        <div className="flex flex-row items-center gap-2">
          <div className="p-2 bg-blue-50 rounded">
            <Store className="w-5 h-h text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
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
          statsData?.all_categories.find(c => c.id === row.current_category_id)
            ?.category_name || 'Unknown';
        return <Chip label={categoryName} variant="filled" />;
      },
    },
    {
      id: 'upcoming_category_id',
      label: 'Upcoming',
      sortable: true,
      render: (_, row) => {
        const categoryName =
          statsData?.all_categories.find(c => c.id === row.upcoming_category_id)
            ?.category_name || 'Unknown';
        return (
          <div className="flex flex-row items-center gap-2">
            {row.change_type === 'upgrade' ? (
              <ArrowUpCircle className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
            )}
            <Chip
              label={categoryName}
              color={row.change_type === 'upgrade' ? 'success' : 'error'}
              variant="filled"
            />
          </div>
        );
      },
    },
    {
      id: 'reason',
      label: 'Condition & Performance',
      hideable: true,
      render: (_, row) => (
        <div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {row.reason || 'No reason provided'}
          </div>
          {row.notes && (
            <div className="text-xs text-blue-600 font-medium">
              Notes: {row.notes}
            </div>
          )}
        </div>
      ),
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
              color={row.change_type === 'upgrade' ? 'success' : 'error'}
              startIcon={<CheckCircle2 className="w-3 h-3" />}
              onClick={() => handleAction(row.id, 'approve')}
              disabled={processRequestMutation.isPending}
              className="!text-[11px] !py-1"
            >
              Change
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
        />
        <StatsCard
          title="Eligible Upgrades"
          value={stats.to_grade}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Risk Alerts"
          value={stats.to_degrade}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          title="Completed Review"
          value={stats.processed}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="purple"
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
        data={filteredData || []}
        columns={columns}
        getRowId={row => row.id}
        tableId="grading-dashboard-table"
        initialOrder="asc"
        stickyHeader
        maxHeight="500px"
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
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="grade">Upgrades Only</MenuItem>
                <MenuItem value="degrade">Downgrades Only</MenuItem>
              </Select>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default OutletCategoryReminders;
