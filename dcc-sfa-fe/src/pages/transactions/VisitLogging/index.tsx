import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  UserCheck,
  XCircle,
  Route as RouteIcon,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useUsers } from '../../../hooks/useUsers';
import { useRoutes } from '../../../hooks/useRoutes';
import { useZones } from '../../../hooks/useZones';
import {
  useDeleteVisit,
  useVisits,
  type Visit,
} from '../../../hooks/useVisits';
import ManageVisit from './ManageVisit';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

const VisitLogging: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salespersonFilter, setSalespersonFilter] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: visitsResponse,
    isLoading,
    error,
  } = useVisits({
    search,
    page,
    limit,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
    sales_person_id:
      salespersonFilter === 'all' ? undefined : Number(salespersonFilter),
  });

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000, // Get all users for salesperson filtering
  });

  const { data: routesResponse } = useRoutes({
    page: 1,
    limit: 100, // Get all routes
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100, // Get all zones
  });

  const visits = visitsResponse?.data || [];
  const users = usersResponse?.data || [];
  const routes = routesResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const totalCount = visitsResponse?.meta?.total || 0;
  const currentPage = (visitsResponse?.meta?.page || 1) - 1;

  const deleteVisitMutation = useDeleteVisit();

  // Mock customers data - replace with actual API call
  const customers: Customer[] = [
    { id: 1, name: 'ABC Store', email: 'abc@store.com', phone: '+1234567890' },
    {
      id: 2,
      name: 'XYZ Market',
      email: 'xyz@market.com',
      phone: '+1234567891',
    },
    {
      id: 3,
      name: 'Quick Mart',
      email: 'quick@mart.com',
      phone: '+1234567892',
    },
  ];

  // Statistics - Use API stats when available, fallback to local calculation
  const totalVisits = visitsResponse?.stats?.total_visits ?? visits.length;
  const activeVisits =
    visitsResponse?.stats?.active_visits ??
    visits.filter(v => v.is_active === 'Y').length;
  const inactiveVisits =
    visitsResponse?.stats?.inactive_visits ??
    visits.filter(v => v.is_active === 'N').length;
  const newVisitsThisMonth = visitsResponse?.stats?.new_visits || 0;

  const handleCreateVisit = useCallback(() => {
    setSelectedVisit(null);
    setDrawerOpen(true);
  }, []);

  const handleEditVisit = useCallback((visit: Visit) => {
    setSelectedVisit(visit);
    setDrawerOpen(true);
  }, []);

  const handleDeleteVisit = useCallback(
    async (id: number) => {
      try {
        await deleteVisitMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting visit:', error);
      }
    },
    [deleteVisitMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Define table columns following Zone pattern
  const visitColumns: TableColumn<Visit>[] = [
    {
      id: 'customer',
      label: 'Customer & Purpose',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.customer?.name || 'Customer'}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.customer?.name || 'Unknown Customer'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.purpose || 'No purpose specified'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'salesperson',
      label: 'Salesperson',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-gray-400" />
          <span className="text-sm">
            {row.salesperson?.name || (
              <span className="text-sm italic text-gray-500">
                No Salesperson
              </span>
            )}
          </span>
        </Box>
      ),
    },
    {
      id: 'route_zone',
      label: 'Route & Zone',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center gap-1 mb-1">
            <RouteIcon className="w-3 h-3 text-gray-400" />
            <Typography variant="caption" className="!text-gray-600">
              {row.route?.name || 'No Route'}
            </Typography>
          </Box>
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <Typography variant="caption" className="!text-gray-600">
              {row.zone?.name || 'No Zone'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'visit_details',
      label: 'Visit Details',
      render: (_value, row) => (
        <Box>
          {row.visit_date && (
            <Box className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {new Date(row.visit_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          {row.visit_time && (
            <Box className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {row.visit_time}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            row.status || ''
          )}`}
        >
          {getStatusLabel(row.status || '')}
        </span>
      ),
    },
    {
      id: 'orders_amount',
      label: 'Orders & Amount',
      render: (_value, row) => (
        <Box>
          <Typography variant="caption" className="!text-gray-600 !block">
            Orders: {row.orders_created || 0}
          </Typography>
          <Typography variant="caption" className="!text-gray-600 !block">
            Amount: {row.amount_collected || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          className="w-26"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditVisit(row)}
            tooltip={`Edit visit for ${row.customer?.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteVisit(row.id)}
            tooltip={`Delete visit for ${row.customer?.name}`}
            itemName={`visit for ${row.customer?.name}`}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  // Show all users as potential salespeople
  const salespeople = users;

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Visit Logging</p>
          <p className="!text-gray-500 text-sm">
            Manage customer visits, track activities, and monitor field
            operations
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalVisits}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Visits</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeVisits}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Visits
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveVisits}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                New This Month
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {newVisitsThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load visits. Please try again.
        </Alert>
      )}

      <Table
        data={visits}
        columns={visitColumns}
        actions={
          <div className="flex justify-between w-full">
            <div className="flex gap-3">
              <SearchInput
                placeholder="Search Visits"
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                fullWidth={false}
                className="!min-w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="!min-w-32"
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              <Select
                value={salespersonFilter}
                onChange={e => setSalespersonFilter(e.target.value)}
                className="!min-w-60"
                size="small"
              >
                <MenuItem value="all">All Salespeople</MenuItem>
                {salespeople.map(salesperson => (
                  <MenuItem
                    key={salesperson.id}
                    value={salesperson.id.toString()}
                  >
                    {salesperson.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateVisit}
            >
              Create Visit
            </Button>
          </div>
        }
        getRowId={visit => visit.id}
        initialOrderBy="visit_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No visits found matching "${search}"`
            : 'No visits found in the system'
        }
      />

      <ManageVisit
        selectedVisit={selectedVisit}
        setSelectedVisit={setSelectedVisit}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        customers={customers}
        users={users}
        routes={routes}
        zones={zones}
      />
    </>
  );
};

export default VisitLogging;
