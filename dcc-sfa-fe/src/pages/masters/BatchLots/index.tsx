import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
  Warning,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useBatchLots,
  useDeleteBatchLot,
  type BatchLot,
} from 'hooks/useBatchLots';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { AlertTriangle, Archive, Calendar, Package } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportBatchLot from './ImportBatchLot';
import ManageBatchLot from './ManageBatchLot';

const BatchLotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBatchLot, setSelectedBatchLot] = useState<BatchLot | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('batch-lots');

  const {
    data: batchLotsResponse,
    isFetching,
    error,
  } = useBatchLots(
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

  const batchLots = batchLotsResponse?.data || [];
  const totalCount = batchLotsResponse?.meta?.total_count || 0;
  const currentPage = (batchLotsResponse?.meta?.current_page || 1) - 1;

  const deleteBatchLotMutation = useDeleteBatchLot();
  const exportToExcelMutation = useExportToExcel();

  const totalBatchLots =
    batchLotsResponse?.stats?.total_batch_lots ?? batchLots.length;
  const activeBatchLots =
    batchLotsResponse?.stats?.active_batch_lots ??
    batchLots.filter(bl => bl.is_active === 'Y').length;
  const expiringBatchLots = batchLotsResponse?.stats?.expiring_batch_lots ?? 0;
  const expiredBatchLots = batchLotsResponse?.stats?.expired_batch_lots ?? 0;

  const handleCreateBatchLot = useCallback(() => {
    setSelectedBatchLot(null);
    setDrawerOpen(true);
  }, []);

  const handleViewBatchLot = useCallback(
    (batchLotId: number) => {
      navigate(`/masters/batch-lots/${batchLotId}`);
    },
    [navigate]
  );

  const handleEditBatchLot = useCallback((batchLot: BatchLot) => {
    setSelectedBatchLot(batchLot);
    setDrawerOpen(true);
  }, []);

  const handleDeleteBatchLot = useCallback(
    async (id: number) => {
      try {
        await deleteBatchLotMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting batch lot:', error);
      }
    },
    [deleteBatchLotMutation]
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
        tableName: 'batch_lots',
        filters,
      });
    } catch (error) {
      console.error('Error exporting batch lots:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        color: 'error',
        label: 'Expired',
        icon: <Block />,
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'expiring',
        color: 'warning',
        label: `${daysUntilExpiry}d left`,
        icon: <Warning />,
      };
    }
    return {
      status: 'valid',
      color: 'success',
      label: 'Valid',
      icon: <CheckCircle />,
    };
  };

  const batchLotColumns: TableColumn<BatchLot>[] = [
    {
      id: 'batch_number',
      label: 'Batch Info',
      render: (_value, row) => (
        <Box
          className="!flex !gap-2 !items-center !cursor-pointer hover:!opacity-80 !transition-opacity"
          onClick={() => handleViewBatchLot(row.id)}
        >
          <Avatar
            alt={row.batch_number}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium hover:!text-primary-600 !transition-colors"
            >
              {row.batch_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.lot_number ? `Lot: ${row.lot_number}` : 'No lot number'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'products',
      label: 'Products',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Package className="w-4 h-4 text-gray-400 mr-2" />
            {row.products?.length || 0} product(s)
          </Box>
          {row.products && row.products.length > 0 && (
            <Box className="flex items-center text-xs text-gray-500 mt-1">
              <Archive className="w-4 h-4 text-gray-400 mr-2" />
              {row.products[0]?.name || 'Unknown'}
              {row.products.length > 1 && ` +${row.products.length - 1} more`}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'dates',
      label: 'Dates',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
            {formatDate(row.expiry_date?.toString())}
          </Box>
          <Box className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            Mfg: {formatDate(row.manufacturing_date?.toString())}
          </Box>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Package className="w-4 h-4 text-gray-400 mr-2" />
            {Number(row.quantity).toLocaleString()} total
          </Box>
          <Box className="flex items-center text-sm text-gray-500 mt-1">
            <Archive className="w-4 h-4 text-gray-400 mr-2" />
            {Number(row.remaining_quantity).toLocaleString()} remaining
          </Box>
        </Box>
      ),
    },
    {
      id: 'supplier',
      label: 'Supplier',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.supplier_name || (
            <span className="!text-gray-500 italic">no supplier</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'storage',
      label: 'Storage',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.storage_location || (
            <span className="!text-gray-500 italic">no location</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'purchase_price',
      label: 'Purchase Price',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.purchase_price ? (
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(row.purchase_price)
          ) : (
            <span className="!text-gray-500 italic">no price</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'expiry_status',
      label: 'Expiry Status',
      render: (_value, row) => {
        const status = getExpiryStatus(row.expiry_date || '');
        return (
          <Chip
            icon={status.icon}
            label={status.label}
            size="small"
            variant="outlined"
            color={status.color as any}
          />
        );
      },
    },
    {
      id: 'is_active',
      label: 'Status',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-500">
          {formatDate(row.createdate?.toString())}
        </Typography>
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: BatchLot) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewBatchLot(row.id)}
                    tooltip={`View ${row.batch_number}`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditBatchLot(row)}
                    tooltip={`Edit ${row.batch_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteBatchLot(row.id)}
                    tooltip={`Delete ${row.batch_number}`}
                    itemName={row.batch_number}
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
            Batch & Lot Management
          </p>
          <p className="!text-gray-500 text-sm">
            Track batch numbers, lot numbers, expiry dates, and inventory levels
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Batch Lots"
          value={totalBatchLots}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Batches"
          value={activeBatchLots}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringBatchLots}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
          isLoading={isFetching}
        />
        <StatsCard
          title="Expired"
          value={expiredBatchLots}
          icon={<Archive className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load batch lots. Please try again.
        </Alert>
      )}

      <Table
        data={batchLots}
        columns={batchLotColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Batch Lots..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="!w-32"
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Batch Lots"
                    description="Are you sure you want to export the current batch lots data to Excel? This will include all filtered results."
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
                    onClick={handleCreateBatchLot}
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
        getRowId={batchLot => batchLot.id}
        initialOrderBy="expiry_date"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No batch lots found matching "${search}"`
            : 'No batch lots found in the system'
        }
      />

      <ManageBatchLot
        selectedBatchLot={selectedBatchLot}
        setSelectedBatchLot={setSelectedBatchLot}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportBatchLot
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default BatchLotsPage;
