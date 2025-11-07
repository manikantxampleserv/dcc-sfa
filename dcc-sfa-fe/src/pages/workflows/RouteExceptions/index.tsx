import { Chip, MenuItem, Skeleton, Typography } from '@mui/material';
import { AlertTriangle, Truck } from 'lucide-react';
import React, { useState } from 'react';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

interface RouteException {
  id: number;
  route_id: number;
  route_name?: string;
  exception_type: string;
  description: string;
  reported_by: number;
  reported_date: string;
  status: string;
  severity: string;
  resolved_date?: string;
  resolved_by?: number;
  reported_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

const RouteExceptions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // TODO: Replace with actual API call
  const isLoading = false;
  const exceptions: RouteException[] = [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: TableColumn<RouteException>[] = [
    {
      id: 'route_name',
      label: 'Route',
      render: (_value, row) => (
        <div className="!flex !items-center !gap-2">
          <Truck className="!w-4 !h-4 !text-gray-400" />
          <Typography variant="body2">
            {row.route_name || `Route #${row.route_id}`}
          </Typography>
        </div>
      ),
    },
    {
      id: 'exception_type',
      label: 'Exception Type',
      render: (_value, row) => (
        <Chip label={row.exception_type} size="small" className="!capitalize" />
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography variant="body2" className="!max-w-md !truncate">
          {row.description}
        </Typography>
      ),
    },
    {
      id: 'severity',
      label: 'Severity',
      render: (_value, row) => (
        <Chip
          label={row.severity}
          color={getSeverityColor(row.severity) as any}
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
      id: 'reported_by',
      label: 'Reported By',
      render: (_value, row) =>
        row.reported_by_user?.name || `User #${row.reported_by}`,
    },
    {
      id: 'reported_date',
      label: 'Reported Date',
      render: (_value, row) => formatDate(row.reported_date),
    },
    {
      id: 'resolved_date',
      label: 'Resolved Date',
      render: (_value, row) =>
        row.resolved_date ? formatDate(row.resolved_date) : '-',
    },
  ];

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h5" className="!font-bold !text-gray-900">
            Route Exceptions
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Monitor and manage exceptions reported for delivery routes
          </Typography>
        </div>
      </div>

      <div className="!bg-white !rounded-lg !shadow-sm !p-4 !mb-6">
        <div className="!flex !flex-wrap !gap-4 !items-end">
          <div className="!flex-1 ">
            <SearchInput
              placeholder="Search Route Exceptions..."
              value={search}
              className="!min-w-[300px]"
              onChange={setSearch}
            />
          </div>
          <div className="!w-[180px]">
            <Select
              label="Status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              fullWidth={true}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </div>
          <div className="!w-[180px]">
            <Select
              label="Severity"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              fullWidth={true}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="!bg-white !rounded-lg !shadow-sm !p-4">
          {[1, 2, 3, 4, 5].map(item => (
            <Skeleton key={item} height={60} className="!mb-2" />
          ))}
        </div>
      ) : exceptions.length === 0 ? (
        <div className="!bg-white !rounded-lg !shadow-sm !p-12 !text-center">
          <AlertTriangle className="!w-16 !h-16 !text-gray-400 !mx-auto !mb-4" />
          <Typography variant="h6" className="!text-gray-600 !mb-2">
            No Route Exceptions
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            There are no route exceptions to display at this time.
          </Typography>
        </div>
      ) : (
        <Table
          columns={columns}
          data={exceptions}
          page={page - 1}
          onPageChange={newPage => setPage(newPage + 1)}
          rowsPerPage={limit}
        />
      )}
    </>
  );
};

export default RouteExceptions;
