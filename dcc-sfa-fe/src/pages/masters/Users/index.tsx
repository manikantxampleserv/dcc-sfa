import { Block, CheckCircle } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useUsers, useDeleteUser, type User } from '../../../hooks/useUsers';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from '../../../utils/dateUtils';
import ManageUsers from './ManageUsers';

const Users: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(7);

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
      width: '200px',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            className={classNames('!rounded', {
              '!bg-primary-100 !text-primary-600': row.is_active === 'Y',
              '!bg-gray-200 !text-gray-600': row.is_active !== 'Y',
            })}
          >
            {row.name
              .split(' ')
              .map(n => n[0])
              .join('')}
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
      width: '220px',
      render: (_value, row) =>
        row.email || <span className="italic text-gray-400"> No Email </span>,
    },
    {
      id: 'role',
      label: 'Role',
      width: '140px',
      render: (_value, row) =>
        row.role?.name || (
          <span className="italic text-gray-400"> No Role </span>
        ),
    },
    {
      id: 'is_active',
      label: 'Status',
      width: '120px',
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
      width: '120px',
      render: (_value, row) =>
        row.depot?.name || (
          <span className="italic text-gray-400"> No Depot </span>
        ),
    },
    {
      id: 'zone',
      label: 'Zone',
      width: '120px',
      render: (_value, row) =>
        row.zone?.name || (
          <span className="italic text-gray-400"> No Zone </span>
        ),
    },
    {
      id: 'phone_number',
      label: 'Phone',
      width: '160px',
      render: (_value, row) =>
        row.phone_number || (
          <span className="italic text-gray-400"> No Phone </span>
        ),
    },
    {
      id: 'address',
      label: 'Address',
      width: '200px',
      render: (_value, row) =>
        row.address || (
          <span className="italic text-gray-400"> No Address </span>
        ),
    },
    {
      id: 'joining_date',
      label: 'Join Date',
      width: '140px',
      render: (_value, row) => formatDate(row.joining_date),
    },
    {
      id: 'reporting_to',
      label: 'Reports To',
      width: '180px',
      render: (_value, row) => row.reporting_manager?.name || 'Top Level',
    },
    {
      id: 'action',
      label: 'Actions',
      width: '120px',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton tooltip={`Edit ${row.name}`} />
          <DeleteButton
            onClick={() => handleDeleteUser(row)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = useCallback(
    async (user: User) => {
      deleteUserMutation.mutate(user.id);
    },
    [deleteUserMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  return (
    <>
      <Box className="!mb-6 !flex !justify-between !items-center">
        <Box>
          <Typography variant="h5" className="!font-bold !text-gray-900 !mb-2">
            Users Management
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Manage users, roles, and access across your organization
          </Typography>
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
            <ManageUsers />
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
    </>
  );
};

export default Users;
