import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteRouteType,
  useRouteTypes,
  type RouteType,
} from 'hooks/useRouteTypes';
import { Route } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportRouteType from './ImportRouteType';
import ManageRouteType from './ManageRouteType';

const RouteTypesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRouteType, setSelectedRouteType] = useState<RouteType | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('route-type');

  const {
    data: routeTypesResponse,
    isLoading,
    error,
  } = useRouteTypes(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      enabled: isRead,
    }
  );

  const routeTypes = routeTypesResponse?.data || [];
  const totalCount = routeTypesResponse?.meta?.total_count || 0;
  const currentPage = (routeTypesResponse?.meta?.current_page || 1) - 1;

  const deleteRouteTypeMutation = useDeleteRouteType();
  const exportToExcelMutation = useExportToExcel();

  const totalRouteTypes = routeTypesResponse?.stats?.total_route_types ?? 0;
  const activeRouteTypes = routeTypesResponse?.stats?.active_route_types ?? 0;
  const inactiveRouteTypes =
    routeTypesResponse?.stats?.inactive_route_types ?? 0;
  const routeTypesThisMonth =
    routeTypesResponse?.stats?.route_types_this_month ?? 0;

  const handleCreateRouteType = useCallback(() => {
    setSelectedRouteType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditRouteType = useCallback((routeType: RouteType) => {
    setSelectedRouteType(routeType);
    setDrawerOpen(true);
  }, []);

  const handleDeleteRouteType = useCallback(
    async (id: number) => {
      try {
        await deleteRouteTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting route type:', error);
      }
    },
    [deleteRouteTypeMutation]
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
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'route_type',
        filters,
      });
    } catch (error) {
      console.error('Error exporting route types:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const routeTypesColumns: TableColumn<RouteType>[] = [
    {
      id: 'name',
      label: 'Route Type Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Box className="!w-8 !h-8 !rounded !bg-primary-100 !flex !items-center !justify-center">
            <Route className="w-4 h-4 text-primary-500" />
          </Box>
          <Typography
            variant="body1"
            className="!text-gray-900 !leading-tight !font-medium"
          >
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={row.is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: RouteType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditRouteType(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteRouteType(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Route Types</p>
          <p className="!text-gray-500 text-sm">
            Manage and configure route types for your delivery routes
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Route Types"
          value={totalRouteTypes}
          icon={<Route className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Route Types"
          value={activeRouteTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Route Types"
          value={inactiveRouteTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={routeTypesThisMonth}
          icon={<Route className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load route types. Please try again.
        </Alert>
      )}

      <Table
        data={routeTypes}
        columns={routeTypesColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Route Types..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-32"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Route Types"
                    description="Are you sure you want to export the current route types data to Excel? This will include all filtered results."
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
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
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
                    onClick={handleCreateRouteType}
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
        getRowId={routeType => routeType.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No route types found matching "${search}"`
            : 'No route types found in the system'
        }
      />

      <ManageRouteType
        selectedRouteType={selectedRouteType}
        setSelectedRouteType={setSelectedRouteType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportRouteType
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default RouteTypesManagement;
