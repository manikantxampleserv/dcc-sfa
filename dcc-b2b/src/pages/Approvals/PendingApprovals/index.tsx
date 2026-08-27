import dayjs from 'dayjs';
import { Calendar, Check, Clock, TrendingUp, Users, X } from 'lucide-react';
import type { Order } from 'mock/data/orders';
import { mockOrders } from 'mock/data/orders';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ActionButton, ViewButton } from 'shared/ActionButton';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();

  // Filter for pending orders only
  const pendingOrders = mockOrders.filter(o => o.status === 'pending_approval');

  const handleApprove = (orderId: number) => {
    toast.success(`Order ${orderId} approved successfully.`);
  };

  const handleReject = (orderId: number) => {
    toast.error(`Order ${orderId} rejected.`);
  };

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
      label: 'Submitted',
      render: (_, row) => (
        <span className="text-xs text-gray-500">
          {dayjs(row.created_at).format('DD MMM YYYY, HH:mm')}
        </span>
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
      id: 'actions',
      label: 'Actions',
      width: 250,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <ViewButton
            onClick={() => navigate(`/orders/${row.id}`)}
            size="small"
            tooltip="View Details"
          />
          <ActionButton
            onClick={() => handleApprove(row.id)}
            icon={<Check className="w-4 h-4" />}
            color="success"
            tooltip="Approve"
            size="small"
          />
          <ActionButton
            onClick={() => handleReject(row.id)}
            icon={<X className="w-4 h-4" />}
            color="error"
            tooltip="Reject"
            size="small"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500">
            Orders waiting for your review
          </p>
        </div>
        <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
          {pendingOrders.length} Pending
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Approvals"
          value={pendingOrders.length}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="Total Value"
          value={`TZS ${(pendingOrders.reduce((s, o) => s + o.total_amount, 0) / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="teal"
        />
        <StatsCard
          title="Unique Customers"
          value={new Set(pendingOrders.map(o => o.customer_sap_code)).size}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Added Today"
          value={
            pendingOrders.filter(o =>
              dayjs(o.created_at).isSame(dayjs(), 'day')
            ).length
          }
          icon={<Calendar className="w-5 h-5" />}
          color="green"
        />
      </div>

      <Table
        columns={columns}
        rows={pendingOrders}
        emptyMessage="No orders pending approval."
      />
    </div>
  );
};

export default PendingApprovals;
