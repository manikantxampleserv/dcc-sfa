import { Block, CheckCircle, Group } from '@mui/icons-material';
import { Alert, Box, Chip, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import SearchInput from 'shared/SearchInput';
import Table, { type TableColumn } from 'shared/Table';
import { useDeleteRole, useRoles, type Role } from '../../../hooks/useRoles';
import { formatDate } from '../../../utils/dateUtils';
import ManageRolePermissions from './ManageRolePermissions';

const RolePermissions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useRoles({ search, page, limit });

  const roles = rolesResponse?.data || [];
  const totalCount = rolesResponse?.meta?.total || 0;
  const currentPage = (rolesResponse?.meta?.page || 1) - 1;

  const deleteRoleMutation = useDeleteRole();

  const roleColumns: TableColumn<Role>[] = [
    {
      id: 'name',
      label: 'Role Name',
      render: (_value, row) => row.name,
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) =>
        row.description || (
          <span className="italic text-gray-400"> No Description </span>
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
      id: '_count',
      label: 'Users Count',
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
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.permissions?.filter(p => p.is_active === 'Y').length || 0} active
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Created Date',
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

  const handleCloseManage = useCallback(() => {
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
            <ManageRolePermissions
              role={selectedRole}
              onClose={handleCloseManage}
            />
          </div>
        }
        getRowId={role => role.id}
        initialOrderBy="name"
        loading={isLoading}
        pagination={true}
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
    </>
  );
};

export default RolePermissions;
