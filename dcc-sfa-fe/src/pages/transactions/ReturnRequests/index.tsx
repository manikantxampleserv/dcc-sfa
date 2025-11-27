import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Package,
  User,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { usePermission } from '../../../hooks/usePermission';
import { useProducts } from '../../../hooks/useProducts';
import {
  useDeleteReturnRequest,
  useReturnRequests,
  type ReturnRequest,
} from '../../../hooks/useReturnRequests';
import { useUsers } from '../../../hooks/useUsers';
import ImportReturnRequest from './ImportReturnRequest';
import ManageReturnRequest from './ManageReturnRequest';

const ReturnRequests: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturnRequest, setSelectedReturnRequest] =
    useState<ReturnRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('return-request');

  const {
    data: returnRequestsResponse,
    isLoading,
    error,
  } = useReturnRequests(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      is_active: 'Y',
    },
    {
      enabled: isRead,
    }
  );

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
  });

  const { data: productsResponse } = useProducts({
    page: 1,
    limit: 1000,
  });

  const returnRequests = returnRequestsResponse?.data || [];
  const users = usersResponse?.data || [];
  const products = productsResponse?.data || [];
  const totalCount = returnRequestsResponse?.pagination?.total_count || 0;
  const currentPage =
    (returnRequestsResponse?.pagination?.current_page || 1) - 1;

  const deleteReturnRequestMutation = useDeleteReturnRequest();
  const exportToExcelMutation = useExportToExcel();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalRequests = returnRequestsResponse?.stats?.total_requests ?? 0;
  const pendingRequests = returnRequestsResponse?.stats?.pending_requests ?? 0;
  const approvedRequests =
    returnRequestsResponse?.stats?.approved_requests ?? 0;
  const rejectedRequests =
    returnRequestsResponse?.stats?.rejected_requests ?? 0;
  const processingRequests =
    returnRequestsResponse?.stats?.processing_requests ?? 0;
  const completedRequests =
    returnRequestsResponse?.stats?.completed_requests ?? 0;
  const cancelledRequests =
    returnRequestsResponse?.stats?.cancelled_requests ?? 0;
  const newRequestsThisMonth =
    returnRequestsResponse?.stats?.new_requests_this_month ?? 0;

  const handleCreateReturnRequest = useCallback(() => {
    setSelectedReturnRequest(null);
    setDrawerOpen(true);
  }, []);

  const handleImportReturnRequests = useCallback(() => {
    setImportDrawerOpen(true);
  }, []);

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
        isActive: 'Y',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'return_requests',
        filters,
      });
    } catch (error) {
      console.error('Error exporting return requests:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const handleEditReturnRequest = useCallback(
    (returnRequest: ReturnRequest) => {
      setSelectedReturnRequest(returnRequest);
      setDrawerOpen(true);
    },
    []
  );

  const handleViewDetails = useCallback(
    (returnRequest: ReturnRequest) => {
      navigate(`/transactions/returns/${returnRequest.id}`);
    },
    [navigate]
  );

  const handleDeleteReturnRequest = useCallback(
    async (id: number) => {
      try {
        await deleteReturnRequestMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting return request:', error);
      }
    },
    [deleteReturnRequestMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const returnRequestColumns: TableColumn<ReturnRequest>[] = [
    {
      id: 'customer_product',
      label: 'Customer & Product',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.customer?.name || 'Customer'}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <User className="w-4 h-4" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.customer?.name || 'Unknown Customer'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.product?.name || 'Unknown Product'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'return_info',
      label: 'Return Info',
      render: (_value, row) => (
        <Box>
          {row.return_date && (
            <Box className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {new Date(row.return_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          {row.serial_number && (
            <Box className="flex items-center gap-1">
              <Package className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                Serial: {row.serial_number.serial_no}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'status_priority',
      label: 'Status',
      render: (_value, row) => (
        <Box className="!space-y-1">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              row.status || ''
            )}`}
          >
            {getStatusLabel(row.status || '')}
          </span>
        </Box>
      ),
    },
    {
      id: 'reason_notes',
      label: 'Reason & Notes',
      render: (_value, row) => {
        const hasReason = row.reason;
        const hasResolutionNotes = row.resolution_notes;

        if (!hasReason && !hasResolutionNotes) {
          return (
            <Typography variant="caption" className="!text-gray-400 !italic">
              No info
            </Typography>
          );
        }

        return (
          <Box>
            {hasReason && (
              <Box className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <Typography
                  variant="caption"
                  className="!text-orange-600 !truncate"
                >
                  {row.reason?.length && row.reason?.length > 30
                    ? `${row.reason?.substring(0, 30)}...`
                    : row.reason}
                </Typography>
              </Box>
            )}
            {hasResolutionNotes && (
              <Box className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-400" />
                <Typography
                  variant="caption"
                  className="!text-blue-600 !truncate"
                >
                  {row.resolution_notes?.length &&
                  row.resolution_notes?.length > 30
                    ? `${row.resolution_notes?.substring(0, 30)}...`
                    : row.resolution_notes}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      id: 'approval_info',
      label: 'Approval Info',
      render: (_value, row) => (
        <Box>
          {row.approved_user && (
            <Box className="flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-green-400" />
              <Typography variant="caption" className="!text-green-600">
                {row.approved_user.name}
              </Typography>
            </Box>
          )}
          {row.approved_date && (
            <Box className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {new Date(row.approved_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          {!row.approved_user && !row.approved_date && (
            <Typography variant="caption" className="!text-gray-400 !italic">
              Not approved
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
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
    ...(isRead || isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: ReturnRequest) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    icon={<Visibility />}
                    onClick={() => handleViewDetails(row)}
                    tooltip={`View return request for ${row.customer?.name}`}
                    color="success"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditReturnRequest(row)}
                    tooltip={`Edit return request for ${row.customer?.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteReturnRequest(row.id)}
                    tooltip={`Delete return request for ${row.customer?.name}`}
                    itemName={`return request for ${row.customer?.name}`}
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
          <p className="!font-bold text-xl !text-gray-900">Return Requests</p>
          <p className="!text-gray-500 text-sm">
            Manage product return requests, track approval status, and monitor
            return processing
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
        <StatsCard
          title="Total"
          value={totalRequests}
          icon={<FileText className="w-4 h-4" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending"
          value={pendingRequests}
          icon={<Clock className="w-4 h-4" />}
          color="yellow"
          isLoading={isLoading}
        />
        <StatsCard
          title="Approved"
          value={approvedRequests}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rejected"
          value={rejectedRequests}
          icon={<XCircle className="w-4 h-4" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Processing"
          value={processingRequests}
          icon={<Clock className="w-4 h-4" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Completed"
          value={completedRequests}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Cancelled"
          value={cancelledRequests}
          icon={<XCircle className="w-4 h-4" />}
          color="gray"
          isLoading={isLoading}
        />
        <StatsCard
          title="New"
          value={newRequestsThisMonth}
          icon={<Calendar className="w-4 h-4" />}
          color="gray"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load return Requests. Please try again.
        </Alert>
      )}

      <Table
        data={returnRequests}
        columns={returnRequestColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between items-center flex-wrap w-full gap-2">
              <div className="flex gap-2 items-center flex-wrap">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Return Requests"
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
                      className="!min-w-40"
                      size="small"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              {isRead && (
                <div className="flex items-center gap-2">
                  <PopConfirm
                    title="Export Return Requests"
                    description="Are you sure you want to export the current return requests data to Excel? This will include all filtered results."
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
                    onClick={handleImportReturnRequests}
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
                  onClick={handleCreateReturnRequest}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={returnRequest => returnRequest.id}
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No return requests found matching "${search}"`
            : 'No return requests found in the system'
        }
      />

      <ManageReturnRequest
        selectedReturnRequest={selectedReturnRequest}
        setSelectedReturnRequest={setSelectedReturnRequest}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        users={users}
        products={products}
      />

      <ImportReturnRequest
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default ReturnRequests;
