import { Add, Block, CheckCircle, Edit, Visibility } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Typography } from '@mui/material';
import React, { useState } from 'react';
import EnhancedTable, {
  type TableAction,
  type TableColumn,
} from 'shared/Table';

// User interface based on Prisma model
interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  parent_id: number;
  department: string | null;
  zone: string | null;
  phone_number: string | null;
  address: string | null;
  employee_id: string | null;
  joining_date: Date | null;
  reporting_to: number | null;
  profile_image: string | null;
  last_login: Date | null;
  is_active: string;
  createdate: Date | null;
  createdby: number;
  updatedate: Date | null;
  updatedby: number | null;
  log_inst: number | null;
}

// Sample data matching the Prisma model structure
const sampleUsers: User[] = [
  {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@company.com',
    password_hash: '$2b$10$...',
    name: 'John Doe',
    role: 'Sales Manager',
    parent_id: 1,
    department: 'IT',
    zone: 'Zone 1',
    phone_number: '+1234567890',
    address: '123 Main St, City, State 12345',
    employee_id: 'EMP001',
    joining_date: new Date('2023-01-15'),
    reporting_to: 5,
    profile_image: null,
    last_login: new Date('2024-01-20T10:30:00'),
    is_active: 'Y',
    createdate: new Date('2023-01-10'),
    createdby: 1,
    updatedate: new Date('2024-01-15'),
    updatedby: 1,
    log_inst: 1,
  },
  {
    id: 2,
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    password_hash: '$2b$10$...',
    name: 'Jane Smith',
    role: 'Sales Representative',
    parent_id: 1,
    department: 'HR',
    zone: 'Zone 2',
    phone_number: '+1234567891',
    address: '456 Oak Ave, City, State 12345',
    employee_id: 'EMP002',
    joining_date: new Date('2023-03-20'),
    reporting_to: 1,
    profile_image: null,
    last_login: new Date('2024-01-21T09:15:00'),
    is_active: 'Y',
    createdate: new Date('2023-03-15'),
    createdby: 1,
    updatedate: new Date('2024-01-20'),
    updatedby: 2,
    log_inst: 2,
  },
  {
    id: 3,
    username: 'mike.johnson',
    email: 'mike.johnson@company.com',
    password_hash: '$2b$10$...',
    name: 'Mike Johnson',
    role: 'Depot Manager',
    parent_id: 1,
    department: 'Depot',
    zone: 'Zone 3',
    phone_number: '+1234567892',
    address: '789 Pine St, City, State 12345',
    employee_id: 'EMP003',
    joining_date: new Date('2022-11-10'),
    reporting_to: null,
    profile_image: null,
    last_login: new Date('2024-01-19T14:20:00'),
    is_active: 'Y',
    createdate: new Date('2022-11-05'),
    createdby: 1,
    updatedate: new Date('2024-01-18'),
    updatedby: 3,
    log_inst: 3,
  },
  {
    id: 4,
    username: 'sarah.wilson',
    email: 'sarah.wilson@company.com',
    password_hash: '$2b$10$...',
    name: 'Sarah Wilson',
    role: 'Zone Supervisor',
    parent_id: 1,
    department: null,
    zone: 'Zone 4',
    phone_number: null,
    address: null,
    employee_id: 'EMP004',
    joining_date: new Date('2023-06-01'),
    reporting_to: 3,
    profile_image: null,
    last_login: new Date('2024-01-10T11:45:00'),
    is_active: 'N',
    createdate: new Date('2023-05-25'),
    createdby: 1,
    updatedate: new Date('2024-01-10'),
    updatedby: 1,
    log_inst: 4,
  },
  {
    id: 5,
    username: 'robert.brown',
    email: 'robert.brown@company.com',
    password_hash: '$2b$10$...',
    name: 'Robert Brown',
    role: 'Regional Manager',
    parent_id: 1,
    department: 'Regional',
    zone: 'Zone 5',
    phone_number: '+1234567893',
    address: '321 Elm St, City, State 12345',
    employee_id: 'EMP005',
    joining_date: new Date('2022-08-15'),
    reporting_to: null,
    profile_image: null,
    last_login: new Date('2024-01-21T16:30:00'),
    is_active: 'Y',
    createdate: new Date('2022-08-10'),
    createdby: 1,
    updatedate: new Date('2024-01-21'),
    updatedby: 5,
    log_inst: 5,
  },
  {
    id: 6,
    username: 'emily.davis',
    email: 'emily.davis@company.com',
    password_hash: '$2b$10$...',
    name: 'Emily Davis',
    role: 'Sales Representative',
    parent_id: 1,
    department: 'Sales',
    zone: 'Zone 6',
    phone_number: '+1234567894',
    address: '654 Maple Dr, City, State 12345',
    employee_id: 'EMP006',
    joining_date: new Date('2023-09-01'),
    reporting_to: 5,
    profile_image: null,
    last_login: null,
    is_active: 'Y',
    createdate: new Date('2023-08-25'),
    createdby: 1,
    updatedate: null,
    updatedby: null,
    log_inst: 6,
  },
];

const formatDate = (date: Date | null) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const UsersTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(sampleUsers);

  const handleRefresh = async () => {
    setLoading(true);
    setUsers([]);

    setTimeout(() => {
      setUsers(sampleUsers);
      setLoading(false);
    }, 2000);
  };

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
      render: value =>
        value || <span className="italic text-gray-400"> No Role </span>,
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
      id: 'department',
      label: 'Department',
      width: '120px',
      render: (_value, row) =>
        row.department || (
          <span className="italic text-gray-400"> No Department </span>
        ),
    },
    {
      id: 'zone',
      label: 'Zone',
      width: '120px',
      render: (_value, row) =>
        row.zone || <span className="italic text-gray-400"> No Zone </span>,
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
      render: (_value, row) => {
        const reportingUser = users.find(u => u.id === row.reporting_to);
        return reportingUser?.name || 'Top Level';
      },
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
      onClick: selectedRows => {
        console.log('Deactivate users:', selectedRows);
        // Update users status
        setUsers(prev =>
          prev.map(user =>
            selectedRows.some(selected => selected.id === user.id)
              ? { ...user, is_active: 'N' }
              : user
          )
        );
      },
      show: selectedRows => selectedRows.some(user => user.is_active === 'Y'),
    },
    {
      label: 'Activate Users',
      icon: <CheckCircle />,
      onClick: selectedRows => {
        console.log('Activate users:', selectedRows);
        // Update users status
        setUsers(prev =>
          prev.map(user =>
            selectedRows.some(selected => selected.id === user.id)
              ? { ...user, is_active: 'Y' }
              : user
          )
        );
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
        <Button
          variant="contained"
          className="!capitalize"
          disableElevation
          startIcon={<Add />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Create
        </Button>
      </Box>

      <EnhancedTable
        data={users}
        columns={userColumns}
        actions={userActions}
        onRowClick={handleUserRowClick}
        getRowId={user => user.id}
        initialOrderBy="name"
        loading={loading}
        totalCount={users.length}
        emptyMessage="No users found in the system"
      />
    </Box>
  );
};

export default UsersTable;
