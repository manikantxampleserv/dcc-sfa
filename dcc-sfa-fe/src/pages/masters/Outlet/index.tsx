import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  Store,
  MapPin,
  User,
  UserCheck,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useUsers } from '../../../hooks/useUsers';
import { useRoutes } from '../../../hooks/useRoutes';
import { useZones } from '../../../hooks/useZones';
import {
  useDeleteCustomer,
  useCustomers,
  type Customer,
} from '../../../hooks/useCustomers';
import ManageOutlet from './ManageOutlet';

const OutletsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: customersResponse,
    isLoading,
    error,
  } = useCustomers({
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
  });

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000, // Get all users for salesperson filtering
  });

  const { data: routesResponse } = useRoutes({
    page: 1,
    limit: 100, // Get all routes
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100, // Get all zones
  });

  const customers = customersResponse?.data || [];
  const users = usersResponse?.data || [];
  const routes = routesResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const totalCount = customersResponse?.meta?.total || 0;
  const currentPage = (customersResponse?.meta?.page || 1) - 1;

  const deleteCustomerMutation = useDeleteCustomer();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalCustomers =
    customersResponse?.stats?.totalCustomers ?? customers.length;
  const activeCustomers =
    customersResponse?.stats?.active_customers ??
    customers.filter(c => c.is_active === 'Y').length;
  // const inactiveCustomers =
  //   customersResponse?.stats?.inactive_customers ??
  //   customers.filter(c => c.is_active === 'N').length;

  // Type-based statistics
  const distributors = customers.filter(c => c.type === 'distributor').length;
  const retailers = customers.filter(c => c.type === 'retailer').length;
  const wholesalers = customers.filter(c => c.type === 'wholesaler').length;

  // Financial statistics
  const totalCreditLimit = customers.reduce(
    (sum, c) => sum + parseFloat(c.credit_limit || '0'),
    0
  );
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + parseFloat(c.outstanding_amount || '0'),
    0
  );

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distributor':
        return 'bg-purple-100 text-purple-800';
      case 'retailer':
        return 'bg-blue-100 text-blue-800';
      case 'wholesaler':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distributor':
        return <TrendingUp className="w-4 h-4" />;
      case 'retailer':
        return <Store className="w-4 h-4" />;
      case 'wholesaler':
        return <Users className="w-4 h-4" />;
      default:
        return <Store className="w-4 h-4" />;
    }
  };

  // Define table columns following Routes pattern
  const outletColumns: TableColumn<Customer>[] = [
    {
      id: 'name',
      label: 'Outlet Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Store className="w-5 h-5" />
          </Avatar>
          <Box>
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
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type & Contact',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center mb-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(row.type || '')}`}
            >
              {getTypeIcon(row.type || '')}
              <span className="ml-1 capitalize">{row.type || 'N/A'}</span>
            </span>
          </Box>
          <Typography variant="body2" className="!font-medium">
            {row.contact_person || 'No Contact'}
          </Typography>
          {row.phone_number && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Phone className="w-3 h-3 mr-1" />
              {row.phone_number}
            </Box>
          )}
          {row.email && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="w-3 h-3 mr-1" />
              {row.email}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-gray-900">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            {row.city && row.state ? `${row.city}, ${row.state}` : 'N/A'}
          </Box>
          {row.zipcode && (
            <Typography
              variant="caption"
              className="!text-gray-500 !block !mt-1"
            >
              {row.zipcode}
            </Typography>
          )}
          {row.latitude && row.longitude && (
            <Typography
              variant="caption"
              className="!text-gray-400 !block !mt-1"
            >
              {parseFloat(row.latitude).toFixed(4)},{' '}
              {parseFloat(row.longitude).toFixed(4)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'route_sales',
      label: 'Route & Sales',
      render: (_value, row) => (
        <Box>
          {row.customer_routes ? (
            <Box className="flex items-center text-sm text-gray-900 mb-1">
              <Store className="w-4 h-4 text-gray-400 mr-2" />
              {row.customer_routes.name}
            </Box>
          ) : (
            <Typography variant="caption" className="!text-gray-500">
              No Route
            </Typography>
          )}
          {row.customer_users ? (
            <Box className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              {row.customer_users.name}
            </Box>
          ) : (
            <Typography variant="caption" className="!text-gray-500">
              No Salesperson
            </Typography>
          )}
          {row.last_visit_date && (
            <Typography
              variant="caption"
              className="!text-gray-400 !block !mt-1"
            >
              Last visit: {new Date(row.last_visit_date).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'financial',
      label: 'Financial',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-gray-900 mb-1">
            <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
            <Typography variant="caption">
              {formatCurrency(row.credit_limit ?? null)}
            </Typography>
          </Box>
          <Box className="flex items-center text-red-600">
            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
            <Typography variant="caption">
              {formatCurrency(row.outstanding_amount)}
            </Typography>
          </Box>
        </Box>
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
            onClick={() => handleEditOutlet(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteOutlet(row.id)}
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
            Outlets Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage customer outlets, distributors, retailers, and wholesalers
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outlets</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalCustomers}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Outlets
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeCustomers}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Credit Limit
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalCreditLimit.toString())}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Outstanding Amount
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOutstanding.toString())}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Distributors</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {distributors}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retailers</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">{retailers}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wholesalers</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {wholesalers}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
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
          <div className="flex justify-between w-full">
            <div className="flex gap-3">
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
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="distributor">Distributors</MenuItem>
                <MenuItem value="retailer">Retailers</MenuItem>
                <MenuItem value="wholesaler">Wholesalers</MenuItem>
              </Select>
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateOutlet}
            >
              Add Outlet
            </Button>
          </div>
        }
        getRowId={customer => customer.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
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
        users={users}
        routes={routes}
        zones={zones}
      />
    </>
  );
};

export default OutletsManagement;
