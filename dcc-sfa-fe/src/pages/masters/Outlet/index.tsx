import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  CreditCard,
  DollarSign,
  MapPin,
  Phone,
  Store,
  UserCheck,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCustomers,
  useDeleteCustomer,
  type Customer,
} from '../../../hooks/useCustomers';
import { usePermission } from 'hooks/usePermission';
import { useRoutes } from '../../../hooks/useRoutes';
import { useZones } from '../../../hooks/useZones';
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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('outlet');

  const {
    data: customersResponse,
    isLoading,
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
  });

  const { data: zonesResponse } = useZones({
    page: 1,
    limit: 100,
  });

  const customers = customersResponse?.data || [];
  const routes = routesResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const totalCount = customersResponse?.meta?.total || 0;
  const currentPage = (customersResponse?.meta?.page || 1) - 1;

  const deleteCustomerMutation = useDeleteCustomer();

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
        <Chip
          icon={getBusinessTypeIcon(row.type || '')}
          label={row.type || 'N/A'}
          size="small"
          variant="outlined"
          className="!capitalize !px-1"
          color={getBusinessTypeChipColor(row.type || '')}
        />
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
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Outlets"
          value={activeCustomers}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Credit Limit"
          value={formatCurrency(totalCreditLimit.toString())}
          icon={<CreditCard className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="Outstanding Amount"
          value={formatCurrency(totalOutstanding.toString())}
          icon={<DollarSign className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
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
        onRowClick={(row: Customer) => navigate(`/masters/outlets/${row.id}`)}
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
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateOutlet}
                >
                  Add Outlet
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={customer => customer.id}
        initialOrderBy="name"
        loading={isLoading}
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
    </>
  );
};

export default OutletsManagement;
