import { Block, CheckCircle, Download } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteLoginHistory,
  useLoginHistory,
  type LoginHistory,
} from 'hooks/useLoginHistory';
import { History, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';

const LoginHistoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: loginHistoryResponse,
    isLoading,
    error,
  } = useLoginHistory({
    search,
    page,
    limit,
    login_status:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'success'
          : 'failed',
  });

  const loginHistory = loginHistoryResponse?.data || [];
  const totalCount = loginHistoryResponse?.meta?.total_count || 0;
  const currentPage = (loginHistoryResponse?.meta?.current_page || 1) - 1;

  const deleteLoginHistoryMutation = useDeleteLoginHistory();
  const exportToExcelMutation = useExportToExcel();

  const totalLogins =
    loginHistoryResponse?.stats?.total_logins ?? loginHistory.length;
  const successfulLogins =
    loginHistoryResponse?.stats?.successful_logins ??
    loginHistory.filter(lh => lh.login_status === 'success').length;
  const failedLogins = loginHistoryResponse?.stats?.failed_logins ?? 0;
  const todayLogins = loginHistoryResponse?.stats?.today_logins ?? 0;

  const handleDeleteLoginHistory = useCallback(
    async (id: number) => {
      try {
        await deleteLoginHistoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting login history:', error);
      }
    },
    [deleteLoginHistoryMutation]
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
        login_status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'success'
              : 'failed',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'login_history',
        filters,
      });
    } catch (error) {
      console.error('Error exporting login history:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const loginHistoryColumns: TableColumn<LoginHistory>[] = [
    {
      id: 'user',
      label: 'User',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.user?.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            {row.user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.user?.name || 'Unknown User'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.user?.email || `ID: ${row.user_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'login_time',
      label: 'Login Time',
      sortable: true,
      render: value => (
        <Typography variant="body2">
          {value ? formatDateTime(value) : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'logout_time',
      label: 'Logout Time',
      sortable: true,
      render: value => (
        <Typography variant="body2">
          {value ? formatDateTime(value) : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      sortable: true,
      render: value => (
        <Typography variant="body2" className="font-mono text-sm">
          {value?.replace(/^::ffff:/, '') || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'device_info',
      label: 'Device',
      sortable: false,
      render: value => (
        <Tooltip title={value || 'N/A'} placement="top" arrow>
          <Typography
            variant="body2"
            className="max-w-[200px] truncate text-gray-600"
          >
            {value || 'N/A'}
          </Typography>
        </Tooltip>
      ),
    },

    {
      id: 'login_status',
      label: 'Login Status',
      sortable: true,
      render: value => (
        <Chip
          icon={value === 'success' ? <CheckCircle /> : <Block />}
          label={value === 'success' ? 'Success' : 'Failed'}
          size="small"
          className="w-26"
          color={value === 'success' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'failure_reason',
      label: 'Failure Reason',
      sortable: false,
      render: value => (
        <Typography variant="body2" className="text-gray-600">
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <DeleteButton
            onClick={() => handleDeleteLoginHistory(row.id)}
            tooltip={`Delete login history`}
            itemName="login history"
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
          <p className="!font-bold text-xl !text-gray-900">Login History</p>
          <p className="!text-gray-500 text-sm">
            Monitor login activities across your organization
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Logins
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalLogins}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <History className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">Successful</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {successfulLogins}
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
              <p className="text-sm font-medium text-red-500">Failed</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {failedLogins}
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
              <p className="text-sm font-medium text-purple-600">
                Today's Logins
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {todayLogins}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load login history. Please try again.
        </Alert>
      )}

      <Table
        data={loginHistory}
        columns={loginHistoryColumns}
        actions={
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search by IP, device, OS, or user..."
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
                <MenuItem value="active">Successful</MenuItem>
                <MenuItem value="inactive">Failed</MenuItem>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <PopConfirm
                title="Export Login History"
                description="Are you sure you want to export the current login history data to Excel? This will include all filtered results."
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
            </div>
          </div>
        }
        getRowId={loginHistory => loginHistory.id}
        initialOrderBy="login_time"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No login history found matching "${search}"`
            : 'No login history found in the system'
        }
      />
    </>
  );
};

export default LoginHistoryPage;
