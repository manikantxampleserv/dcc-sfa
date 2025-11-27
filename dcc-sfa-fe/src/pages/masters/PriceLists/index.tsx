import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeletePriceList,
  usePriceLists,
  type PriceList,
} from 'hooks/usePriceLists';
import { DollarSign, Calendar, TrendingUp, FileText } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportPriceList from './ImportPriceList';
import ManagePriceList from './ManagePriceList';

const PriceListsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('pricelist');

  const {
    data: priceListsResponse,
    isLoading,
    error,
  } = usePriceLists(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      enabled: isRead,
    }
  );

  const priceLists = priceListsResponse?.data || [];
  const totalCount = priceListsResponse?.meta?.total_count || 0;
  const currentPage = (priceListsResponse?.meta?.current_page || 1) - 1;
  const stats = priceListsResponse?.stats || {};

  const deletePriceListMutation = useDeletePriceList();
  const exportToExcelMutation = useExportToExcel();

  const totalPriceLists = stats.total_price_lists ?? priceLists.length;
  const activePriceLists =
    stats.active_price_lists ??
    priceLists.filter((p: PriceList) => p.is_active === 'Y').length;
  const inactivePriceLists =
    stats.inactive_price_lists ??
    priceLists.filter((p: PriceList) => p.is_active === 'N').length;
  const newPriceListsThisMonth = stats.new_price_lists_this_month ?? 0;

  const handleCreatePriceList = useCallback(() => {
    setSelectedPriceList(null);
    setDrawerOpen(true);
  }, []);

  const handleEditPriceList = useCallback((priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setDrawerOpen(true);
  }, []);

  const handleDeletePriceList = useCallback(
    async (id: number) => {
      try {
        await deletePriceListMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting price list:', error);
      }
    },
    [deletePriceListMutation]
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
        status: statusFilter === 'all' ? undefined : statusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'pricelists',
        filters,
      });
    } catch (error) {
      console.error('Error exporting price lists:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const priceListsColumns: TableColumn<PriceList>[] = [
    {
      id: 'price_list_info',
      label: 'Price List Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <FileText className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            {row.description && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {row.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'currency_code',
      label: 'Currency',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium">
            {row.currency_code || 'INR'}
          </span>
        </Box>
      ),
    },
    {
      id: 'validity_period',
      label: 'Validity Period',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <Box className="text-xs">
            {row.valid_from || row.valid_to ? (
              <span>
                {row.valid_from && row.valid_to ? (
                  <>
                    {formatDate(row.valid_from)}
                    <span className="mx-1 text-gray-400">–</span>
                    {formatDate(row.valid_to)}
                  </>
                ) : row.valid_from ? (
                  <>
                    <span className="text-gray-400">From</span>{' '}
                    {formatDate(row.valid_from)}
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">Until</span>{' '}
                    {formatDate(row.valid_to)}
                  </>
                )}
              </span>
            ) : (
              <span className="text-gray-400 italic">No validity period</span>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'items_count',
      label: 'Items',
      render: (_value, row) => (
        <Chip
          label={`${row.pricelist_item?.length || 0} items`}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={row.is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: PriceList) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditPriceList(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeletePriceList(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Price Lists</p>
          <p className="!text-gray-500 text-sm">
            Manage pricing lists and product pricing strategies
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Price Lists"
          value={totalPriceLists}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Lists"
          value={activePriceLists}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Lists"
          value={inactivePriceLists}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={newPriceListsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load price lists. Please try again.
        </Alert>
      )}

      <Table
        data={priceLists}
        columns={priceListsColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Price Lists..."
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
                    title="Export Price Lists"
                    description="Are you sure you want to export the current price lists data to Excel? This will include all filtered results."
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
                    onClick={handleCreatePriceList}
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
        getRowId={priceList => priceList.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No price lists found matching "${search}"`
            : 'No price lists found in the system'
        }
      />

      <ManagePriceList
        selectedPriceList={selectedPriceList}
        setSelectedPriceList={setSelectedPriceList}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportPriceList
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default PriceListsManagement;
