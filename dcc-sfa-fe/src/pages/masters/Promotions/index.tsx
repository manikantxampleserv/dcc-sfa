import { Add, Block, CheckCircle, Download } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Tag, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from 'utils/dateUtils';
import { useExportToExcel } from 'hooks/useImportExport';
import ManagePromotion from './ManagePromotion';

interface Promotion {
  id: number;
  promotion_name: string;
  promotion_code: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_active: string;
  createdate?: string;
}

const PromotionsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [_page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('promotions');

  // TODO: Implement promotion hooks and API calls
  // const { data: promotionsResponse, isLoading, error } = usePromotions({
  //   search,
  //   page, // Using page state
  //   limit,
  //   status: statusFilter === 'all' ? undefined : statusFilter,
  // });

  const promotions: Promotion[] = [];
  const totalCount = 0;
  const currentPage = 0;
  const isLoading = false;
  const error = null;

  const exportToExcelMutation = useExportToExcel();

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(p => p.is_active === 'Y').length;
  const inactivePromotions = promotions.filter(p => p.is_active === 'N').length;
  const newPromotionsThisMonth = 0;

  const handleCreatePromotion = useCallback(() => {
    setSelectedPromotion(null);
    setDrawerOpen(true);
  }, []);

  const handleEditPromotion = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setDrawerOpen(true);
  }, []);

  const handleDeletePromotion = useCallback(async (id: number) => {
    try {
      console.log('Delete promotion:', id);
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  }, []);

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
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'promotions',
        filters,
      });
    } catch (error) {
      console.error('Error exporting promotions:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const promotionColumns: TableColumn<Promotion>[] = [
    {
      id: 'promotion_name',
      label: 'Promotion Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.promotion_name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Tag className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.promotion_name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.promotion_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'start_date',
      label: 'Period',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900">
            {formatDate(row.start_date)}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            to {formatDate(row.end_date)}
          </Typography>
        </Box>
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
            render: (_value: any, row: Promotion) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditPromotion(row)}
                    tooltip="Edit promotion"
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeletePromotion(row.id)}
                    tooltip="Delete promotion"
                    confirmDelete={true}
                    itemName="promotion"
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
            Promotions Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage promotional offers, discounts, and special deals for your
            products
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Promotions
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalPromotions}
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
                Active Promotions
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activePromotions}
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
                Inactive Promotions
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactivePromotions}
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
                  {newPromotionsThisMonth}
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
          Failed to load promotions. Please try again.
        </Alert>
      )}

      <Table
        data={promotions}
        columns={promotionColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Promotions..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
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
                    title="Export Promotions"
                    description="Are you sure you want to export the current promotions data to Excel? This will include all filtered results."
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
                    onClick={handleCreatePromotion}
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
        getRowId={promotion => promotion.id}
        initialOrderBy="promotion_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No promotions found matching "${search}"`
            : 'No promotions found in the system'
        }
      />

      <ManagePromotion
        selectedPromotion={selectedPromotion}
        setSelectedPromotion={setSelectedPromotion}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default PromotionsManagement;
