import {
  Add,
  Block,
  CheckCircle,
  Download,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useApiMutation } from 'hooks/useApiMutation';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { usePromotions } from 'hooks/usePromotions';
import { Tag, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePromotion, type Promotion } from 'services/masters/Promotions';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManagePromotion from './ManagePromotion';

const PromotionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('promotions');

  const {
    data: promotionsResponse,
    isLoading,
    error,
  } = usePromotions({
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

  const promotions: Promotion[] = promotionsResponse?.data || [];
  const totalCount = promotionsResponse?.pagination?.total_count || 0;
  const currentPage = (promotionsResponse?.pagination?.current_page || 1) - 1;

  const exportToExcelMutation = useExportToExcel();

  const deleteMutation = useApiMutation({
    mutationFn: (id: number) => deletePromotion(id),
    loadingMessage: 'Deleting promotion...',
    invalidateQueries: [['promotions']],
  });

  const totalPromotions =
    promotionsResponse?.stats?.total_promotions ||
    promotionsResponse?.pagination?.total_count ||
    0;
  const activePromotions =
    promotionsResponse?.stats?.active_promotions ||
    promotions.filter(p => p.is_active === 'Y').length;
  const inactivePromotions =
    promotionsResponse?.stats?.inactive_promotions ||
    promotions.filter(p => p.is_active === 'N').length;
  const newPromotionsThisMonth =
    promotionsResponse?.stats?.promotions_this_month || 0;

  const handleCreatePromotion = useCallback(() => {
    setSelectedPromotion(null);
    setDrawerOpen(true);
  }, []);

  const handleEditPromotion = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setDrawerOpen(true);
  }, []);

  const handleDeletePromotion = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    },
    [deleteMutation]
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
      id: 'name',
      label: 'Promotion Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center" onClick={() => navigate(`/masters/promotions/${row.id}`)}>
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Tag className="w-5 h-5" />
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
                {isRead && (
                  <ActionButton
                    onClick={() => navigate(`/masters/promotions/${row.id}`)}
                    tooltip="View promotion"
                    icon={<Visibility fontSize="small" />}
                    color="info"
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
        <StatsCard
          title="Total Promotions"
          value={totalPromotions}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Promotions"
          value={activePromotions}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Promotions"
          value={inactivePromotions}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newPromotionsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
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
        initialOrderBy="name"
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
