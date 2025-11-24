import { Box, Chip, MenuItem } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import { useAttendanceHistoryReport } from 'hooks/useReports';
import { Clock, Download, MapPin, User, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportAttendanceHistoryReport } from 'services/reports/attendance';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDate, formatDateTime } from 'utils/dateUtils';

const AttendanceReports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [actionType, setActionType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useAttendanceHistoryReport(
    {
      page,
      limit,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      user_id: userId,
      action_type: actionType === 'all' ? undefined : actionType,
      search: search || undefined,
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.stats || {
    total_history_records: 0,
    punch_in_count: 0,
    punch_out_count: 0,
    history_this_month: 0,
  };

  const pagination = reportData?.meta || {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportAttendanceHistoryReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        user_id: userId,
        action_type: actionType === 'all' ? undefined : actionType,
        search: search || undefined,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, userId, actionType, search]);

  const handleUserChange = useCallback((_event: any, user: any) => {
    setUserId(user?.id || undefined);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const columns: TableColumn<any>[] = [
    {
      id: 'employee',
      label: 'Employee',
      render: (_value, row) => {
        const user = row.attendance?.user;
        if (!user) return <span className="text-sm text-gray-500">N/A</span>;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user.name}</span>
              <span className="text-xs text-gray-500">
                {user.employee_id || `ID: ${user.id}`} • {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'attendance_date',
      label: 'Date',
      render: (_value, row) => (
        <span className="text-sm">
          {row.attendance?.attendance_date
            ? formatDate(row.attendance.attendance_date)
            : 'N/A'}
        </span>
      ),
    },
    {
      id: 'action_type',
      label: 'Action',
      render: value => {
        const actionLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (actionLower === 'punch_in') {
          chipColor = 'success';
        } else if (actionLower === 'punch_out') {
          chipColor = 'info';
        }

        return (
          <Chip
            label={value?.replace(/_/g, ' ')}
            size="small"
            className="!capitalize !text-xs"
            color={chipColor}
          />
        );
      },
    },
    {
      id: 'action_time',
      label: 'Action Time',
      render: value => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {value ? formatDateTime(value) : 'N/A'}
          </span>
        </div>
      ),
    },

    {
      id: 'address',
      label: 'Location',
      render: value => (
        <div className="flex items-center gap-1 max-w-xs">
          {value ? (
            <>
              <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{value}</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Attendance History Report
          </p>
          <p className="!text-gray-500 text-sm">
            View and analyze employee attendance history records
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current report data to Excel?"
          onConfirm={handleExportToExcel}
          confirmText="Export"
          cancelText="Cancel"
          placement="bottom"
        >
          <Button
            startIcon={<Download className="w-4 h-4" />}
            variant="outlined"
          >
            Export to Excel
          </Button>
        </PopConfirm>
      </Box>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            setValue={value => {
              setStartDate(value);
              handleFilterChange();
            }}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            setValue={value => {
              setEndDate(value);
              handleFilterChange();
            }}
          />
          <Box className="!w-full">
            <UserSelect
              label="Employee"
              value={userId}
              onChange={handleUserChange}
              fullWidth={true}
              size="small"
            />
          </Box>
          <Select
            label="Action Type"
            value={actionType}
            onChange={e => {
              setActionType(e.target.value);
              handleFilterChange();
            }}
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="punch_in">Punch In</MenuItem>
            <MenuItem value="punch_out">Punch Out</MenuItem>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total History Records
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_history_records}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Punch In</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.punch_in_count}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Punch Out</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.punch_out_count}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.history_this_month}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}

      <Table
        columns={columns}
        actions={
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <SearchInput
              placeholder="Search by action type, address..."
              value={search}
              className="!w-80"
              onChange={value => {
                setSearch(value);
                handleFilterChange();
              }}
              debounceMs={400}
            />
          </div>
        }
        data={reportData?.data || []}
        loading={isLoading}
        totalCount={pagination.total_count || 0}
        page={pagination.current_page - 1 || 0}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage="No attendance history records found"
      />
    </div>
  );
};

export default AttendanceReports;
