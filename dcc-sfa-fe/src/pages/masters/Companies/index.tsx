import { Add, CheckCircle, Block } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Building2, Globe, Mail, MapPin, Phone, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {
  useCompanies,
  useDeleteCompany,
  type Company,
} from 'hooks/useCompanies';
import { usePermission } from 'hooks/usePermission';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageCompanies from './ManageCompanies';

const CompaniesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('company');

  const { data: companiesData, isLoading } = useCompanies(
    {
      page,
      limit,
      search,
      is_active:
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

  const deleteCompanyMutation = useDeleteCompany();

  const companies = companiesData?.data || [];

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch =
      search === '' ||
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.code.toLowerCase().includes(search.toLowerCase()) ||
      company.email?.toLowerCase().includes(search.toLowerCase()) ||
      company.city?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.is_active === 'Y') ||
      (statusFilter === 'inactive' && company.is_active === 'N');

    return matchesSearch && matchesStatus;
  });

  const handleCreateCompany = useCallback(() => {
    setSelectedCompany(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCompany = useCallback(
    (id: number) => {
      deleteCompanyMutation.mutate(id);
    },
    [deleteCompanyMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => setPage(newPage + 1);

  const companyColumns: TableColumn<Company>[] = [
    {
      id: 'name',
      label: 'Company & Logo',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            src={row.logo}
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
      id: 'email',
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
            {[row.city, row.state, row.country].filter(Boolean).join(', ') ||
              'No Location'}
          </span>
        </Box>
      ),
    },
    {
      id: 'website',
      label: 'Website',
      render: (_value, row) =>
        row.website ? (
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-gray-400" />
            <a
              href={row.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Visit Site
            </a>
          </div>
        ) : (
          <span className="italic text-gray-400">No Website</span>
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
      id: 'created_at',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.created_at) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Company) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCompany(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCompany(row.id)}
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

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Companies Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage your company database and organizational structure
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Companies"
          value={companiesData?.stats?.total_companies || 0}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Companies"
          value={companiesData?.stats?.active_companies || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Companies"
          value={companiesData?.stats?.inactive_companies || 0}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={companiesData?.stats?.new_companies || 0}
          icon={<Globe className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <Table
        data={filteredCompanies}
        columns={companyColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Companies"
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
                  </>
                )}
              </div>
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateCompany}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={company => company.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={companiesData?.meta?.total_count || 0}
        page={page - 1}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No companies found matching "${search}"`
            : 'No companies found in the system'
        }
      />

      <ManageCompanies
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default CompaniesManagement;
