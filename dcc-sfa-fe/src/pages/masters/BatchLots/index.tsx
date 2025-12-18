import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
  Warning,
} from '@mui/icons-material';
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
  useBatchLots,
  useDeleteBatchLot,
  type BatchLot,
} from 'hooks/useBatchLots';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { AlertTriangle, Archive, Package } from 'lucide-react';
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
    isLoading,
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

  const getQualityGradeColor = (grade?: string | null) => {
    switch (grade) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'error';
      default:
        return 'default';
    }
  };

  const batchLotColumns: TableColumn<BatchLot>[] = [
    {
      id: 'batch_number',
      label: 'Batch Information',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.batch_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.batch_number}
            </Typography>
            {row.lot_number && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                Lot: {row.lot_number}
              </Typography>
            )}
            {row.products && row.products.length > 0 && (
              <Typography
                variant="caption"
                className="!text-gray-600 !text-xs !block !mt-0.5"
              >
                {row.products.length} product(s)
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.remaining_quantity} / {row.quantity}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Available / Total
          </Typography>
        </Box>
      ),
    },
    {
      id: 'expiry_date',
      label: 'Expiry Status',
      render: (_value, row) => {
        const expiryStatus = getExpiryStatus(row.expiry_date);
        return (
          <Tooltip
            title={`Expires: ${formatDate(row.expiry_date)}`}
            placement="top"
            arrow
          >
            <Chip
              icon={expiryStatus.icon}
              label={expiryStatus.label}
              size="small"
              variant="outlined"
              color={expiryStatus.color as any}
            />
          </Tooltip>
        );
      },
    },
    {
      id: 'quality_grade',
      label: 'Quality',
      render: (quality_grade, _row) => (
        <Chip
          label={`Grade ${quality_grade || 'N/A'}`}
          size="small"
          variant="filled"
          color={getQualityGradeColor(quality_grade) as any}
        />
      ),
    },
    {
      id: 'supplier_name',
      label: 'Supplier',
      render: (supplier_name, _row) => (
        <Typography variant="body2" className="!text-gray-900">
          {supplier_name || (
            <span className="italic text-gray-400">No Supplier</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'storage_location',
      label: 'Storage Location',
      render: (storage_location, _row) => (
        <Typography variant="body2" className="!text-gray-700">
          {storage_location || (
            <span className="italic text-gray-400">Not Specified</span>
          )}
        </Typography>
      ),
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
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Batches"
          value={activeBatchLots}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringBatchLots}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Expired"
          value={expiredBatchLots}
          icon={<Archive className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
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
                      label="Status"
                    >
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
        loading={isLoading}
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
