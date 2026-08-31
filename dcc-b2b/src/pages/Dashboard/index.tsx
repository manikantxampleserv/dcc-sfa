import { Avatar, Chip } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import dayjs from 'dayjs';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { mockDeliveries } from 'mock/data/deliveries';
import { mockInvoices } from 'mock/data/invoices';
import { mockIssues } from 'mock/data/issues';
import { mockOrders } from 'mock/data/orders';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';
import { ViewButton } from 'shared/ActionButton';

const orderTrendData = [
  { month: 'Mar', orders: 3, value: 8200000 },
  { month: 'Apr', orders: 4, value: 11500000 },
  { month: 'May', orders: 5, value: 14800000 },
  { month: 'Jun', orders: 3, value: 9700000 },
  { month: 'Jul', orders: 6, value: 18200000 },
  { month: 'Aug', orders: 6, value: 18005000 },
];

const statusColors: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  delivered: 'success',
  in_transit: 'primary',
  pending_approval: 'warning',
  approved: 'primary',
  rejected: 'error',
  cancelled: 'error',
  draft: 'default',
};

const statusLabels: Record<string, string> = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  draft: 'Draft',
};

/** Main dashboard page shown after login. */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalOrders = mockOrders.length;
  const pendingApproval = mockOrders.filter(
    o => o.status === 'pending_approval'
  ).length;
  const inTransit = mockDeliveries.filter(
    d => d.status === 'out_for_delivery'
  ).length;
  const openIssues = mockIssues.filter(
    i => i.status === 'open' || i.status === 'in_progress'
  ).length;
  const overdueInvoices = mockInvoices.filter(
    i => i.status === 'overdue'
  ).length;
  const totalValue = mockOrders.reduce((s, o) => s + o.total_amount, 0);

  const recentOrders = [...mockOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const recentOrderColumns: TableColumn<typeof mockOrders[0]>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{row.order_number}</span>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Avatar className="!w-7 !h-7 !text-xs !bg-blue-100 !text-blue-700">
            {row.customer_name[0]}
          </Avatar>
          <span className="text-gray-700 text-xs">{row.customer_name}</span>
        </div>
      ),
    },
    {
      id: 'created_at',
      label: 'Date',
      render: (_, row) => (
        <span className="text-gray-500 text-xs">{dayjs(row.created_at).format('DD MMM YYYY')}</span>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amount',
      render: (_, row) => (
        <span className="font-semibold text-gray-800 text-xs">
          TZS {row.total_amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={statusLabels[row.status] ?? row.status}
          size="small"
          color={statusColors[row.status] ?? 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      render: (_, row) => (
        <ViewButton
          onClick={() => navigate(`/orders/${row.id}`)}
          size="small"
          tooltip="View Order"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.company} · {dayjs().format('dddd, D MMMM YYYY')}
          </p>
        </div>
        {user?.role === 'customer' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => navigate('/orders/place')}
          >
            Place New Order
          </Button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Pending Approval"
          value={pendingApproval}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="In Transit"
          value={inTransit}
          icon={<Truck className="w-5 h-5" />}
          color="teal"
        />
        <StatsCard
          title="Open Issues"
          value={openIssues}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="Overdue Invoices"
          value={overdueInvoices}
          icon={<FileText className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="Total Value"
          value={`TZS ${(totalValue / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Order Trend
              </h2>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              ↑ 8% vs last month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={orderTrendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="url(#colorVal)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
          {user?.role === 'customer' ? (
            <>
              <button
                onClick={() => navigate('/orders/place')}
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-left"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Place New Order
                  </p>
                  <p className="text-xs text-blue-500">
                    Browse product catalog
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/issues/raise')}
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all text-left"
              >
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    Raise an Issue
                  </p>
                  <p className="text-xs text-orange-500">Report a problem</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-all text-left"
              >
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    View Invoices
                  </p>
                  <p className="text-xs text-green-500">
                    {overdueInvoices > 0
                      ? `${overdueInvoices} overdue`
                      : 'All clear'}
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all text-left"
              >
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Submit Feedback
                  </p>
                  <p className="text-xs text-purple-500">
                    Rate your experience
                  </p>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/approvals/pending')}
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all text-left"
              >
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    Pending Approvals
                  </p>
                  <p className="text-xs text-orange-500">
                    {pendingApproval} orders await review
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-left"
              >
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    All Orders
                  </p>
                  <p className="text-xs text-blue-500">
                    View all customer orders
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/issues')}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-all text-left"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Open Issues
                  </p>
                  <p className="text-xs text-red-500">
                    {openIssues} need attention
                  </p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>
        <Table
          columns={recentOrderColumns}
          rows={recentOrders}
          pagination={false}
          compact
        />
      </div>
    </div>
  );
};

export default Dashboard;
