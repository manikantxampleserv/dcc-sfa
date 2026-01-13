import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useDepots } from 'hooks/useDepots';
import { usePermission } from 'hooks/usePermission';
import { useDeleteRoute, useRoutes, type Route } from 'hooks/useRoutes';
import { useZones } from 'hooks/useZones';
import {
  Building,
  Building2,
  Navigation,
  Route as RouteIcon,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useExportToExcel } from '../../../hooks/useImportExport';
import ImportRoutes from './ImportRoutes';
import ManageRoute from './ManageRoute';

const RoutesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('route');

  const {
    data: routesResponse,
    isFetching,
    error,
  } = useRoutes(
    {
      search,
      page,
      limit,
      status:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'active'
            : 'inactive',
      depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
    },
    {
      enabled: isRead,
    }
  );

  const { data: depotsResponse } = useDepots({
    page: 1,
    limit: 100,
    isActive: 'Y',
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100,
    isActive: 'Y',
  });

  const routes = routesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const totalCount = routesResponse?.meta?.total || 0;
  const currentPage = (routesResponse?.meta?.page || 1) - 1;

  const deleteRouteMutation = useDeleteRoute();
  const exportToExcelMutation = useExportToExcel();

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

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'routes',
        filters,
      });
    } catch (error) {
      console.error('Error exporting routes:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const handleEditRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
    setDrawerOpen(true);
  }, []);

  const handleViewRoute = useCallback(
    (route: Route) => {
      navigate(`/masters/routes/${route.id}`);
    },
    [navigate]
  );

  const handleDeleteRoute = useCallback(
    async (id: number) => {
      try {
        await deleteRouteMutation.mutateAsync({ id });
      } catch (error: any) {
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
      id: 'depot',
      label: 'Depot',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar className="!rounded !bg-primary-100 !text-primary-600">
            <Building2 className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.route_depots?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.route_depots?.code || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'zone',
      label: 'Zone',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Avatar className="!rounded !bg-primary-100 !text-primary-600">
            <Building className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.route_zones?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.route_zones?.code || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'salesperson',
      label: 'Sales Person',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          {row.routes_salesperson ? (
            <>
              <Avatar
                alt={row.routes_salesperson.name}
                src={row.routes_salesperson.profile_image || 'mkx'}
                className="!rounded !bg-primary-100 !text-primary-600"
              />

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
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Tooltip title={row.description} placement="top" arrow>
          <Typography
            variant="body2"
            className="!text-gray-600 !max-w-xs !truncate"
          >
            {row.description || 'No description'}
          </Typography>
        </Tooltip>
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
          variant="outlined"
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
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Route) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewRoute(row)}
                    tooltip={`View ${row.name}`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditRoute(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteRoute(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Routes"
          value={totalRoutes}
          icon={<RouteIcon className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Routes"
          value={activeRoutes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Routes"
          value={inactiveRoutes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newRoutesThisMonth}
          icon={<Navigation className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
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
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
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
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={depotFilter}
                      onChange={e => setDepotFilter(e.target.value)}
                      className="!min-w-80"
                      size="small"
                      disableClearable
                    >
                      <MenuItem value="all">All Depots</MenuItem>
                      {depots.map(depot => (
                        <MenuItem key={depot.id} value={depot.id.toString()}>
                          {depot.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCreate && (
                  <PopConfirm
                    title="Export Routes"
                    description="Are you sure you want to export the current routes data to Excel? This will include all filtered results."
                    onConfirm={handleExportToExcel}
                    confirmText="Export"
                    cancelText="Cancel"
                  >
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Download />}
                      disabled={exportToExcelMutation.isPending}
                    >
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                )}
                {isCreate && (
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Upload />}
                    onClick={() => setImportDrawerOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateRoute}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={route => route.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
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
      />

      {/* ImportRoutes Component */}
      <ImportRoutes
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default RoutesManagement;
