import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { useUsers } from 'hooks/useUsers';
import { useDeleteVisit, useVisits, type Visit } from 'hooks/useVisits';
import {
  Calendar,
  Clock,
  MapPin,
  Route as RouteIcon,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageVisit from './ManageVisit';
import ImportVisit from './ImportVisit';

const VisitLogging: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salespersonFilter, setSalespersonFilter] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
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

  const visits = visitsResponse?.data || [];
  const users = usersResponse?.data || [];
  const totalCount = visitsResponse?.meta?.total || 0;
  const currentPage = (visitsResponse?.meta?.page || 1) - 1;

  const deleteVisitMutation = useDeleteVisit();
  const exportToExcelMutation = useExportToExcel();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalVisits = visitsResponse?.stats?.total_visits ?? 0;
  const activeVisits = visitsResponse?.stats?.active_visits ?? 0;
  const inactiveVisits = visitsResponse?.stats?.inactive_visits ?? 0;
  const newVisitsThisMonth = visitsResponse?.stats?.new_visits ?? 0;

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

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
        salesperson:
          salespersonFilter === 'all' ? undefined : Number(salespersonFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'visits',
        filters,
      });
    } catch (error) {
      console.error('Error exporting visits:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, salespersonFilter]);

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
      label: 'Sales Person',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-gray-400" />
          <span className="text-sm">
            {row.salesperson?.name || (
              <span className="text-sm italic text-gray-500">
                No Sales Person
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
          className={`inline-flex px-2 py-1 text-xs capitalize font-semibold rounded-full ${getStatusColor(
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
          <div className="flex justify-between !items-center gap-2 flex-wrap w-full">
            <div className="flex gap-2 items-center flex-wrap">
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
                <MenuItem value="all">All Sales Persons</MenuItem>
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
            <div className="flex gap-2 items-center">
              <Button
                variant="outlined"
                className="!capitalize"
                startIcon={<Download />}
                disabled={exportToExcelMutation.isPending}
                onClick={handleExportToExcel}
              >
                {exportToExcelMutation.isPending ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                variant="outlined"
                className="!capitalize"
                startIcon={<Upload />}
                onClick={() => setImportModalOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="contained"
                className="!capitalize"
                disableElevation
                startIcon={<Add />}
                onClick={handleCreateVisit}
              >
                Create
              </Button>
            </div>
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
      />

      <ImportVisit
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default VisitLogging;
