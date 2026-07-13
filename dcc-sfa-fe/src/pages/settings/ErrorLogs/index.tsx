import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useErrorLogs } from 'hooks/useErrorLogs';
import { usePermission } from 'hooks/usePermission';
import { Activity, AlertTriangle, Calendar, Clock, X } from 'lucide-react';
import React, { useState } from 'react';
import type { ErrorLogData } from 'services/errorLogs';
import { ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';
import { formatDeviceInfo } from 'utils/deviceUtils';

const ErrorLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [path, setPath] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorLogData | null>(null);

  const { isRead } = usePermission('error-logs');

  const { data: responseData, isFetching } = useErrorLogs(
    {
      page,
      limit: pageSize,
      path: path === '' ? undefined : path,
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

  const columns: TableColumn<any>[] = [
    {
      id: 'id',
      label: 'Error ID',
      render: value => (
        <span className="font-medium text-gray-700">ERROR{value}</span>
      ),
    },
    {
      id: 'message',
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
      id: 'path',
      label: 'Endpoint',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 border border-gray-200">
            {row.method}
          </span>
          <Tooltip title={row.path} placement="top" arrow>
            <span className="text-gray-600 truncate max-w-[200px]">
              {row.path}
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
          {row.user_id ? (
            <>
              <Avatar
                alt={row.user_name}
                className="!rounded !bg-primary-100 !text-primary-500"
              >
                {row.user_name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{row.user_name}</span>
                <span className="text-xs text-gray-500">
                  {row.employee_code}
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
      id: 'ip_address',
      label: 'IP Address',
      render: value => (
        <Typography variant="body2" className="font-mono text-sm">
          {value?.replace(/^::ffff:/, '') || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, row) => (
        <Typography variant="body2" className="text-gray-600">
          {row.location || 'Unknown'}
        </Typography>
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
          <p className="!font-bold text-xl !text-gray-900">System Error Logs</p>
          <p className="!text-gray-500 text-sm">
            Monitor and trace server-side exceptions and unhandled errors.
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
                placeholder="Search by endpoint path..."
                value={path}
                onChange={setPath}
                debounceMs={400}
                showClear={true}
                className="!w-80"
              />
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
            <span className="font-bold text-red-600">Error Details</span>
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
                  {selectedError.message}
                </Typography>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 font-bold mb-1"
                  >
                    Request Info
                  </Typography>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-semibold">Method:</span>{' '}
                      {selectedError.method}
                    </div>
                    <div>
                      <span className="font-semibold">Path:</span>{' '}
                      {selectedError.path}
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
                    {selectedError.user_id ? (
                      <>
                        <div>
                          <span className="font-semibold">ID:</span>{' '}
                          {selectedError.user_id}
                        </div>
                        <div>
                          <span className="font-semibold">Name:</span>{' '}
                          {selectedError.user_name}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span>{' '}
                          {selectedError.user_email}
                        </div>
                      </>
                    ) : (
                      <div className="italic">Anonymous request</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedError.query &&
                Object.keys(selectedError.query).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography
                      variant="subtitle2"
                      className="text-gray-700 font-bold mb-2"
                    >
                      Query Parameters
                    </Typography>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto text-gray-800 border border-gray-200">
                      {JSON.stringify(selectedError.query, null, 2)}
                    </pre>
                  </div>
                )}

              {selectedError.body &&
                Object.keys(selectedError.body).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography
                      variant="subtitle2"
                      className="text-gray-700 font-bold mb-2"
                    >
                      Request Body Payload
                    </Typography>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto text-gray-800 border border-gray-200">
                      {JSON.stringify(selectedError.body, null, 2)}
                    </pre>
                  </div>
                )}

              {selectedError.stack && (
                <div className="bg-gray-900 p-4 rounded-lg">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-300 font-bold mb-2"
                  >
                    Stack Trace
                  </Typography>
                  <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-words">
                    {selectedError.stack}
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

export default ErrorLogs;
