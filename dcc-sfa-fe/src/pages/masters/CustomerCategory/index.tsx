import { Add, Block, CheckCircle, Download } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Users, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCustomerCategories,
  useDeleteCustomerCategory,
  type CustomerCategory,
} from '../../../hooks/useCustomerCategory';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ManageCustomerCategory from './ManageCustomerCategory';

const CustomerCategoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomerCategory, setSelectedCustomerCategory] =
    useState<CustomerCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('customer-category');

  const {
    data: customerCategoriesResponse,
    isLoading,
    error,
  } = useCustomerCategories(
    {
      search,
      page,
      limit,
      is_active:
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

  const customerCategories = customerCategoriesResponse?.data || [];
  const totalCount = customerCategoriesResponse?.meta?.total || 0;
  const currentPage = (customerCategoriesResponse?.meta?.page || 1) - 1;

  const deleteCustomerCategoryMutation = useDeleteCustomerCategory();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = customerCategoriesResponse?.stats;
  const totalCustomerCategories =
    stats?.total_categories || customerCategories.length;
  const activeCustomerCategories =
    stats?.active_categories ||
    customerCategories.filter(cat => cat.is_active === 'Y').length;
  const inactiveCustomerCategories =
    stats?.inactive_categories ||
    customerCategories.filter(cat => cat.is_active === 'N').length;

  const handleCreateCustomerCategory = useCallback(() => {
    setSelectedCustomerCategory(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCustomerCategory = useCallback(
    (customerCategory: CustomerCategory) => {
      setSelectedCustomerCategory(customerCategory);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteCustomerCategory = useCallback(
    async (id: number) => {
      try {
        await deleteCustomerCategoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting customer category:', error);
      }
    },
    [deleteCustomerCategoryMutation]
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
        tableName: 'customer_category',
        filters,
      });
    } catch (error) {
      console.error('Error exporting customer categories:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const customerCategoryColumns: TableColumn<CustomerCategory>[] = [
    {
      id: 'category_name',
      label: 'Category Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.category_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Users className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.category_name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.category_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'conditions',
      label: 'Conditions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.conditions?.length || 0} condition(s)
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
            render: (_value: any, row: CustomerCategory) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCustomerCategory(row)}
                    tooltip={`Edit ${row.category_name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCustomerCategory(row.id)}
                    tooltip={`Delete ${row.category_name}`}
                    itemName={row.category_name}
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
            Customer Category Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage customer categories and their conditions
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Categories"
          value={totalCustomerCategories}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Categories"
          value={activeCustomerCategories}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Categories"
          value={inactiveCustomerCategories}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Conditions"
          value={customerCategories.reduce(
            (sum, cat) => sum + (cat.conditions?.length || 0),
            0
          )}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load customer categories. Please try again.
        </Alert>
      )}

      <Table
        data={customerCategories}
        columns={customerCategoryColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Customer Categories..."
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
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {isRead && (
                  <PopConfirm
                    title="Export Customer Categories"
                    description="Are you sure you want to export the current customer categories data to Excel? This will include all filtered results."
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
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateCustomerCategory}
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
        getRowId={customerCategory => customerCategory.id}
        initialOrderBy="category_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No customer categories found matching "${search}"`
            : 'No customer categories found in the system'
        }
      />

      <ManageCustomerCategory
        selectedCustomerCategory={selectedCustomerCategory}
        setSelectedCustomerCategory={setSelectedCustomerCategory}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default CustomerCategoryPage;
