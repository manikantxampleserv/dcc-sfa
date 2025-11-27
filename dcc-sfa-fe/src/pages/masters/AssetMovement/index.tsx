import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useAssetMovements,
  useDeleteAssetMovement,
  type AssetMovement,
} from 'hooks/useAssetMovement';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { ArrowRight, Calendar, FileText, MapPin, Package } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
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

  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('asset-movement');

  const {
    data: assetMovementResponse,
    isLoading,
    error,
  } = useAssetMovements(
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

  const assetMovements = assetMovementResponse?.data || [];
  const totalCount = assetMovementResponse?.meta?.total_count || 0;
  const currentPage = (assetMovementResponse?.meta?.current_page || 1) - 1;

  const deleteAssetMovementMutation = useDeleteAssetMovement();
  const exportToExcelMutation = useExportToExcel();

  const stats = (assetMovementResponse?.stats as any) || {};
  const totalMovements = stats.total_records ?? 0;
  const activeMovements = stats.active_records ?? 0;
  const inactiveMovements = stats.inactive_records ?? 0;
  const movementsThisMonth = stats.this_month_records ?? 0;

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
    const typeLower = type.toLowerCase();
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
    return colors[typeLower as keyof typeof colors] || 'default';
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
              {row.asset_movements_master?.asset_master_asset_types?.name ||
                'Unknown Asset'}
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
          variant="outlined"
          color={getMovementTypeColor(row.movement_type || 'other')}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'performed_by',
      label: 'Performed By',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.asset_movements_performed_by?.name}
            src={row.asset_movements_performed_by?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-500"
          />
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_movements_performed_by?.name || 'Unknown User'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.asset_movements_performed_by?.email || 'Unknown Email'}
            </Typography>
          </Box>
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
          <Tooltip title={row.notes || 'No notes'} placement="top" arrow>
            <span className="text-xs truncate max-w-32">
              {row.notes || 'No notes'}
            </span>
          </Tooltip>
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
            render: (_value: any, row: AssetMovement) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditMovement(row)}
                    tooltip={`Edit Movement #${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteMovement(row.id)}
                    tooltip={`Delete Movement #${row.id}`}
                    itemName={`Movement #${row.id}`}
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
          <p className="!font-bold text-xl !text-gray-900">Asset Movements</p>
          <p className="!text-gray-500 text-sm">
            Track and manage asset movements across locations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Movements"
          value={totalMovements}
          icon={<ArrowRight className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Movements"
          value={activeMovements}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Movements"
          value={inactiveMovements}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={movementsThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
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
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
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
              )}
              <div className="flex items-center gap-2">
                {isRead && (
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
                    onClick={handleCreateMovement}
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
        getRowId={movement => movement.id}
        initialOrderBy="movement_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
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
