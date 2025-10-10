import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  CreditCard,
  DollarSign,
  MapPin,
  Phone,
  Store,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCustomers,
  useDeleteCustomer,
  type Customer,
} from '../../../hooks/useCustomers';
import { useRoutes } from '../../../hooks/useRoutes';
import { useUsers } from '../../../hooks/useUsers';
import { useZones } from '../../../hooks/useZones';
import ManageOutlet from './ManageOutlet';

const OutletsManagement: React.FC = () => {
  const navigate = useNavigate();
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
    customersResponse?.stats?.total_customers ?? customers.length;
  const activeCustomers =
    customersResponse?.stats?.active_customers ??
    customers.filter(c => c.is_active === 'Y').length;

  // Type-based statistics from API
  const distributors =
    customersResponse?.stats?.distributors ??
    customers.filter(c => c.type === 'distributor').length;
  const retailers =
    customersResponse?.stats?.retailers ??
    customers.filter(c => c.type === 'retailer').length;
  const wholesalers =
    customersResponse?.stats?.wholesellers ??
    customers.filter(c => c.type === 'wholesaler').length;

  // Financial statistics from API
  const totalCreditLimit = customersResponse?.stats?.total_credit_limit
    ? parseFloat(customersResponse.stats.total_credit_limit)
    : customers.reduce((sum, c) => sum + parseFloat(c.credit_limit || '0'), 0);
  const totalOutstanding = customersResponse?.stats?.total_outstanding_amount
    ? parseFloat(customersResponse.stats.total_outstanding_amount)
    : customers.reduce(
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

  // Define table columns with better separation
  const outletColumns: TableColumn<Customer>[] = [
    {
      id: 'name',
      label: 'Outlet Name',
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
      id: 'type',
      label: 'Type',
      render: (_value, row) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(row.type || '')}`}
        >
          {getTypeIcon(row.type || '')}
          <span className="ml-1 capitalize">{row.type || 'N/A'}</span>
        </span>
      ),
    },
    {
      id: 'contact',
      label: 'Contact Person',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!font-medium !text-gray-900">
            {row.contact_person || 'No Contact'}
          </Typography>
          {row.phone_number && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Phone className="w-3 h-3 mr-1" />
              {row.phone_number}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.email || 'No Email'}
        </Typography>
      ),
    },
    {
      id: 'location',
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
      id: 'route',
      label: 'Route',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_routes?.name || 'No Route'}
        </Typography>
      ),
    },
    {
      id: 'salesperson',
      label: 'Salesperson',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.customer_users?.name || 'No Salesperson'}
        </Typography>
      ),
    },
    {
      id: 'credit_limit',
      label: 'Credit Limit',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900 !font-medium">
          {formatCurrency(row.credit_limit ?? null)}
        </Typography>
      ),
    },
    {
      id: 'outstanding',
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
          color={is_active === 'Y' ? 'success' : 'error'}
        />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
        onRowClick={(row: Customer) => navigate(`/masters/outlets/${row.id}`)}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
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
