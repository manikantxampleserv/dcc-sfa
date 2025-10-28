import { Chip, MenuItem, Skeleton } from '@mui/material';
import { useAuditLogs } from 'hooks/useAuditLogs';
import { useUsers } from 'hooks/useUsers';
import {
  AlertCircle,
  Database,
  FileText,
  History,
  Info,
  Shuffle,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';

const ActivityLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState('all');
  const [userId, setUserId] = useState<string>('all');

  const { data: auditData, isLoading } = useAuditLogs({
    page,
    limit: pageSize,
    start_date: startDate === '' ? undefined : startDate,
    end_date: endDate === '' ? undefined : endDate,
    action: action === 'all' ? undefined : (action as any),
    user_id: userId === 'all' ? undefined : parseInt(userId as string),
  });

  const { data: usersData } = useUsers();
  const users = usersData?.data || [];

  const logs = auditData?.logs || [];
  const statistics = auditData?.statistics || {
    total_logs: 0,
    by_action: { CREATE: 0, UPDATE: 0, DELETE: 0 },
    unique_tables: [],
    unique_users: [],
    unique_tables_count: 0,
    unique_users_count: 0,
  };
  const pagination = auditData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  };

  const SummaryStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map(item => (
        <div
          key={item}
          className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                className="!mb-2"
              />
              <Skeleton variant="text" width="40%" height={32} />
            </div>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="!bg-gray-100"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const columns: TableColumn<any>[] = [
    {
      id: 'user_name',
      label: 'User',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">
              {row.user_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium">{row.user_name}</div>
            <div className="text-xs text-gray-500">{row.user_email}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'changed_at',
      label: 'Date & Time',
      render: value => (
        <span className="text-sm text-gray-700">{formatDateTime(value)}</span>
      ),
    },
    {
      id: 'table_name',
      label: 'Table',
      render: value => (
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: 'record_id',
      label: 'Record ID',
      numeric: true,
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'action',
      label: 'Action',
      render: value => {
        const getActionIcon = (action: string) => {
          switch (action) {
            case 'CREATE':
              return <FileText className="w-4 h-4 text-green-600" />;
            case 'UPDATE':
              return <Shuffle className="w-4 h-4 text-blue-600" />;
            case 'DELETE':
              return <Trash2 className="w-4 h-4 text-red-600" />;
            default:
              return <Info className="w-4 h-4 text-gray-600" />;
          }
        };

        const getActionColor = (action: string): any => {
          switch (action) {
            case 'CREATE':
              return 'success';
            case 'UPDATE':
              return 'info';
            case 'DELETE':
              return 'error';
            default:
              return 'default';
          }
        };

        return (
          <div className="flex items-center gap-2">
            {getActionIcon(value)}
            <Chip label={value} size="small" color={getActionColor(value)} />
          </div>
        );
      },
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      render: value => (
        <span className="text-sm text-gray-600 font-mono">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      id: 'device_info',
      label: 'Device',
      render: value => (
        <span className="text-sm text-gray-600" title={value || ''}>
          {value ? value.substring(0, 30) + '...' : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">Activity Logs</h2>
          <p className="!text-gray-500 text-sm">
            Track and monitor all system activities and changes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
              label="Start Date"
            />
          </div>
          <div>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
              label="End Date"
            />
          </div>

          <Select
            label="Action"
            value={action}
            onChange={e => setAction(e.target.value)}
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
          </Select>
          <Select
            label="User"
            value={userId || 'all'}
            onChange={e => setUserId(e.target.value ? e.target.value : 'all')}
          >
            <MenuItem value="all">All Users</MenuItem>
            {users.map((user: any) => (
              <MenuItem key={user.id} value={user.id.toString()}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      {isLoading ? (
        <SummaryStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statistics.total_logs}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Created</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statistics.by_action.CREATE}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Updated</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statistics.by_action.UPDATE}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Deleted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statistics.by_action.DELETE}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}

      <Table
        columns={columns}
        data={logs}
        loading={isLoading}
        pagination={true}
        page={page - 1}
        rowsPerPage={pageSize}
        totalCount={pagination.total}
        onPageChange={(newPage: number) => setPage(newPage + 1)}
      />

      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No activity logs found</p>
          <p className="text-gray-400 text-sm mt-2">
            Please adjust your filters to view activity logs
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
