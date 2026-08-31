import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { AlertTriangle } from 'lucide-react';
import type { ReturnReason, ReturnRequest } from 'mock/data/deliveries';
import { mockReturns } from 'mock/data/deliveries';
import React from 'react';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

const reasonLabels: Record<ReturnReason, string> = {
  damaged: 'Damaged Goods',
  shortage: 'Shortage/Missing',
  wrong_product: 'Wrong Product',
  quality_issue: 'Quality Issue',
  late_delivery: 'Late Delivery',
};

const statusColors: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  pending: 'warning',
  approved: 'primary',
  rejected: 'error',
  completed: 'success',
};

const Returns: React.FC = () => {
  const columns: TableColumn<ReturnRequest>[] = [
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
      id: 'reason',
      label: 'Reason',
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          {reasonLabels[row.reason]}
        </div>
      ),
    },
    {
      id: 'description',
      label: 'Details',
      render: (_, row) => (
        <span className="text-xs text-gray-600 line-clamp-1 max-w-xs">
          {row.description}
        </span>
      ),
    },
    {
      id: 'total_value',
      label: 'Claim Value',
      render: (_, row) => (
        <span className="text-sm font-semibold text-gray-800">
          TZS {row.total_value.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          color={statusColors[row.status]}
          variant="outlined"
        />
      ),
    },
    {
      id: 'created_at',
      label: 'Requested On',
      render: (_, row) => (
        <span className="text-xs text-gray-500">
          {dayjs(row.created_at).format('DD MMM YYYY')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">Returns Management</p>
          <p className="text-sm text-gray-500">
            Track and manage product return requests
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        rows={mockReturns}
        emptyMessage="No returns requested."
      />
    </div>
  );
};

export default Returns;
