import React from 'react';
import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { CreditCard, Landmark, Banknote, Smartphone } from 'lucide-react';
import { mockPayments } from 'mock/data/invoices';
import type { Payment, PaymentMethod } from 'mock/data/invoices';
import Table from 'shared/Table';
import type { TableColumn } from 'shared/Table';

const methodLabels: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cash: 'Cash',
  cheque: 'Cheque',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  bank_transfer: <Landmark className="w-4 h-4 text-blue-500" />,
  mobile_money: <Smartphone className="w-4 h-4 text-green-500" />,
  cash: <Banknote className="w-4 h-4 text-emerald-500" />,
  cheque: <CreditCard className="w-4 h-4 text-purple-500" />,
};

const PaymentHistory: React.FC = () => {
  const columns: TableColumn<Payment>[] = [
    {
      id: 'payment_number',
      label: 'Receipt #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          {row.payment_number}
        </span>
      ),
    },
    {
      id: 'paid_at',
      label: 'Date',
      render: (_, row) => (
        <span className="text-sm font-medium text-gray-800">
          {dayjs(row.paid_at).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      id: 'invoice_number',
      label: 'Applied To Invoice',
      render: (_, row) => (
        <span className="font-mono text-xs text-blue-600 hover:underline cursor-pointer">
          {row.invoice_number}
        </span>
      ),
    },
    {
      id: 'method',
      label: 'Method',
      render: (_, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {methodIcons[row.method]}
          <span>{methodLabels[row.method]}</span>
        </div>
      ),
    },
    {
      id: 'reference',
      label: 'Reference',
      render: (_, row) => (
        <span className="font-mono text-xs text-gray-500">{row.reference}</span>
      ),
    },
    {
      id: 'amount',
      label: 'Amount Paid',
      render: (_, row) => (
        <span className="text-sm font-bold text-green-600">
          TZS {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: () => (
        <Chip
          label="Confirmed"
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">Payment History</p>
          <p className="text-sm text-gray-500">
            Record of all cleared payments
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        rows={mockPayments}
        emptyMessage="No payment history found."
      />
    </div>
  );
};

export default PaymentHistory;
