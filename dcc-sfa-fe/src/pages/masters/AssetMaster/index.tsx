import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteAssetMaster,
  useAssetMaster,
  type AssetMaster,
} from 'hooks/useAssetMaster';
import {
  Package,
  MapPin,
  User,
  Calendar,
  Settings,
  Wrench,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportAssetMaster from './ImportAssetMaster';
import ManageAssetMaster from './ManageAssetMaster';

const AssetMasterManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<AssetMaster | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: assetMasterResponse,
    isLoading,
    error,
  } = useAssetMaster({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const assetMaster = assetMasterResponse?.data || [];
  const totalCount = assetMasterResponse?.meta?.total_count || 0;
  const currentPage = (assetMasterResponse?.meta?.current_page || 1) - 1;

  const deleteAssetMasterMutation = useDeleteAssetMaster();
  const exportToExcelMutation = useExportToExcel();

  const totalAssets = assetMasterResponse?.stats?.total_assets ?? 0;
  const activeAssets = assetMasterResponse?.stats?.active_assets ?? 0;
  const inactiveAssets = assetMasterResponse?.stats?.inactive_assets ?? 0;
  const assetsThisMonth = assetMasterResponse?.stats?.assets_this_month ?? 0;

  const handleCreateAsset = useCallback(() => {
    setSelectedAsset(null);
    setDrawerOpen(true);
  }, []);

  const handleEditAsset = useCallback((asset: AssetMaster) => {
    setSelectedAsset(asset);
    setDrawerOpen(true);
  }, []);

  const handleDeleteAsset = useCallback(
    async (id: number) => {
      try {
        await deleteAssetMasterMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    },
    [deleteAssetMasterMutation]
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
        tableName: 'asset_master',
        filters,
      });
    } catch (error) {
      console.error('Error exporting assets:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (
    status: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      Available: 'success',
      'In Use': 'primary',
      'Under Maintenance': 'warning',
      Retired: 'secondary',
      Lost: 'error',
      Damaged: 'error',
    };
    return colors[status] || 'default';
  };

  const assetMasterColumns: TableColumn<AssetMaster>[] = [
    {
      id: 'asset_info',
      label: 'Asset Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.serial_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_master_asset_types?.name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.serial_number}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'current_location',
      label: 'Location',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.current_location || 'Not specified'}
          </span>
        </Box>
      ),
    },
    {
      id: 'current_status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.current_status || 'Available'}
          color={getStatusColor(row.current_status || 'Available')}
          size="small"
        />
      ),
    },
    {
      id: 'assigned_to',
      label: 'Assigned To',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs">{row.assigned_to || 'Unassigned'}</span>
        </Box>
      ),
    },
    {
      id: 'warranty_expiry',
      label: 'Warranty',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.warranty_expiry
              ? formatDate(row.warranty_expiry)
              : 'No warranty'}
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
            onClick={() => handleEditAsset(row)}
            tooltip={`Edit ${row.serial_number}`}
          />
          <DeleteButton
            onClick={() => handleDeleteAsset(row.id)}
            tooltip={`Delete ${row.serial_number}`}
            itemName={row.serial_number}
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
          <p className="!font-bold text-xl !text-gray-900">Asset Master</p>
          <p className="!text-gray-500 text-sm">
            Manage and track all company assets and equipment
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Assets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalAssets}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Assets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeAssets}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">
                Inactive Assets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveAssets}
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
                  {assetsThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load assets. Please try again.
        </Alert>
      )}

      <Table
        data={assetMaster}
        columns={assetMasterColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Assets..."
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
                title="Export Assets"
                description="Are you sure you want to export the current asset data to Excel? This will include all filtered results."
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
                onClick={handleCreateAsset}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={asset => asset.id}
        initialOrderBy="serial_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No assets found matching "${search}"`
            : 'No assets found in the system'
        }
      />

      <ManageAssetMaster
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportAssetMaster
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default AssetMasterManagement;
