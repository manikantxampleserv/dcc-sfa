import { Block, CheckCircle, Group } from '@mui/icons-material';
import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Shield, ShieldCheck, ShieldX, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { useDeleteRole, useRoles, type Role } from '../../../hooks/useRoles';
import { usePermission } from '../../../hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ManageRolePermissions from './ManageRolePermissions';

const RolePermissions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('role');

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useRoles(
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

  const roles = rolesResponse?.data || [];
  const totalCount = rolesResponse?.meta?.total || 0;
  const currentPage = (rolesResponse?.meta?.page || 1) - 1;
  const stats = rolesResponse?.stats;

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
          variant="outlined"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'user_role',
      label: 'Users Count',
      render: (_value, row) => (
        <Box className="!flex !gap-1 !items-center">
          <Group className="!text-gray-500 !text-sm" />
          <Typography variant="body2" className="!text-gray-700">
            {row.user_role?.length || 0}
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
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            width: '120px',
            sortable: false,
            render: (_value: any, row: Role) => (
              <Box className="!flex !gap-1">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditRole(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteRole(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
                    confirmDelete={true}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role);
    console.log(role);
    setDrawerOpen(true);
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
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Role & Permissions Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage system roles and their associated permissions
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Roles"
          value={stats?.total_roles || 0}
          icon={<Shield className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Roles"
          value={stats?.active_roles || 0}
          icon={<ShieldCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Roles"
          value={stats?.inactive_roles || 0}
          icon={<ShieldX className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={stats?.new_roles || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load roles. Please try again.
        </Alert>
      )}

      <Table
        data={roles}
        columns={roleColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex items-center flex-wrap gap-2">
                  <SearchInput
                    placeholder="Search Roles"
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
                </div>
              )}
              {(isCreate || isUpdate) && (
                <ManageRolePermissions
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  setDrawerOpen={setDrawerOpen}
                  drawerOpen={drawerOpen}
                />
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={role => role.id}
        initialOrderBy="name"
        loading={isLoading}
        pagination={true}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={newPage => setPage(newPage + 1)}
        isPermission={isRead}
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
