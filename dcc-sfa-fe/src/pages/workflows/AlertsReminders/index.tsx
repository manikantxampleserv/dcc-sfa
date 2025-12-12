import { Chip, MenuItem, Typography } from '@mui/material';
import { Bell, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { usePermission } from 'hooks/usePermission';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate, formatDateTime } from 'utils/dateUtils';

interface AlertReminder {
  id: number;
  title: string;
  description: string;
  type: 'alert' | 'reminder';
  category: string;
  priority: string;
  target_user_id?: number;
  target_role?: string;
  scheduled_date?: string;
  trigger_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_date: string;
  created_by: number;
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

const AlertsReminders: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isRead } = usePermission('alert');

  const isLoading = false;
  const alertsReminders: AlertReminder[] = [];

  const totalAlerts = alertsReminders.filter(a => a.type === 'alert').length;
  const totalReminders = alertsReminders.filter(
    a => a.type === 'reminder'
  ).length;
  const activeAlerts = alertsReminders.filter(
    a => a.status === 'active'
  ).length;
  const highPriority = alertsReminders.filter(
    a => a.priority === 'high'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'alert' ? (
      <XCircle className="!w-4 !h-4 !text-red-500" />
    ) : (
      <Bell className="!w-4 !h-4 !text-blue-500" />
    );
  };

  const columns: TableColumn<AlertReminder>[] = [
    {
      id: 'type',
      label: 'Type',
      render: (_value, row) => (
        <div className="!flex !items-center !gap-2">
          {getTypeIcon(row.type)}
          <Typography variant="body2" className="!capitalize">
            {row.type}
          </Typography>
        </div>
      ),
    },
    {
      id: 'title',
      label: 'Title',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium">
          {row.title}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!max-w-md !truncate !text-gray-600"
        >
          {row.description}
        </Typography>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (_value, row) => (
        <Chip label={row.category} size="small" className="!capitalize" />
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      render: (_value, row) => (
        <Chip
          label={row.priority}
          color={getPriorityColor(row.priority) as any}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.status}
          color={getStatusColor(row.status) as any}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'scheduled_date',
      label: 'Scheduled Date',
      render: (_value, row) =>
        row.scheduled_date ? formatDateTime(row.scheduled_date) : '-',
    },
    {
      id: 'trigger_date',
      label: 'Trigger Date',
      render: (_value, row) =>
        row.trigger_date ? formatDateTime(row.trigger_date) : '-',
    },
    {
      id: 'created_date',
      label: 'Created Date',
      render: (_value, row) => formatDate(row.created_date),
    },
  ];

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h5" className="!font-bold !text-gray-900">
            Alerts & Reminders
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Configure and manage system alerts and reminders for users and roles
          </Typography>
        </div>
      </div>

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Alerts"
            value={totalAlerts}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Reminders"
            value={totalReminders}
            icon={<Bell className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Alerts"
            value={activeAlerts}
            icon={<Bell className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="High Priority"
            value={highPriority}
            icon={<XCircle className="w-6 h-6" />}
            color="orange"
            isLoading={isLoading}
          />
        </div>
      )}

      <Table
        columns={columns}
        data={alertsReminders}
        loading={isLoading}
        page={page - 1}
        onPageChange={newPage => setPage(newPage + 1)}
        rowsPerPage={limit}
        isPermission={isRead}
        actions={
          isRead ? (
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <SearchInput
                  placeholder="Search Alerts & Reminders..."
                  value={search}
                  onChange={setSearch}
                  className="min-w-[300px]"
                />
              </div>
              <div className="w-[180px]">
                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="alert">Alerts</MenuItem>
                  <MenuItem value="reminder">Reminders</MenuItem>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select
                  label="Priority"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </div>
            </div>
          ) : undefined
        }
      />
    </>
  );
};

export default AlertsReminders;
