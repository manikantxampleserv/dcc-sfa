import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { FileText, Package, Truck, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useVanInventory,
  useDeleteVanInventory,
  type VanInventory,
} from '../../../hooks/useVanInventory';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from '../../../hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import UserSelect from '../../../shared/UserSelect';
import ImportVanInventory from './ImportVanInventory';
import ManageVanInventory from './ManageVanInventory';
import VanInventoryDetail from './VanInventoryDetail';
import VanInventoryItemsManagement from './VanInventoryItemsManagement';

const VanStockPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState<number | undefined>(undefined);
  const [selectedVanInventory, setSelectedVanInventory] =
    useState<VanInventory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [itemsDrawerOpen, setItemsDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } = usePermission('van-stock');

  const {
    data: vanInventoryResponse,
    isLoading,
    error,
  } = useVanInventory(
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
      user_id: userFilter,
    },
    {
      enabled: isRead,
    }
  );

  const vanInventory = vanInventoryResponse?.data || [];
  const totalCount = vanInventoryResponse?.meta?.total_count || 0;
  const currentPage = (vanInventoryResponse?.meta?.current_page || 1) - 1;

  const deleteVanInventoryMutation = useDeleteVanInventory();
  const exportToExcelMutation = useExportToExcel();

  const totalVanInventory = vanInventoryResponse?.stats?.total_records ?? 0;
  const activeVanInventory = vanInventoryResponse?.stats?.active_records ?? 0;
  const inactiveVanInventory =
    vanInventoryResponse?.stats?.inactive_records ?? 0;
  const newVanInventoryThisMonth =
    vanInventoryResponse?.stats?.van_inventory ?? 0;

  const handleCreateVanInventory = useCallback(() => {
    setSelectedVanInventory(null);
    setDrawerOpen(true);
  }, []);

  const handleEditVanInventory = useCallback((vanInventory: VanInventory) => {
    setSelectedVanInventory(vanInventory);
    setDrawerOpen(true);
  }, []);

  const handleViewVanInventory = useCallback((vanInventory: VanInventory) => {
    setSelectedVanInventory(vanInventory);
    setDetailDrawerOpen(true);
  }, []);

  const handleManageItems = useCallback((vanInventory: VanInventory) => {
    setSelectedVanInventory(vanInventory);
    setItemsDrawerOpen(true);
  }, []);

  const handleDeleteVanInventory = useCallback(
    async (id: number) => {
      try {
        await deleteVanInventoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting van inventory:', error);
      }
    },
    [deleteVanInventoryMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleUserFilterChange = useCallback((_event: any, user: any) => {
    setUserFilter(user ? user.id : undefined);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
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
        user_id: userFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'van_inventory',
        filters: {
          ...filters,
          user_id: userFilter,
        },
      });
    } catch (error) {
      console.error('Error exporting van inventory:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getLoadingTypeLabel = (type: string) => {
    switch (type) {
      case 'L':
        return 'Load';
      case 'U':
        return 'Unload';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'D':
        return 'Draft';
      case 'A':
        return 'Confirmed';
      case 'C':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'D':
        return 'warning';
      case 'A':
        return 'success';
      case 'C':
        return 'error';
      default:
        return 'default';
    }
  };

  const vanInventoryColumns: TableColumn<VanInventory>[] = [
    {
      id: 'user_id',
      label: 'User',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.user?.name || 'Unknown'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Truck className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.user?.name || 'Unknown User'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.user?.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'loading_type',
      label: 'Type',
      render: (_value, row) => (
        <Chip
          label={getLoadingTypeLabel(row.loading_type || 'L')}
          size="small"
          className="w-20"
          color={row.loading_type === 'L' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={getStatusLabel(row.status || 'D')}
          size="small"
          className="w-24"
          variant="outlined"
          color={getStatusColor(row.status || 'D') as any}
        />
      ),
    },
    {
      id: 'items',
      label: 'Items',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.items?.length || 0} items
        </Typography>
      ),
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.vehicle?.vehicle_number || 'No Vehicle'}
        </Typography>
      ),
    },
    {
      id: 'document_date',
      label: 'Document Date',
      render: (_value, row) =>
        formatDate(row.document_date) || (
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
      id: 'last_updated',
      label: 'Last Updated',
      render: (_value, row) => {
        const formattedDate = formatDate(row.last_updated);
        return formattedDate ? (
          <span>{formattedDate}</span>
        ) : (
          <span className="italic text-gray-400">No Date</span>
        );
      },
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'id',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: VanInventory) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <>
                    <ActionButton
                      onClick={() => handleViewVanInventory(row)}
                      tooltip="View van inventory details"
                      icon={<FileText />}
                      color="success"
                    />
                    <ActionButton
                      onClick={() => handleManageItems(row)}
                      tooltip="Manage van inventory items"
                      icon={<Package />}
                      color="info"
                    />
                  </>
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditVanInventory(row)}
                    tooltip={`Edit Van Inventory #${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteVanInventory(row.id)}
                    tooltip={`Delete Van Inventory #${row.id}`}
                    itemName={`Van Inventory #${row.id}`}
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
            Van Stock Load/Unload Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage van inventory, stock levels, and load/unload operations for
            sales personnel
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Records"
          value={totalVanInventory}
          icon={<Truck className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Records"
          value={activeVanInventory}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Records"
          value={inactiveVanInventory}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newVanInventoryThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load van inventory. Please try again.
        </Alert>
      )}

      <Table
        data={vanInventory}
        columns={vanInventoryColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex flex-wrap items-center gap-2">
                  <SearchInput
                    placeholder="Search Van Inventory..."
                    value={search}
                    onChange={handleSearchChange}
                    debounceMs={400}
                    showClear={true}
                    className="!w-80"
                  />
                  <Select
                    value={statusFilter}
                    onChange={e => handleStatusFilterChange(e.target.value)}
                    className="!w-32"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  <Box className="!w-64">
                    <UserSelect
                      label="Filter by User"
                      value={userFilter}
                      onChange={handleUserFilterChange}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Van Inventory"
                    description="Are you sure you want to export the current van inventory data to Excel? This will include all filtered results."
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
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateVanInventory}
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
        getRowId={vanInventory => vanInventory.id}
        initialOrderBy="last_updated"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No van inventory found matching "${search}"`
            : 'No van inventory found in the system'
        }
      />

      <ManageVanInventory
        selectedVanInventory={selectedVanInventory}
        setSelectedVanInventory={setSelectedVanInventory}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <VanInventoryDetail
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedVanInventory(null);
        }}
        vanInventory={selectedVanInventory}
      />

      <VanInventoryItemsManagement
        key={`items-management-${selectedVanInventory?.id || 0}`}
        open={itemsDrawerOpen}
        onClose={() => {
          setItemsDrawerOpen(false);
          setSelectedVanInventory(null);
        }}
        vanInventoryId={selectedVanInventory?.id || 0}
      />

      <ImportVanInventory
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default VanStockPage;
