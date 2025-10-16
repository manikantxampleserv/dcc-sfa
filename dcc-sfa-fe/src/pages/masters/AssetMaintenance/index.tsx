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
import {
  Calendar,
  DollarSign,
  FileText,
  Package,
  User,
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

  const {
    data: assetMaintenanceResponse,
    isLoading,
    error,
  } = useAssetMaintenances({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const assetMaintenances = assetMaintenanceResponse?.data || [];
  const totalCount = assetMaintenanceResponse?.meta?.total_count || 0;
  const currentPage = (assetMaintenanceResponse?.meta?.current_page || 1) - 1;

  const deleteAssetMaintenanceMutation = useDeleteAssetMaintenance();
  const exportToExcelMutation = useExportToExcel();

  const totalMaintenances = assetMaintenanceResponse?.stats?.total_records ?? 0;
  const activeMaintenances =
    assetMaintenanceResponse?.stats?.active_records ?? 0;
  const inactiveMaintenances =
    assetMaintenanceResponse?.stats?.inactive_records ?? 0;
  const maintenancesThisMonth =
    assetMaintenanceResponse?.stats?.this_month_records ?? 0;

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
              {row.asset_maintenance_master?.name || 'Unknown Asset'}
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
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.asset_maintenance_technician?.name || 'Unknown Technician'}
          </span>
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
            onClick={() => handleEditMaintenance(row)}
            tooltip={`Edit Maintenance #${row.id}`}
          />
          <DeleteButton
            onClick={() => handleDeleteMaintenance(row.id)}
            tooltip={`Delete Maintenance #${row.id}`}
            itemName={`Maintenance #${row.id}`}
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
          <p className="!font-bold text-xl !text-gray-900">Asset Maintenance</p>
          <p className="!text-gray-500 text-sm">
            Track and manage asset maintenance records
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Maintenance
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalMaintenances}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Maintenance
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeMaintenances}
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
                Inactive Maintenance
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveMaintenances}
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
                  {maintenancesThisMonth}
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
          Failed to load asset maintenance records. Please try again.
        </Alert>
      )}

      <Table
        data={assetMaintenances}
        columns={assetMaintenanceColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
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
            <div className="flex items-center gap-2">
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
                onClick={handleCreateMaintenance}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={maintenance => maintenance.id}
        initialOrderBy="maintenance_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
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
