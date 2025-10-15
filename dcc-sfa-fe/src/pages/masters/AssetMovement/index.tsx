import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteAssetMovement,
  useAssetMovements,
  type AssetMovement,
} from 'hooks/useAssetMovement';
import {
  Package,
  MapPin,
  User,
  Calendar,
  ArrowRight,
  FileText,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportAssetMovement from './ImportAssetMovement';
import ManageAssetMovement from './ManageAssetMovement';

const AssetMovementManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMovement, setSelectedMovement] =
    useState<AssetMovement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: assetMovementResponse,
    isLoading,
    error,
  } = useAssetMovements({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const assetMovements = assetMovementResponse?.data || [];
  const totalCount = assetMovementResponse?.meta?.total_count || 0;
  const currentPage = (assetMovementResponse?.meta?.current_page || 1) - 1;

  const deleteAssetMovementMutation = useDeleteAssetMovement();
  const exportToExcelMutation = useExportToExcel();

  const totalMovements = assetMovementResponse?.stats?.total_records ?? 0;
  const activeMovements = assetMovementResponse?.stats?.active_records ?? 0;
  const inactiveMovements = assetMovementResponse?.stats?.inactive_records ?? 0;
  const movementsThisMonth =
    assetMovementResponse?.stats?.this_month_records ?? 0;

  const handleCreateMovement = useCallback(() => {
    setSelectedMovement(null);
    setDrawerOpen(true);
  }, []);

  const handleEditMovement = useCallback((movement: AssetMovement) => {
    setSelectedMovement(movement);
    setDrawerOpen(true);
  }, []);

  const handleDeleteMovement = useCallback(
    async (id: number) => {
      try {
        await deleteAssetMovementMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset movement:', error);
      }
    },
    [deleteAssetMovementMutation]
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
        tableName: 'asset_movements',
        filters,
      });
    } catch (error) {
      console.error('Error exporting asset movements:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getMovementTypeColor = (
    type: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      transfer: 'primary',
      maintenance: 'warning',
      repair: 'error',
      disposal: 'secondary',
      return: 'success',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const assetMovementColumns: TableColumn<AssetMovement>[] = [
    {
      id: 'asset_info',
      label: 'Asset Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.asset_movements_master?.serial_number || 'Asset'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_movements_master?.name || 'Unknown Asset'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.asset_movements_master?.serial_number ||
                `Asset #${row.asset_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'movement_details',
      label: 'Movement Details',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs">{row.from_location || 'Unknown'}</span>
          </Box>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs">{row.to_location || 'Unknown'}</span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'movement_type',
      label: 'Type',
      render: (_value, row) => (
        <Chip
          label={row.movement_type || 'Other'}
          color={getMovementTypeColor(row.movement_type || 'other')}
          size="small"
        />
      ),
    },
    {
      id: 'performed_by',
      label: 'Performed By',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.asset_movements_performed_by?.name || 'Unknown User'}
          </span>
        </Box>
      ),
    },
    {
      id: 'movement_date',
      label: 'Date',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">{formatDate(row.movement_date)}</span>
        </Box>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-gray-400" />
          <span className="text-xs truncate max-w-32">
            {row.notes || 'No notes'}
          </span>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditMovement(row)}
            tooltip={`Edit Movement #${row.id}`}
          />
          <DeleteButton
            onClick={() => handleDeleteMovement(row.id)}
            tooltip={`Delete Movement #${row.id}`}
            itemName={`Movement #${row.id}`}
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
          <p className="!font-bold text-xl !text-gray-900">Asset Movements</p>
          <p className="!text-gray-500 text-sm">
            Track and manage asset movements across locations
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Movements
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalMovements}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Movements
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeMovements}
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
                Inactive Movements
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveMovements}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">This Month</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {movementsThisMonth}
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
          Failed to load asset movements. Please try again.
        </Alert>
      )}

      <Table
        data={assetMovements}
        columns={assetMovementColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Movements..."
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
                title="Export Asset Movements"
                description="Are you sure you want to export the current asset movement data to Excel? This will include all filtered results."
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
                onClick={handleCreateMovement}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={movement => movement.id}
        initialOrderBy="movement_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No asset movements found matching "${search}"`
            : 'No asset movements found in the system'
        }
      />

      <ManageAssetMovement
        selectedMovement={selectedMovement}
        setSelectedMovement={setSelectedMovement}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportAssetMovement
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default AssetMovementManagement;
