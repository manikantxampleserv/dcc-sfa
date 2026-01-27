import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useCurrencies } from 'hooks/useCurrencies';
import { usePermission } from 'hooks/usePermission';
import { useSettings } from 'hooks/useSettings';
import {
  CreditCard,
  MapPin,
  Store,
  UserCheck,
  AlertCircle,
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
import { useRoutes } from '../../../hooks/useRoutes';
import { useZones } from '../../../hooks/useZones';
import { useExportToExcel } from '../../../hooks/useImportExport';
import ImportCustomers from './ImportCustomers';
import ManageOutlet from './ManageOutlet';
import {
  BUSINESS_TYPES,
  getBusinessTypeChipColor,
  getBusinessTypeIcon,
} from './utils';

const OutletsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('outlet');

  const { data: settingsResponse } = useSettings();
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });

  const settings = settingsResponse?.data;
  const defaultCurrencyId = settings?.currency_id || '';

  const {
    data: customersResponse,
    isFetching,
    error,
  } = useCustomers(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
      type: typeFilter === 'all' ? undefined : typeFilter,
    },
    {
      enabled: isRead,
    }
  );

  const { data: routesResponse } = useRoutes({
    page: 1,
    limit: 100,
    status: 'active',
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100,
    isActive: 'Y',
  });

  const customers = customersResponse?.data || [];
  const routes = routesResponse?.data || [];
  const zones = zonesResponse?.data || [];
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
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
        type: typeFilter === 'all' ? undefined : typeFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'customers',
        filters,
      });
    } catch (error) {
      console.error('Error exporting customers:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, typeFilter]);

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
              className="!text-gray-500 !text-xs !block !mt-0.5"
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
      render: (_value, row) => (
        <Chip
          icon={getBusinessTypeIcon(row.customer_type?.type_name || '')}
          label={row.customer_type?.type_name || 'N/A'}
          size="small"
          variant="outlined"
          className="!capitalize !px-1"
          color={getBusinessTypeChipColor(row.customer_type?.type_name || '')}
        />
      ),
    },

    {
      id: 'customer_channel.channel_name',
      label: 'Outlet Channel',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_channel?.channel_name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.email || (
            <span className="!text-gray-500 !text-xs italic">No Email</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'row.city',
      label: 'Location',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-gray-900">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            {row.city && row.state && row.zipcode
              ? `${row.city}${row.state ? `, ${row.state}` : ''}${row.zipcode ? `, ${row.zipcode}` : ''}`
              : row.city
                ? row.city
                : row.state
                  ? row.state
                  : row.zipcode
                    ? row.zipcode
                    : 'N/A'}
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer_routes.name',
      label: 'Route',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_routes?.name || (
            <span className="!text-gray-500 !text-xs italic">No Route</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'customer_users.name',
      label: 'Salesperson',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_users?.name || (
            <span className="!text-gray-500 !text-xs italic">
              No Salesperson
            </span>
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
          <p className="!text-gray-500 text-sm">
            Manage customer outlets, distributors, retailers, and wholesalers
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
          value={formatCurrency(totalCreditLimit.toString())}
          icon={<CreditCard className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Outstanding Amount"
          value={formatCurrency(totalOutstanding.toString())}
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

      <Table
        data={customers}
        columns={outletColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Outlets"
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
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      className="!min-w-40"
                      size="small"
                      disableClearable
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      {BUSINESS_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              {isCreate && (
                <div className="flex items-center gap-2">
                  {isRead && (
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
                  )}
                  {isRead && (
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Upload />}
                      onClick={() => setImportDrawerOpen(true)}
                    >
                      Import
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateOutlet}
                  >
                    Create
                  </Button>
                </div>
              )}
            </div>
          ) : (
            false
          )
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
        routes={routes}
        zones={zones}
      />

      <ImportCustomers
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default OutletsManagement;
