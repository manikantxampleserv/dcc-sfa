import {
  Add,
  Block,
  CheckCircle,
  Close,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCoolerInspections,
  useDeleteCoolerInspection,
  type CoolerInspection,
} from 'hooks/useCoolerInspections';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import UserSelect from 'shared/UserSelect';
import {
  Calendar,
  Check,
  Droplets,
  MapPin,
  Thermometer,
  Wrench,
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
import ImportCoolerInspection from './ImportCoolerInspection';
import ManageCoolerInspection from './ManageCoolerInspection';

const CoolerInspectionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workingFilter, setWorkingFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [inspectorFilter, setInspectorFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] =
    useState<CoolerInspection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('inspection');

  const {
    data: coolerInspectionsResponse,
    isLoading,
    error,
  } = useCoolerInspections(
    {
      search,
      page,
      limit,
      isActive: statusFilter === 'all' ? undefined : statusFilter,
      isWorking: workingFilter === 'all' ? undefined : workingFilter,
      actionRequired: actionFilter === 'all' ? undefined : actionFilter,
      inspector_id:
        inspectorFilter === 'all' || inspectorFilter === '' || !inspectorFilter
          ? undefined
          : Number(inspectorFilter),
    },
    {
      enabled: isRead,
    }
  );

  const coolerInspections = coolerInspectionsResponse?.data || [];
  const totalCount = coolerInspectionsResponse?.meta?.total_count || 0;
  const currentPage = (coolerInspectionsResponse?.meta?.current_page || 1) - 1;

  const deleteCoolerInspectionMutation = useDeleteCoolerInspection();
  const exportToExcelMutation = useExportToExcel();
  const stats = coolerInspectionsResponse?.stats;
  const totalInspections = stats?.total_inspections ?? 0;
  const activeInspections = stats?.active_inspections ?? 0;
  const inactiveInspections = stats?.inactive_inspections ?? 0;
  const inspectionsThisMonth = stats?.new_inspections_this_month ?? 0;

  const handleCreateInspection = useCallback(() => {
    setSelectedInspection(null);
    setDrawerOpen(true);
  }, []);

  const handleEditInspection = useCallback((inspection: CoolerInspection) => {
    setSelectedInspection(inspection);
    setDrawerOpen(true);
  }, []);

  const handleViewInspection = useCallback(
    (inspection: CoolerInspection) => {
      navigate(`/transactions/inspections/${inspection.id}`);
    },
    [navigate]
  );

  const handleDeleteInspection = useCallback(
    async (id: number) => {
      try {
        await deleteCoolerInspectionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting cooler inspection:', error);
      }
    },
    [deleteCoolerInspectionMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleInspectorFilterChange = useCallback((_event: any, user: any) => {
    if (!user) {
      setInspectorFilter('all');
    } else {
      setInspectorFilter(String(user.id));
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
        isWorking: workingFilter === 'all' ? undefined : workingFilter,
        actionRequired: actionFilter === 'all' ? undefined : actionFilter,
        inspector_id:
          inspectorFilter === 'all' ||
          inspectorFilter === '' ||
          !inspectorFilter
            ? undefined
            : Number(inspectorFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'cooler_inspections',
        filters,
      });
    } catch (error) {
      console.error('Error exporting cooler inspections:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    workingFilter,
    actionFilter,
    inspectorFilter,
  ]);

  const getWorkingStatusColor = (isWorking: string) => {
    switch (isWorking) {
      case 'Y':
        return 'success';
      case 'N':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionRequiredColor = (actionRequired: string) => {
    switch (actionRequired) {
      case 'Y':
        return 'success';
      case 'N':
        return 'error';
      default:
        return 'default';
    }
  };

  const coolerInspectionColumns: TableColumn<CoolerInspection>[] = [
    {
      id: 'cooler_info',
      label: 'Cooler Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.cooler?.code}
            className="!rounded !bg-blue-100 !text-blue-500"
          >
            <Droplets className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.cooler?.code || 'Unknown Cooler'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.cooler?.brand && row.cooler?.model
                ? `${row.cooler.brand} ${row.cooler.model}`
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
            alt={row.cooler?.customer?.name || 'Customer'}
            src={'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box className="flex flex-col">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.cooler?.customer?.name || 'Unknown Customer'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.cooler?.customer?.code ?? ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'inspection_details',
      label: 'Inspection Details',
      render: (_value, row) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs">
              {row.inspection_date
                ? formatDate(row.inspection_date)
                : 'Not inspected'}
            </span>
          </Box>
          {row.temperature && (
            <Box className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-gray-400" />
              <span className="text-xs">{row.temperature}°C</span>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'working_status',
      label: 'Working Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_working === 'Y' ? <Check /> : <Close />}
          label={row.is_working === 'Y' ? 'Working' : 'Not Working'}
          size="small"
          variant="outlined"
          color={getWorkingStatusColor(row.is_working)}
        />
      ),
    },
    {
      id: 'action_required',
      label: 'Action Required',
      render: (_value, row) => (
        <Chip
          label={row.action_required === 'Y' ? 'Yes' : 'No'}
          size="small"
          icon={row.action_required === 'Y' ? <Check /> : <Close />}
          variant="outlined"
          color={getActionRequiredColor(row.action_required)}
        />
      ),
    },
    {
      id: 'inspector',
      label: 'Inspector',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Avatar
            alt={row.inspector?.name || 'Inspector'}
            src={row.inspector?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box className="flex flex-col">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.inspector?.name || 'No inspector'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.inspector?.email || 'No email'}
            </Typography>
          </Box>
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
            {row.latitude && row.longitude
              ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
              : 'N/A'}
          </span>
        </Box>
      ),
    },
    {
      id: 'next_inspection',
      label: 'Next Inspection',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.next_inspection_due
              ? formatDate(row.next_inspection_due)
              : 'N/A'}
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
            render: (_value: any, row: CoolerInspection) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewInspection(row)}
                    tooltip="View cooler inspection details"
                    icon={<Visibility />}
                    color="success"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditInspection(row)}
                    tooltip={`Edit Inspection ${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteInspection(row.id)}
                    tooltip={`Delete Inspection ${row.id}`}
                    itemName={`Inspection ${row.id}`}
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
            Cooler Inspections
          </p>
          <p className="!text-gray-500 text-sm">
            Track and manage cooler inspections across installations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Inspections"
          value={totalInspections}
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Inspections"
          value={activeInspections}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Inspections"
          value={inactiveInspections}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="This Month"
          value={inspectionsThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load cooler inspections. Please try again.
        </Alert>
      )}

      <Table
        data={coolerInspections}
        columns={coolerInspectionColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Cooler Inspections..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-40"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={workingFilter}
                      onChange={e => setWorkingFilter(e.target.value)}
                      className="!w-40"
                    >
                      <MenuItem value="all">All Working</MenuItem>
                      <MenuItem value="Y">Working</MenuItem>
                      <MenuItem value="N">Not Working</MenuItem>
                    </Select>
                    <Select
                      value={actionFilter}
                      onChange={e => setActionFilter(e.target.value)}
                      className="!w-40"
                    >
                      <MenuItem value="all">All Action</MenuItem>
                      <MenuItem value="Y">Action Required</MenuItem>
                      <MenuItem value="N">No Action</MenuItem>
                    </Select>
                    <UserSelect
                      label="Inspector"
                      value={
                        inspectorFilter === 'all' || inspectorFilter === 'null'
                          ? undefined
                          : inspectorFilter
                      }
                      onChange={handleInspectorFilterChange}
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
                    title="Export Cooler Inspections"
                    description="Are you sure you want to export the current cooler inspections data to Excel? This will include all filtered results."
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
                  onClick={handleCreateInspection}
                >
                  Create
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={inspection => inspection.id}
        initialOrderBy="inspection_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No cooler inspections found matching "${search}"`
            : 'No cooler inspections found in the system'
        }
      />

      <ManageCoolerInspection
        selectedInspection={selectedInspection}
        setSelectedInspection={setSelectedInspection}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCoolerInspection
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CoolerInspectionsManagement;
