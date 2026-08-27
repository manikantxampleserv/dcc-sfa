import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Chip } from '@mui/material';
import { mockOrders } from 'mock/data/orders';
import type { Order } from 'mock/data/orders';
import Table from 'shared/Table';
import type { TableColumn } from 'shared/Table';
import { ViewButton } from 'shared/ActionButton';

const ApprovalHistory: React.FC = () => {
  const navigate = useNavigate();

  // Filter for approved/rejected orders
  const historyOrders = mockOrders.filter(
    o => o.status === 'approved' || o.status === 'rejected'
  );

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
      id: 'total_amount',
      label: 'Amount',
      render: (_, row) => (
        <span className="text-sm font-semibold text-gray-800">
          TZS {row.total_amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'decision',
      label: 'Decision',
      render: (_, row) => (
        <Chip
          label={row.status === 'approved' ? 'Approved' : 'Rejected'}
          size="small"
          color={row.status === 'approved' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'approved_at',
      label: 'Decision Date',
      render: (_, row) => (
        <div>
          <p className="text-xs text-gray-700">
            {row.approved_at
              ? dayjs(row.approved_at).format('DD MMM YYYY, HH:mm')
              : '-'}
          </p>
          <p className="text-xs text-gray-400">by {row.approved_by || '-'}</p>
        </div>
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approval History</h1>
          <p className="text-sm text-gray-500">
            Record of past order decisions
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        rows={historyOrders}
        emptyMessage="No approval history found."
      />
    </div>
  );
};

export default ApprovalHistory;
