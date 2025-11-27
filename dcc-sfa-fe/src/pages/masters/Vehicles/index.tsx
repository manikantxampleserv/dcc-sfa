import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { useDeleteVehicle, useVehicles, type Vehicle } from 'hooks/useVehicles';
import { Car, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportVehicle from './ImportVehicle';
import ManageVehicle from './ManageVehicle';

const VehiclesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('vehicle');

  const {
    data: vehiclesResponse,
    isLoading,
    error,
  } = useVehicles(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
    },
    {
      enabled: isRead,
    }
  );

  const vehicles = vehiclesResponse?.data || [];
  const totalCount = vehiclesResponse?.meta?.total_count || 0;
  const currentPage = (vehiclesResponse?.meta?.current_page || 1) - 1;

  const deleteVehicleMutation = useDeleteVehicle();
  const exportToExcelMutation = useExportToExcel();

  const totalVehicles =
    vehiclesResponse?.stats?.total_vehicles ?? vehicles.length;
  const activeVehicles =
    vehiclesResponse?.stats?.active_vehicles ??
    vehicles.filter(v => v.is_active === 'Y').length;
  const inactiveVehicles =
    vehiclesResponse?.stats?.inactive_vehicles ??
    vehicles.filter(v => v.is_active === 'N').length;
  const newVehiclesThisMonth = vehiclesResponse?.stats?.new_vehicles ?? 0;

  const handleCreateVehicle = useCallback(() => {
    setSelectedVehicle(null);
    setDrawerOpen(true);
  }, []);

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDrawerOpen(true);
  }, []);

  const handleDeleteVehicle = useCallback(
    async (id: number) => {
      try {
        await deleteVehicleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    },
    [deleteVehicleMutation]
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
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'vehicles',
        filters,
      });
    } catch (error) {
      console.error('Error exporting vehicles:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const vehicleColumns: TableColumn<Vehicle>[] = [
    {
      id: 'vehicle_number',
      label: 'Vehicle Number',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.vehicle_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Car className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.vehicle_number}
            </Typography>
            {row.type && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block"
              >
                {row.type}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'make',
      label: 'Make & Model',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900">
            {row.make || <span className="italic text-gray-400">No Make</span>}
          </Typography>
          {row.model && (
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block"
            >
              {row.model}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'year',
      label: 'Year',
      render: year => (
        <Typography variant="body2" className="!text-gray-900">
          {year || <span className="italic text-gray-400">-</span>}
        </Typography>
      ),
    },
    {
      id: 'fuel_type',
      label: 'Fuel Type',
      render: fuel_type => (
        <Typography variant="body2" className="!text-gray-900">
          {fuel_type || <span className="italic text-gray-400">-</span>}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: status => (
        <Chip
          label={status || 'available'}
          size="small"
          variant="outlined"
          className="!capitalize"
          color={status === 'available' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Active',
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
            render: (_value: any, row: Vehicle) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditVehicle(row)}
                    tooltip={`Edit ${row.vehicle_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteVehicle(row.id)}
                    tooltip={`Delete ${row.vehicle_number}`}
                    itemName={row.vehicle_number}
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
          <p className="!font-bold text-xl !text-gray-900">
            Vehicle Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage vehicles, fleet tracking, and maintenance schedules
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={<Car className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Vehicles"
          value={inactiveVehicles}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newVehiclesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load vehicles. Please try again.
        </Alert>
      )}

      <Table
        data={vehicles}
        columns={vehicleColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Vehicles..."
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
                    title="Export Vehicles"
                    description="Are you sure you want to export the current vehicles data to Excel? This will include all filtered results."
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
                    onClick={handleCreateVehicle}
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
        getRowId={vehicle => vehicle.id}
        initialOrderBy="vehicle_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No vehicles found matching "${search}"`
            : 'No vehicles found in the system'
        }
      />

      <ManageVehicle
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportVehicle
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default VehiclesPage;
