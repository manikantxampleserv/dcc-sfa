import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMobileErrorLogs } from 'hooks/useMobileErrorLogs';
import { usePermission } from 'hooks/usePermission';
import { Activity, AlertTriangle, Calendar, Clock, X } from 'lucide-react';
import React, { useState } from 'react';
import type { MobileErrorLogData } from 'services/mobileErrorLogs';
import { ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDateTime } from 'utils/dateUtils';
import { formatDeviceInfo } from 'utils/deviceUtils';

const MobileErrorLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [errorType, setErrorType] = useState('ALL');
  const [userFilter, setUserFilter] = useState('');
  const [selectedError, setSelectedError] = useState<MobileErrorLogData | null>(
    null
  );

  // You might want to update this permission key if mobile errors has a different one
  const { isRead } = usePermission('error-logs');

  const { data: responseData, isFetching } = useMobileErrorLogs(
    {
      page,
      limit: pageSize,
      search: search === '' ? undefined : search,
      error_type: errorType === 'ALL' ? undefined : errorType,
      user_id: userFilter ? Number(userFilter) : undefined,
    },
    { enabled: isRead }
  );

  const logs = responseData?.data || [];
  const pagination = responseData?.pagination || {
    currentPage: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  };

  const currentPage = (pagination.currentPage || 1) - 1;

  const columns: TableColumn<MobileErrorLogData>[] = [
    {
      id: 'id',
      label: 'Error ID',
      render: value => (
        <span className="font-medium text-gray-700">ERR{value}</span>
      ),
    },
    {
      id: 'error_message',
      label: 'Error Message',
      render: value => (
        <Tooltip title={value} placement="top" arrow>
          <div className="max-w-xs truncate text-red-600 font-medium">
            {value}
          </div>
        </Tooltip>
      ),
    },
    {
      id: 'screen_name',
      label: 'Screen / Type',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 border border-gray-200">
            {row.error_type || 'Unknown'}
          </span>
          <Tooltip title={row.screen_name || ''} placement="top" arrow>
            <span className="text-gray-600 truncate max-w-[150px]">
              {row.screen_name || 'Global'}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      id: 'user_name',
      label: 'User',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          {row.user_name && row.user_name !== 'N/A' ? (
            <>
              <Avatar
                alt={row.user_name}
                className="!rounded !bg-primary-100 !text-primary-500"
                sx={{ width: 32, height: 32 }}
              >
                {row.user_name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{row.user_name}</span>
                <span className="text-xs text-gray-500">
                  {row.employee_code && row.employee_code !== 'N/A'
                    ? row.employee_code
                    : ''}
                </span>
              </div>
            </>
          ) : (
            <span className="text-gray-400 italic">Anonymous</span>
          )}
        </div>
      ),
    },
    {
      id: 'device_info',
      label: 'Device',
      render: (_value, row) => (
        <Tooltip title={row.device_info || 'No Device'} arrow placement="top">
          <Typography
            variant="body2"
            className="text-gray-600 truncate max-w-[200px]"
          >
            {formatDeviceInfo(row.device_info)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'createdate',
      label: 'Date Logged',
      render: value => (
        <div className="flex flex-col text-gray-600">
          <span>{formatDateTime(value)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Details',
      render: (_value, row) => (
        <ViewButton
          tooltip="View Trace"
          onClick={() => setSelectedError(row)}
        />
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Mobile App Error Logs
          </p>
          <p className="!text-gray-500 text-sm">
            Track application crashes, API timeouts, and offline sync issues
            logged from mobile devices.
          </p>
        </Box>
      </Box>

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatsCard
            title="Total Errors"
            value={responseData?.stats?.total_errors ?? 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            isLoading={isFetching}
          />
          <StatsCard
            title="Today's Errors"
            value={responseData?.stats?.today_errors ?? 0}
            icon={<Activity className="w-6 h-6" />}
            color="orange"
            isLoading={isFetching}
          />
          <StatsCard
            title="This Week's Errors"
            value={responseData?.stats?.this_week_errors ?? 0}
            icon={<Clock className="w-6 h-6" />}
            color="blue"
            isLoading={isFetching}
          />
          <StatsCard
            title="This Month's Errors"
            value={responseData?.stats?.this_month_errors ?? 0}
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
            isLoading={isFetching}
          />
        </div>
      )}

      <Table
        isPermission={isRead}
        columns={columns}
        data={logs}
        loading={isFetching}
        pagination={true}
        page={currentPage}
        rowsPerPage={pageSize}
        totalCount={pagination.totalRecords}
        onPageChange={newPage => setPage(newPage + 1)}
        emptyMessage="No error logs found matching the current filters."
        actions={
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search error message, screen..."
                value={search}
                onChange={setSearch}
                debounceMs={400}
                showClear={true}
                className="!w-80"
              />
              <Select
                value={errorType}
                setValue={setErrorType}
                placeholder="Error Type"
                className="!w-50"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="Crash">Crash</MenuItem>
                <MenuItem value="API Timeout">API Timeout</MenuItem>
                <MenuItem value="Network">Network</MenuItem>
                <MenuItem value="Sync Error">Sync Error</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
              <Box className="!w-64">
                <UserSelect
                  label=""
                  placeholder="Select User"
                  value={userFilter}
                  setValue={val => {
                    setUserFilter(val);
                    setPage(1);
                  }}
                  fullWidth
                  size="small"
                />
              </Box>
            </div>
          </div>
        }
      />

      <Dialog
        open={!!selectedError}
        onClose={() => setSelectedError(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-600">Mobile Error Details</span>
            <IconButton onClick={() => setSelectedError(null)} size="small">
              <X size={20} />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className="p-6">
          {selectedError && (
            <div className="space-y-4 pt-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <Typography
                  variant="subtitle2"
                  className="text-red-800 font-bold mb-1"
                >
                  Message
                </Typography>
                <Typography className="text-red-700 font-mono text-sm break-words">
                  {selectedError.error_message}
                </Typography>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 font-bold mb-1"
                  >
                    Error Info
                  </Typography>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-semibold">Type:</span>{' '}
                      {selectedError.error_type || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-semibold">Screen:</span>{' '}
                      {selectedError.screen_name || 'Global'}
                    </div>
                    <div>
                      <span className="font-semibold">Synced:</span>{' '}
                      {selectedError.is_synced === 1 ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-semibold">Timestamp:</span>{' '}
                      {formatDateTime(selectedError.createdate)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 font-bold mb-1"
                  >
                    User Info
                  </Typography>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedError.user_name &&
                    selectedError.user_name !== 'N/A' ? (
                      <>
                        <div>
                          <span className="font-semibold">Name:</span>{' '}
                          {selectedError.user_name}
                        </div>
                        {selectedError.user_email && (
                          <div>
                            <span className="font-semibold">Email:</span>{' '}
                            {selectedError.user_email}
                          </div>
                        )}
                        {selectedError.employee_code && (
                          <div>
                            <span className="font-semibold">Emp Code:</span>{' '}
                            {selectedError.employee_code}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="italic">Anonymous request</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Typography
                  variant="subtitle2"
                  className="text-gray-700 font-bold mb-1"
                >
                  Device Info
                </Typography>
                <div className="text-sm text-gray-600">
                  {selectedError.device_info || 'No device details captured'}
                </div>
              </div>

              {selectedError.stack_trace && (
                <div className="bg-gray-900 p-4 rounded-lg">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-300 font-bold mb-2"
                  >
                    Stack Trace
                  </Typography>
                  <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-words">
                    {selectedError.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className="border-t border-gray-200 p-4 bg-gray-50">
          <Button onClick={() => setSelectedError(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileErrorLogs;
