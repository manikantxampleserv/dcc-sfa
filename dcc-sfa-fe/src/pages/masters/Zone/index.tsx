import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Building2, MapPin, User, UserCheck, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { usePermission } from 'hooks/usePermission';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useDepots } from '../../../hooks/useDepots';
import { useUsers } from '../../../hooks/useUsers';
import { useDeleteZone, useZones, type Zone } from '../../../hooks/useZones';
import { useExportToExcel } from '../../../hooks/useImportExport';
import ManageZone from './ManageZone';
import ImportZone from './ImportZone';

const ZonesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('zone');

  const {
    data: zonesResponse,
    isLoading,
    error,
  } = useZones(
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
      parent_id: depotFilter === 'all' ? undefined : Number(depotFilter),
    },
    {
      enabled: isRead,
    }
  );

  const { data: depotsResponse } = useDepots({
    page: 1,
    limit: 100, // Get all depots for filter
  });

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000, // Get all users for supervisor filtering
  });

  const zones = zonesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const users = usersResponse?.data || [];
  const totalCount = zonesResponse?.meta?.total || 0;
  const currentPage = (zonesResponse?.meta?.page || 1) - 1;

  const deleteZoneMutation = useDeleteZone();
  const exportToExcelMutation = useExportToExcel();

  // Statistics - Use API stats when available, fallback to local calculation
  const totalZones = zonesResponse?.stats?.total_zones ?? zones.length;
  const activeZones =
    zonesResponse?.stats?.active_zones ??
    zones.filter(z => z.is_active === 'Y').length;
  const inactiveZones =
    zonesResponse?.stats?.inactive_zones ??
    zones.filter(z => z.is_active === 'N').length;
  const newZonesThisMonth = zonesResponse?.stats?.new_zones || 0;

  const handleCreateZone = useCallback(() => {
    setSelectedZone(null);
    setDrawerOpen(true);
  }, []);

  const handleEditZone = useCallback((zone: Zone) => {
    setSelectedZone(zone);
    setDrawerOpen(true);
  }, []);

  const handleDeleteZone = useCallback(
    async (id: number) => {
      try {
        await deleteZoneMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
    },
    [deleteZoneMutation]
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
        parent_id: depotFilter === 'all' ? undefined : Number(depotFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'zones',
        filters,
      });
    } catch (error) {
      console.error('Error exporting zones:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, depotFilter]);

  // Define table columns following Depot pattern
  const zoneColumns: TableColumn<Zone>[] = [
    {
      id: 'name',
      label: 'Zone & Code',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <MapPin className="w-5 h-5" />
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
      id: 'zone_depots',
      label: 'Depot',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.zone_depots?.name || 'No Depot'}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: description => (
        <Typography
          variant="body2"
          className="!text-gray-600 !max-w-xs !truncate"
        >
          {description || 'No description'}
        </Typography>
      ),
    },
    {
      id: 'supervisor_id',
      label: 'Supervisor',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {users.find(u => u.id === row.supervisor_id)?.name || (
              <span className="text-xs italic text-gray-500">
                No Supervisor
              </span>
            )}
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
            render: (_value: any, row: Zone) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditZone(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteZone(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Zone Management</p>
          <p className="!text-gray-500 text-sm">
            Manage zone territories, supervisor assignments, and operational
            areas
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Zones"
          value={totalZones}
          icon={<MapPin className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Zones"
          value={activeZones}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Zones"
          value={inactiveZones}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newZonesThisMonth}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load zones. Please try again.
        </Alert>
      )}

      <Table
        data={zones}
        columns={zoneColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Zones"
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
                    <Select
                      value={depotFilter}
                      onChange={e => setDepotFilter(e.target.value)}
                      className="!min-w-60"
                      size="small"
                    >
                      <MenuItem value="all">All Depots</MenuItem>
                      {depots.map(depot => (
                        <MenuItem key={depot.id} value={depot.id.toString()}>
                          {depot.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Zones"
                    description="Are you sure you want to export the current zones data to Excel? This will include all filtered results."
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
                    onClick={handleCreateZone}
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
        getRowId={zone => zone.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No zones found matching "${search}"`
            : 'No zones found in the system'
        }
      />

      <ManageZone
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        depots={depots}
        users={users}
      />

      <ImportZone
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default ZonesManagement;
