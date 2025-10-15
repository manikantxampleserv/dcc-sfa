import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { DollarSign } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { useExportToExcel } from '../../../hooks/useImportExport';
import {
  useDeletePayment,
  usePayments,
  type Payment,
} from '../../../hooks/usePayments';
import { formatDate } from '../../../utils/dateUtils';
import ImportPayment from './ImportPayment';
import ManagePayment from './ManagePayment';

const PaymentCollection: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: paymentsResponse,
    isLoading,
    error,
  } = usePayments({
    search,
    page,
    limit,
    is_active:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
  });

  const payments = paymentsResponse?.data || [];
  const totalCount = paymentsResponse?.pagination?.total_count || 0;
  const currentPage = (paymentsResponse?.pagination?.current_page || 1) - 1;

  const deletePaymentMutation = useDeletePayment();
  const exportToExcelMutation = useExportToExcel();

  const totalPayments = paymentsResponse?.stats?.total_payments ?? 0;
  const activePayments = paymentsResponse?.stats?.active_payments ?? 0;
  const inactivePayments = paymentsResponse?.stats?.inactive_payments ?? 0;
  const totalAmount = paymentsResponse?.stats?.total_amount ?? 0;

  const handleCreatePayment = useCallback(() => {
    setSelectedPayment(null);
    setDrawerOpen(true);
  }, []);

  const handleEditPayment = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  }, []);

  const handleViewPayment = useCallback(
    (payment: Payment) => {
      navigate(`/transactions/payments/${payment.id}`);
    },
    [navigate]
  );

  const handleDeletePayment = useCallback(
    async (id: number) => {
      try {
        await deletePaymentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    },
    [deletePaymentMutation]
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
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'payments',
        filters,
      });
    } catch (error) {
      console.error('Error exporting payments:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const paymentColumns: TableColumn<Payment>[] = [
    {
      id: 'payment_number',
      label: 'Payment Number',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.payment_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <DollarSign className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.payment_number}
            </Typography>
            {row.customer?.name && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
                title={row.customer.name}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '300px',
                  cursor: 'help',
                }}
              >
                {row.customer.name}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'payment_date',
      label: 'Payment Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.payment_date ? (
            formatDate(row.payment_date)
          ) : (
            <span className="italic text-gray-400">No Date</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'method',
      label: 'Payment Method',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900 !capitalize">
          {row.method?.replaceAll('_', ' ') || (
            <span className="italic text-gray-400">No Method</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'reference_number',
      label: 'Reference',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.reference_number || (
            <span className="italic text-gray-400">No Reference</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'currency',
      label: 'Currency',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.currency ? (
            <span className="!font-medium">
              {row.currency.code} ({row.currency.name})
            </span>
          ) : (
            <span className="italic text-gray-400">No Currency</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'collected_by_user',
      label: 'Collected By',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar
            alt={row.collected_by_user?.name}
            className="!w-10 !h-10 !rounded !bg-green-100 !text-green-600"
          >
            {row.collected_by_user?.name?.[0] || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" className="!text-gray-900 !font-medium">
              {row.collected_by_user?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500 !text-xs">
              {row.collected_by_user?.email || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amount',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.total_amount ? (
            `${row.currency?.code} ${row.total_amount.toFixed(2)}`
          ) : (
            <span className="italic text-gray-400">No Amount</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-900 !max-w-xs"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {row.notes || <span className="italic text-gray-400">No Notes</span>}
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          className="w-26"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <ActionButton
            onClick={() => handleViewPayment(row)}
            tooltip={`View ${row.payment_number}`}
            icon={<Visibility />}
            color="success"
          />
          <EditButton
            onClick={() => handleEditPayment(row)}
            tooltip={`Edit ${row.payment_number}`}
          />
          <DeleteButton
            onClick={() => handleDeletePayment(row.id)}
            tooltip={`Delete ${row.payment_number}`}
            itemName={row.payment_number}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Payment Collection Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage payment collections, track transactions, and monitor
            financial records
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Payments
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalPayments}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Payments
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activePayments}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">
                Inactive Payments
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactivePayments}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Total Amount
              </p>
              {isLoading ? (
                <div className="h-7 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalAmount.toFixed(2)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load payments. Please try again.
        </Alert>
      )}

      <Table
        data={payments}
        columns={paymentColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Payments..."
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                className="lg:!min-w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="!w-32"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <PopConfirm
                title="Export Payments"
                description="Are you sure you want to export the current payments data to Excel? This will include all filtered results."
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
                  {exportToExcelMutation.isPending ? 'Exporting...' : 'Export'}
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
              <Button
                variant="contained"
                className="!capitalize"
                disableElevation
                startIcon={<Add />}
                onClick={handleCreatePayment}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={payment => payment.id}
        initialOrderBy="payment_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No payments found matching "${search}"`
            : 'No payments found in the system'
        }
      />

      <ManagePayment
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportPayment
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default PaymentCollection;
