import { Block, CheckCircle, Group } from '@mui/icons-material';
import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Shield, ShieldCheck, ShieldX, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { useDeleteRole, useRoles, type Role } from '../../../hooks/useRoles';
import { formatDate } from '../../../utils/dateUtils';
import ManageRolePermissions from './ManageRolePermissions';

const RolePermissions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useRoles({ 
    search, 
    page, 
    limit,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 'Y' : 'N'
  });

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
          className="w-26"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_roles || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {stats?.active_roles || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Roles
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {stats?.inactive_roles || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                New This Month
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.new_roles || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
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
          <div className="flex justify-between w-full">
            <div className="flex gap-3">
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
            <ManageRolePermissions
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              setDrawerOpen={setDrawerOpen}
              drawerOpen={drawerOpen}
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
