import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import classNames from 'classnames';
import { useDeleteUser, useUsers, type User } from 'hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserPlus, Users as UsersIcon, UserX } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageUsers from './ManageUsers';
import { usePermission } from 'hooks/usePermission';

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user');

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers(
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

  const users = usersResponse?.data || [];
  const pagination = {
    total: usersResponse?.meta?.total || 0,
    page: usersResponse?.meta?.page || 1,
    limit: usersResponse?.meta?.limit || 10,
    totalPages: usersResponse?.meta?.totalPages || 0,
  };

  const userColumns: TableColumn<User>[] = [
    {
      id: 'name',
      label: 'Name & Avatar',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            src={row.profile_image || 'mkx'}
            className={classNames('!rounded', {
              '!bg-primary-100 !text-primary-600': row.is_active === 'Y',
              '!bg-gray-200 !text-gray-600': row.is_active !== 'Y',
            })}
          >
            {row.name
              .split(' ')
              .map(n => n[0])
              .join('')
              ?.slice(0, 2)}
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
              {row.role?.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email Address',
      render: (_value, row) =>
        row.email || <span className="italic text-gray-400"> No Email </span>,
    },
    {
      id: 'role',
      label: 'Role',
      render: (_value, row) =>
        row.role?.name || (
          <span className="italic text-gray-400"> No Role </span>
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
          className="!text-start !justify-start"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'depot',
      label: 'Depot',
      render: (_value, row) =>
        row.depot?.name || (
          <span className="italic text-gray-400"> No Depot </span>
        ),
    },
    {
      id: 'zone',
      label: 'Zone',
      render: (_value, row) =>
        row.zone?.name || (
          <span className="italic text-gray-400"> No Zone </span>
        ),
    },
    {
      id: 'phone_number',
      label: 'Phone',
      render: (_value, row) =>
        row.phone_number || (
          <span className="italic text-gray-400"> No Phone </span>
        ),
    },
    {
      id: 'address',
      label: 'Address',
      render: (_value, row) =>
        row.address || (
          <span className="italic text-gray-400"> No Address </span>
        ),
    },
    {
      id: 'joining_date',
      label: 'Join Date',
      render: (_value, row) =>
        formatDate(row.joining_date) || (
          <span className="italic text-gray-400"> No Date </span>
        ),
    },
    {
      id: 'reporting_to',
      label: 'Reports To',
      render: (_value, row) =>
        row.reporting_manager?.name || (
          <span className="italic text-gray-400"> No Reports To </span>
        ),
    },
    ...(isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: User) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditUser(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteUser(row.id)}
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

  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = useCallback(() => {
    setSelectedUser(null);
    setDrawerOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    (id: number) => {
      deleteUserMutation.mutate(id);
    },
    [deleteUserMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => setPage(newPage + 1);

  const handleRowClick = useCallback(
    (user: User) => {
      navigate(`/masters/users/${user.id}`);
    },
    [navigate]
  );

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Users Management</p>
          <p className="!text-gray-500 text-sm">
            Manage users, roles, and access across your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Users"
          value={usersResponse?.stats?.total_users || 0}
          icon={<UsersIcon className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Users"
          value={usersResponse?.stats?.active_users || 0}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Users"
          value={usersResponse?.stats?.inactive_users || 0}
          icon={<UserX className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />

        <StatsCard
          title="New This Month"
          value={usersResponse?.stats?.new_users || 0}
          icon={<UserPlus className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load users. Please try again.
        </Alert>
      )}

      <Table
        data={users}
        columns={userColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                <SearchInput
                  placeholder="Search Users"
                  value={search}
                  onChange={handleSearchChange}
                  debounceMs={400}
                  showClear={true}
                  fullWidth={false}
                  className="!min-w-80"
                />
                {isRead && (
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
                )}
              </div>
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateUser}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={user => user.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={pagination.total}
        page={page - 1}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        emptyMessage={
          search
            ? `No users found matching "${search}"`
            : 'No users found in the system'
        }
      />

      <ManageUsers
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default UsersManagement;
