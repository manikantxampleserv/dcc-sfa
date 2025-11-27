import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteWarehouse,
  useWarehouses,
  type Warehouse,
} from 'hooks/useWarehouses';
import { TrendingUp, Warehouse as WarehouseIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportWarehouse from './ImportWarehouse';
import ManageWarehouse from './ManageWarehouse';

const WarehousesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('warehouse');

  const {
    data: warehousesResponse,
    isLoading,
    error,
  } = useWarehouses(
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

  const warehouses = warehousesResponse?.data || [];
  const totalCount = warehousesResponse?.meta?.total_count || 0;
  const currentPage = (warehousesResponse?.meta?.current_page || 1) - 1;

  const deleteWarehouseMutation = useDeleteWarehouse();
  const exportToExcelMutation = useExportToExcel();

  const totalWarehouses =
    warehousesResponse?.stats?.total_warehouses ?? warehouses.length;
  const activeWarehouses =
    warehousesResponse?.stats?.active_warehouses ??
    warehouses.filter(w => w.is_active === 'Y').length;
  const inactiveWarehouses =
    warehousesResponse?.stats?.inactive_warehouses ??
    warehouses.filter(w => w.is_active === 'N').length;
  const newWarehousesThisMonth = warehousesResponse?.stats?.new_warehouses ?? 0;

  const handleCreateWarehouse = useCallback(() => {
    setSelectedWarehouse(null);
    setDrawerOpen(true);
  }, []);

  const handleEditWarehouse = useCallback((warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDrawerOpen(true);
  }, []);

  const handleDeleteWarehouse = useCallback(
    async (id: number) => {
      try {
        await deleteWarehouseMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting warehouse:', error);
      }
    },
    [deleteWarehouseMutation]
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
        tableName: 'warehouses',
        filters,
      });
    } catch (error) {
      console.error('Error exporting warehouses:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const warehouseColumns: TableColumn<Warehouse>[] = [
    {
      id: 'name',
      label: 'Warehouse Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <WarehouseIcon className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body1" className="!text-gray-900">
              {row.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.location}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.type || <span className="italic text-gray-400">No Type</span>}
        </Typography>
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
            render: (_value: any, row: Warehouse) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditWarehouse(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteWarehouse(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">
            Warehouse Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage warehouses, storage facilities, and distribution centers
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Warehouses"
          value={totalWarehouses}
          icon={<WarehouseIcon className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Warehouses"
          value={activeWarehouses}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Warehouses"
          value={inactiveWarehouses}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newWarehousesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load warehouses. Please try again.
        </Alert>
      )}

      <Table
        data={warehouses}
        columns={warehouseColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Warehouses..."
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
                    title="Export Warehouses"
                    description="Are you sure you want to export the current warehouses data to Excel? This will include all filtered results."
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
                    onClick={handleCreateWarehouse}
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
        getRowId={warehouse => warehouse.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No warehouses found matching "${search}"`
            : 'No warehouses found in the system'
        }
      />

      <ManageWarehouse
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportWarehouse
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default WarehousesPage;
