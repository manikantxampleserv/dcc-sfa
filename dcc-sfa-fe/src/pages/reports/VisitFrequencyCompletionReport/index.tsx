import { Box, Chip, MenuItem } from '@mui/material';
import { useCustomers } from 'hooks/useCustomers';
import { usePermission } from 'hooks/usePermission';
import { useVisitFrequencyCompletionReport } from 'hooks/useReports';
import { useUsers } from 'hooks/useUsers';
import {
  Download,
  MapPin,
  Clock,
  Target,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportVisitFrequencyCompletionReport } from 'services/reports/visitFrequencyCompletion';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const VisitFrequencyCompletionReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salespersonId, setSalespersonId] = useState<number | undefined>(
    undefined
  );
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('all');
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useVisitFrequencyCompletionReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      salesperson_id: salespersonId,
      customer_id: customerId,
      status: status === 'all' ? undefined : status,
    },
    {
      enabled: isRead,
    }
  );

  const { data: customersData } = useCustomers();
  const { data: usersData } = useUsers();

  const customers = customersData?.data || [];
  const users = usersData?.data || [];

  const summary = reportData?.summary || {
    total_visits: 0,
    completed_visits: 0,
    in_progress_visits: 0,
    planned_visits: 0,
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    avg_duration_minutes: 0,
    total_orders_created: 0,
    total_amount_collected: 0,
    completion_rate: 0,
    gps_logs_count: 0,
  };

  // Handle export to Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      await exportVisitFrequencyCompletionReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        salesperson_id: salespersonId,
        customer_id: customerId,
        status: status === 'all' ? undefined : status,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, salespersonId, customerId, status]);

  // Visits columns
  const visitsColumns: TableColumn<any>[] = [
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.customer_name}</span>
          <span className="text-xs text-gray-500">{row.customer_code}</span>
        </div>
      ),
    },
    {
      id: 'salesperson_name',
      label: 'Sales Person',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">
              {row.salesperson_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {row.salesperson_name}
            </span>
            <span className="text-xs text-gray-500">
              {row.salesperson_email}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'route_name',
      label: 'Route',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'visit_date',
      label: 'Visit Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'purpose',
      label: 'Purpose',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'completed' || statusLower === 'closed') {
          chipColor = 'success';
        } else if (statusLower === 'in_progress' || statusLower === 'started') {
          chipColor = 'warning';
        } else if (statusLower === 'planned' || statusLower === 'scheduled') {
          chipColor = 'info';
        } else if (statusLower === 'cancelled' || statusLower === 'no_show') {
          chipColor = 'error';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'duration_minutes',
      label: 'Duration',
      numeric: true,
      render: value => <span className="text-sm">{value} min</span>,
    },
    {
      id: 'orders_created',
      label: 'Orders',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'completion_rate',
      label: 'Tasks Complete',
      numeric: true,
      render: value => (
        <Chip
          label={`${value}%`}
          size="small"
          color={
            Number(value) >= 100
              ? 'success'
              : Number(value) >= 75
                ? 'info'
                : 'warning'
          }
          variant="outlined"
        />
      ),
    },
  ];

  // Visit Tasks columns
  const tasksColumns: TableColumn<any>[] = [
    {
      id: 'customer_name',
      label: 'Customer',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'visit_date',
      label: 'Visit Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'task_type',
      label: 'Task Type',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'description',
      label: 'Description',
      render: value => (
        <span className="text-sm max-w-xs truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      id: 'due_date',
      label: 'Due Date',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'completed' || statusLower === 'done') {
          chipColor = 'success';
        } else if (statusLower === 'in_progress' || statusLower === 'started') {
          chipColor = 'warning';
        } else if (statusLower === 'pending') {
          chipColor = 'info';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
  ];

  // GPS Logs columns
  const gpsLogsColumns: TableColumn<any>[] = [
    {
      id: 'user_name',
      label: 'User',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'log_time',
      label: 'Log Time',
      render: value => formatDate(value) || 'N/A',
    },
    {
      id: 'latitude',
      label: 'Latitude',
      numeric: true,
      render: value => (
        <span className="text-sm">{Number(value).toFixed(6)}</span>
      ),
    },
    {
      id: 'longitude',
      label: 'Longitude',
      numeric: true,
      render: value => (
        <span className="text-sm">{Number(value).toFixed(6)}</span>
      ),
    },
    {
      id: 'speed_kph',
      label: 'Speed',
      numeric: true,
      render: value => (
        <span className="text-sm">{Number(value).toFixed(1)} km/h</span>
      ),
    },
    {
      id: 'battery_level',
      label: 'Battery',
      numeric: true,
      render: value => {
        const battery = Number(value);
        const color =
          battery > 50
            ? 'text-green-600'
            : battery > 20
              ? 'text-yellow-600'
              : 'text-red-600';
        return <span className={`text-sm ${color}`}>{battery}%</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Visit Frequency/Completion Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track visit patterns, completion rates, and GPS logs
          </p>
        </Box>
        {isRead && (
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
        )}
      </Box>

      {isRead && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              setValue={setStartDate}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              setValue={setEndDate}
            />
            <Select
              label="Salesperson"
              value={salespersonId?.toString() || 'all'}
              onChange={e =>
                setSalespersonId(
                  e.target.value && e.target.value !== 'all'
                    ? parseInt(e.target.value)
                    : undefined
                )
              }
            >
              <MenuItem value="all">All Salespeople</MenuItem>
              {users.map((user: any) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Customer"
              value={customerId?.toString() || 'all'}
              onChange={e =>
                setCustomerId(
                  e.target.value && e.target.value !== 'all'
                    ? parseInt(e.target.value)
                    : undefined
                )
              }
            >
              <MenuItem value="all">All Customers</MenuItem>
              {customers.map((customer: any) => (
                <MenuItem key={customer.id} value={customer.id.toString()}>
                  {customer.name} ({customer.code})
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_visits}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.completed_visits}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tasks Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.completed_tasks}/{summary.total_tasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.avg_duration_minutes} min
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GPS Logs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.gps_logs_count}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Calendar className="w-5 h-5" /> Visits (
            {reportData?.data?.visits?.length || 0})
          </Box>
        }
        columns={visitsColumns}
        data={reportData?.data?.visits || []}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      {/* Visit Tasks Table */}

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Target className="w-5 h-5" />
            Visit Tasks ({reportData?.data?.tasks?.length || 0})
          </Box>
        }
        columns={tasksColumns}
        data={reportData?.data?.tasks || []}
        loading={isLoading}
        pagination={false}
      />

      {/* GPS Logs Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <MapPin className="w-5 h-5" /> GPS Logs (
            {reportData?.data?.gps_logs?.length || 0})
          </Box>
        }
        columns={gpsLogsColumns}
        data={reportData?.data?.gps_logs || []}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default VisitFrequencyCompletionReport;
