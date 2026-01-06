import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useProductShelfLife,
  useDeleteProductShelfLife,
  type ProductShelfLife,
} from 'hooks/useProductShelfLife';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Clock, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportProductShelfLife from './ImportProductShelfLife';
import ManageProductShelfLife from './ManageProductShelfLife';

const ProductShelfLifePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShelfLife, setSelectedShelfLife] =
    useState<ProductShelfLife | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('product-shelf-life');

  const {
    data: shelfLifeResponse,
    isFetching,
    error,
  } = useProductShelfLife(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
    },
    {
      enabled: isRead,
    }
  );

  const shelfLife = shelfLifeResponse?.data || [];
  const totalCount = shelfLifeResponse?.meta?.total_count || 0;
  const currentPage = (shelfLifeResponse?.meta?.current_page || 1) - 1;

  const deleteShelfLifeMutation = useDeleteProductShelfLife();
  const exportToExcelMutation = useExportToExcel();

  const totalShelfLife =
    shelfLifeResponse?.stats?.total_product_shelf_life ?? shelfLife.length;
  const activeShelfLife =
    shelfLifeResponse?.stats?.active_product_shelf_life ??
    shelfLife.filter(s => s.is_active === 'Y').length;
  const inactiveShelfLife =
    shelfLifeResponse?.stats?.inactive_product_shelf_life ??
    shelfLife.filter(s => s.is_active === 'N').length;
  const newShelfLifeThisMonth =
    shelfLifeResponse?.stats?.new_product_shelf_life_this_month ?? 0;

  const handleCreateShelfLife = useCallback(() => {
    setSelectedShelfLife(null);
    setDrawerOpen(true);
  }, []);

  const handleEditShelfLife = useCallback((shelfLife: ProductShelfLife) => {
    setSelectedShelfLife(shelfLife);
    setDrawerOpen(true);
  }, []);

  const handleDeleteShelfLife = useCallback(
    async (id: number) => {
      try {
        await deleteShelfLifeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product shelf life:', error);
      }
    },
    [deleteShelfLifeMutation]
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
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'product_shelf_life',
        filters,
      });
    } catch (error) {
      console.error('Error exporting product shelf life:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const shelfLifeColumns: TableColumn<ProductShelfLife>[] = [
    {
      id: 'name',
      label: 'Shelf Life Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Clock className="w-5 h-5" />
          </Avatar>
          <Typography variant="body1" className="!text-gray-900">
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'code',
      label: 'Code',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.code || <span className="italic text-gray-400">No Code</span>}
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
    {
      id: 'createdate',
      label: 'Created Date',
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
            render: (_value: any, row: ProductShelfLife) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditShelfLife(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteShelfLife(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
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
            Product Shelf Life Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage product shelf life for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Shelf Life"
          value={totalShelfLife}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Shelf Life"
          value={activeShelfLife}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Shelf Life"
          value={inactiveShelfLife}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newShelfLifeThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load product shelf life. Please try again.
        </Alert>
      )}

      <Table
        data={shelfLife}
        columns={shelfLifeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Product Shelf Life..."
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
                    title="Export Product Shelf Life"
                    description="Are you sure you want to export the current product shelf life data to Excel?"
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
                    onClick={handleCreateShelfLife}
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
        getRowId={shelfLife => shelfLife.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No product shelf life found matching "${search}"`
            : 'No product shelf life found in the system'
        }
      />

      <ManageProductShelfLife
        selectedShelfLife={selectedShelfLife}
        setSelectedShelfLife={setSelectedShelfLife}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportProductShelfLife
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ProductShelfLifePage;
