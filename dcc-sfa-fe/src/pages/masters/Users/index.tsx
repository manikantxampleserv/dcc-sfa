import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteUser,
  useUsers,
  useUsersDropdown,
  type User,
} from 'hooks/useUsers';
import { useExportToExcel } from 'hooks/useImportExport';
import { useRolesDropdown } from 'hooks/useRoles';
import { useDepots } from 'hooks/useDepots';
import { UserCheck, UserPlus, Users as UsersIcon, UserX } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Depot } from 'services/masters/Depots';
import type { RoleDropdown } from 'services/masters/Roles';
import type { UserDropdown } from 'services/masters/Users';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { PopConfirm } from 'shared/DeleteConfirmation';
import { formatDate } from 'utils/dateUtils';
import ManageUsers from './ManageUsers';
import ImportUsers from './ImportUsers';
import { useTour } from 'context/TourContext';

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user');
  const { setSteps, stopTour } = useTour();

  useEffect(() => {
    setSteps([
      {
        target: '#user-management-title',
        content:
          'This is the User Management page where you can manage all system users.',
      },
      {
        target: '#stats-cards-container',
        content: 'Quick overview of total, active, and inactive users.',
      },
      {
        target: '#search-users-input',
        content: 'Search for users by name, email, or employee code.',
      },
      {
        target: '#status-filter-select',
        content: 'Filter users by their active/inactive status.',
      },
      {
        target: '#action-buttons-container',
        content: 'Export data, import users from excel, or create a new user.',
      },
      {
        target: '#users-table',
        content:
          'View and manage user details here. You can edit or delete users from the actions column.',
      },
    ]);
  }, [setSteps]);

  const { data: rolesResponse } = useRolesDropdown({ enabled: isRead });
  const { data: depotsResponse } = useDepots(
    { isActive: 'Y', limit: 1000 },
    { enabled: isRead }
  );
  const { data: managersResponse } = useUsersDropdown({}, { enabled: isRead });

  const roles = rolesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const managers = managersResponse?.data || [];

  const {
    data: usersResponse,
    isFetching,
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
            : statusFilter === 'inactive'
              ? 'N'
              : undefined,
      role_id: roleFilter === 'all' ? undefined : Number(roleFilter),
      depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
      reporting_to: managerFilter === 'all' ? undefined : Number(managerFilter),
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
        <Box
          className="!flex !gap-2 !items-center"
          onClick={() => handleRowClick(row)}
        >
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
      id: 'employee_id',
      label: 'Code',
      render: value =>
        value || <span className="italic text-xs text-gray-400">No Code</span>,
    },
    {
      id: 'email',
      label: 'Email Address',
      render: value =>
        value || <span className="italic text-xs text-gray-400">No Email</span>,
    },
    {
      id: 'role',
      label: 'Role',
      render: value =>
        value?.name || (
          <span className="italic text-xs text-gray-400"> No Role </span>
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
      id: 'phone_number',
      label: 'Phone',
      render: value =>
        value || (
          <span className="italic text-xs text-gray-400"> No Phone </span>
        ),
    },
    {
      id: 'address',
      label: 'Address',
      render: value =>
        value ? (
          <Tooltip title={value} placement="top" arrow>
            <div className="truncate max-w-72">{value}</div>
          </Tooltip>
        ) : (
          <span className="italic text-xs text-gray-400"> No Address </span>
        ),
    },
    {
      id: 'joining_date',
      label: 'Join Date',
      render: (_value, row) =>
        formatDate(row.joining_date) || (
          <span className="italic text-xs text-gray-400">No Date </span>
        ),
    },
    {
      id: 'reporting_to',
      label: 'Reports To',
      render: (_value, row) =>
        row.reporting_manager?.name || (
          <span className="italic text-xs text-gray-400">No Reports To </span>
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
  const exportToExcelMutation = useExportToExcel();

  const handleCreateUser = useCallback(() => {
    stopTour();
    setSelectedUser(null);
    setDrawerOpen(true);
  }, [stopTour]);

  const handleEditUser = useCallback(
    (user: User) => {
      stopTour();
      setSelectedUser(user);
      setDrawerOpen(true);
    },
    [stopTour]
  );

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

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
        role_id: roleFilter === 'all' ? undefined : Number(roleFilter),
        depot_id: depotFilter === 'all' ? undefined : Number(depotFilter),
        reporting_to:
          managerFilter === 'all' ? undefined : Number(managerFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'users',
        filters,
      });
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    roleFilter,
    depotFilter,
    managerFilter,
  ]);

  const handleRowClick = useCallback(
    (user: User) => {
      navigate(`/masters/users/${user.id}`);
    },
    [navigate]
  );

  return (
    <>
      <Box
        className="!mb-3 !flex !justify-between !items-center"
        id="user-management-title"
      >
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Users Management</p>
          <p className="!text-gray-500 text-sm">
            Manage users, roles, and access across your organization
          </p>
        </Box>
      </Box>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
        id="stats-cards-container"
      >
        <StatsCard
          title="Total Users"
          value={usersResponse?.stats?.total_users || 0}
          icon={<UsersIcon className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Users"
          value={usersResponse?.stats?.active_users || 0}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Users"
          value={usersResponse?.stats?.inactive_users || 0}
          icon={<UserX className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />

        <StatsCard
          title="New This Month"
          value={usersResponse?.stats?.new_users || 0}
          icon={<UserPlus className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
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
            <div className="flex justify-between w-full flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                <div id="search-users-input">
                  <SearchInput
                    placeholder="Search Users"
                    value={search}
                    onChange={handleSearchChange}
                    debounceMs={400}
                    showClear={true}
                    fullWidth={false}
                    className="!min-w-40"
                  />
                </div>
                {isRead && (
                  <div className="flex items-center flex-wrap gap-2">
                    <div id="status-filter-select">
                      <Select
                        value={statusFilter}
                        onChange={e => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        size="small"
                        disableClearable
                        className="!min-w-40"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </div>
                    <Select
                      value={roleFilter}
                      onChange={e => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                      }}
                      size="small"
                      placeholder="Filter by Role"
                      disableClearable
                      className="!min-w-64"
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      {roles.map((role: RoleDropdown) => (
                        <MenuItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={depotFilter}
                      onChange={e => {
                        setDepotFilter(e.target.value);
                        setPage(1);
                      }}
                      size="small"
                      placeholder="Filter by Depot"
                      disableClearable
                      className="!min-w-52"
                    >
                      <MenuItem value="all">All Depots</MenuItem>
                      {depots.map((depot: Depot) => (
                        <MenuItem key={depot.id} value={depot.id.toString()}>
                          {depot.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={managerFilter}
                      onChange={e => {
                        setManagerFilter(e.target.value);
                        setPage(1);
                      }}
                      size="small"
                      placeholder="Filter by Manager"
                      disableClearable
                      className="!min-w-52"
                    >
                      <MenuItem value="all">All Managers</MenuItem>
                      {managers.map((manager: UserDropdown) => (
                        <MenuItem
                          key={manager.id}
                          value={manager.id.toString()}
                        >
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
              {isCreate && (
                <div
                  className="flex items-center gap-2"
                  id="action-buttons-container"
                >
                  {isRead && (
                    <PopConfirm
                      title="Export Users"
                      description="Are you sure you want to export the current users data to Excel? This will include all filtered results."
                      onConfirm={handleExportToExcel}
                      confirmText="Export"
                      cancelText="Cancel"
                      placement="top"
                    >
                      <Button
                        variant="outlined"
                        className="!capitalize"
                        startIcon={<Download />}
                        disabled={exportToExcelMutation.isPending}
                      >
                        {exportToExcelMutation.isPending
                          ? 'Exporting...'
                          : 'Export'}
                      </Button>
                    </PopConfirm>
                  )}
                  {isCreate && (
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Upload />}
                      onClick={() => {
                        stopTour();
                        setImportModalOpen(true);
                      }}
                    >
                      Import
                    </Button>
                  )}
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
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={user => user.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={pagination.total}
        page={page - 1}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        id="users-table"
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

      <ImportUsers
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default UsersManagement;
