import { Message } from '@mui/icons-material';
import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import type { Issue } from 'mock/data/issues';
import { mockIssues } from 'mock/data/issues';
import React from 'react';
import { ActionButton } from 'shared/ActionButton';
import StatsCard from 'shared/StatsCard';
import type { TableColumn } from 'shared/Table';
import Table from 'shared/Table';

const priorityColors: Record<string, string> = {
  low: 'text-gray-500 bg-gray-50',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
};

const statusColors: Record<
  string,
  'default' | 'primary' | 'success' | 'warning'
> = {
  open: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const MyIssues: React.FC = () => {
  const columns: TableColumn<Issue>[] = [
    {
      id: 'issue_number',
      label: 'Issue #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {row.issue_number}
        </span>
      ),
    },
    {
      id: 'subject',
      label: 'Subject',
      render: (_, row) => (
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="text-sm font-medium text-gray-800 line-clamp-1">
            {row.subject}
          </span>
          <span className="text-xs text-gray-500 line-clamp-1">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      render: (_, row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[row.priority]}`}
        >
          {row.priority.toUpperCase()}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={row.status.replace('_', ' ').toUpperCase()}
          size="small"
          color={statusColors[row.status]}
          variant="filled"
        />
      ),
    },
    {
      id: 'order_number',
      label: 'Order Ref',
      render: (_, row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.order_number}
        </span>
      ),
    },
    {
      id: 'created_at',
      label: 'Reported',
      render: (_, row) => (
        <span className="text-xs text-gray-500">
          {dayjs(row.created_at).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: '',
      render: () => (
        <ActionButton
          icon={<Message sx={{ fontSize: 16 }} />}
          color="info"
          tooltip="View Messages"
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">My Issues</p>
          <p className="text-sm text-gray-500">
            Track and manage your reported issues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Issues"
          value={mockIssues.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Open Issues"
          value={mockIssues.filter(i => i.status === 'open').length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="In Progress"
          value={mockIssues.filter(i => i.status === 'in_progress').length}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="Resolved"
          value={mockIssues.filter(i => i.status === 'resolved').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
      </div>

      <Table
        columns={columns}
        rows={mockIssues}
        emptyMessage="No issues reported."
      />
    </div>
  );
};

export default MyIssues;
