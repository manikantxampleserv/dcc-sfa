import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { DollarSign, Package, Percent, Tag, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useDeleteProduct,
  useProducts,
  type Product,
} from '../../../hooks/useProducts';
import ManageProduct from './ManageProducts';

const ProductsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: productsResponse,
    isLoading,
    error,
  } = useProducts({
    search,
    page,
    limit,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'Y'
          : 'N',
  });

  const products = productsResponse?.data || [];
  const totalCount = productsResponse?.meta?.total || 0;
  const currentPage = (productsResponse?.meta?.page || 1) - 1;

  const deleteProductMutation = useDeleteProduct();

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active === 'Y').length;
  const inactiveProducts = products.filter(p => p.is_active === 'N').length;
  const newProductsThisMonth = 0;

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
          <Box className="flex items-center text-sm text-gray-900">
            <Tag className="w-4 h-4 text-gray-400 mr-2" />
            {row.category || 'N/A'}
          </Box>
          <Box className="flex items-center text-sm text-gray-500 mt-1">
            <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
            {row.brand || 'N/A'}
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
      id: 'unit_of_measure',
      label: 'Unit',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.unit_of_measure || 'N/A'}
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
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-500">
          {row.createdate
            ? new Date(row.createdate).toLocaleDateString()
            : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditProduct(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteProduct(row.id)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
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
            Products Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage your product catalog with pricing and inventory details
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Products
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeProducts}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Products
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveProducts}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                New This Month
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {newProductsThisMonth}
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
          Failed to load products. Please try again.
        </Alert>
      )}

      <Table
        data={products}
        columns={productColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
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
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateProduct}
            >
              Add Product
            </Button>
          </div>
        }
        getRowId={product => product.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
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
    </>
  );
};

export default ProductsManagement;
