import { CheckCircle, Pending, Receipt, Visibility } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useCurrency } from 'hooks/useCurrency';
import { usePermission } from 'hooks/usePermission';
import { useOrdersInvoicesReturnsReport } from 'hooks/useReports';
import {
  Calendar,
  Download,
  FileText,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import InvoiceDetail from 'pages/transactions/Invoices/InvoiceDetail';
import React, { useCallback, useState } from 'react';
import { exportOrdersInvoicesReturnsReport } from 'services/reports/ordersInvoicesReturns';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate, formatDateTime } from 'utils/dateUtils';

const OrdersInvoicesReturnsReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoiceDetailDrawerOpen, setInvoiceDetailDrawerOpen] = useState(false);
  const { formatCurrency } = useCurrency();
  const { isRead } = usePermission('report');

  const { data: reportData, isFetching } = useOrdersInvoicesReturnsReport(
    {
      start_date: startDate,
      end_date: endDate,
      customer_id: customerId,
      status: status === 'all' ? undefined : status?.toUpperCase(),
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.summary || {
    total_orders: 0,
    total_invoices: 0,
    total_returns: 0,
    total_order_value: 0,
    total_invoice_value: 0,
  };

  const statusBreakdown = reportData?.status_breakdown || {
    pending_orders: 0,
    completed_orders: 0,
    pending_invoices: 0,
    paid_invoices: 0,
    pending_returns: 0,
    completed_returns: 0,
  };

  const statistics = reportData?.statistics || {
    average_order_value: 0,
    average_invoice_value: 0,
    conversion_rate: 0,
    return_rate: 0,
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportOrdersInvoicesReturnsReport({
        start_date: startDate,
        end_date: endDate,
        customer_id: customerId,
        status: status === 'all' ? undefined : status?.toUpperCase(),
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, customerId, status]);

  const orderColumns: TableColumn<any>[] = [
    {
      id: 'order_number',
      label: 'Order Info',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.order_number}</span>
            <span className="text-xs text-gray-500">
              {row.order_type || 'Regular Order'} • 0 Items
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.customer_name}</span>
          <span className="text-xs text-gray-500">{row.customer_code}</span>
        </div>
      ),
    },
    {
      id: 'salesperson',
      label: 'Salesperson',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-600">
              {row.salesperson_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {row.salesperson_name || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              {row.salesperson_email || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'order_date',
      label: 'Order Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (
          statusLower === 'delivered' ||
          statusLower === 'completed' ||
          statusLower === 'approved'
        ) {
          chipColor = 'success';
        } else if (
          statusLower === 'processing' ||
          statusLower === 'in_progress' ||
          statusLower === 'ready'
        ) {
          chipColor = 'warning';
        } else if (
          statusLower === 'shipped' ||
          statusLower === 'dispatched' ||
          statusLower === 'in_transit' ||
          statusLower === 'confirmed'
        ) {
          chipColor = 'info';
        } else if (
          statusLower === 'pending' ||
          statusLower === 'draft' ||
          statusLower === 'pending_approval'
        ) {
          chipColor = 'default';
        } else if (
          statusLower === 'cancelled' ||
          statusLower === 'failed' ||
          statusLower === 'rejected'
        ) {
          chipColor = 'error';
        }

        return (
          <Chip
            icon={
              statusLower === 'pending' ? (
                <Pending fontSize="small" />
              ) : (
                <CheckCircle fontSize="small" />
              )
            }
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'total_amount',
      label: 'Amount',
      numeric: true,
      render: value => formatCurrency(Number(value)),
    },
  ];

  const invoiceColumns: TableColumn<any>[] = [
    {
      id: 'invoice_number',
      label: 'Invoice Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.invoice_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Receipt className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.invoice_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.invoice_items?.length || 0} items
              {row.parent_id && ` • Order #${row.parent_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer Info',
      render: (_value, row) => (
        <Box>
          <Typography
            variant="body2"
            className="!text-gray-900 !font-medium uppercase"
          >
            {row.customer?.name || row.customer_name || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            {row.customer?.code || row.customer_code || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'invoice_date',
      label: 'Date',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            {row.invoice_date ? formatDateTime(row.invoice_date) : 'N/A'}
          </Box>
        </Box>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amounts',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            Total: {formatCurrency(row.total_amount + row.tax_amount || 0)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Tax: {formatCurrency(row.tax_amount || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value: any, row: any) => (
        <div className="!flex !gap-2 !items-center">
          <ActionButton
            onClick={() => {
              setSelectedInvoice(row);
              setInvoiceDetailDrawerOpen(true);
            }}
            tooltip="View Invoice"
            icon={<Visibility className="!text-[20px]" />}
            color="success"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center flex-wrap gap-4">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Orders & Invoices Report
          </p>
          <p className="!text-gray-500 text-sm">
            Comprehensive report on orders and invoices
          </p>
        </Box>
        {isRead && (
          <PopConfirm
            title="Export Report to Excel"
            description="Are you sure you want to export the current report data to Excel? This will include all filtered results with Orders and Invoices data."
            onConfirm={handleExportToExcel}
            confirmText="Export"
            cancelText="Cancel"
            placement="bottom"
          >
            <Button
              startIcon={<Download className="w-4 h-4" />}
              variant="outlined"
            >
              Export to Excel
            </Button>
          </PopConfirm>
        )}
      </Box>

      {isRead && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CustomerSelect
              name="customer_id"
              label="Customer"
              value={customerId}
              setValue={value =>
                setCustomerId(value ? parseInt(value.toString()) : undefined)
              }
              onChange={(_event, customer) =>
                setCustomerId(customer ? customer.id : undefined)
              }
            />
            <div>
              <Select
                label="Status"
                value={status}
                fullWidth
                onChange={e => setStatus(e.target.value as string)}
                disableClearable
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.total_orders}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.total_invoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  summary.total_order_value + summary.total_invoice_value
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="!font-bold text-lg !text-gray-900 !mb-4">
          Key Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(statistics.average_order_value)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Avg Invoice Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(statistics.average_invoice_value)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-xl font-bold text-green-600">
              {statistics.conversion_rate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="!font-bold text-lg !text-gray-900 !mb-4">
          Status Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-lg font-bold text-orange-600">
              {statusBreakdown.pending_orders}
            </p>
          </div>
          <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-600">Completed Orders</p>
            <p className="text-lg font-bold text-primary-600">
              {statusBreakdown.completed_orders}
            </p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600">Pending Invoices</p>
            <p className="text-lg font-bold text-yellow-600">
              {statusBreakdown.pending_invoices}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Paid Invoices</p>
            <p className="text-lg font-bold text-green-600">
              {statusBreakdown.paid_invoices}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Orders (
            {reportData?.data?.orders?.length || 0})
          </Box>
        }
        data={reportData?.data?.orders || []}
        columns={orderColumns}
        loading={isFetching}
        pagination={false}
        isPermission={isRead}
      />

      {/* Invoices Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <FileText className="w-5 h-5" /> Invoices (
            {reportData?.data?.invoices?.length || 0})
          </Box>
        }
        data={reportData?.data?.invoices || []}
        columns={invoiceColumns}
        loading={isFetching}
        pagination={false}
        isPermission={isRead}
      />

      {/* Invoice Detail Drawer */}
      <InvoiceDetail
        open={invoiceDetailDrawerOpen}
        onClose={() => {
          setInvoiceDetailDrawerOpen(false);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default OrdersInvoicesReturnsReport;
