import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteStockTransferRequest,
  useStockTransferRequests,
  type StockTransferRequest,
} from 'hooks/useStockTransferRequests';
import { usePermission } from 'hooks/usePermission';
import { TrendingUp, Truck, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportStockTransferRequest from './ImportStockTransferRequest';
import ManageStockTransferRequest from './ManageStockTransferRequest';

const StockTransferRequestsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] =
    useState<StockTransferRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('stock-transfer');

  const {
    data: requestsResponse,
    isLoading,
    error,
  } = useStockTransferRequests(
    {
      search,
      page,
      limit,
      status:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'active'
            : 'inactive',
    },
    {
      enabled: isRead,
    }
  );

  const requests = requestsResponse?.data || [];
  const totalCount = requestsResponse?.meta?.total || 0;
  const currentPage = (requestsResponse?.meta?.page || 1) - 1;

  const deleteRequestMutation = useDeleteStockTransferRequest();
  const exportToExcelMutation = useExportToExcel();

  const totalRequests = requestsResponse?.stats?.total_requests ?? 0;
  const activeRequests = requestsResponse?.stats?.active_requests ?? 0;
  const inactiveRequests = requestsResponse?.stats?.inactive_requests ?? 0;
  const requestsThisMonth = requestsResponse?.stats?.requests_this_month ?? 0;

  const handleCreateRequest = useCallback(() => {
    setSelectedRequest(null);
    setDrawerOpen(true);
  }, []);

  const handleEditRequest = useCallback((request: StockTransferRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  const handleDeleteRequest = useCallback(
    async (id: number) => {
      try {
        await deleteRequestMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting stock transfer request:', error);
      }
    },
    [deleteRequestMutation]
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
        status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'active'
              : 'inactive',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'stock_transfer_requests',
        filters,
      });
    } catch (error) {
      console.error('Error exporting stock transfer requests:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  };

  // Define table columns
  const requestColumns: TableColumn<StockTransferRequest>[] = [
    {
      id: 'request_number',
      label: 'Request Number',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.request_number}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Truck className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.request_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.source_type} → {row.destination_type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'source',
      label: 'Source',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.source?.name || `ID: ${row.source_id}`}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            {row.source_type}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'destination',
      label: 'Destination',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.destination?.name || `ID: ${row.destination_id}`}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            {row.destination_type}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'requested_by_user',
      label: 'Requested By',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.requested_by_user?.name || 'Unknown'}
            className="!rounded !bg-primary-100 !text-primary-600"
            sx={{ width: 32, height: 32 }}
          >
            {row.requested_by_user?.name?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" className="!text-gray-900 !font-medium">
              {row.requested_by_user?.name || 'Unknown User'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.requested_by_user?.email || `ID: ${row.requested_by}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={getStatusLabel(row.status || 'pending')}
          size="small"
          className="w-24"
          variant="outlined"
          color={getStatusColor(row.status || 'pending') as any}
        />
      ),
    },
    {
      id: 'transfer_lines',
      label: 'Items',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.transfer_lines?.length || 0} items
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Active',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
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
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: StockTransferRequest) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditRequest(row)}
                    tooltip={`Edit ${row.request_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteRequest(row.id)}
                    tooltip={`Delete ${row.request_number}`}
                    itemName={row.request_number}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Stock Transfer Requests Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage stock transfer requests between warehouses and locations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Requests"
          value={totalRequests}
          icon={<Truck className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Requests"
          value={activeRequests}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Requests"
          value={inactiveRequests}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={requestsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load stock transfer requests. Please try again.
        </Alert>
      )}

      <Table
        data={requests}
        columns={requestColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex items-center flex-wrap gap-2">
                  <SearchInput
                    placeholder="Search Stock Transfer Requests"
                    value={search}
                    onChange={handleSearchChange}
                    debounceMs={400}
                    showClear={true}
                    fullWidth={false}
                    className="!min-w-80"
                  />
                  <Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="!min-w-32"
                    size="small"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </div>
              )}
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Stock Transfer Requests"
                    description="Are you sure you want to export the current stock transfer requests data to Excel? This will include all filtered results."
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
                )}
                {isCreate && (
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateRequest}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={request => request.id}
        initialOrderBy="request_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No stock transfer requests found matching "${search}"`
            : 'No stock transfer requests found in the system'
        }
      />

      <ManageStockTransferRequest
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <ImportStockTransferRequest
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default StockTransferRequestsManagement;
