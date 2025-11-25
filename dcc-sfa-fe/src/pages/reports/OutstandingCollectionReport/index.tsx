import { Box, Chip, MenuItem } from '@mui/material';
import { useCustomers } from 'hooks/useCustomers';
import { usePermission } from 'hooks/usePermission';
import { useOutstandingCollectionReport } from 'hooks/useReports';
import {
  Download,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportOutstandingCollectionReport } from 'services/reports/outstandingCollection';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const OutstandingCollectionReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('all');
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useOutstandingCollectionReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      customer_id: customerId,
      invoice_status: invoiceStatus !== 'all' ? invoiceStatus : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const { data: customersData } = useCustomers();

  const customers = customersData?.data || [];

  const summary = reportData?.summary || {
    total_outstanding_amount: 0,
    total_outstanding_invoices: 0,
    total_customers_with_outstanding: 0,
    total_collections: 0,
    total_collection_count: 0,
    avg_days_overdue: 0,
  };

  const outstandingInvoices = reportData?.data?.outstanding_invoices || [];
  const customerSummary = reportData?.data?.customer_summary || [];
  const collections = reportData?.data?.collections || [];

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportOutstandingCollectionReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        customer_id: customerId,
        invoice_status: invoiceStatus !== 'all' ? invoiceStatus : undefined,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, customerId, invoiceStatus]);

  const outstandingColumns: TableColumn<any>[] = [
    {
      id: 'invoice_number',
      label: 'Invoice#',
      render: value => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-red-600" />
          </div>
          <span className="font-semibold text-sm">{value}</span>
        </div>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'salesperson_name',
      label: 'Salesperson',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'invoice_date',
      label: 'Invoice Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'due_date',
      label: 'Due Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'balance_due',
      label: 'Balance Due',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'days_overdue',
      label: 'Days Overdue',
      numeric: true,
      render: value => {
        const days = Number(value);
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (days === 0) {
          chipColor = 'success';
        } else if (days <= 30) {
          chipColor = 'warning';
        } else {
          chipColor = 'error';
        }

        return (
          <Chip
            label={days}
            size="small"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'paid' || statusLower === 'completed') {
          chipColor = 'success';
        } else if (statusLower === 'overdue' || statusLower === 'pending') {
          chipColor = 'error';
        } else {
          chipColor = 'warning';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
  ];

  const customerSummaryColumns: TableColumn<any>[] = [
    {
      id: 'customer_name',
      label: 'Customer',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'invoice_count',
      label: 'Invoice Count',
      numeric: true,
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'total_outstanding',
      label: 'Total Outstanding',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'avg_days_overdue',
      label: 'Avg Days Overdue',
      numeric: true,
      render: value => {
        const days = Number(value);
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (days === 0) {
          chipColor = 'success';
        } else if (days <= 30) {
          chipColor = 'warning';
        } else {
          chipColor = 'error';
        }

        return (
          <Chip
            label={days.toFixed(0)}
            size="small"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
  ];

  const collectionsColumns: TableColumn<any>[] = [
    {
      id: 'payment_number',
      label: 'Payment#',
      render: value => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <span className="font-semibold text-sm">{value}</span>
        </div>
      ),
    },
    {
      id: 'payment_date',
      label: 'Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'amount',
      label: 'Amount',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'method',
      label: 'Method',
      render: value => <span className="text-sm capitalize">{value}</span>,
    },
    {
      id: 'collected_by',
      label: 'Collected By',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'reference_number',
      label: 'Reference',
      render: value => <span className="text-sm">{value}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Outstanding & Collection Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track outstanding invoices and payment collections
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current report data to Excel?"
          onConfirm={handleExportToExcel}
          confirmText="Export"
          cancelText="Cancel"
          placement="bottom"
        >
          <Button
            startIcon={<Download className="w-4 h-冒号" />}
            variant="outlined"
          >
            Export to Excel
          </Button>
        </PopConfirm>
      </Box>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            setValue={setStartDate}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            setValue={setEndDate}
          />
          <Select
            label="Customer"
            value={customerId?.toString() || 'all'}
            onChange={e =>
              setCustomerId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Customers</MenuItem>
            {customers.map((customer: any) => (
              <MenuItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            label="Invoice Status"
            value={invoiceStatus}
            onChange={e => setInvoiceStatus(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Outstanding Amount
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_outstanding_amount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Outstanding Invoices
              </p>
              <p className="text-2xl font-bold Subsequently text-gray-900 mt-1">
                {summary.total_outstanding_invoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Customers with Outstanding
              </p>
              <p className="text-2phansxl font-bold text-gray-900 mt-1">
                {summary.total_customers_with_outstanding}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Collections
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_collections.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Collection Count
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_collection_count}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Days Overdue
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.avg_days_overdue.toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Receipt className="w-5 h-5" />
            Outstanding Invoices ({outstandingInvoices.length})
          </Box>
        }
        columns={outstandingColumns}
        data={outstandingInvoices}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Summary ({customerSummary.length})
          </Box>
        }
        columns={customerSummaryColumns}
        data={customerSummary}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Collections ({collections.length})
          </Box>
        }
        columns={collectionsColumns}
        data={collections}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default OutstandingCollectionReport;
