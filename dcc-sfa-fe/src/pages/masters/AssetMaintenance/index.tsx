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
  useAssetMaintenances,
  useDeleteAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Calendar, DollarSign, FileText, Package, Wrench } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportAssetMaintenance from './ImportAssetMaintenance';
import ManageAssetMaintenance from './ManageAssetMaintenance';

const AssetMaintenanceManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<AssetMaintenance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } = usePermission('maintenance');

  const {
    data: assetMaintenanceResponse,
    isLoading,
    error,
  } = useAssetMaintenances(
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

  const assetMaintenances = assetMaintenanceResponse?.data || [];
  const totalCount = assetMaintenanceResponse?.meta?.total_count || 0;
  const currentPage = (assetMaintenanceResponse?.meta?.current_page || 1) - 1;

  const deleteAssetMaintenanceMutation = useDeleteAssetMaintenance();
  const exportToExcelMutation = useExportToExcel();

  const stats = (assetMaintenanceResponse?.stats as any) || {};
  const totalMaintenances = stats.total_records ?? 0;
  const activeMaintenances = stats.active_records ?? 0;
  const inactiveMaintenances = stats.inactive_records ?? 0;
  const maintenancesThisMonth =
    stats.this_month_records ?? stats.records_this_month ?? 0;

  const handleCreateMaintenance = useCallback(() => {
    setSelectedMaintenance(null);
    setDrawerOpen(true);
  }, []);

  const handleEditMaintenance = useCallback((maintenance: AssetMaintenance) => {
    setSelectedMaintenance(maintenance);
    setDrawerOpen(true);
  }, []);

  const handleDeleteMaintenance = useCallback(
    async (id: number) => {
      try {
        await deleteAssetMaintenanceMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset maintenance:', error);
      }
    },
    [deleteAssetMaintenanceMutation]
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
        tableName: 'asset_maintenance',
        filters,
      });
    } catch (error) {
      console.error('Error exporting asset maintenances:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const assetMaintenanceColumns: TableColumn<AssetMaintenance>[] = [
    {
      id: 'asset_info',
      label: 'Asset Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.asset_maintenance_master?.serial_number || 'Asset'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_maintenance_master?.asset_master_asset_types?.name ||
                'Unknown Asset'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.asset_maintenance_master?.serial_number ||
                `Asset #${row.asset_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'maintenance_details',
      label: 'Maintenance Details',
      render: (_value, row) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-1">
            <Wrench className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.issue_reported || 'No issue reported'}
            </span>
          </Box>
          <Box className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.action_taken || 'No action taken'}
            </span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'technician',
      label: 'Technician',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Avatar
            alt={row.asset_maintenance_technician?.name}
            src={row.asset_maintenance_technician?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-500"
          />

          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.asset_maintenance_technician?.name || 'Unknown Technician'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.asset_maintenance_technician?.email || 'Unknown Email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'maintenance_date',
      label: 'Date',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">{formatDate(row.maintenance_date)}</span>
        </Box>
      ),
    },
    {
      id: 'cost',
      label: 'Cost',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.cost ? `$${row.cost.toFixed(2)}` : 'N/A'}
          </span>
        </Box>
      ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-gray-400" />
          <Tooltip title={row.remarks || 'No remarks'} placement="top" arrow>
            <span className="text-xs truncate max-w-32">
              {row.remarks || 'No remarks'}
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
            render: (_value: any, row: AssetMaintenance) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditMaintenance(row)}
                    tooltip={`Edit Maintenance #${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteMaintenance(row.id)}
                    tooltip={`Delete Maintenance #${row.id}`}
                    itemName={`Maintenance #${row.id}`}
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
          <p className="!font-bold text-xl !text-gray-900">Asset Maintenance</p>
          <p className="!text-gray-500 text-sm">
            Track and manage asset maintenance records
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Maintenance"
          value={totalMaintenances}
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Maintenance"
          value={activeMaintenances}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Maintenance"
          value={inactiveMaintenances}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={maintenancesThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load asset maintenance records. Please try again.
        </Alert>
      )}

      <Table
        data={assetMaintenances}
        columns={assetMaintenanceColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex flex-wrap items-center gap-2">
                  <SearchInput
                    placeholder="Search Maintenance Records..."
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
                    title="Export Asset Maintenance"
                    description="Are you sure you want to export the current asset maintenance data to Excel? This will include all filtered results."
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
                    onClick={handleCreateMaintenance}
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
        getRowId={maintenance => maintenance.id}
        initialOrderBy="maintenance_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No asset maintenance records found matching "${search}"`
            : 'No asset maintenance records found in the system'
        }
      />

      <ManageAssetMaintenance
        selectedMaintenance={selectedMaintenance}
        setSelectedMaintenance={setSelectedMaintenance}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportAssetMaintenance
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default AssetMaintenanceManagement;
