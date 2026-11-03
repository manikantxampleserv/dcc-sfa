import { Block, CheckCircle, Download, Settings } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import {
  useAssetMaintenances,
  useDeleteAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useCurrency } from 'hooks/useCurrency';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Clock, MapPin, Package, Shield, Wrench } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import { formatDateTime } from 'utils/dateUtils';
import ManageAssetMaintenance from './ManageAssetMaintenance';

/**
 * Asset Maintenance Management Page Component.
 * Displays maintenance jobs, KPI health cards, technician filtering,
 * and links to the 4-stage Drawer workflow matching DCC-SFA master lists.
 *
 * @returns {React.ReactElement} Asset maintenance management view.
 */
const AssetMaintenanceManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<AssetMaintenance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { formatCurrency } = useCurrency();

  const { isUpdate, isDelete, isRead } = usePermission('maintenance');

  const {
    data: assetMaintenanceResponse,
    isFetching,
    error,
  } = useAssetMaintenances(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      technician_id:
        technicianFilter === 'all' ? undefined : Number(technicianFilter),
    },
    {
      enabled: isRead,
    }
  );

  const assetMaintenances = assetMaintenanceResponse?.data || [];
  const totalCount = assetMaintenanceResponse?.meta?.total || 0;
  const currentPage = (assetMaintenanceResponse?.meta?.page || 1) - 1;

  const deleteAssetMaintenanceMutation = useDeleteAssetMaintenance();
  const exportToExcelMutation = useExportToExcel();

  const stats = (assetMaintenanceResponse?.stats as any) || {};
  const totalMaintenances = stats.total_records ?? totalCount;
  const openJobs = stats.open_jobs ?? 0;
  const overdueJobs = stats.overdue_jobs ?? 0;
  const closedJobs = stats.closed_jobs ?? stats.this_month_records ?? 0;

  const handleEditMaintenance = useCallback((maintenance: AssetMaintenance) => {
    setSelectedMaintenance(maintenance);
    setDrawerOpen(true);
  }, []);

  /** Navigate to Cooler 360 view for the selected asset using its ID */
  const handleOpenCooler360 = useCallback(
    (row: AssetMaintenance) => {
      const assetId = row.asset_id || row.asset_maintenance_master?.id;
      if (assetId) {
        navigate(`/transactions/cooler-360/${assetId}`);
      }
    },
    [navigate]
  );

  const handleDeleteMaintenance = useCallback(
    async (id: number) => {
      try {
        await deleteAssetMaintenanceMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting asset maintenance:', err);
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
        technician_id:
          technicianFilter === 'all' ? undefined : Number(technicianFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'asset_maintenance',
        filters,
      });
    } catch (err) {
      console.error('Error exporting asset maintenances:', err);
    }
  }, [exportToExcelMutation, search, statusFilter, technicianFilter]);

  const assetMaintenanceColumns: TableColumn<AssetMaintenance>[] = [
    {
      id: 'job_number',
      label: 'Job Info',
      sortable: true,
      render: (_value, row) => (
        <Box
          className="!flex !items-center !gap-2 cursor-pointer"
          onClick={() => handleEditMaintenance(row)}
        >
          <Avatar className="!rounded !bg-sky-100 !text-sky-700">
            <Wrench className="h-5 w-5" />
          </Avatar>
          <Box className="min-w-0">
            <Typography
              variant="body1"
              className="!leading-tight !text-gray-900 !text-sm !font-semibold hover:!text-primary-600 !flex !items-center !gap-1.5"
            >
              {row.job_number || `MT-${String(row.id).padStart(5, '0')}`}
              {row.is_overdue && row.status !== 'closed' && (
                <Tooltip title="Past due date, escalated" arrow>
                  <Clock size={13} className="text-rose-600 inline shrink-0" />
                </Tooltip>
              )}
              {row.warranty_claim === 'Y' && (
                <Tooltip title="Cooler under warranty" arrow>
                  <Shield size={13} className="text-sky-600 inline shrink-0" />
                </Tooltip>
              )}
            </Typography>
            <Typography
              variant="caption"
              className="!mt-0.5 !block !text-xs !text-gray-500 truncate"
            >
              {formatDateTime(row.maintenance_date)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'asset_info',
      label: 'Asset / Cooler',
      sortable: false,
      render: (_value, row) => {
        const master = row.asset_maintenance_master;
        return (
          <Box
            className="!flex !items-center !gap-2 cursor-pointer group"
            onClick={() => handleOpenCooler360(row)}
          >
            <Avatar className="!rounded !bg-sky-100 !text-sky-700 transition-colors">
              <Package className="h-5 w-5" />
            </Avatar>
            <Box className="min-w-0">
              <Tooltip title="View Cooler 360" arrow placement="top">
                <Typography
                  variant="body1"
                  className="!leading-tight !text-gray-900 !text-sm !font-semibold group-hover:!text-primary-600 transition-colors truncate"
                >
                  {master?.name}
                </Typography>
              </Tooltip>
              <Typography
                variant="caption"
                className="!mt-0.5 !block !text-xs !text-gray-500 truncate"
              >
                {master?.serial_number}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'location',
      label: 'Outlet/Depot',
      sortable: false,
      render: (_value, row) => {
        const master = row.asset_maintenance_master;
        const customer =
          row.customer ||
          master?.asset_master_outlet ||
          master?.cooler_asset_master?.[0]?.coolers_customers ||
          master?.customer_assets?.[0]?.customer_customer_assets;

        const locName =
          customer?.name ||
          master?.current_location ||
          master?.asset_master_depot?.name ||
          'Unassigned Location';
        const locCode = customer?.code || 'No Code';

        return (
          <Box className="!flex !items-center !gap-2">
            <Avatar className="!rounded !bg-sky-100 !text-sky-700">
              <MapPin className="h-5 w-5" />
            </Avatar>
            <Box className="min-w-0">
              <Typography
                variant="body1"
                className="!leading-tight !text-gray-900 !text-sm !font-semibold"
              >
                {locName}
              </Typography>
              <Typography
                variant="caption"
                className="!mt-0.5 !block !text-xs !text-gray-500 truncate"
              >
                {locCode}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'repair_location',
      label: 'Location',
      sortable: true,
      render: (_value, row) => {
        const repairLoc = (row.repair_location || 'onsite').toLowerCase();
        const repairLabel =
          repairLoc === 'onsite'
            ? 'On Site'
            : repairLoc === 'workshop'
              ? 'Workshop'
              : row.repair_location || 'On Site';

        return (
          <span
            className={classNames(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              repairLoc === 'workshop'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            )}
          >
            {repairLabel}
          </span>
        );
      },
    },
    {
      id: 'technician_id',
      label: 'Technician',
      sortable: true,
      render: (_value, row) => {
        const tech = row.asset_maintenance_technician;
        const sapCode = tech?.sap_code || tech?.employee_id;
        const subText =
          sapCode ||
          (row.technician_id
            ? `Tech ID: #${row.technician_id}`
            : 'No SAP Code');

        return (
          <Box className="!flex !items-center !gap-2">
            <Avatar
              alt={tech?.name || 'Technician'}
              src={tech?.profile_image}
              className="!rounded !bg-sky-100 !text-sky-700"
            >
              {(tech?.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box className="min-w-0">
              <Typography
                variant="body1"
                className="!leading-tight !text-gray-900 !text-sm !font-semibold"
              >
                {tech?.name || 'Unassigned'}
              </Typography>
              <Typography
                variant="caption"
                className="!mt-0.5 !block !text-xs !text-gray-500 truncate"
              >
                {subText}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Stage',
      sortable: true,
      render: (_value, row) => {
        const stg = (row.status || 'open').toLowerCase();
        return (
          <Chip
            label={stg.charAt(0).toUpperCase() + stg.slice(1)}
            size="small"
            color={
              stg === 'closed'
                ? 'success'
                : stg === 'repaired'
                  ? 'primary'
                  : stg === 'assigned'
                    ? 'info'
                    : 'warning'
            }
            className="!font-semibold !text-[11px]"
          />
        );
      },
    },
    {
      id: 'cost',
      label: 'Cost',
      sortable: true,
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-sm !font-semibold !text-gray-900"
        >
          {row.cost ? formatCurrency(Number(row.cost)) : 'TZS 0'}
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      sortable: true,
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
              <div className="!flex !items-center !gap-2">
                {isUpdate && (
                  <EditButton
                    icon={<Settings fontSize="small" />}
                    onClick={() => handleEditMaintenance(row)}
                    tooltip={`Manage Job #${row.job_number || row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteMaintenance(row.id)}
                    tooltip={`Delete Job #${row.job_number || row.id}`}
                    itemName={`Maintenance #${row.job_number || row.id}`}
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
            Asset Maintenance Management
          </p>
          <p className="!text-gray-500 text-sm">
            Track and manage asset maintenance records
          </p>
        </Box>
      </Box>

      {/** Top KPI Cards matching other master lists */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Maintenance"
          value={totalMaintenances}
          icon={<Wrench className="h-6 w-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Open Maintenance"
          value={openJobs}
          icon={<Clock className="h-6 w-6" />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Overdue Maintenance"
          value={overdueJobs}
          icon={<Block className="h-6 w-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="Closed Maintenance"
          value={closedJobs}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          isLoading={isFetching}
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
          isRead ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  placeholder="Search Job, Coolers..."
                  value={search}
                  onChange={handleSearchChange}
                  debounceMs={400}
                  showClear={true}
                  className="!w-72"
                />
                <Select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  disableClearable
                  className="!w-36"
                >
                  <MenuItem value="all">All Stages</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="repaired">Repaired</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
                <UserSelect
                  label=""
                  placeholder="All Technicians"
                  value={
                    technicianFilter === 'all'
                      ? undefined
                      : Number(technicianFilter)
                  }
                  onChange={(_event: any, user: any) => {
                    setTechnicianFilter(user?.id ? String(user.id) : 'all');
                    setPage(1);
                  }}
                  className="!w-72"
                />
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
                    {exportToExcelMutation.isPending
                      ? 'Exporting...'
                      : 'Export'}
                  </Button>
                </PopConfirm>
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={maintenance => maintenance.id}
        initialOrderBy="maintenance_date"
        loading={isFetching}
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
    </>
  );
};

export default AssetMaintenanceManagement;
