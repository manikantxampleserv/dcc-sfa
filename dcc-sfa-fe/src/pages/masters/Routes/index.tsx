import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Route as RouteIcon, Building2, Navigation, Clock } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useDepots } from '../../../hooks/useDepots';
import { useUsers } from '../../../hooks/useUsers';
import {
  useDeleteRoute,
  useRoutes,
  type Route,
} from '../../../hooks/useRoutes';
import { useZones } from '../../../hooks/useZones';
import ManageRoute from './ManageRoute';

const RoutesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: routesResponse,
    isLoading,
    error,
  } = useRoutes({
    search,
    page,
    limit,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
    depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
  });

  const { data: depotsResponse } = useDepots({
    page: 1,
    limit: 100, // Get all depots for filter
  });

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 100, // Get all users for salesperson filtering
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100, // Get all zones for filter
  });

  const routes = routesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const users = usersResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const totalCount = routesResponse?.meta?.total || 0;
  const currentPage = (routesResponse?.meta?.page || 1) - 1;

  const deleteRouteMutation = useDeleteRoute();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalRoutes = routesResponse?.stats?.total_routes ?? routes.length;
  const activeRoutes =
    routesResponse?.stats?.active_routes ??
    routes.filter(r => r.is_active === 'Y').length;
  const inactiveRoutes =
    routesResponse?.stats?.inactive_routes ??
    routes.filter(r => r.is_active === 'N').length;
  const newRoutesThisMonth = routesResponse?.stats?.routes_this_month || 0;

  const handleCreateRoute = useCallback(() => {
    setSelectedRoute(null);
    setDrawerOpen(true);
  }, []);

  const handleEditRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
    setDrawerOpen(true);
  }, []);

  const handleDeleteRoute = useCallback(
    async (id: number) => {
      try {
        await deleteRouteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    },
    [deleteRouteMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  // Define table columns following Zone pattern
  const routeColumns: TableColumn<Route>[] = [
    {
      id: 'name',
      label: 'Route & Code',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <RouteIcon className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-600 !max-w-xs !truncate"
        >
          {row.description || 'No description'}
        </Typography>
      ),
    },
    {
      id: 'depot',
      label: 'Depot',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.routes_depots?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.routes_depots?.code || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'zone',
      label: 'Zone',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.routes_zones?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'salesperson',
      label: 'Salesperson',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          {row.routes_salesperson ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Box>
                <Typography variant="body2" className="!font-medium">
                  {row.routes_salesperson.name}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {row.routes_salesperson.email}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Block className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Unassigned
              </Typography>
            </>
          )}
        </Box>
      ),
    },
    {
      id: 'distance_time',
      label: 'Distance & Time',
      render: (_value, row) => (
        <Box className="!space-y-1">
          <Box className="!flex !items-center !gap-1">
            <Navigation className="w-3 h-3 text-gray-400" />
            <Typography variant="caption" className="!text-gray-600">
              {row?.estimated_distance ? `${row.estimated_distance} km` : 'N/A'}
            </Typography>
          </Box>
          <Box className="!flex !items-center !gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <Typography variant="caption" className="!text-gray-600">
              {row?.estimated_time ? `${row.estimated_time} min` : 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
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
            onClick={() => handleEditRoute(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteRoute(row.id)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Route Management</p>
          <p className="!text-gray-500 text-sm">
            Manage sales routes, assignments, and territory coverage
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalRoutes}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <RouteIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeRoutes}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Routes
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveRoutes}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-600" />
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
                  {newRoutesThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load routes. Please try again.
        </Alert>
      )}

      <Table
        data={routes}
        columns={routeColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Routes"
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
                value={depotFilter}
                onChange={e => setDepotFilter(e.target.value)}
                className="!min-w-60"
                size="small"
              >
                <MenuItem value="all">All Depots</MenuItem>
                {depots.map(depot => (
                  <MenuItem key={depot.id} value={depot.id.toString()}>
                    {depot.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateRoute}
            >
              Create
            </Button>
          </div>
        }
        getRowId={route => route.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No routes found matching "${search}"`
            : 'No routes found in the system'
        }
      />

      {/* ManageRoute Component */}
      <ManageRoute
        selectedRoute={selectedRoute}
        setSelectedRoute={setSelectedRoute}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        depots={depots}
        zones={zones}
        users={users}
      />
    </>
  );
};

export default RoutesManagement;
