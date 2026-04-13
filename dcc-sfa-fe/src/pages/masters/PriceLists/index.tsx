import {
  Add,
  Block,
  CheckCircle,
  // Download,
  FilterList,
  // Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomers } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
// import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeletePriceList,
  usePriceLists,
  type PriceList,
} from 'hooks/usePriceLists';
import { useRoutes } from 'hooks/useRoutes';
import { FileText, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
// import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportPriceList from './ImportPriceList';
import ManagePriceList from './ManagePriceList';

const PriceListsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotId, setDepotId] = useState<string>('');
  const [routeId, setRouteId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');

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
    isFetching,
    error,
  } = usePriceLists(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      depot_id: depotId ? Number(depotId) : undefined,
      route_id: routeId ? Number(routeId) : undefined,
      customer_id: customerId ? Number(customerId) : undefined,
      customer_category_id: categoryId ? Number(categoryId) : undefined,
      include_items: true,
    },
    { enabled: isRead }
  );

  const { data: depotsResponse } = useDepots({ limit: 1000, isActive: 'Y' });
  const { data: routesResponse } = useRoutes({
    limit: 1000,
    status: 'active',
    depot_id: depotId ? Number(depotId) : undefined,
  });
  const { data: categoriesResponse } = useCustomerCategories({
    limit: 1000,
    is_active: 'Y',
  });
  const { data: customersResponse } = useCustomers({
    limit: 1000,
    isActive: 'Y',
    depot_id: depotId ? Number(depotId) : undefined,
    route_id: routeId ? Number(routeId) : undefined,
  });

  const depots = depotsResponse?.data || [];
  const routes = routesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const customers = customersResponse?.data || [];

  const priceLists = priceListsResponse?.data || [];
  const totalCount = priceListsResponse?.meta?.total || 0;
  const currentPage = (priceListsResponse?.meta?.page || 1) - 1;
  const stats = priceListsResponse?.stats || {};

  const deletePriceListMutation = useDeletePriceList();
  // const exportToExcelMutation = useExportToExcel();

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

  // const handleExportToExcel = useCallback(async () => {
  //   try {
  //     const filters = {
  //       search,
  //       status: statusFilter === 'all' ? undefined : statusFilter,
  //       depot_id: depotId ? Number(depotId) : undefined,
  //       route_id: routeId ? Number(routeId) : undefined,
  //       customer_id: customerId ? Number(customerId) : undefined,
  //       customer_category_id: categoryId ? Number(categoryId) : undefined,
  //       view_mode: viewMode,
  //     };

  //     await exportToExcelMutation.mutateAsync({
  //       tableName: 'pricelists',
  //       filters,
  //     });
  //   } catch (error) {
  //     console.error('Error exporting price lists:', error);
  //   }
  // }, [
  //   exportToExcelMutation,
  //   search,
  //   statusFilter,
  //   depotId,
  //   routeId,
  //   customerId,
  //   categoryId,
  //   viewMode,
  // ]);

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
      id: 'assignment',
      label: 'Assignment',
      render: (_value, row) => {
        if (row.is_default === 'Y') {
          return (
            <Chip
              label="Default"
              size="small"
              className="!bg-blue-50 !text-blue-700 !border-blue-200"
              variant="outlined"
            />
          );
        }
        if (row.customer_id)
          return (
            <Typography variant="caption" className="text-gray-600">
              Customer: {row.pricelists_customer?.name || row.customer_id}
            </Typography>
          );
        if (row.route_id)
          return (
            <Typography variant="caption" className="text-gray-600">
              Route: {row.pricelists_route?.name || row.route_id}
            </Typography>
          );
        if (row.depot_id)
          return (
            <Typography variant="caption" className="text-gray-600">
              Depot: {row.pricelists_depot?.name || row.depot_id}
            </Typography>
          );
        if (row.customer_category_id)
          return (
            <Typography variant="caption" className="text-gray-600">
              Category: {row.customer_category_id}
            </Typography>
          );
        return (
          <Typography variant="caption" className="text-gray-400 italic">
            Global
          </Typography>
        );
      },
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
            label: 'Action',
            sortable: false,
            render: (_value: any, row: PriceList) => (
              <div className="!flex !gap-2 justify-center !items-center">
                <ActionButton
                  onClick={() => navigate(`/masters/price-lists/${row.id}`)}
                  tooltip={`View ${row.name} details`}
                  icon={<Visibility fontSize="small" />}
                  color="info"
                />
                {isUpdate && row.is_default !== 'Y' && (
                  <EditButton
                    onClick={() => handleEditPriceList(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}

                {isUpdate && row.is_default !== 'Y' && (
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
          <p className="!font-bold text-xl !text-gray-900">
            Price List Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage pricing lists and product pricing strategies
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Price Lists"
          value={totalPriceLists}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Lists"
          value={activePriceLists}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Lists"
          value={inactivePriceLists}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="This Month"
          value={newPriceListsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load price lists. Please try again.
        </Alert>
      )}

      {isRead && (
        <Box className="bg-white shadow-sm p-3 rounded-lg border border-gray-100 mb-4">
          <Box className="flex items-center gap-2 mb-4">
            <FilterList className="text-primary-500" />
            <Typography variant="subtitle2" className="!font-bold">
              Filters
            </Typography>
          </Box>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Depot"
              value={depotId}
              onChange={e => {
                setDepotId(e.target.value);
                setRouteId('');
                setCustomerId('');
                setPage(1);
              }}
              placeholder="Select Depot"
              className="w-full"
            >
              {depots.map((depot: any) => (
                <MenuItem key={depot.id} value={depot.id.toString()}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              label="Route"
              value={routeId}
              onChange={e => {
                setRouteId(e.target.value);
                setCustomerId('');
                setPage(1);
              }}
              placeholder="Select Route"
              disabled={!depotId}
              className="w-full"
            >
              {routes.map((route: any) => (
                <MenuItem key={route.id} value={route.id.toString()}>
                  {route.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              label="Customer Category"
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              placeholder="Select Category"
              className="w-full"
            >
              {categories.map((category: any) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              label="Customer"
              value={customerId}
              onChange={e => {
                setCustomerId(e.target.value);
                setPage(1);
              }}
              placeholder="Select Customer"
              disabled={!depotId && !routeId}
              className="w-full"
            >
              {customers.map((customer: any) => (
                <MenuItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </Box>
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
                      placeholder={'Search Price Lists...'}
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
                {/* {isRead && (
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
                )} */}
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
        loading={isFetching}
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
