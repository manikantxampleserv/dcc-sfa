import { Add, Download, Upload, Visibility } from '@mui/icons-material';
import { Alert, Avatar, Box, Typography } from '@mui/material';
import { useCurrency } from 'hooks/useCurrency';
import { useExportToExcel } from 'hooks/useImportExport';
import { useDeleteInvoice, useInvoices, type Invoice } from 'hooks/useInvoices';
import { usePermission } from 'hooks/usePermission';
import {
  Calendar,
  CheckCircle as CheckCircleIcon,
  DollarSign,
  Receipt,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import DateRangeFilter from 'shared/DateRangeFilter';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDateTime } from 'utils/dateUtils';
import ImportInvoice from './ImportInvoice';
import InvoiceDetail from './InvoiceDetail';
import InvoiceItemsManagement from './InvoiceItemsManagement';
import InvoicePaymentTracking from './InvoicePaymentTracking';
import ManageInvoice from './ManageInvoice';

const InvoicesManagement: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [itemsDrawerOpen, setItemsDrawerOpen] = useState(false);
  const [paymentTrackingDrawerOpen, setPaymentTrackingDrawerOpen] =
    useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('invoice');

  const {
    data: invoicesResponse,
    isFetching,
    error,
  } = useInvoices(
    {
      search,
      page,
      limit,
      salesperson_id: salespersonFilter ? Number(salespersonFilter) : undefined,
      time_filter: timeFilter !== 'all' ? timeFilter : undefined,
      start_date:
        timeFilter === 'custom' && customDateRange.start
          ? customDateRange.start
          : undefined,
      end_date:
        timeFilter === 'custom' && customDateRange.end
          ? customDateRange.end
          : undefined,
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

  const stats = (invoicesResponse as any)?.stats || {};
  const totalInvoices = stats.total_invoices || 0;
  const totalAmount = stats.total_amount || 0;
  const createdThisMonth = stats.created_this_month || 0;
  const todayCreated = stats.today_created || 0;

  const handleCreateInvoice = useCallback(() => {
    setSelectedInvoice(null);
    setDrawerOpen(true);
  }, []);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailDrawerOpen(true);
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
        salesperson_id: salespersonFilter
          ? Number(salespersonFilter)
          : undefined,
        time_filter: timeFilter !== 'all' ? timeFilter : undefined,
        start_date:
          timeFilter === 'custom' && customDateRange.start
            ? customDateRange.start
            : undefined,
        end_date:
          timeFilter === 'custom' && customDateRange.end
            ? customDateRange.end
            : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'invoices',
        filters,
      });
    } catch (error) {
      console.error('Error exporting invoices:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    salespersonFilter,
    timeFilter,
    customDateRange,
  ]);

  const invoiceColumns: TableColumn<Invoice>[] = [
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
      id: 'customer.name',
      label: 'Customer Info',
      render: (_value, row) => (
        <Box>
          <Typography
            variant="body2"
            className="!text-gray-900 !font-medium uppercase"
          >
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
      id: 'salesperson',
      label: 'Salesperson',
      render: (_value, row) =>
        row.salesperson ? (
          <Box className="!flex !items-center !gap-2">
            <Avatar
              src={'mkx'}
              alt={row.salesperson.name.trim() || 'N/A'}
              className="!rounded !bg-primary-100 !text-primary-600 !w-10 !h-10"
            />
            <Box>
              <Typography
                variant="body2"
                className="!text-gray-900 !font-medium"
              >
                {row.salesperson.name}
              </Typography>
              <Box className="!flex !gap-1 !items-center !text-gray-500 !text-xs !mt-0.5">
                {row.salesperson.sap_code ? (
                  <span>{row.salesperson.sap_code}</span>
                ) : null}
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" className="!text-gray-500">
            N/A
          </Typography>
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
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Created: {row.createdate ? formatDateTime(row.createdate) : 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amounts',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            Total:{' '}
            {formatCurrency(Number(row.subtotal) + Number(row.tax_amount) || 0)}
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
                      icon={<Visibility className="!text-[20px]" />}
                      color="success"
                    />
                  </>
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
      <Box className="!mb-3 !flex !justify-between !items-start sm:!items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Invoices Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage customer invoices, track payments, and monitor outstanding
            balances
          </p>
        </Box>
        <DateRangeFilter
          timeFilter={timeFilter}
          setTimeFilter={val => {
            setTimeFilter(val);
            setPage(1);
          }}
          customDateRange={customDateRange}
          setCustomDateRange={val => {
            setCustomDateRange(val);
            setPage(1);
          }}
        />
      </Box>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Invoices"
          value={totalInvoices}
          icon={<Receipt className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />

        <StatsCard
          title="Created This Month"
          value={createdThisMonth}
          icon={<Receipt className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Created Today"
          value={todayCreated}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="orange"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
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
            <div className="flex justify-between w-full gap-3 items-center flex-wrap">
              <div className="flex flex-wrap justify-between items-center gap-2">
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
                    <Box className="!w-64">
                      <UserSelect
                        label=""
                        placeholder="Select Salesperson"
                        value={salespersonFilter}
                        setValue={val => {
                          setSalespersonFilter(val);
                          setPage(1);
                        }}
                        fullWidth
                        size="small"
                        roleName="Salesman"
                      />
                    </Box>
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
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={invoice => invoice.id}
        initialOrderBy="invoice_number"
        loading={isFetching}
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
      {drawerOpen && (
        <ManageInvoice
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoice={selectedInvoice}
        />
      )}
      {detailDrawerOpen && (
        <InvoiceDetail
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          invoice={selectedInvoice}
        />
      )}
      {itemsDrawerOpen && (
        <InvoiceItemsManagement
          key={`items-management-${selectedInvoice?.id || 0}`}
          open={itemsDrawerOpen}
          onClose={() => setItemsDrawerOpen(false)}
          invoiceId={selectedInvoice?.id || 0}
        />
      )}
      {paymentTrackingDrawerOpen && (
        <InvoicePaymentTracking
          key={`payment-tracking-${selectedInvoice?.id || 0}`}
          open={paymentTrackingDrawerOpen}
          onClose={() => setPaymentTrackingDrawerOpen(false)}
          invoiceId={selectedInvoice?.id || 0}
        />
      )}
      {importModalOpen && (
        <ImportInvoice
          drawerOpen={importModalOpen}
          setDrawerOpen={setImportModalOpen}
        />
      )}
    </>
  );
};

export default InvoicesManagement;
