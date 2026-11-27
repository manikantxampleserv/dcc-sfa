import { Avatar, Chip } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useMockDb } from 'context/MockDataContext';
import dayjs from 'dayjs';
import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Package,
  PieChart as PieChartIcon,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
} from 'lucide-react';
import type { Order } from 'mock/data/orders';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

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

/**
 * Enterprise B2B Dashboard with Rich Analytics Charts
 * Follows the exact existing DCC corporate pattern, shadows, borders, and live database state.
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    orders: allOrders,
    deliveries: allDeliveries,
    issues: allIssues,
    invoices: allInvoices,
  } = useMockDb();

  const isCustomer = user?.role === 'customer';

  /** Role-based data isolation */
  const orders = useMemo(() => {
    if (!isCustomer) return allOrders;
    return allOrders.filter(
      o =>
        o.customer_sap_code === user?.sapCode ||
        o.customer_name === user?.company ||
        o.customer_name === user?.name
    );
  }, [allOrders, isCustomer, user]);

  const customerOrderNumbers = useMemo(() => {
    return new Set(orders.map(o => o.order_number));
  }, [orders]);

  const deliveries = useMemo(() => {
    if (!isCustomer) return allDeliveries;
    return allDeliveries.filter(
      d =>
        customerOrderNumbers.has(d.order_number) ||
        d.customer_name === user?.company ||
        d.customer_name === user?.name
    );
  }, [allDeliveries, isCustomer, customerOrderNumbers, user]);

  const invoices = useMemo(() => {
    if (!isCustomer) return allInvoices;
    return allInvoices.filter(
      inv =>
        customerOrderNumbers.has(inv.order_number) ||
        inv.customer_name === user?.company ||
        inv.customer_name === user?.name
    );
  }, [allInvoices, isCustomer, customerOrderNumbers, user]);

  const issues = useMemo(() => {
    if (!isCustomer) return allIssues;
    return allIssues.filter(
      iss =>
        !iss.order_number ||
        customerOrderNumbers.has(iss.order_number)
    );
  }, [allIssues, isCustomer, customerOrderNumbers]);

  const [trendMetric, setTrendMetric] = useState<'revenue' | 'orders'>(
    'revenue'
  );
  const [orderFilter, setOrderFilter] = useState<
    'all' | 'pending' | 'in_transit' | 'delivered'
  >('all');

  const totalOrders = orders.length;
  const pendingApproval = useMemo(
    () => orders.filter(o => o.status === 'pending_approval').length,
    [orders]
  );
  const inTransit = useMemo(
    () => deliveries.filter(d => d.status === 'out_for_delivery').length,
    [deliveries]
  );
  const deliveredOrders = useMemo(
    () => orders.filter(o => o.status === 'delivered').length,
    [orders]
  );
  const openIssues = useMemo(
    () =>
      issues.filter(i => i.status === 'open' || i.status === 'in_progress')
        .length,
    [issues]
  );
  const overdueInvoices = useMemo(
    () => invoices.filter(i => i.status === 'overdue').length,
    [invoices]
  );
  const totalValue = useMemo(
    () => orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    [orders]
  );

  const totalPaid = useMemo(
    () => invoices.reduce((s, inv) => s + (inv.amount_paid || 0), 0),
    [invoices]
  );
  const totalBalanceDue = useMemo(
    () => invoices.reduce((s, inv) => s + (inv.balance_due || 0), 0),
    [invoices]
  );
  const paymentCollectionRate = useMemo(() => {
    if (totalValue === 0) return 100;
    return Math.min(100, Math.round((totalPaid / totalValue) * 100));
  }, [totalPaid, totalValue]);

  const otifScore = useMemo(() => {
    if (deliveries.length === 0) return 96;
    const deliveredCount = deliveries.filter(
      d => d.status === 'delivered'
    ).length;
    return Math.round((deliveredCount / deliveries.length) * 100);
  }, [deliveries]);

  /** Realistic enterprise trend combining historical trajectory with live orders */
  const orderTrendData = useMemo(() => {
    const cur = dayjs();
    const baseTrajectories = isCustomer
      ? [2400000, 3100000, 4850000, 3900000, 4200000]
      : [8500000, 11200000, 14600000, 12800000, 16400000];
    const baseOrdersCount = isCustomer
      ? [1, 2, 2, 2, 3]
      : [3, 4, 5, 4, 6];

    const result = [];
    for (let i = 5; i >= 1; i--) {
      const mName = cur.subtract(i, 'month').format('MMM');
      const idx = 5 - i;
      result.push({
        month: mName,
        orders: baseOrdersCount[idx],
        value: baseTrajectories[idx],
      });
    }

    const currentMonthName = cur.format('MMM');
    const liveMonthValue = orders.reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );
    const liveMonthOrders = orders.length;

    result.push({
      month: currentMonthName,
      orders: liveMonthOrders,
      value: liveMonthValue > 0 ? liveMonthValue : (isCustomer ? 4850000 : 18900000),
    });

    return result;
  }, [orders, isCustomer]);

  /** Status breakdown for Donut Chart */
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {
      delivered: 0,
      in_transit: 0,
      pending_approval: 0,
      approved: 0,
      draft: 0,
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });

    return [
      { label: 'Delivered', count: counts.delivered, color: '#16A34A' },
      { label: 'In Transit', count: counts.in_transit, color: '#2563EB' },
      {
        label: 'Pending Approval',
        count: counts.pending_approval,
        color: '#EA580C',
      },
      { label: 'Approved', count: counts.approved, color: '#4F46E5' },
      { label: 'Draft / Other', count: counts.draft, color: '#64748B' },
    ].filter(item => item.count > 0);
  }, [orders]);

  /** Monthly Invoicing vs Collections Trajectory */
  const collectionsTrendData = useMemo(() => {
    const cur = dayjs();
    const baseInvoicedM = [8.5, 11.2, 14.6, 12.8, 16.4];
    const baseCollectedM = [7.8, 10.4, 13.9, 12.1, 15.2];

    const result = [];
    for (let i = 5; i >= 1; i--) {
      const mName = cur.subtract(i, 'month').format('MMM');
      const idx = 5 - i;
      result.push({
        month: mName,
        invoiced: baseInvoicedM[idx],
        collected: baseCollectedM[idx],
      });
    }

    const currentMonthName = cur.format('MMM');
    const liveBilledM = Number((totalValue / 1000000).toFixed(1)) || 18.9;
    const liveCollectedM = Number((totalPaid / 1000000).toFixed(1)) || 12.4;

    result.push({
      month: currentMonthName,
      invoiced: liveBilledM,
      collected: liveCollectedM,
    });

    return result;
  }, [totalValue, totalPaid]);

  /** Top Selling SKUs / Products */
  const topProductsData = useMemo(() => {
    const productMap: Record<
      string,
      { name: string; units: number; revenue: number }
    > = {};

    orders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.product_name;
        if (!productMap[key]) {
          productMap[key] = {
            name: item.product_name,
            units: 0,
            revenue: 0,
          };
        }
        productMap[key].units += Number(item.quantity) || 0;
        productMap[key].revenue += Number(item.total_price) || 0;
      });
    });

    const list = Object.values(productMap).sort((a, b) => b.units - a.units);
    if (list.length === 0) {
      return [
        { name: 'Bonite Water 500ml', units: 4200, revenue: 3150000 },
        { name: 'Bonite Water 1.5L', units: 2800, revenue: 3360000 },
        { name: 'Kilimanjaro Pure 500ml', units: 2100, revenue: 1890000 },
        { name: 'Safari Soda Orange', units: 1650, revenue: 1485000 },
        { name: 'Safari Soda Cola', units: 1200, revenue: 1080000 },
      ];
    }
    return list.slice(0, 5);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (orderFilter === 'pending') {
      list = list.filter(o => o.status === 'pending_approval');
    } else if (orderFilter === 'in_transit') {
      list = list.filter(o => o.status === 'in_transit');
    } else if (orderFilter === 'delivered') {
      list = list.filter(o => o.status === 'delivered');
    }

    return list.slice(0, 6);
  }, [orders, orderFilter]);

  const recentOrderColumns: TableColumn<Order>[] = useMemo(() => {
    const cols: TableColumn<Order>[] = [
      {
        id: 'order_number',
        label: 'Order #',
        render: (_, row) => (
          <span className="font-mono text-xs font-semibold text-blue-600">
            {row.order_number}
          </span>
        ),
      },
    ];

    if (!isCustomer) {
      cols.push({
        id: 'customer_name',
        label: 'Customer',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Avatar className="!w-7 !h-7 !text-xs !bg-blue-100 !text-blue-700">
              {row.customer_name?.[0] || 'C'}
            </Avatar>
            <span className="text-gray-700 text-xs font-medium">
              {row.customer_name}
            </span>
          </div>
        ),
      });
    }

    cols.push(
      {
        id: 'created_at',
        label: 'Date',
        render: (_, row) => (
          <span className="text-gray-500 text-xs">
            {dayjs(row.created_at).format('DD MMM YYYY')}
          </span>
        ),
      },
      {
        id: 'items',
        label: 'Items',
        render: (_, row) => (
          <span className="text-gray-600 text-xs font-medium">
            {row.items?.length || 0} SKUs
          </span>
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
      }
    );

    return cols;
  }, [isCustomer, navigate]);

  return (
    <div className="flex flex-col gap-4">
      {/** Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.company || 'Bonite Bottlers Ltd'} ·{' '}
            {dayjs().format('dddd, D MMMM YYYY')}
          </p>
        </div>
        {user?.role === 'customer' ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => navigate('/orders/place')}
          >
            Place New Order
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Clock className="w-4 h-4" />}
            onClick={() => navigate('/approvals/pending')}
          >
            Review Approvals ({pendingApproval})
          </Button>
        )}
      </div>

      {/** 6 KPI StatsCards */}
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

      {/** Charts Row 1: Order Trend & Order Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/** Order Trend AreaChart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  {trendMetric === 'revenue'
                    ? 'Revenue Trajectory'
                    : 'Order Volume Trajectory'}
                </h2>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  ↑ 12.8% vs last month
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Last 6 months performance
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium text-gray-600">
              <button
                type="button"
                onClick={() => setTrendMetric('revenue')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  trendMetric === 'revenue'
                    ? 'bg-white text-blue-600 font-semibold shadow-sm'
                    : 'hover:text-gray-900'
                }`}
              >
                Revenue (TZS)
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric('orders')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  trendMetric === 'orders'
                    ? 'bg-white text-blue-600 font-semibold shadow-sm'
                    : 'hover:text-gray-900'
                }`}
              >
                Volume (Orders)
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210} minWidth={0}>
            <AreaChart data={orderTrendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis
                tickFormatter={(v: number) =>
                  trendMetric === 'revenue'
                    ? `${(v / 1000000).toFixed(0)}M`
                    : `${v}`
                }
                tick={{ fontSize: 11, fill: '#6B7280' }}
              />
              <Tooltip
                formatter={(val: any) => [
                  trendMetric === 'revenue'
                    ? `TZS ${(Number(val) || 0).toLocaleString()}`
                    : `${val} Orders`,
                  trendMetric === 'revenue' ? 'Billed Revenue' : 'Order Count',
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={trendMetric === 'revenue' ? 'value' : 'orders'}
                stroke="#3B82F6"
                fill="url(#colorVal)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-gray-100 mt-3 text-center text-xs">
            <div>
              <span className="text-gray-400">Total Billed</span>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                TZS {(totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <span className="text-gray-400">Avg Monthly Growth</span>
              <p className="font-bold text-green-600 text-sm mt-0.5">+14.2%</p>
            </div>
            <div>
              <span className="text-gray-400">Pipeline Orders</span>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                {totalOrders} Active
              </p>
            </div>
          </div>
        </div>

        {/** Order Status Funnel Donut Chart (1 Col) */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800">
                Order Status Funnel
              </h2>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              {totalOrders} Total
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Orders`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
            {statusChartData.map(item => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/** Charts Row 2: Invoicing vs Collections & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/** Invoicing vs Collections Trajectory (BarChart) */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-500" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Invoicing vs Payment Collections
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Monthly invoiced totals against actual payment cash-ins
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Invoiced
              </span>
              <span className="flex items-center gap-1.5 text-green-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />{' '}
                Collected
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210} minWidth={0}>
            <BarChart
              data={collectionsTrendData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis
                tickFormatter={v => `${v}M`}
                tick={{ fontSize: 11, fill: '#6B7280' }}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `TZS ${Number(val).toFixed(1)}M`,
                  name === 'invoiced' ? 'Invoiced Amount' : 'Collected Payment',
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="invoiced"
                fill="#93C5FD"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="collected"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3 text-xs text-gray-600">
            <span>Overall Collection Efficiency:</span>
            <span className="font-bold text-green-700">
              {paymentCollectionRate}% Collected
            </span>
          </div>
        </div>

        {/** Top Selling SKUs / Demand Mix (Horizontal BarChart) */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Top Selling Products & Demand Mix
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Top performing items ranked by units ordered
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              Volume (Units)
            </span>
          </div>

          <ResponsiveContainer width="100%" height={210} minWidth={0}>
            <BarChart
              data={topProductsData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#374151' }}
                width={125}
              />
              <Tooltip
                formatter={(val: any) => [
                  `${Number(val).toLocaleString()} units`,
                  'Quantity Sold',
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="units"
                fill="#3B82F6"
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3 text-xs text-gray-600">
            <span>Leading Product:</span>
            <span className="font-bold text-gray-900">
              {topProductsData[0]?.name || 'Bonite Water 500ml'} (
              {topProductsData[0]?.units?.toLocaleString() || '4,200'} units)
            </span>
          </div>
        </div>
      </div>

      {/** Clean Operational Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/** Invoice & Payment Collection Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Payment Collection & Invoicing Health
                </h2>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {paymentCollectionRate}% Collected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 text-xs">
              <div>
                <span className="text-gray-400">Total Billed</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  TZS {(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <span className="text-gray-400">Paid / Received</span>
                <p className="font-bold text-green-700 text-sm mt-0.5">
                  TZS {(totalPaid / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <span className="text-gray-400">Balance Due</span>
                <p className="font-bold text-amber-700 text-sm mt-0.5">
                  TZS {(totalBalanceDue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                style={{ width: `${paymentCollectionRate}%` }}
                className="bg-green-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/** Logistics & Delivery Status Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Logistics & Fulfillment Accuracy (OTIF)
                </h2>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                {otifScore}% OTIF Score
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 text-xs">
              <div>
                <span className="text-gray-400">Dispatches</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {deliveries.length} Total
                </p>
              </div>
              <div>
                <span className="text-gray-400">Out for Delivery</span>
                <p className="font-bold text-blue-700 text-sm mt-0.5">
                  {inTransit} on road
                </p>
              </div>
              <div>
                <span className="text-gray-400">Scheduled Runs</span>
                <p className="font-bold text-gray-800 text-sm mt-0.5">
                  {deliveries.filter(d => d.status === 'scheduled').length}{' '}
                  planned
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                style={{ width: `${otifScore}%` }}
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/** Quick Actions Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
          Operational Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {user?.role === 'customer' ? (
            <>
              <button
                onClick={() => navigate('/orders/place')}
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-left cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Place New Order
                  </p>
                  <p className="text-xs text-blue-500">Catalog & bulk cart</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/issues/raise')}
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all text-left cursor-pointer"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    Raise an Issue
                  </p>
                  <p className="text-xs text-orange-500">
                    Report shortage / damage
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
              >
                <FileText className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Invoices & Receipts
                  </p>
                  <p className="text-xs text-green-500">
                    {overdueInvoices > 0
                      ? `${overdueInvoices} overdue`
                      : 'Statements clear'}
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 text-purple-600 shrink-0" />
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
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all text-left cursor-pointer"
              >
                <Clock className="w-5 h-5 text-orange-600 shrink-0" />
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
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-left cursor-pointer"
              >
                <Package className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    All Orders
                  </p>
                  <p className="text-xs text-blue-500">
                    Complete order directory
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/deliveries/schedule')}
                className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-all text-left cursor-pointer"
              >
                <Truck className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    Delivery Schedule
                  </p>
                  <p className="text-xs text-teal-500">
                    {inTransit} in transit on road
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate('/issues')}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-all text-left cursor-pointer"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
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

      {/** Recent Orders with Filter Pills */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-800">
              Recent Orders
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  orderFilter === 'all'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('pending')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  orderFilter === 'pending'
                    ? 'bg-orange-100 text-orange-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Pending ({pendingApproval})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('in_transit')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  orderFilter === 'in_transit'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                In Transit ({inTransit})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('delivered')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  orderFilter === 'delivered'
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Delivered ({deliveredOrders})
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            View all →
          </button>
        </div>

        <Table
          columns={recentOrderColumns}
          rows={filteredOrders}
          pagination={false}
          compact
        />
      </div>
    </div>
  );
};

export default Dashboard;
