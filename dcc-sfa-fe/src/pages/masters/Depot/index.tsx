import { Add, Block, CheckCircle } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageDepot from './ManageDepot';
import type { Depot, Company, Employee } from 'types/Depot';

const DepotsManagement: React.FC = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const mockCompanies: Company[] = [
      { id: 1, name: 'TechCorp Solutions', code: 'TECH001' },
      { id: 2, name: 'Global Industries', code: 'GLOB002' },
      { id: 3, name: 'Innovation Labs', code: 'INNO003' },
      { id: 4, name: 'Future Systems', code: 'FUTU004' },
    ];

    const mockEmployees: Employee[] = [
      { id: 1, name: 'John Smith', role: 'Manager' },
      { id: 2, name: 'Sarah Johnson', role: 'Supervisor' },
      { id: 3, name: 'Mike Davis', role: 'Coordinator' },
      { id: 4, name: 'Lisa Wilson', role: 'Manager' },
      { id: 5, name: 'David Brown', role: 'Supervisor' },
      { id: 6, name: 'Emma Taylor', role: 'Coordinator' },
    ];

    const mockDepots: Depot[] = [
      {
        id: 1,
        parent_id: 1,
        name: 'North Regional Depot',
        code: 'NRD001',
        address: '123 Industrial Blvd',
        city: 'Chicago',
        state: 'Illinois',
        zipcode: '60601',
        phone_number: '+1-312-555-0101',
        email: 'north@techcorp.com',
        manager_id: 1,
        supervisor_id: 2,
        coordinator_id: 3,
        latitude: 41.8781,
        longitude: -87.6298,
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1,
        updatedate: '2024-01-20T14:15:00',
        updatedby: 1,
        log_inst: 1,
        company_name: 'TechCorp Solutions',
        manager_name: 'John Smith',
        supervisor_name: 'Sarah Johnson',
        coordinator_name: 'Mike Davis',
      },
      {
        id: 2,
        parent_id: 2,
        name: 'South Distribution Center',
        code: 'SDC002',
        address: '456 Commerce Way',
        city: 'Atlanta',
        state: 'Georgia',
        zipcode: '30309',
        phone_number: '+1-404-555-0202',
        email: 'south@global.com',
        manager_id: 4,
        supervisor_id: 5,
        coordinator_id: 6,
        latitude: 33.749,
        longitude: -84.388,
        is_active: 'Y',
        createdate: '2024-01-10T09:00:00',
        createdby: 2,
        updatedate: null,
        updatedby: null,
        log_inst: 2,
        company_name: 'Global Industries',
        manager_name: 'Lisa Wilson',
        supervisor_name: 'David Brown',
        coordinator_name: 'Emma Taylor',
      },
      {
        id: 3,
        parent_id: 1,
        name: 'West Coast Hub',
        code: 'WCH003',
        address: '789 Pacific Ave',
        city: 'Los Angeles',
        state: 'California',
        zipcode: '90210',
        phone_number: '+1-213-555-0303',
        email: 'west@techcorp.com',
        manager_id: 1,
        supervisor_id: null,
        coordinator_id: null,
        latitude: 34.0522,
        longitude: -118.2437,
        is_active: 'N',
        createdate: '2024-01-05T16:45:00',
        createdby: 1,
        updatedate: '2024-01-25T11:30:00',
        updatedby: 3,
        log_inst: 3,
        company_name: 'TechCorp Solutions',
        manager_name: 'John Smith',
        supervisor_name: undefined,
        coordinator_name: undefined,
      },
    ];

    setCompanies(mockCompanies);
    setEmployees(mockEmployees);
    setDepots(mockDepots);
  }, []);

  // Filter depots based on search, status, and company
  const filteredDepots = depots.filter(depot => {
    const matchesSearch =
      search === '' ||
      depot.name.toLowerCase().includes(search.toLowerCase()) ||
      depot.code.toLowerCase().includes(search.toLowerCase()) ||
      depot.email?.toLowerCase().includes(search.toLowerCase()) ||
      depot.city?.toLowerCase().includes(search.toLowerCase()) ||
      depot.company_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && depot.is_active === 'Y') ||
      (statusFilter === 'inactive' && depot.is_active === 'N');

    const matchesCompany =
      companyFilter === 'all' || depot.parent_id.toString() === companyFilter;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  const handleCreateDepot = useCallback(() => {
    setSelectedDepot(null);
    setDrawerOpen(true);
  }, []);

  const handleEditDepot = useCallback((depot: Depot) => {
    setSelectedDepot(depot);
    setDrawerOpen(true);
  }, []);

  const handleDeleteDepot = useCallback(
    (id: number) => {
      setDepots(depots.filter(d => d.id !== id));
    },
    [depots]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => setPage(newPage + 1);

  // Define table columns following Company pattern
  const depotColumns: TableColumn<Depot>[] = [
    {
      id: 'name',
      label: 'Depot & Code',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Building2 className="w-5 h-5" />
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
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'company_name',
      label: 'Company',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.company_name || 'No Company'}
        </Typography>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (_value, row) => (
        <Box className="space-y-1">
          {row.email ? (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.email}</span>
            </div>
          ) : (
            <span className="italic text-gray-400">No Email</span>
          )}
          {row.phone_number && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.phone_number}</span>
            </div>
          )}
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {[row.city, row.state].filter(Boolean).join(', ') || 'No Location'}
          </span>
        </Box>
      ),
    },
    {
      id: 'staff',
      label: 'Staff',
      render: (_value, row) => (
        <Box className="space-y-1">
          {row.manager_name ? (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.manager_name}</span>
            </div>
          ) : (
            <span className="italic text-gray-400">No Manager</span>
          )}
          {(row.supervisor_name || row.coordinator_name) && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs">
                {[row.supervisor_name, row.coordinator_name]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </Box>
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
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditDepot(row)}
            tooltip={`Edit ${row.name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteDepot(row.id)}
            tooltip={`Delete ${row.name}`}
            itemName={row.name}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  // Statistics
  const totalDepots = depots.length;
  const activeDepots = depots.filter(d => d.is_active === 'Y').length;
  const inactiveDepots = depots.filter(d => d.is_active === 'N').length;
  const uniqueCompanies = new Set(depots.map(d => d.company_name)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depot Management</h1>
          <p className="text-gray-600 mt-1">
            Manage depot locations, staff assignments, and operational details
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Depots</p>
              <p className="text-2xl font-bold text-gray-900">{totalDepots}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Depots</p>
              <p className="text-2xl font-bold text-green-600">
                {activeDepots}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Depots
              </p>
              <p className="text-2xl font-bold text-red-600">
                {inactiveDepots}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-purple-600">
                {uniqueCompanies}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredDepots}
        columns={depotColumns}
        actions={
          <div className="flex justify-between flex-wrap gap-3 w-full">
            <div className="flex gap-3 flex-wrap items-center">
              <SearchInput
                placeholder="Search Depots"
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                fullWidth={true}
                className="!w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="!w-40"
                size="small"
                fullWidth={false}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              <Select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="!w-60"
                size="small"
                fullWidth={false}
              >
                <MenuItem value="all">All Companies</MenuItem>
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Add />}
              onClick={handleCreateDepot}
            >
              Create
            </Button>
          </div>
        }
        getRowId={depot => depot.id}
        initialOrderBy="name"
        loading={false}
        totalCount={filteredDepots.length}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No depots found matching "${search}"`
            : 'No depots found in the system'
        }
      />

      <ManageDepot
        selectedDepot={selectedDepot}
        setSelectedDepot={setSelectedDepot}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        companies={companies}
        employees={employees}
      />
    </div>
  );
};

export default DepotsManagement;
