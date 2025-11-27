import {
  Add,
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCoolerInstallations,
  useDeleteCoolerInstallation,
  type CoolerInstallation,
} from 'hooks/useCoolerInstallations';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import UserSelect from 'shared/UserSelect';
import { Calendar, Droplets, Package, Thermometer } from 'lucide-react';
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
import ImportCoolerInstallation from './ImportCoolerInstallation';
import ManageCoolerInstallation from './ManageCoolerInstallation';

const CoolerInstallationsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [operationalStatusFilter, setOperationalStatusFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [selectedInstallation, setSelectedInstallation] =
    useState<CoolerInstallation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'cooler-installation'
  );

  const {
    data: coolerInstallationsResponse,
    isLoading,
    error,
  } = useCoolerInstallations(
    {
      search,
      page,
      limit,
      isActive: statusFilter === 'all' ? undefined : statusFilter,
      status:
        operationalStatusFilter === 'all' ? undefined : operationalStatusFilter,
      technician_id:
        technicianFilter === 'all' ||
        technicianFilter === '' ||
        !technicianFilter
          ? undefined
          : Number(technicianFilter),
    },
    {
      enabled: isRead,
    }
  );

  const coolerInstallations = coolerInstallationsResponse?.data || [];
  const totalCount = coolerInstallationsResponse?.meta?.total_count || 0;
  const currentPage =
    (coolerInstallationsResponse?.meta?.current_page || 1) - 1;

  const deleteCoolerInstallationMutation = useDeleteCoolerInstallation();
  const exportToExcelMutation = useExportToExcel();
  const stats = coolerInstallationsResponse?.stats;
  const totalInstallations = stats?.total_coolers ?? 0;
  const activeInstallations = stats?.active_coolers ?? 0;
  const inactiveInstallations = stats?.inactive_coolers ?? 0;
  const installationsThisMonth = stats?.new_coolers_this_month ?? 0;

  const handleCreateInstallation = useCallback(() => {
    setSelectedInstallation(null);
    setDrawerOpen(true);
  }, []);

  const handleEditInstallation = useCallback(
    (installation: CoolerInstallation) => {
      setSelectedInstallation(installation);
      setDrawerOpen(true);
    },
    []
  );

  const handleViewInstallation = useCallback(
    (installation: CoolerInstallation) => {
      navigate(`/transactions/installations/${installation.id}`);
    },
    [navigate]
  );

  const handleDeleteInstallation = useCallback(
    async (id: number) => {
      try {
        await deleteCoolerInstallationMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting cooler installation:', error);
      }
    },
    [deleteCoolerInstallationMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTechnicianFilterChange = useCallback((_event: any, user: any) => {
    if (!user) {
      setTechnicianFilter('all');
    } else {
      setTechnicianFilter(String(user.id));
    }
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
        status:
          operationalStatusFilter === 'all'
            ? undefined
            : operationalStatusFilter,
        technician_id:
          technicianFilter === 'all' ||
          technicianFilter === '' ||
          !technicianFilter
            ? undefined
            : Number(technicianFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'cooler_installations',
        filters,
      });
    } catch (error) {
      console.error('Error exporting cooler installations:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'working':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'broken':
        return 'error';
      case 'offline':
        return 'default';
      default:
        return 'default';
    }
  };

  const coolerInstallationColumns: TableColumn<CoolerInstallation>[] = [
    {
      id: 'cooler_info',
      label: 'Cooler Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.code}
            className="!rounded !bg-blue-100 !text-blue-500"
          >
            <Droplets className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.code}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.brand && row.model
                ? `${row.brand} • ${row.model}`
                : 'Unknown Model'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Avatar
            alt={row.customer?.name || 'Customer'}
            src={'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box className="flex flex-col">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.customer?.name || 'Unknown Customer'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.customer?.code ?? ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'installation_details',
      label: 'Installation Details',
      render: (_value, row) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.install_date
                ? formatDate(row.install_date)
                : 'Not installed'}
            </span>
          </Box>
          {row.capacity && (
            <Box className="flex items-center gap-1">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.capacity}L</span>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.status || 'Unknown'}
          size="small"
          variant="outlined"
          color={getStatusColor(row.status)}
          className="!capitalize"
        />
      ),
    },
    {
      id: 'temperature',
      label: 'Temperature',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.temperature ? `${row.temperature}°C` : 'N/A'}
          </span>
        </Box>
      ),
    },
    {
      id: 'technician',
      label: 'Technician',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Avatar
            alt={row.technician?.name || 'Technician'}
            src={row.technician?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />

          <Box className="flex flex-col">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.technician?.name || 'No technician'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.technician?.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'next_service',
      label: 'Next Service',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.next_service_due ? formatDate(row.next_service_due) : 'N/A'}
          </span>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          variant="outlined"
          color={row.is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    ...(isRead || isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: CoolerInstallation) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewInstallation(row)}
                    tooltip="View cooler installation details"
                    icon={<Visibility />}
                    color="success"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditInstallation(row)}
                    tooltip={`Edit Installation ${row.code}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteInstallation(row.id)}
                    tooltip={`Delete Installation ${row.code}`}
                    itemName={`Installation ${row.code}`}
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
            Cooler Installations
          </p>
          <p className="!text-gray-500 text-sm">
            Track and manage cooler installations across customers
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Installations"
          value={totalInstallations}
          icon={<Droplets className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Installations"
          value={activeInstallations}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Installations"
          value={inactiveInstallations}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={installationsThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load cooler installations. Please try again.
        </Alert>
      )}

      <Table
        data={coolerInstallations}
        columns={coolerInstallationColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Cooler Installations..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-32"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Y">Active</MenuItem>
                      <MenuItem value="N">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={operationalStatusFilter}
                      onChange={e => setOperationalStatusFilter(e.target.value)}
                      className="!w-50"
                    >
                      <MenuItem value="all">All Operational</MenuItem>
                      <MenuItem value="working">Working</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="broken">Broken</MenuItem>
                      <MenuItem value="offline">Offline</MenuItem>
                    </Select>
                    <UserSelect
                      label="Technician"
                      value={
                        technicianFilter === 'all' ||
                        technicianFilter === 'null'
                          ? undefined
                          : technicianFilter
                      }
                      onChange={handleTechnicianFilterChange}
                      fullWidth={true}
                      size="small"
                      className="!w-60"
                    />
                  </>
                )}
              </div>
              {isRead && (
                <div className="flex items-center gap-2">
                  <PopConfirm
                    title="Export Cooler Installations"
                    description="Are you sure you want to export the current cooler installations data to Excel? This will include all filtered results."
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
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                </div>
              )}
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateInstallation}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={installation => installation.id}
        initialOrderBy="install_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No cooler installations found matching "${search}"`
            : 'No cooler installations found in the system'
        }
      />

      <ManageCoolerInstallation
        selectedInstallation={selectedInstallation}
        setSelectedInstallation={setSelectedInstallation}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCoolerInstallation
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CoolerInstallationsManagement;
