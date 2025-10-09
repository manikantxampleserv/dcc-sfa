import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteKpiTarget,
  useKpiTargets,
  type KpiTarget,
} from 'hooks/useKpiTargets';
import { Target, User, Calendar, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportKpiTarget from './ImportKpiTarget';
import ManageKpiTarget from './ManageKpiTarget';

const KpiTargetsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKpiTarget, setSelectedKpiTarget] = useState<KpiTarget | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: kpiTargetsResponse,
    isLoading,
    error,
  } = useKpiTargets({
    search,
    page,
    limit,
    is_active: statusFilter === 'all' ? undefined : statusFilter,
  });

  const kpiTargets = kpiTargetsResponse?.data || [];
  const totalCount = kpiTargetsResponse?.meta?.total_count || 0;
  const currentPage = (kpiTargetsResponse?.meta?.current_page || 1) - 1;
  const stats = kpiTargetsResponse?.stats || {};

  const deleteKpiTargetMutation = useDeleteKpiTarget();
  const exportToExcelMutation = useExportToExcel();

  const totalTargets = stats.total_targets ?? kpiTargets.length;
  const activeTargets =
    stats.active_targets ??
    kpiTargets.filter((t: KpiTarget) => t.is_active === 'Y').length;
  const inactiveTargets =
    stats.inactive_targets ??
    kpiTargets.filter((t: KpiTarget) => t.is_active === 'N').length;
  const targetsThisMonth = stats.targets_this_month ?? 0;

  const handleCreateKpiTarget = useCallback(() => {
    setSelectedKpiTarget(null);
    setDrawerOpen(true);
  }, []);

  const handleEditKpiTarget = useCallback((kpiTarget: KpiTarget) => {
    setSelectedKpiTarget(kpiTarget);
    setDrawerOpen(true);
  }, []);

  const handleDeleteKpiTarget = useCallback(
    async (id: number) => {
      try {
        await deleteKpiTargetMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting KPI target:', error);
      }
    },
    [deleteKpiTargetMutation]
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
        is_active: statusFilter === 'all' ? undefined : statusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'employee_kpi_targets',
        filters,
      });
    } catch (error) {
      console.error('Error exporting KPI targets:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const kpiTargetsColumns: TableColumn<KpiTarget>[] = [
    {
      id: 'kpi_info',
      label: 'KPI Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.kpi_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Target className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.kpi_name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              Target: {row.target_value} {row.measure_unit || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'employee',
      label: 'Employee',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.employee?.name || 'Unknown Employee'}
          </span>
        </Box>
      ),
    },
    {
      id: 'period',
      label: 'Period',
      render: (_value, row) => {
        const start = formatDate(row.period_start);
        const end = formatDate(row.period_end);
        return (
          <Box className="flex flex-col items-start">
            <Box className="flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-800">
                {start} - {end}
              </span>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'measure_unit',
      label: 'Unit',
      render: (_value, row) => (
        <Chip
          label={row.measure_unit || 'N/A'}
          size="small"
          variant="outlined"
        />
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
            onClick={() => handleEditKpiTarget(row)}
            tooltip={`Edit ${row.kpi_name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteKpiTarget(row.id)}
            tooltip={`Delete ${row.kpi_name}`}
            itemName={row.kpi_name}
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
          <p className="!font-bold text-xl !text-gray-900">KPI Targets</p>
          <p className="!text-gray-500 text-sm">
            Manage employee KPI targets and performance goals
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Targets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalTargets}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Targets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeTargets}
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
                Inactive Targets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveTargets}
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
                  {targetsThisMonth}
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
          Failed to load KPI targets. Please try again.
        </Alert>
      )}

      <Table
        data={kpiTargets}
        columns={kpiTargetsColumns}
        actions={
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search KPI Targets..."
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
                <MenuItem value="Y">Active</MenuItem>
                <MenuItem value="N">Inactive</MenuItem>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <PopConfirm
                title="Export KPI Targets"
                description="Are you sure you want to export the current KPI targets data to Excel? This will include all filtered results."
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
                onClick={handleCreateKpiTarget}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={kpiTarget => kpiTarget.id}
        initialOrderBy="kpi_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No KPI targets found matching "${search}"`
            : 'No KPI targets found in the system'
        }
      />

      <ManageKpiTarget
        selectedKpiTarget={selectedKpiTarget}
        setSelectedKpiTarget={setSelectedKpiTarget}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportKpiTarget
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default KpiTargetsManagement;
