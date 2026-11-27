import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { CheckCircle, Clock, Package, TrendingUp, Truck } from 'lucide-react';
import type { Order, OrderStatus } from 'mock/data/orders';
import { useAuth } from 'context/AuthContext';
import { useMockDb } from 'context/MockDataContext';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, ViewButton } from 'shared/ActionButton';
import Input from 'shared/Input';
import ScheduleDeliveryModal from 'shared/ScheduleDeliveryModal';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

const statusColors: Record<
  OrderStatus,
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

const statusLabels: Record<OrderStatus, string> = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  draft: 'Draft',
};

/** My Orders list page with search and status filter. */
const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders: allOrders } = useMockDb();
  const isCustomer = user?.role === 'customer';

  /** Filter orders based on user role */
  const orders = useMemo(() => {
    if (!isCustomer) return allOrders;
    return allOrders.filter(
      o =>
        o.customer_sap_code === user?.sapCode ||
        o.customer_name === user?.company ||
        o.customer_name === user?.name
    );
  }, [allOrders, isCustomer, user]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [selectedOrderNum, setSelectedOrderNum] = useState<string | undefined>(undefined);

  const totalOrders = orders.length;
  const pendingApproval = orders.filter(
    o => o.status === 'pending_approval'
  ).length;
  const deliveredOrders = orders.filter(
    o => o.status === 'delivered'
  ).length;
  const totalValue = orders.reduce((s, o) => s + o.total_amount, 0);

  const filtered = useMemo(() => {
    return orders
      .filter(o => {
        const matchSearch =
          !search.trim() ||
          o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
        const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
        return timeB - timeA || b.id - a.id;
      });
  }, [orders, search, statusFilter]);

  const columns: TableColumn<Order>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {row.order_number}
        </span>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">
            {row.customer_name}
          </p>
          <p className="text-xs text-gray-400">{row.customer_sap_code}</p>
        </div>
      ),
    },
    {
      id: 'created_at',
      label: 'Date',
      render: (_, row) => (
        <span className="text-xs text-gray-500">
          {dayjs(row.created_at).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.items.length} SKUs</span>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amount',
      render: (_, row) => (
        <span className="text-sm font-semibold text-gray-800">
          TZS {row.total_amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={statusLabels[row.status]}
          size="small"
          color={statusColors[row.status]}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: isCustomer ? 80 : 120,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <ViewButton
            onClick={() => navigate(`/orders/${row.id}`)}
            size="small"
            tooltip="View Order"
          />
          {user?.role === 'sales_officer' && row.status === 'approved' && (
            <ActionButton
              icon={<Truck className="w-4 h-4" />}
              tooltip="Schedule Delivery"
              size="small"
              color="primary"
              onClick={() => {
                setSelectedOrderNum(row.order_number);
                setScheduleModalOpen(true);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">
            {isCustomer ? 'My Orders' : 'All Orders'}
          </p>
          <p className="text-sm text-gray-500">
            {isCustomer
              ? 'Here you can place, view and manage your orders'
              : 'Complete customer order directory across all sales territories'}
          </p>
        </div>
      </div>

      {/** Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Delivered Orders"
          value={deliveredOrders}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Total Value"
          value={`TZS ${(totalValue / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/** Filters & Table */}

      <Table
        actions={
          <div className="flex gap-3 items-center">
            <Input
              type="text"
              placeholder="Search by order or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 !min-w-[300px]"
            />
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        }
        columns={columns}
        rows={filtered}
        emptyMessage="No orders found matching your filters."
      />

      {user?.role === 'sales_officer' && (
        <ScheduleDeliveryModal
          open={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedOrderNum(undefined);
          }}
          orderNumber={selectedOrderNum}
        />
      )}
    </div>
  );
};

export default MyOrders;
