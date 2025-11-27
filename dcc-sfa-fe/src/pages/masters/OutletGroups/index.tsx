import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Calendar, Percent, UserCheck, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteOutletGroup,
  useOutletGroups,
  type OutletGroup,
} from '../../../hooks/useOutletGroups';
import ManageOutletGroup from './ManageOutletGroups';

const OutletGroupsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOutletGroup, setSelectedOutletGroup] =
    useState<OutletGroup | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('outlet-group');

  const {
    data: outletGroupsResponse,
    isLoading,
    error,
  } = useOutletGroups(
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
    },
    {
      enabled: isRead,
    }
  );

  const outletGroups = outletGroupsResponse?.data || [];
  const totalCount = outletGroupsResponse?.meta?.total || 0;
  const currentPage = (outletGroupsResponse?.meta?.page || 1) - 1;

  const deleteOutletGroupMutation = useDeleteOutletGroup();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalGroups =
    outletGroupsResponse?.stats?.total_groups ?? outletGroups.length;
  const activeGroups =
    outletGroupsResponse?.stats?.active_groups ??
    outletGroups.filter(g => g.is_active === 'Y').length;
  const inactiveGroups =
    outletGroupsResponse?.stats?.inactive_groups ??
    outletGroups.filter(g => g.is_active === 'N').length;
  const avgDiscountPercentage =
    Number(outletGroupsResponse?.stats?.avg_discount)?.toFixed(2) ?? 0;

  const handleCreateOutletGroup = useCallback(() => {
    setSelectedOutletGroup(null);
    setDrawerOpen(true);
  }, []);

  const handleEditOutletGroup = useCallback((outletGroup: OutletGroup) => {
    setSelectedOutletGroup(outletGroup);
    setDrawerOpen(true);
  }, []);

  const handleDeleteOutletGroup = useCallback(
    async (id: number) => {
      try {
        await deleteOutletGroupMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting outlet group:', error);
      }
    },
    [deleteOutletGroupMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    return `${Number(percentage || '0').toFixed(2)}%`;
  };

  const outletGroupColumns: TableColumn<OutletGroup>[] = [
    {
      id: 'name',
      label: 'Group Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Users className="w-5 h-5" />
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
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-700 !max-w-xs !truncate"
        >
          {row.description || 'No Description'}
        </Typography>
      ),
    },
    {
      id: 'discount_percentage',
      label: 'Discount %',
      render: (_value, row) => (
        <Box className="flex items-center">
          <Percent className="w-4 h-4 text-gray-400 mr-2" />
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.discount_percentage
              ? formatPercentage(row.discount_percentage)
              : '0'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'credit_terms',
      label: 'Credit Terms',
      render: (_value, row) => (
        <Box className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <Typography variant="body2" className="!text-gray-700">
            {row.credit_terms ? `${row.credit_terms} days` : 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'payment_terms',
      label: 'Payment Terms',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.payment_terms || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'price_group',
      label: 'Price Group',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.price_group || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'members_count',
      label: 'Members',
      render: (_value, row) => (
        <Box className="flex items-center">
          <Users className="w-4 h-4 text-gray-400 mr-2" />
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {row.members?.length || 0}
          </Typography>
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
            render: (_value: any, row: OutletGroup) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditOutletGroup(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteOutletGroup(row.id)}
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
            Outlet Groups Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage outlet groups with pricing, discounts, and credit terms
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Groups"
          value={totalGroups}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Groups"
          value={activeGroups}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Groups"
          value={inactiveGroups}
          icon={<Users className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Avg Discount %"
          value={avgDiscountPercentage}
          icon={<Percent className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load outlet groups. Please try again.
        </Alert>
      )}

      <Table
        data={outletGroups}
        columns={outletGroupColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Outlet Groups"
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
                  </>
                )}
              </div>
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateOutletGroup}
                >
                  Add Outlet Group
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={outletGroup => outletGroup.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No outlet groups found matching "${search}"`
            : 'No outlet groups found in the system'
        }
      />

      <ManageOutletGroup
        selectedOutletGroup={selectedOutletGroup}
        setSelectedOutletGroup={setSelectedOutletGroup}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default OutletGroupsManagement;
