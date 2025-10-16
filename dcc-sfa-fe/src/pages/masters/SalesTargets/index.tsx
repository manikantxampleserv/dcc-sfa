import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useSalesTargets,
  useDeleteSalesTarget,
  type SalesTarget,
} from 'hooks/useSalesTargets';
import { useExportToExcel } from 'hooks/useImportExport';
import { Target, Calendar, TrendingUp, Package } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportSalesTarget from './ImportSalesTarget';
import ManageSalesTarget from './ManageSalesTarget';

const SalesTargetsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState<SalesTarget | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: targetsResponse,
    isLoading,
    error,
  } = useSalesTargets({
    search,
    page,
    limit,
    is_active:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
  });

  const targets = targetsResponse?.data || [];
  const totalCount = targetsResponse?.meta?.total || 0;
  const currentPage = (targetsResponse?.meta?.page || 1) - 1;

  const deleteTargetMutation = useDeleteSalesTarget();
  const exportToExcelMutation = useExportToExcel();

  const totalTargets = targetsResponse?.stats?.total_sales_targets ?? 0;
  const activeTargets = targetsResponse?.stats?.active_sales_targets ?? 0;
  const inactiveTargets = targetsResponse?.stats?.inactive_sales_targets ?? 0;
  const targetsThisMonth =
    targetsResponse?.stats?.sales_targets_this_month ?? 0;

  const handleCreateTarget = useCallback(() => {
    setSelectedTarget(null);
    setDrawerOpen(true);
  }, []);

  const handleEditTarget = useCallback((target: SalesTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(true);
  }, []);

  const handleDeleteTarget = useCallback(
    async (id: number) => {
      try {
        await deleteTargetMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting sales target:', error);
      }
    },
    [deleteTargetMutation]
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
        is_active:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'sales_targets',
        filters,
      });
    } catch (error) {
      console.error('Error exporting sales targets:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  // Define table columns
  const targetColumns: TableColumn<SalesTarget>[] = [
    {
      id: 'target_info',
      label: 'Target Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={`Target ${row.id}`}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Target className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.sales_target_group?.group_name || 'Unknown Group'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              Qty: {row.target_quantity} | Amount:{' '}
              {row.target_amount ? `$${row.target_amount}` : 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'product_category',
      label: 'Product Category',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Package className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.product_category?.category_name || 'Unknown Category'}
          </span>
        </Box>
      ),
    },
    {
      id: 'period',
      label: 'Period',
      render: (_value, row) => {
        const start = formatDate(row.start_date);
        const end = formatDate(row.end_date);
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
      id: 'target_quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Chip
          label={row.target_quantity}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      id: 'target_amount',
      label: 'Amount',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.target_amount ? `$${row.target_amount}` : 'N/A'}
        </Typography>
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
          className="w-26"
          color={row.is_active === 'Y' ? 'success' : 'error'}
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
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditTarget(row)}
            tooltip={`Edit Target ${row.id}`}
          />
          <DeleteButton
            onClick={() => handleDeleteTarget(row.id)}
            tooltip={`Delete Target ${row.id}`}
            itemName={`Target ${row.id}`}
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
            Sales Targets Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage sales targets for groups and product categories
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Targets</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalTargets}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Targets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeTargets}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Targets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveTargets}
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
              <p className="text-sm font-medium text-gray-600">This Month</p>
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
          Failed to load sales targets. Please try again.
        </Alert>
      )}

      <Table
        data={targets}
        columns={targetColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Sales Targets"
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                fullWidth={false}
                className="!min-w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="!min-w-32"
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <PopConfirm
                title="Export Sales Targets"
                description="Are you sure you want to export the current sales targets data to Excel? This will include all filtered results."
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
                onClick={handleCreateTarget}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={target => target.id}
        initialOrderBy="target_quantity"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No sales targets found matching "${search}"`
            : 'No sales targets found in the system'
        }
      />

      <ManageSalesTarget
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportSalesTarget
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SalesTargetsManagement;
