import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Truck, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useVanInventory,
  useDeleteVanInventory,
  type VanInventory,
} from '../../../hooks/useVanInventory';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { formatDate } from '../../../utils/dateUtils';
import ImportVanInventory from './ImportVanInventory';
import ManageVanInventory from './ManageVanInventory';

const VanStockPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVanInventory, setSelectedVanInventory] =
    useState<VanInventory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: vanInventoryResponse,
    isLoading,
    error,
  } = useVanInventory({
    search,
    page,
    limit,
    status:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
  });

  const vanInventory = vanInventoryResponse?.data || [];
  const totalCount = vanInventoryResponse?.meta?.total_count || 0;
  const currentPage = (vanInventoryResponse?.meta?.current_page || 1) - 1;

  const deleteVanInventoryMutation = useDeleteVanInventory();
  const exportToExcelMutation = useExportToExcel();

  const totalVanInventory = vanInventoryResponse?.stats?.total_records ?? 0;
  const activeVanInventory = vanInventoryResponse?.stats?.active_records ?? 0;
  const inactiveVanInventory =
    vanInventoryResponse?.stats?.inactive_records ?? 0;
  const newVanInventoryThisMonth =
    vanInventoryResponse?.stats?.van_inventory ?? 0;

  const handleCreateVanInventory = useCallback(() => {
    setSelectedVanInventory(null);
    setDrawerOpen(true);
  }, []);

  const handleEditVanInventory = useCallback((vanInventory: VanInventory) => {
    setSelectedVanInventory(vanInventory);
    setDrawerOpen(true);
  }, []);

  const handleDeleteVanInventory = useCallback(
    async (id: number) => {
      try {
        await deleteVanInventoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting van inventory:', error);
      }
    },
    [deleteVanInventoryMutation]
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
        status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'van_inventory',
        filters,
      });
    } catch (error) {
      console.error('Error exporting van inventory:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const vanInventoryColumns: TableColumn<VanInventory>[] = [
    {
      id: 'user_id',
      label: 'Sales Person',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.user?.name || 'Unknown'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Truck className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.user?.name || 'Unknown User'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.user?.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'product_id',
      label: 'Product',
      render: (_value, row) => (
        <Box className="!max-w-xs">
          <Typography variant="body1" className="!text-gray-900 !leading-tight">
            {row.product?.name || 'Unknown Product'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Code: {row.product?.code || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Stock Levels',
      render: (_value, row) => (
        <Box className="!space-y-1">
          <Box className="!flex !items-center !gap-2">
            <Typography variant="body2" className="!text-gray-600">
              Total:
            </Typography>
            <Typography variant="body2" className="!font-medium !text-gray-900">
              {row.quantity || 0}
            </Typography>
          </Box>
          <Box className="!flex !items-center !gap-2">
            <Typography variant="body2" className="!text-gray-600">
              Reserved:
            </Typography>
            <Typography
              variant="body2"
              className="!font-medium !text-orange-600"
            >
              {row.reserved_quantity || 0}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'available_quantity',
      label: 'Available',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium">
          {row.available_quantity || 0}
        </Typography>
      ),
    },

    {
      id: 'batch_id',
      label: 'Batch/Serial',
      render: (_value, row) => (
        <Box className="!space-y-1">
          {row.batch && (
            <Box>
              <Typography variant="caption" className="!text-gray-500">
                Batch:
              </Typography>
              <Typography variant="body2" className="!font-medium">
                {row.batch.batch_number}
              </Typography>
            </Box>
          )}
          {row.serial_number && (
            <Box>
              <Typography variant="caption" className="!text-gray-500">
                Serial:
              </Typography>
              <Typography variant="body2" className="!font-medium">
                {row.serial_number.serial_number}
              </Typography>
            </Box>
          )}
          {!row.batch && !row.serial_number && (
            <Typography variant="body2" className="!italic !text-gray-400">
              No batch/serial
            </Typography>
          )}
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
      id: 'last_updated',
      label: 'Last Updated',
      render: (_value, row) => {
        const formattedDate = formatDate(row.last_updated);
        return formattedDate ? (
          <span>{formattedDate}</span>
        ) : (
          <span className="italic text-gray-400">No Date</span>
        );
      },
    },
    {
      id: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditVanInventory(row)}
            tooltip={`Edit ${row.product?.name || 'Van Inventory'}`}
          />
          <DeleteButton
            onClick={() => handleDeleteVanInventory(row.id)}
            tooltip={`Delete ${row.product?.name || 'Van Inventory'}`}
            itemName={row.product?.name || 'Van Inventory'}
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
          <p className="!font-bold text-xl !text-gray-900">
            Van Stock Load/Unload Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage van inventory, stock levels, and load/unload operations for
            sales personnel
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Records
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalVanInventory}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Records
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeVanInventory}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">
                Inactive Records
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveVanInventory}
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
              <p className="text-sm font-medium text-purple-600">
                New This Month
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {newVanInventoryThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load van inventory. Please try again.
        </Alert>
      )}

      <Table
        data={vanInventory}
        columns={vanInventoryColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Van Inventory..."
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
            </div>
            <div className="flex items-center gap-2">
              <PopConfirm
                title="Export Van Inventory"
                description="Are you sure you want to export the current van inventory data to Excel? This will include all filtered results."
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
                  {exportToExcelMutation.isPending ? 'Exporting...' : 'Export'}
                </Button>
              </PopConfirm>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setImportModalOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateVanInventory}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={vanInventory => vanInventory.id}
        initialOrderBy="last_updated"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No van inventory found matching "${search}"`
            : 'No van inventory found in the system'
        }
      />

      <ManageVanInventory
        selectedVanInventory={selectedVanInventory}
        setSelectedVanInventory={setSelectedVanInventory}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportVanInventory
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default VanStockPage;
