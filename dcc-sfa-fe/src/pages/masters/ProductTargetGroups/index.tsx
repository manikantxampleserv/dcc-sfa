import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useProductTargetGroups,
  useDeleteProductTargetGroup,
  type ProductTargetGroup,
} from 'hooks/useProductTargetGroups';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Package, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportProductTargetGroup from './ImportProductTargetGroup';
import ManageProductTargetGroup from './ManageProductTargetGroup';

const ProductTargetGroupsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProductTargetGroup, setSelectedProductTargetGroup] =
    useState<ProductTargetGroup | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'product-target-group'
  );

  const {
    data: productTargetGroupsResponse,
    isLoading,
    error,
  } = useProductTargetGroups(
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

  const productTargetGroups = productTargetGroupsResponse?.data || [];
  const totalCount = productTargetGroupsResponse?.meta?.total_count || 0;
  const currentPage =
    (productTargetGroupsResponse?.meta?.current_page || 1) - 1;

  const deleteProductTargetGroupMutation = useDeleteProductTargetGroup();
  const exportToExcelMutation = useExportToExcel();

  const totalProductTargetGroups =
    productTargetGroupsResponse?.stats?.total_product_target_groups ??
    productTargetGroups.length;
  const activeProductTargetGroups =
    productTargetGroupsResponse?.stats?.active_product_target_groups ??
    productTargetGroups.filter(ptg => ptg.is_active === 'Y').length;
  const inactiveProductTargetGroups =
    productTargetGroupsResponse?.stats?.inactive_product_target_groups ??
    productTargetGroups.filter(ptg => ptg.is_active === 'N').length;
  const newProductTargetGroupsThisMonth =
    productTargetGroupsResponse?.stats?.new_product_target_groups_this_month ??
    0;

  const handleCreateProductTargetGroup = useCallback(() => {
    setSelectedProductTargetGroup(null);
    setDrawerOpen(true);
  }, []);

  const handleEditProductTargetGroup = useCallback(
    (productTargetGroup: ProductTargetGroup) => {
      setSelectedProductTargetGroup(productTargetGroup);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteProductTargetGroup = useCallback(
    async (id: number) => {
      try {
        await deleteProductTargetGroupMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product target group:', error);
      }
    },
    [deleteProductTargetGroupMutation]
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
        tableName: 'product_target_group',
        filters,
      });
    } catch (error) {
      console.error('Error exporting product target groups:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const productTargetGroupColumns: TableColumn<ProductTargetGroup>[] = [
    {
      id: 'name',
      label: 'Target Group Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
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
            render: (_value: any, row: ProductTargetGroup) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditProductTargetGroup(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteProductTargetGroup(row.id)}
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
            Product Target Groups Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage product target groups for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Target Groups"
          value={totalProductTargetGroups}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Groups"
          value={activeProductTargetGroups}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Groups"
          value={inactiveProductTargetGroups}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newProductTargetGroupsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load product target groups. Please try again.
        </Alert>
      )}

      <Table
        data={productTargetGroups}
        columns={productTargetGroupColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Product Target Groups..."
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
                    title="Export Product Target Groups"
                    description="Are you sure you want to export the current product target groups data to Excel?"
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
                    onClick={handleCreateProductTargetGroup}
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
        getRowId={productTargetGroup => productTargetGroup.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No product target groups found matching "${search}"`
            : 'No product target groups found in the system'
        }
      />

      <ManageProductTargetGroup
        selectedProductTargetGroup={selectedProductTargetGroup}
        setSelectedProductTargetGroup={setSelectedProductTargetGroup}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportProductTargetGroup
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ProductTargetGroupsPage;
