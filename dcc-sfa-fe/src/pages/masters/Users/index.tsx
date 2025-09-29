import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import { useDeleteUser, useUsers, type User } from 'hooks/useUsers';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageUsers from './ManageUsers';

const Users: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers({ search, page, limit });

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
          className="w-26"
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
    {
      id: 'action',
      label: 'Actions',
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditUser(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteUser(row.id)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
            confirmDelete={true}
          />
        </div>
      ),
    },
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

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load users. Please try again.
        </Alert>
      )}

      <Table
        data={users}
        columns={userColumns}
        actions={
          <div className="flex justify-between w-full">
            <SearchInput
              placeholder="Search Users"
              value={search}
              onChange={handleSearchChange}
              debounceMs={400}
              showClear={true}
              fullWidth={false}
              className="!min-w-80"
            />
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateUser}
            >
              Create
            </Button>
          </div>
        }
        getRowId={user => user.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={pagination.total}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
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

export default Users;
