import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { Invoice } from 'mock/data/invoices';
import { mockInvoices } from 'mock/data/invoices';
import React from 'react';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';
import { ActionButton } from 'shared/ActionButton';

const statusColors: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  paid: 'success',
  unpaid: 'error',
  overdue: 'error',
  partial: 'warning',
};

const InvoiceList: React.FC = () => {
  const columns: TableColumn<Invoice>[] = [
    {
      id: 'invoice_number',
      label: 'Invoice #',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-semibold text-blue-600">
            {row.invoice_number}
          </span>
          <span className="text-xs text-gray-400">
            Order: {row.order_number}
          </span>
        </div>
      ),
    },
    {
      id: 'issue_date',
      label: 'Dates',
      render: (_, row) => (
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-gray-600">
            Issued: {dayjs(row.issue_date).format('DD MMM YYYY')}
          </span>
          <span
            className={`font-medium ${row.status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}
          >
            Due: {dayjs(row.due_date).format('DD MMM YYYY')}
          </span>
        </div>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total Amount',
      render: (_, row) => (
        <span className="text-sm font-semibold text-gray-800">
          TZS {row.total_amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'balance_due',
      label: 'Balance Due',
      render: (_, row) => (
        <span
          className={`text-sm font-bold ${row.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          TZS {row.balance_due.toLocaleString()}
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
          variant="filled"
          className={row.status === 'overdue' ? 'animate-pulse' : ''}
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      render: () => (
        <ActionButton
          icon={<Download className="w-4 h-4" />}
          tooltip="Download PDF"
          color="info"
          size="small"
        />
      ),
    },
  ];

  const totalOutstanding = mockInvoices.reduce(
    (sum, inv) => sum + inv.balance_due,
    0
  );
  const overdueCount = mockInvoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">Invoices</p>
          <p className="text-sm text-gray-500">
            View and download your invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Invoices"
          value={mockInvoices.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Paid Invoices"
          value={mockInvoices.filter(i => i.status === 'paid').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Overdue Invoices"
          value={overdueCount}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="Total Outstanding"
          value={`TZS ${(totalOutstanding / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="teal"
        />
      </div>

      <Table
        columns={columns}
        rows={mockInvoices}
        emptyMessage="No invoices found."
      />
    </div>
  );
};

export default InvoiceList;
