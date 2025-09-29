import { Block, CheckCircle, Security, Group } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useRoles, useDeleteRole, type Role } from '../../../hooks/useRoles';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import ManageRolePermissions from './ManageRolePermissions';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString)
    return <span className="italic text-gray-400"> No Date </span>;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const RolePermissions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useRoles({ search, page, limit });

  const roles = rolesResponse?.data || [];
  const totalCount = rolesResponse?.meta?.total || 0;
  const currentPage = (rolesResponse?.meta?.page || 1) - 1; // Convert to 0-based for MUI

  const deleteRoleMutation = useDeleteRole();

  const roleColumns: TableColumn<Role>[] = [
    {
      id: 'name',
      label: 'Role Name',
      width: '200px',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Security
            className={classNames('!text-lg', {
              '!text-primary-600': row.is_active === 'Y',
              '!text-gray-400': row.is_active !== 'Y',
            })}
          />
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
              ID: {row.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      width: '250px',
      render: (_value, row) =>
        row.description || (
          <span className="italic text-gray-400"> No Description </span>
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
      id: '_count',
      label: 'Users Count',
      width: '120px',
      render: (_value, row) => (
        <Box className="!flex !gap-1 !items-center">
          <Group className="!text-gray-500 !text-sm" />
          <Typography variant="body2" className="!text-gray-700">
            {row._count?.user_role || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'permissions',
      label: 'Permissions',
      width: '140px',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.permissions?.filter(p => p.is_active === 'Y').length || 0} active
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Created Date',
      width: '130px',
      render: created_at => formatDate(created_at),
    },
    {
      id: 'action',
      label: 'Actions',
      width: '120px',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !gap-1">
          <EditButton
            onClick={() => handleEditRole(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteRole(row.id)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
          />
        </Box>
      ),
    },
  ];

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsManageOpen(true);
  }, []);

  const handleDeleteRole = useCallback(
    async (roleId: number) => {
      try {
        await deleteRoleMutation.mutateAsync(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    },
    [deleteRoleMutation]
  );

  const handleAddRole = useCallback(() => {
    setSelectedRole(null);
    setIsManageOpen(true);
  }, []);

  const handleCloseManage = useCallback(() => {
    setIsManageOpen(false);
    setSelectedRole(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        Error loading roles: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box className="!mb-6 !flex !justify-between !items-center">
        <Box>
          <Typography variant="h5" className="!font-bold !text-gray-900 !mb-2">
            Role & Permissions Management
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Manage system roles and their associated permissions
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load roles. Please try again.
        </Alert>
      )}

      <Table
        data={roles}
        columns={roleColumns}
        actions={
          <div className="flex justify-between w-full">
            <SearchInput
              placeholder="Search Roles"
              value={search}
              onChange={handleSearchChange}
              debounceMs={400}
              showClear={true}
              fullWidth={false}
              className="!min-w-80"
            />
            <Button variant="contained" onClick={handleAddRole}>
              + Create
            </Button>
          </div>
        }
        getRowId={role => role.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={newPage => setPage(newPage + 1)}
        emptyMessage={
          search
            ? `No roles found matching "${search}"`
            : 'No roles found in the system'
        }
      />

      {isManageOpen && (
        <ManageRolePermissions
          role={selectedRole}
          onClose={handleCloseManage}
        />
      )}
    </>
  );
};

export default RolePermissions;
