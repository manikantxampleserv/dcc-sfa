import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useCurrencies } from 'hooks/useCurrencies';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomerChannels } from 'hooks/useCustomerChannel';
import { useCustomerTypes } from 'hooks/useCustomerType';
import { useDepots } from 'hooks/useDepots';
import { useDistricts } from 'hooks/useDistrict';
import { usePermission } from 'hooks/usePermission';
import { useRegions } from 'hooks/useRegion';
import { useSettings } from 'hooks/useSettings';
import {
  AlertCircle,
  CreditCard,
  MapPin,
  Store,
  UserCheck,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCustomers,
  useDeleteCustomer,
  type Customer,
} from '../../../hooks/useCustomers';
import { useExportToExcel } from '../../../hooks/useImportExport';
import ImportCustomers from './ImportCustomers';
import ManageOutlet from './ManageOutlet';
import { getBusinessTypeChipColor, getBusinessTypeIcon } from './utils';

const OutletsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('outlet');

  const { data: settingsResponse } = useSettings();
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });
  const { data: depotsResponse } = useDepots({ limit: 1000 });
  const { data: typesResponse } = useCustomerTypes({ limit: 1000 });
  const { data: categoriesResponse } = useCustomerCategories({ limit: 1000 });
  const { data: channelsResponse } = useCustomerChannels({ limit: 1000 });
  const { data: regionsResponse } = useRegions({ limit: 1000 });
  const { data: districtsResponse } = useDistricts({ limit: 1000 });

  const settings = settingsResponse?.data;
  const defaultCurrencyId = settings?.currency_id || '';
  const depots = depotsResponse?.data || [];
  const customerTypes = typesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const channels = channelsResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const districts = districtsResponse?.data || [];

  const {
    data: customersResponse,
    isFetching,
    error,
  } = useCustomers(
    {
      search,
      page,
      limit,
      region_id: regionFilter === 'all' ? undefined : Number(regionFilter),
      district_id:
        districtFilter === 'all' ? undefined : Number(districtFilter),
      depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
      customer_type_id:
        customerTypeFilter === 'all' ? undefined : Number(customerTypeFilter),
      customer_category_id:
        categoryFilter === 'all' ? undefined : Number(categoryFilter),
      customer_channel_id:
        channelFilter === 'all' ? undefined : Number(channelFilter),
    },
    {
      enabled: isRead,
    }
  );

  const customers = customersResponse?.data || [];
  const totalCount = customersResponse?.meta?.total || 0;
  const currentPage = (customersResponse?.meta?.page || 1) - 1;

  const deleteCustomerMutation = useDeleteCustomer();
  const exportToExcelMutation = useExportToExcel();

  const totalCustomers = customersResponse?.stats?.total_customers ?? 0;
  const activeCustomers = customersResponse?.stats?.active_customers ?? 0;

  const totalCreditLimit = customersResponse?.stats?.total_credit_limit ?? 0;

  const totalOutstanding =
    customersResponse?.stats?.total_outstanding_amount ?? 0;

  const handleCreateOutlet = useCallback(() => {
    setSelectedOutlet(null);
    setDrawerOpen(true);
  }, []);

  const handleEditOutlet = useCallback((outlet: Customer) => {
    setSelectedOutlet(outlet);
    setDrawerOpen(true);
  }, []);

  const handleDeleteOutlet = useCallback(
    async (id: number) => {
      try {
        await deleteCustomerMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting outlet:', error);
      }
    },
    [deleteCustomerMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        region_id: regionFilter === 'all' ? undefined : Number(regionFilter),
        district_id:
          districtFilter === 'all' ? undefined : Number(districtFilter),
        depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
        customer_type_id:
          customerTypeFilter === 'all' ? undefined : Number(customerTypeFilter),
        customer_category_id:
          categoryFilter === 'all' ? undefined : Number(categoryFilter),
        customer_channel_id:
          channelFilter === 'all' ? undefined : Number(channelFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'customers',
        filters,
      });
    } catch (error) {
      console.error('Error exporting customers:', error);
    }
  }, [exportToExcelMutation, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const getCurrencyCode = (currencyId: string | number) => {
    const currencies = currenciesResponse?.data || [];
    const currency = currencies.find(c => c.id === Number(currencyId));
    return currency?.code || 'USD';
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return 'N/A';
    const currencyCode = getCurrencyCode(defaultCurrencyId);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  const outletColumns: TableColumn<Customer>[] = [
    {
      id: 'name',
      label: 'Outlet Name',
      render: (_value, row) => (
        <Box
          className="!flex !gap-2 !items-center"
          onClick={() => navigate(`/masters/outlets/${row.id}`)}
        >
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Store className="w-5 h-5" />
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
              className="!text-gray-400 !text-xs !block !mt-0.5"
            >
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer_type.type_name',
      label: 'Outlet Type',
      render: (_value, row) =>
        row?.customer_type?.type_name ? (
          <Chip
            icon={getBusinessTypeIcon(row?.customer_type?.type_name || '')}
            label={row?.customer_type?.type_name || 'N/A'}
            size="small"
            variant="outlined"
            className="!capitalize !px-1"
            color={getBusinessTypeChipColor(
              row?.customer_type?.type_name || ''
            )}
          />
        ) : (
          <span className="italic text-gray-400 text-xs">No Outlet Type</span>
        ),
    },

    {
      id: 'customer_channel.channel_name',
      label: 'Outlet Channel',
      render: (_value, row) =>
        row?.customer_channel?.channel_name ? (
          <Typography variant="body2" className="!text-gray-700">
            {row?.customer_channel?.channel_name || 'N/A'}
          </Typography>
        ) : (
          <span className="italic text-gray-400 text-xs">
            No Outlet Channel
          </span>
        ),
    },
    {
      id: 'customer_category.category_name',
      label: 'Category',
      render: (_value, row) =>
        row?.customer_category?.category_name ? (
          <Chip
            label={row?.customer_category?.category_name || 'Unassigned'}
            size="small"
            variant="filled"
            className="!font-medium"
          />
        ) : (
          <span className="italic text-gray-400 text-xs">
            No Outlet Category
          </span>
        ),
    },
    {
      id: 'depot.name',
      label: 'Depot',
      render: (_value, row) =>
        row?.depot?.name ? (
          <Box className="!flex !items-center !gap-1.5 flex-wrap">
            <Typography variant="body2" className="!text-gray-700">
              {row?.depot?.name || 'N/A'}
            </Typography>
            {row.default_for_depots && row.default_for_depots.length > 0 && (
              <Chip
                label="Default"
                size="small"
                variant="filled"
                color="success"
                className="!text-[10px] !h-4 !px-0.5 !font-semibold"
              />
            )}
          </Box>
        ) : (
          <span className="italic text-gray-400 text-xs">No Depot</span>
        ),
    },
    {
      id: 'customer_zones.name',
      label: 'Zone',
      render: (_value, row) =>
        row?.customer_zones?.name ? (
          <Typography variant="body2" className="!text-gray-700">
            {row?.customer_zones?.name || 'N/A'}
          </Typography>
        ) : (
          <span className="italic text-gray-400 text-xs">No Zone</span>
        ),
    },
    {
      id: 'email',
      label: 'Email',
      render: value => (
        <Typography variant="body2" className="!text-gray-700">
          {value || (
            <span className="!text-gray-400 !text-xs italic">No Email</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'city_detail.name',
      label: 'Location',
      render: (_value, row) => {
        const locationParts = [
          row.customer_city?.name,
          row.customer_district?.name,
          row.customer_region?.name,
        ].filter(Boolean);
        return (
          <Box>
            <Box className="flex items-center text-gray-900">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              {locationParts.length > 0 ? (
                locationParts.join(', ')
              ) : (
                <Typography variant="body2" className="!text-gray-700">
                  {row.address || (
                    <span className="!text-gray-400 !text-xs italic">
                      No Location
                    </span>
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'customer_routes.name',
      label: 'Route',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_routes?.name || (
            <span className="!text-gray-400 !text-xs italic">No Route</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'credit_limit',
      label: 'Credit Limit',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900 !font-medium">
          {formatCurrency(row.credit_limit ?? '0')}
        </Typography>
      ),
    },
    {
      id: 'outstanding_amount',
      label: 'Outstanding',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-red-600 !font-medium">
          {formatCurrency(row.outstanding_amount)}
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
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Customer) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditOutlet(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteOutlet(row.id)}
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
            Outlets Management
          </p>
          <p className="!text-gray-400 text-sm">
            Manage customer outlets, distributors, retailers, and wholesalers
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Outlets"
          value={totalCustomers}
          icon={<Store className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Outlets"
          value={activeCustomers}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Total Credit Limit"
          value={formatCurrency(totalCreditLimit.toString()).replaceAll(
            '.00',
            ''
          )}
          icon={<CreditCard className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Outstanding Amount"
          value={formatCurrency(totalOutstanding.toString()).replaceAll(
            '.00',
            ''
          )}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load outlets. Please try again.
        </Alert>
      )}

      {isRead && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 grid grid-cols-1 md:grid-cols-6 items-center gap-3">
          <Select
            value={depotFilter}
            onChange={e => setDepotFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Depots</MenuItem>
            {depots.map(depot => (
              <MenuItem key={depot.id} value={depot.id.toString()}>
                {depot.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={customerTypeFilter}
            onChange={e => setCustomerTypeFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Outlet Types</MenuItem>
            {customerTypes.map(type => (
              <MenuItem key={type.id} value={type.id.toString()}>
                {type.type_name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id.toString()}>
                {category.category_name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Channels</MenuItem>
            {channels.map(channel => (
              <MenuItem key={channel.id} value={channel.id.toString()}>
                {channel.channel_name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Regions</MenuItem>
            {regions.map(region => (
              <MenuItem key={region.id} value={region.id.toString()}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            size="small"
            disableClearable
          >
            <MenuItem value="all">All Districts</MenuItem>
            {districts.map(district => (
              <MenuItem key={district.id} value={district.id.toString()}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      )}

      <Table
        data={customers}
        columns={outletColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div>
                {isRead && (
                  <SearchInput
                    placeholder="Search Outlets"
                    value={search}
                    onChange={handleSearchChange}
                    debounceMs={400}
                    showClear={true}
                    className="!min-w-80"
                  />
                )}
              </div>
              <div className="flex justify-end items-center gap-2">
                {isRead && (
                  <>
                    <PopConfirm
                      title="Export Customers"
                      description="Are you sure you want to export the current customers data to Excel? This will include all filtered results."
                      onConfirm={handleExportToExcel}
                      confirmText="Export"
                      cancelText="Cancel"
                    >
                      <Button
                        variant="outlined"
                        className="!capitalize"
                        disableElevation
                        startIcon={<Download />}
                        disabled={exportToExcelMutation.isPending}
                      >
                        {exportToExcelMutation.isPending
                          ? 'Exporting...'
                          : 'Export'}
                      </Button>
                    </PopConfirm>
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Upload />}
                      onClick={() => setImportDrawerOpen(true)}
                    >
                      Import
                    </Button>
                  </>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateOutlet}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : undefined
        }
        getRowId={customer => customer.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No outlets found matching "${search}"`
            : 'No outlets found in the system'
        }
      />

      <ManageOutlet
        selectedOutlet={selectedOutlet}
        setSelectedOutlet={setSelectedOutlet}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCustomers
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default OutletsManagement;
