import { Add, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { useDeleteInvoice, useInvoices, type Invoice } from 'hooks/useInvoices';
import {
  AlertTriangle,
  Calendar,
  CheckCircle as CheckCircleIcon,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Receipt,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportInvoice from './ImportInvoice';
import InvoiceDetail from './InvoiceDetail';
import InvoiceItemsManagement from './InvoiceItemsManagement';
import InvoicePaymentTracking from './InvoicePaymentTracking';
import ManageInvoice from './ManageInvoice';

const InvoicesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [itemsDrawerOpen, setItemsDrawerOpen] = useState(false);
  const [paymentTrackingDrawerOpen, setPaymentTrackingDrawerOpen] =
    useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('invoice');

  const {
    data: invoicesResponse,
    isLoading,
    error,
  } = useInvoices(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      enabled: isRead,
    }
  );

  const invoices = invoicesResponse?.data || [];
  const totalCount = invoicesResponse?.pagination?.total_count || 0;
  const currentPage = (invoicesResponse?.pagination?.current_page || 1) - 1;

  const deleteInvoiceMutation = useDeleteInvoice();
  const exportToExcelMutation = useExportToExcel();

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce(
    (sum, i) => sum + (i.total_amount || 0),
    0
  );
  const totalPaid = invoices.reduce((sum, i) => sum + (i.amount_paid || 0), 0);
  const totalBalance = invoices.reduce(
    (sum, i) => sum + (i.balance_due || 0),
    0
  );

  const handleCreateInvoice = useCallback(() => {
    setSelectedInvoice(null);
    setDrawerOpen(true);
  }, []);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDrawerOpen(true);
  }, []);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailDrawerOpen(true);
  }, []);

  const handleManageItems = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setItemsDrawerOpen(true);
  }, []);

  const handlePaymentTracking = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentTrackingDrawerOpen(true);
  }, []);

  const handleDeleteInvoice = useCallback(
    async (id: number) => {
      try {
        await deleteInvoiceMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    },
    [deleteInvoiceMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'invoices',
        filters,
      });
    } catch (error) {
      console.error('Error exporting invoices:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '!bg-gray-100 !text-gray-800',
      sent: '!bg-blue-100 !text-blue-800',
      paid: '!bg-green-100 !text-green-800',
      overdue: '!bg-red-100 !text-red-800',
      cancelled: '!bg-gray-100 !text-gray-800',
    };
    return (
      colors[status as keyof typeof colors] || '!bg-gray-100 !text-gray-800'
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.due_date || !invoice.balance_due) return false;
    return new Date(invoice.due_date) < new Date() && invoice.balance_due > 0;
  };

  const invoiceColumns: TableColumn<Invoice>[] = [
    {
      id: 'invoice_info',
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
              {row.invoice_items?.length || 0} items • Order #{row.parent_id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.customer?.name || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            {row.customer?.code || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Box className="flex !gap-2 items-center">
          <Chip
            icon={getStatusIcon(row.status || 'draft')}
            label={row.status || 'draft'}
            size="small"
            className={`!text-xs !capitalize ${getStatusColor(row.status || 'draft')} !min-w-20`}
          />
          {isOverdue(row) && (
            <Chip
              label="OVERDUE"
              size="small"
              className="!text-xs !bg-red-100 !text-red-800 !font-bold"
            />
          )}
        </Box>
      ),
    },
    {
      id: 'dates',
      label: 'Dates',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            Invoice:{' '}
            {row.invoice_date
              ? new Date(row.invoice_date).toLocaleDateString()
              : 'N/A'}
          </Box>
          {row.due_date && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              Due: {new Date(row.due_date).toLocaleDateString()}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'amounts',
      label: 'Amounts',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            Total: {formatCurrency(row.total_amount)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-green-600 !text-xs !block !mt-0.5"
          >
            Paid: {formatCurrency(row.amount_paid)}
          </Typography>
          {row.balance_due && row.balance_due > 0 && (
            <Typography
              variant="caption"
              className="!text-red-600 !text-xs !block !mt-0.5"
            >
              Balance: {formatCurrency(row.balance_due)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'payment_method',
      label: 'Payment Method',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-600 !capitalize">
          {row.payment_method?.replaceAll('_', ' ') || 'N/A'}
        </Typography>
      ),
    },
    ...(isRead || isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Invoice) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <>
                    <ActionButton
                      onClick={() => handleViewInvoice(row)}
                      tooltip="View invoice details"
                      icon={<FileText />}
                      color="success"
                    />
                    <ActionButton
                      onClick={() => handleManageItems(row)}
                      tooltip="Manage invoice items"
                      icon={<Package />}
                      color="info"
                    />
                    <ActionButton
                      onClick={() => handlePaymentTracking(row)}
                      tooltip="Track payments"
                      icon={<CreditCard />}
                      color="secondary"
                    />
                  </>
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditInvoice(row)}
                    tooltip={`Edit ${row.invoice_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteInvoice(row.id)}
                    tooltip={`Delete ${row.invoice_number}`}
                    itemName={row.invoice_number}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        Error loading invoices: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Invoices Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage customer invoices, track payments, and monitor outstanding
            balances
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Invoices"
          value={totalInvoices}
          icon={<Receipt className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Amount Paid"
          value={formatCurrency(totalPaid)}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Outstanding Balance"
          value={formatCurrency(totalBalance)}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load invoices. Please try again.
        </Alert>
      )}

      <Table
        data={invoices}
        columns={invoiceColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between gap-3 items-center flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Invoices..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-40"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="sent">Sent</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              {isRead && (
                <div className="flex gap-2 items-center">
                  <PopConfirm
                    title="Export Invoices"
                    description="Are you sure you want to export the current invoices data to Excel? This will include all filtered results."
                    onConfirm={handleExportToExcel}
                    confirmText="Export"
                    cancelText="Cancel"
                    placement="top"
                  >
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Download />}
                      disabled={exportToExcelMutation.isPending}
                    >
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                </div>
              )}
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateInvoice}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={invoice => invoice.id}
        initialOrderBy="invoice_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No invoices found matching "${search}"`
            : 'No invoices found in the system'
        }
      />

      <ManageInvoice
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoiceDetail
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoiceItemsManagement
        key={`items-management-${selectedInvoice?.id || 0}`}
        open={itemsDrawerOpen}
        onClose={() => setItemsDrawerOpen(false)}
        invoiceId={selectedInvoice?.id || 0}
      />

      <InvoicePaymentTracking
        key={`payment-tracking-${selectedInvoice?.id || 0}`}
        open={paymentTrackingDrawerOpen}
        onClose={() => setPaymentTrackingDrawerOpen(false)}
        invoiceId={selectedInvoice?.id || 0}
      />

      <ImportInvoice
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default InvoicesManagement;
