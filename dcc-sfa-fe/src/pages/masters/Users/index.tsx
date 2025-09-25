import { Block, CheckCircle, Edit, Visibility } from '@mui/icons-material';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Table, { type TableAction, type TableColumn } from 'shared/Table';
import ManageUsers from './ManageUsers';
import userService, {
  type User,
  type GetUsersParams,
} from '../../../services/masters/Users';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const UsersTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchUsersData = async (params?: GetUsersParams) => {
    try {
      setLoading(true);
      const response = await userService.fetchUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        if (response.meta) {
          setPagination({
            total: response.meta.total || 0,
            page: response.meta.page || 1,
            limit: response.meta.limit || 10,
            totalPages: response.meta.totalPages || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const userColumns: TableColumn<User>[] = [
    {
      id: 'name',
      label: 'Name & Avatar',
      width: '200px',
      render: (_value, row) => (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Avatar
            sx={{
              backgroundColor: row.is_active === 'Y' ? '#2563eb' : '#6b7280',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {row.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.2,
              }}
            >
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#6b7280',
                fontSize: '0.75rem',
                display: 'block',
                mt: 0.25,
              }}
            >
              {row.employee_id}
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
  ];

  const userActions: TableAction<User>[] = [
    {
      label: 'Edit User',
      icon: <Edit />,
      onClick: selectedRows => {
        console.log('Edit users:', selectedRows);
      },
      show: selectedRows => selectedRows.length === 1,
    },
    {
      label: 'View Details',
      icon: <Visibility />,
      onClick: selectedRows => {
        console.log('View user details:', selectedRows);
      },
      show: selectedRows => selectedRows.length === 1,
    },
    {
      label: 'Deactivate Users',
      icon: <Block />,
      onClick: async selectedRows => {
        console.log('Deactivate users:', selectedRows);
        try {
          for (const user of selectedRows) {
            await userService.updateUser(user.id, { is_active: 'N' });
          }
          // Refresh the users list
          fetchUsersData();
        } catch (error) {
          console.error('Error deactivating users:', error);
        }
      },
      show: selectedRows => selectedRows.some(user => user.is_active === 'Y'),
    },
    {
      label: 'Activate Users',
      icon: <CheckCircle />,
      onClick: async selectedRows => {
        console.log('Activate users:', selectedRows);
        try {
          for (const user of selectedRows) {
            await userService.updateUser(user.id, { is_active: 'Y' });
          }
          // Refresh the users list
          fetchUsersData();
        } catch (error) {
          console.error('Error activating users:', error);
        }
      },
      show: selectedRows => selectedRows.some(user => user.is_active === 'N'),
    },
  ];

  const handleUserRowClick = (user: User) => {
    console.log('User clicked:', user);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}
          >
            Users Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Manage users, roles, and access across your organization
          </Typography>
        </Box>
        <ManageUsers />
      </Box>

      <Table
        data={users}
        columns={userColumns}
        actions={userActions}
        onRowClick={handleUserRowClick}
        getRowId={user => user.id}
        initialOrderBy="name"
        loading={loading}
        totalCount={pagination.total}
        emptyMessage="No users found in the system"
      />
    </Box>
  );
};

export default UsersTable;
