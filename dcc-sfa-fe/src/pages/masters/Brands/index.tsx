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
import { useBrands, useDeleteBrand, type Brand } from 'hooks/useBrands';
import { useExportToExcel } from 'hooks/useImportExport';
import { Tag, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportBrand from './ImportBrand';
import ManageBrand from './ManageBrand';

const BrandsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: brandsResponse,
    isLoading,
    error,
  } = useBrands({
    search,
    page,
    limit,
    status:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'active'
          : 'inactive',
  });

  const brands = brandsResponse?.data || [];
  const totalCount = brandsResponse?.meta?.total_count || 0;
  const currentPage = (brandsResponse?.meta?.current_page || 1) - 1;

  const deleteBrandMutation = useDeleteBrand();
  const exportToExcelMutation = useExportToExcel();

  const totalBrands = brandsResponse?.stats?.total_brands ?? 0;
  const activeBrands = brandsResponse?.stats?.active_brands ?? 0;
  const inactiveBrands = brandsResponse?.stats?.inactive_brands ?? 0;
  const newBrandsThisMonth = brandsResponse?.stats?.new_brands_this_month ?? 0;

  const handleCreateBrand = useCallback(() => {
    setSelectedBrand(null);
    setDrawerOpen(true);
  }, []);

  const handleEditBrand = useCallback((brand: Brand) => {
    setSelectedBrand(brand);
    setDrawerOpen(true);
  }, []);

  const handleDeleteBrand = useCallback(
    async (id: number) => {
      try {
        await deleteBrandMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    },
    [deleteBrandMutation]
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
        tableName: 'brands',
        filters,
      });
    } catch (error) {
      console.error('Error exporting brands:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const brandColumns: TableColumn<Brand>[] = [
    {
      id: 'name',
      label: 'Brand Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
            src={row.logo || undefined}
          >
            <Tag className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              Code: {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Tooltip title={row.description} placement="top" arrow>
          <Typography
            variant="body2"
            className="!text-gray-900 !max-w-xs !truncate"
          >
            {row.description}
          </Typography>
        </Tooltip>
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
            onClick={() => handleEditBrand(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteBrand(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Brands Management</p>
          <p className="!text-gray-500 text-sm">
            Manage brands for your organization
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Brands
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalBrands}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Brands
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeBrands}
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
                Inactive Brands
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveBrands}
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
                  {newBrandsThisMonth}
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
          Failed to load brands. Please try again.
        </Alert>
      )}

      <Table
        data={brands}
        columns={brandColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Brands..."
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
                title="Export Brands"
                description="Are you sure you want to export the current brands data to Excel? This will include all filtered results."
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
                onClick={handleCreateBrand}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={brand => brand.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No brands found matching "${search}"`
            : 'No brands found in the system'
        }
      />

      <ManageBrand
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportBrand
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default BrandsPage;
