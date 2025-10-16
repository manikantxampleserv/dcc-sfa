import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { Package, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useProductCategories,
  useDeleteProductCategory,
  type ProductCategory,
} from '../../../hooks/useProductCategories';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { formatDate } from '../../../utils/dateUtils';
import ImportProductCategory from './ImportProductCategory';
import ManageProductCategory from './ManageProductCategory';

const ProductCategoriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<ProductCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: productCategoriesResponse,
    isLoading,
    error,
  } = useProductCategories({
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

  const productCategories = productCategoriesResponse?.data || [];
  const totalCount = productCategoriesResponse?.meta?.total_count || 0;
  const currentPage = (productCategoriesResponse?.meta?.current_page || 1) - 1;

  const deleteProductCategoryMutation = useDeleteProductCategory();
  const exportToExcelMutation = useExportToExcel();

  const totalProductCategories =
    productCategoriesResponse?.stats?.total_product_categories ?? 0;
  const activeProductCategories =
    productCategoriesResponse?.stats?.active_product_categories ?? 0;
  const inactiveProductCategories =
    productCategoriesResponse?.stats?.inactive_product_categories ?? 0;
  const newProductCategoriesThisMonth =
    productCategoriesResponse?.stats?.new_product_categories_this_month ?? 0;

  const handleCreateProductCategory = useCallback(() => {
    setSelectedProductCategory(null);
    setDrawerOpen(true);
  }, []);

  const handleEditProductCategory = useCallback(
    (productCategory: ProductCategory) => {
      setSelectedProductCategory(productCategory);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteProductCategory = useCallback(
    async (id: number) => {
      try {
        await deleteProductCategoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product category:', error);
      }
    },
    [deleteProductCategoryMutation]
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
        tableName: 'product_categories',
        filters,
      });
    } catch (error) {
      console.error('Error exporting product categories:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const productCategoryColumns: TableColumn<ProductCategory>[] = [
    {
      id: 'category_name',
      label: 'Category Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.category_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.category_name}
            </Typography>
            {row.description && (
              <Tooltip title={row.description} placement="top" arrow>
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !block !mt-0.5"
                  title={row.description}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    maxWidth: '300px',
                    cursor: 'help',
                  }}
                >
                  {row.description}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Box>
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
          className="w-26"
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
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditProductCategory(row)}
            tooltip={`Edit ${row.category_name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteProductCategory(row.id)}
            tooltip={`Delete ${row.category_name}`}
            itemName={row.category_name}
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
            Product Categories Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage product categories for your organization
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalProductCategories}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeProductCategories}
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
                Inactive Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveProductCategories}
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
              <p className="text-sm font-medium text-purple-600">
                New This Month
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {newProductCategoriesThisMonth}
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
          Failed to load product categories. Please try again.
        </Alert>
      )}

      <Table
        data={productCategories}
        columns={productCategoryColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Product Categories..."
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
            </div>
            <div className="flex items-center gap-2">
              <PopConfirm
                title="Export Product Categories"
                description="Are you sure you want to export the current product categories data to Excel? This will include all filtered results."
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
                onClick={handleCreateProductCategory}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={productCategory => productCategory.id}
        initialOrderBy="category_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No product categories found matching "${search}"`
            : 'No product categories found in the system'
        }
      />

      <ManageProductCategory
        selectedProductCategory={selectedProductCategory}
        setSelectedProductCategory={setSelectedProductCategory}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportProductCategory
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ProductCategoriesPage;
