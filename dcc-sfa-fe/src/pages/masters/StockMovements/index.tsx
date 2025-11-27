import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteStockMovement,
  useStockMovements,
  type StockMovement,
} from 'hooks/useStockMovements';
import { usePermission } from 'hooks/usePermission';
import { ArrowDown, ArrowRightLeft, ArrowUp, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportStockMovement from './ImportStockMovement';
import ManageStockMovement from './ManageStockMovement';

const StockMovementsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [selectedMovement, setSelectedMovement] =
    useState<StockMovement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('stock-movement');

  const {
    data: movementsResponse,
    isLoading,
    error,
  } = useStockMovements(
    {
      search,
      page,
      limit,
      status:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'active'
            : 'inactive',
      movement_type:
        movementTypeFilter === 'all' ? undefined : movementTypeFilter,
    },
    {
      enabled: isRead,
    }
  );

  const movements = movementsResponse?.data || [];
  const totalCount = movementsResponse?.meta?.total || 0;
  const currentPage = (movementsResponse?.meta?.page || 1) - 1;

  const deleteMovementMutation = useDeleteStockMovement();
  const exportToExcelMutation = useExportToExcel();

  const totalMovements = movementsResponse?.stats?.total_stock_movements ?? 0;

  const movementsThisMonth =
    movementsResponse?.stats?.stock_movements_this_month ?? 0;
  const totalInMovements = movementsResponse?.stats?.total_in_movements ?? 0;
  const totalOutMovements = movementsResponse?.stats?.total_out_movements ?? 0;

  const handleCreateMovement = useCallback(() => {
    setSelectedMovement(null);
    setDrawerOpen(true);
  }, []);

  const handleEditMovement = useCallback((movement: StockMovement) => {
    setSelectedMovement(movement);
    setDrawerOpen(true);
  }, []);

  const handleDeleteMovement = useCallback(
    async (id: number) => {
      try {
        await deleteMovementMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting stock movement:', error);
      }
    },
    [deleteMovementMutation]
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
              ? 'active'
              : 'inactive',
        movement_type:
          movementTypeFilter === 'all' ? undefined : movementTypeFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'stock_movements',
        filters,
      });
    } catch (error) {
      console.error('Error exporting stock movements:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, movementTypeFilter]);

  const getMovementTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'IN':
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case 'OUT':
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      default:
        return <ArrowRightLeft className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'IN':
        return 'Stock In';
      case 'OUT':
        return 'Stock Out';
      case 'TRANSFER':
        return 'Transfer';
      default:
        return type || 'Unknown';
    }
  };

  // Define table columns
  const movementColumns: TableColumn<StockMovement>[] = [
    {
      id: 'movement_type',
      label: 'Movement',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.movement_type}
            className="!rounded !bg-primary-100 !text-primary-600"
            sx={{ width: 32, height: 32 }}
          >
            {getMovementTypeIcon(row.movement_type)}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {getMovementTypeLabel(row.movement_type)}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.reference_type
                ? `${row.reference_type} #${row.reference_id}`
                : 'Direct Movement'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'product',
      label: 'Product',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.product?.name || `ID: ${row.product_id}`}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            {row.product?.code || 'No Code'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Box className="!text-center">
          <Typography
            variant="body2"
            className={`${
              row.movement_type?.toUpperCase() === 'IN'
                ? '!text-green-600'
                : row.movement_type?.toUpperCase() === 'OUT'
                  ? '!text-red-600'
                  : '!text-blue-600'
            }`}
          >
            {row.movement_type?.toUpperCase() === 'IN'
              ? '+'
              : row.movement_type?.toUpperCase() === 'OUT'
                ? '-'
                : '±'}{' '}
            {row.quantity}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'locations',
      label: 'Locations',
      render: (_value, row) => (
        <Box>
          {row.from_location && (
            <Typography variant="caption" className="!text-gray-500 !block">
              From: {row.from_location.name}
            </Typography>
          )}
          {row.to_location && (
            <Typography variant="caption" className="!text-gray-500 !block">
              To: {row.to_location.name}
            </Typography>
          )}
          {!row.from_location && !row.to_location && (
            <Typography variant="caption" className="!text-gray-400 !italic">
              No location specified
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'batch_serial',
      label: 'Batch/Serial',
      render: (_value, row) => (
        <Box>
          {row.batch_id && (
            <Typography variant="caption" className="!text-gray-600 !block">
              Batch: {row.batch_id}
            </Typography>
          )}
          {row.serial_id && (
            <Typography variant="caption" className="!text-gray-600 !block">
              Serial: {row.serial_id}
            </Typography>
          )}
          {!row.batch_id && !row.serial_id && (
            <Typography variant="caption" className="!text-gray-400 !italic">
              No batch/serial
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'movement_date',
      label: 'Date',
      render: (_value, row) =>
        formatDate(row.movement_date) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'is_active',
      label: 'Active',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          className="w-20"
          variant="outlined"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created',
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
            render: (_value: any, row: StockMovement) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditMovement(row)}
                    tooltip={`Edit movement ${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteMovement(row.id)}
                    tooltip={`Delete movement ${row.id}`}
                    itemName={`movement ${row.id}`}
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
            Stock Movements Management
          </p>
          <p className="!text-gray-500 text-sm">
            Track and manage all stock movements including in, out, and transfer
            operations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Movements"
          value={totalMovements}
          icon={<ArrowRightLeft className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Stock In"
          value={totalInMovements}
          icon={<ArrowDown className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Stock Out"
          value={totalOutMovements}
          icon={<ArrowUp className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={movementsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load stock movements. Please try again.
        </Alert>
      )}

      <Table
        data={movements}
        columns={movementColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex items-center flex-wrap gap-2">
                  <SearchInput
                    placeholder="Search Stock Movements"
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
                  <Select
                    value={movementTypeFilter}
                    onChange={e => setMovementTypeFilter(e.target.value)}
                    className="!min-w-32"
                    size="small"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="IN">Stock In</MenuItem>
                    <MenuItem value="OUT">Stock Out</MenuItem>
                    <MenuItem value="TRANSFER">Transfer</MenuItem>
                  </Select>
                </div>
              )}
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Stock Movements"
                    description="Are you sure you want to export the current stock movements data to Excel? This will include all filtered results."
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
        initialOrderBy="createdate"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No stock movements found matching "${search}"`
            : 'No stock movements found in the system'
        }
      />

      <ManageStockMovement
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
      />

      <ImportStockMovement
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default StockMovementsManagement;
