import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Map, Tag } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useRegions,
  useDeleteRegion,
  type Region,
} from 'hooks/useRegion';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from 'utils/dateUtils';
import ManageRegion from './ManageRegion';
import ImportRegion from './ImportRegion';

const RegionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] =
    useState<Region | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('region');

  const {
    data: regionsResponse,
    isFetching,
    error,
  } = useRegions(
    {
      search,
      page,
      limit,
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

  const regions = regionsResponse?.data || [];
  const totalCount = regionsResponse?.meta?.total || 0;
  const currentPage = (regionsResponse?.meta?.page || 1) - 1;

  const deleteRegionMutation = useDeleteRegion();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = regionsResponse?.stats;
  const totalRegions = stats?.total || totalCount;
  const activeRegions =
    stats?.active || regions.filter(r => r.is_active === 'Y').length;
  const inactiveRegions =
    stats?.inactive || regions.filter(r => r.is_active === 'N').length;

  const handleCreateRegion = useCallback(() => {
    setSelectedRegion(null);
    setDrawerOpen(true);
  }, []);

  const handleImportRegion = useCallback(() => {
    setImportDrawerOpen(true);
  }, []);

  const handleEditRegion = useCallback((region: Region) => {
    setSelectedRegion(region);
    setDrawerOpen(true);
  }, []);

  const handleDeleteRegion = useCallback(
    async (id: number) => {
      try {
        await deleteRegionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting region:', error);
      }
    },
    [deleteRegionMutation]
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
        is_active:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'regions',
        filters,
      });
    } catch (error) {
      console.error('Error exporting regions:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const regionColumns: TableColumn<Region>[] = [
    {
      id: 'name',
      label: 'Region Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Map className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
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
      id: 'description',
      label: 'Description',
      render: (value) => value || '-',
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
            render: (_value: any, row: Region) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditRegion(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteRegion(row.id)}
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
            Region Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage regions for geographic organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatsCard
          title="Total Regions"
          value={totalRegions}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Regions"
          value={activeRegions}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Regions"
          value={inactiveRegions}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load regions. Please try again.
        </Alert>
      )}

      <Table
        data={regions}
        columns={regionColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Regions..."
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
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {isRead && (
                  <PopConfirm
                    title="Export Regions"
                    description="Are you sure you want to export the current regions data to Excel? This will include all filtered results."
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
                  <>
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Upload />}
                      onClick={handleImportRegion}
                    >
                      Import
                    </Button>
                    <Button
                      variant="contained"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Add />}
                      onClick={handleCreateRegion}
                    >
                      Create
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={region => region.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No regions found matching "${search}"`
            : 'No regions found in the system'
        }
      />

      <ManageRegion
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportRegion
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default RegionsPage;
