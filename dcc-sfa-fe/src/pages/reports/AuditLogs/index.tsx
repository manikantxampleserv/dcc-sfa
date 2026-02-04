import { Chip, MenuItem, Skeleton, Tooltip, Typography } from '@mui/material';
import { useAuditLogs } from 'hooks/useAuditLogs';
import { usePermission } from 'hooks/usePermission';
import {
  Database,
  Download,
  FileText,
  History,
  Info,
  Shuffle,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDateTime } from 'utils/dateUtils';
import { useExportToExcel } from '../../../hooks/useImportExport';

const ActivityLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [action, setAction] = useState('all');
  const [userId, setUserId] = useState<string>('all');
  const { isRead } = usePermission('report');

  const { data: auditData, isLoading } = useAuditLogs(
    {
      page,
      limit: pageSize,
      start_date: startDate === '' ? undefined : startDate,
      end_date: endDate === '' ? undefined : endDate,
      action: action === 'all' ? undefined : (action as any),
      user_id: userId === 'all' ? undefined : parseInt(userId as string),
    },
    {
      enabled: isRead,
    }
  );

  const exportToExcelMutation = useExportToExcel();

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

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        start_date: startDate === '' ? undefined : startDate,
        end_date: endDate === '' ? undefined : endDate,
        action: action === 'all' ? undefined : action,
        user_id: userId === 'all' ? undefined : parseInt(userId as string),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'audit_logs',
        filters,
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  }, [exportToExcelMutation, startDate, endDate, action, userId]);

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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg text-blue-600">
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
            <Chip
              label={value}
              size="small"
              color={getActionColor(value)}
              variant="outlined"
            />
          </div>
        );
      },
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      render: value => (
        <Tooltip title={value || 'N/A'} placement="top" arrow>
          <span className="text-sm text-gray-600 font-mono">
            {value || 'N/A'}
          </span>
        </Tooltip>
      ),
    },
    {
      id: 'device_info',
      label: 'Device',
      render: value => (
        <Tooltip title={value || 'N/A'} placement="top" arrow>
          <Typography variant="body2" className="text-gray-600">
            {value ? value.substring(0, 30) + '...' : 'N/A'}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">Audit Logs</h2>
          <p className="!text-gray-500 text-sm">
            Track and monitor all system activities and changes
          </p>
        </div>
        {isRead && (
          <PopConfirm
            title="Export Audit Logs"
            description="Are you sure you want to export the current audit logs data to Excel? This will include all filtered results."
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
        )}
      </div>

      {isRead && (
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <Input
                type="date"
                value={startDate}
                setValue={setStartDate}
                placeholder="Start Date"
                label="Start Date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={endDate}
                setValue={setEndDate}
                placeholder="End Date"
                label="End Date"
              />
            </div>

            <Select
              label="Action"
              value={action}
              onChange={e => setAction(e.target.value)}
              disableClearable
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="CREATE">Create</MenuItem>
              <MenuItem value="UPDATE">Update</MenuItem>
              <MenuItem value="DELETE">Delete</MenuItem>
            </Select>
            <UserSelect
              label="User"
              value={userId || 'all'}
              setValue={setUserId}
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {isLoading ? (
        <SummaryStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <StatsCard
            title="Total Logs"
            value={statistics.total_logs}
            icon={<History className="w-6 h-6" />}
            color="blue"
          />

          <StatsCard
            title="Created"
            value={statistics.by_action.CREATE}
            icon={<FileText className="w-6 h-6" />}
            color="green"
          />

          <StatsCard
            title="Updated"
            value={statistics.by_action.UPDATE}
            icon={<Shuffle className="w-6 h-6" />}
            color="blue"
          />

          <StatsCard
            title="Deleted"
            value={statistics.by_action.DELETE}
            icon={<Trash2 className="w-6 h-6" />}
            color="red"
          />
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
        isPermission={isRead}
      />
    </div>
  );
};

export default ActivityLogs;
