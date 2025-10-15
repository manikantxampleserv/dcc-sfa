import { Add, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCreditNotes,
  useDeleteCreditNote,
  type CreditNote,
} from 'hooks/useCreditNotes';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  AlertTriangle,
  Calendar,
  CheckCircle as CheckCircleIcon,
  Clock,
  DollarSign,
  Package,
  Receipt,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import ImportCreditNote from './ImportCreditNote';
import ManageCreditNote from './ManageCreditNote';
import CreditNoteDetail from './CreditNoteDetail';

const CreditNotesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedCreditNote, setSelectedCreditNote] =
    useState<CreditNote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: creditNotesResponse,
    isLoading,
    error,
  } = useCreditNotes({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const creditNotes = creditNotesResponse?.data || [];
  const totalCount = creditNotesResponse?.meta?.total || 0;
  const currentPage = (creditNotesResponse?.meta?.page || 1) - 1;

  const deleteCreditNoteMutation = useDeleteCreditNote();
  const exportToExcelMutation = useExportToExcel();

  const totalCreditNotes = creditNotes.length;
  const totalValue = creditNotes.reduce(
    (sum, cn) => sum + (cn.total_amount || 0),
    0
  );
  const avgCreditNoteValue =
    totalCreditNotes > 0 ? totalValue / totalCreditNotes : 0;
  const pendingApproval = creditNotes.filter(
    cn => cn.status === 'pending'
  ).length;

  const handleCreateCreditNote = useCallback(() => {
    setSelectedCreditNote(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCreditNote = useCallback((creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote);
    setDrawerOpen(true);
  }, []);

  const handleViewCreditNote = useCallback((creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote);
    setDetailDrawerOpen(true);
  }, []);

  const handleDeleteCreditNote = useCallback(
    async (id: number) => {
      try {
        await deleteCreditNoteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting credit note:', error);
      }
    },
    [deleteCreditNoteMutation]
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
        tableName: 'credit_notes',
        filters,
      });
    } catch (error) {
      console.error('Error exporting credit notes:', error);
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
      pending: '!bg-yellow-100 !text-yellow-800',
      approved: '!bg-green-100 !text-green-800',
      rejected: '!bg-red-100 !text-red-800',
      cancelled: '!bg-red-100 !text-red-800',
    };
    return (
      colors[status as keyof typeof colors] || '!bg-gray-100 !text-gray-800'
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Package className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const creditNoteColumns: TableColumn<CreditNote>[] = [
    {
      id: 'credit_note_info',
      label: 'Credit Note Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.credit_note_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Receipt className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !cursor-pointer !hover:!text-primary-500 !hover:!underline"
              onClick={() => handleViewCreditNote(row)}
            >
              {row.credit_note_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !capitalize !text-xs !block !mt-0.5"
            >
              {row.status || 'draft'} • {row.creditNoteItems?.length || 0} items
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
      id: 'order',
      label: 'Related Order',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.order?.order_number || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Order ID: {row.parent_id}
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
            className={`!text-xs !px-1 !capitalize ${getStatusColor(row.status || 'draft')} !min-w-20`}
          />
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
            Credit Note:{' '}
            {row.credit_note_date
              ? new Date(row.credit_note_date).toLocaleDateString()
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
      id: 'amount',
      label: 'Amount',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {formatCurrency(row.total_amount)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Subtotal: {formatCurrency(row.subtotal)}
          </Typography>
          {row.discount_amount && row.discount_amount > 0 && (
            <Typography
              variant="caption"
              className="!text-green-600 !text-xs !block !mt-0.5"
            >
              Discount: -{formatCurrency(row.discount_amount)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'reason',
      label: 'Reason',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.reason || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 capitalize !text-xs !block !mt-0.5"
          >
            {row.payment_method?.replaceAll('_', ' ') || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditCreditNote(row)}
            tooltip={`Edit ${row.credit_note_number}`}
          />
          <DeleteButton
            onClick={() => handleDeleteCreditNote(row.id)}
            tooltip={`Delete ${row.credit_note_number}`}
            itemName={row.credit_note_number}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        Error loading credit notes: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Credit Notes Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage credit notes, track refunds, and process adjustments
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Credit Notes
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalCreditNotes}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">Total Value</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalValue)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Avg Credit Note Value
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(avgCreditNoteValue)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Pending Approval
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-orange-600">
                  {pendingApproval}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load credit notes. Please try again.
        </Alert>
      )}

      <Table
        data={creditNotes}
        columns={creditNoteColumns}
        actions={
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search Credit Notes..."
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <PopConfirm
                title="Export Credit Notes"
                description="Are you sure you want to export the current credit notes data to Excel? This will include all filtered results."
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
                onClick={handleCreateCreditNote}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={creditNote => creditNote.id}
        initialOrderBy="credit_note_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No credit notes found matching "${search}"`
            : 'No credit notes found in the system'
        }
      />

      <ManageCreditNote
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        creditNote={selectedCreditNote}
      />

      <ImportCreditNote
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />

      <CreditNoteDetail
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        creditNote={selectedCreditNote}
      />
    </>
  );
};

export default CreditNotesManagement;
