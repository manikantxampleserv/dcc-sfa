import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useCompanies } from 'hooks/useCompanies';
import { useDeleteDepot, useDepots, type Depot } from 'hooks/useDepots';
import { useExportToExcel } from 'hooks/useImportExport';
import { useUsers } from 'hooks/useUsers';
import { usePermission } from 'hooks/usePermission';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportDepot from './ImportDepot';
import ManageDepot from './ManageDepot';

const DepotsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('depot');

  const {
    data: depotsResponse,
    isLoading,
    error,
  } = useDepots(
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
      parent_id: companyFilter === 'all' ? undefined : Number(companyFilter),
    },
    {
      enabled: isRead,
    }
  );

  const { data: companiesResponse } = useCompanies({ page: 1, limit: 100 });

  const { data: usersResponse } = useUsers({ page: 1, limit: 1000 });

  const depots = depotsResponse?.data || [];
  const companies = companiesResponse?.data || [];
  const users = usersResponse?.data || [];
  const totalCount = depotsResponse?.meta?.total_count || 0;
  const currentPage = (depotsResponse?.meta?.current_page || 1) - 1;

  const deleteDepotMutation = useDeleteDepot();
  const exportToExcelMutation = useExportToExcel();

  const totalDepots = depotsResponse?.stats?.total_depots ?? depots.length;
  const activeDepots =
    depotsResponse?.stats?.active_depots ??
    depots.filter(d => d.is_active === 'Y').length;
  const inactiveDepots =
    depotsResponse?.stats?.inactive_depots ??
    depots.filter(d => d.is_active === 'N').length;
  const uniqueCompanies = new Set(depots.map(d => d.company_name)).size;

  const handleCreateDepot = useCallback(() => {
    setSelectedDepot(null);
    setDrawerOpen(true);
  }, []);

  const handleEditDepot = useCallback((depot: Depot) => {
    setSelectedDepot(depot);
    setDrawerOpen(true);
  }, []);

  const handleViewDepot = useCallback(
    (depot: Depot) => {
      navigate(`/masters/depots/${depot.id}`);
    },
    [navigate]
  );

  const handleDeleteDepot = useCallback(
    async (id: number) => {
      try {
        await deleteDepotMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting depot:', error);
      }
    },
    [deleteDepotMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

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
        parent_id: companyFilter === 'all' ? undefined : Number(companyFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'depots',
        filters,
      });
    } catch (error) {
      console.error('Error exporting depots:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, companyFilter]);

  const depotColumns: TableColumn<Depot>[] = [
    {
      id: 'name',
      label: 'Depot & Code',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
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
      id: 'depot_companies',
      label: 'Company',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.depot_companies?.name || 'No Company'}
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
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Depot) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewDepot(row)}
                    tooltip={`View ${row.name}`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditDepot(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteDepot(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Depot Management</p>
          <p className="!text-gray-500 text-sm">
            Manage depot locations, staff assignments, and operational details
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Depots"
          value={totalDepots}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Depots"
          value={activeDepots}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Depots"
          value={inactiveDepots}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Unique Companies"
          value={uniqueCompanies}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load depots. Please try again.
        </Alert>
      )}

      <Table
        data={depots}
        columns={depotColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  placeholder="Search Depots..."
                  value={search}
                  onChange={handleSearchChange}
                  debounceMs={400}
                  showClear={true}
                  className="!w-80"
                />
                {isRead && (
                  <>
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-32"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={companyFilter}
                      onChange={e => setCompanyFilter(e.target.value)}
                      className="!w-68"
                    >
                      <MenuItem value="all">All Companies</MenuItem>
                      {companies.map(company => (
                        <MenuItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Depots"
                    description="Are you sure you want to export the current depot data to Excel? This will include all filtered results."
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
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateDepot}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={depot => depot.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
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
        users={users}
      />

      <ImportDepot
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default DepotsManagement;
