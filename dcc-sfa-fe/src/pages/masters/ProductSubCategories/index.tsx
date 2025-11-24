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
  useProductSubCategories,
  useDeleteProductSubCategory,
  type ProductSubCategory,
} from '../../../hooks/useProductSubCategories';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ImportProductSubCategory from './ImportProductSubCategory';
import ManageProductSubCategory from './ManageProductSubCategory';

const ProductSubCategoriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProductSubCategory, setSelectedProductSubCategory] =
    useState<ProductSubCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'product-sub-category'
  );

  const {
    data: productSubCategoriesResponse,
    isLoading,
    error,
  } = useProductSubCategories(
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

  const productSubCategories = productSubCategoriesResponse?.data || [];
  const totalCount = productSubCategoriesResponse?.meta?.total_count || 0;
  const currentPage =
    (productSubCategoriesResponse?.meta?.current_page || 1) - 1;

  const deleteProductSubCategoryMutation = useDeleteProductSubCategory();
  const exportToExcelMutation = useExportToExcel();

  const totalProductSubCategories =
    productSubCategoriesResponse?.stats?.total_sub_categories ?? 0;
  const activeProductSubCategories =
    productSubCategoriesResponse?.stats?.active_sub_categories ?? 0;
  const inactiveProductSubCategories =
    productSubCategoriesResponse?.stats?.inactive_sub_categories ?? 0;
  const newProductSubCategoriesThisMonth =
    productSubCategoriesResponse?.stats?.new_sub_categories_this_month ?? 0;

  const handleCreateProductSubCategory = useCallback(() => {
    setSelectedProductSubCategory(null);
    setDrawerOpen(true);
  }, []);

  const handleEditProductSubCategory = useCallback(
    (productSubCategory: ProductSubCategory) => {
      setSelectedProductSubCategory(productSubCategory);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteProductSubCategory = useCallback(
    async (id: number) => {
      try {
        await deleteProductSubCategoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product sub category:', error);
      }
    },
    [deleteProductSubCategoryMutation]
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
        tableName: 'product_sub_categories',
        filters,
      });
    } catch (error) {
      console.error('Error exporting product sub categories:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const productSubCategoryColumns: TableColumn<ProductSubCategory>[] = [
    {
      id: 'sub_category_name',
      label: 'Sub Category Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.sub_category_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.sub_category_name}
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
      id: 'product_category',
      label: 'Product Category',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.product_category?.category_name || (
            <span className="italic text-gray-400">No Category</span>
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
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: ProductSubCategory) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditProductSubCategory(row)}
                    tooltip={`Edit ${row.sub_category_name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteProductSubCategory(row.id)}
                    tooltip={`Delete ${row.sub_category_name}`}
                    itemName={row.sub_category_name}
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
            Product Sub Categories Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage product sub categories for your organization
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Sub Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalProductSubCategories}
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
                Active Sub Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeProductSubCategories}
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
                Inactive Sub Categories
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveProductSubCategories}
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
                  {newProductSubCategoriesThisMonth}
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
          Failed to load product sub categories. Please try again.
        </Alert>
      )}

      <Table
        data={productSubCategories}
        columns={productSubCategoryColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Product Sub Categories..."
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
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Product Sub Categories"
                    description="Are you sure you want to export the current product sub categories data to Excel? This will include all filtered results."
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
                    onClick={handleCreateProductSubCategory}
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
        getRowId={productSubCategory => productSubCategory.id}
        initialOrderBy="sub_category_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No product sub categories found matching "${search}"`
            : 'No product sub categories found in the system'
        }
      />

      <ManageProductSubCategory
        selectedProductSubCategory={selectedProductSubCategory}
        setSelectedProductSubCategory={setSelectedProductSubCategory}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportProductSubCategory
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ProductSubCategoriesPage;
