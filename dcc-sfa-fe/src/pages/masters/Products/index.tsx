import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { DollarSign, Package, Percent, Tag, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useDeleteProduct,
  useProducts,
  type Product,
} from '../../../hooks/useProducts';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import ManageProduct from './ManageProducts';
import ImportProduct from './ImportProduct';
import { formatDate } from 'utils/dateUtils';

const ProductsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('product');

  const {
    data: productsResponse,
    isLoading,
    error,
  } = useProducts(
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
    },
    {
      enabled: isRead,
    }
  );

  const products = productsResponse?.data || [];
  const totalCount = productsResponse?.meta?.total_count || 0;
  const currentPage = (productsResponse?.meta?.current_page || 1) - 1;

  const deleteProductMutation = useDeleteProduct();
  const exportToExcelMutation = useExportToExcel();

  const totalProducts = productsResponse?.stats?.total_products ?? 0;
  const activeProducts = productsResponse?.stats?.active_products ?? 0;
  const inactiveProducts = productsResponse?.stats?.inactive_products ?? 0;
  const newProductsThisMonth =
    productsResponse?.stats?.new_products_this_month ?? 0;

  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null);
    setDrawerOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(
    async (id: number) => {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    [deleteProductMutation]
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
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'products',
        filters,
      });
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    return `${Number(percentage || '0').toFixed(2)}%`;
  };

  const productColumns: TableColumn<Product>[] = [
    {
      id: 'name',
      label: 'Product Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category & Brand',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm mt-1">
            <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
            {row.product_brand?.name || 'N/A'}
          </Box>
          <Box className="flex items-center text-xs text-gray-900">
            <Tag className="w-4 h-4 text-gray-400 mr-2" />
            {row.product_category?.category_name || 'N/A'}{' '}
            {row.product_sub_category?.sub_category_name && (
              <span className="text-gray-500 pl-0.5">
                {`• ${row.product_sub_category?.sub_category_name}`}
              </span>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'pricing',
      label: 'Pricing',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
            {formatPrice(row.base_price)}
          </Box>
          {row.tax_rate && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Percent className="w-4 h-4 text-gray-400 mr-2" />
              {formatPercentage(row.tax_rate)} tax
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'unit_of_measurement',
      label: 'Unit',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.product_unit?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-700 !max-w-xs !truncate"
        >
          {row.description || 'N/A'}
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
            render: (_value: any, row: Product) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditProduct(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteProduct(row.id)}
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
            Products Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage your product catalog with pricing and inventory details
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Products"
          value={activeProducts}
          icon={<Package className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Products"
          value={inactiveProducts}
          icon={<Package className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newProductsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load products. Please try again.
        </Alert>
      )}

      <Table
        data={products}
        columns={productColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Products"
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
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Products"
                    description="Are you sure you want to export the current products data to Excel? This will include all filtered results."
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
                    onClick={handleCreateProduct}
                  >
                    Add Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={product => product.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No products found matching "${search}"`
            : 'No products found in the system'
        }
      />

      <ManageProduct
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportProduct
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ProductsManagement;
