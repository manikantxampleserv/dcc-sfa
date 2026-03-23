import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Building, Tag } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCities,
  useDeleteCity,
  type City,
} from 'hooks/useCity';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from 'utils/dateUtils';
import ManageCity from './ManageCity';
import ImportCity from './ImportCity';

const CitiesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCity, setSelectedCity] =
    useState<City | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('city');

  const {
    data: citiesResponse,
    isFetching,
    error,
  } = useCities(
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

  const cities = citiesResponse?.data || [];
  const totalCount = citiesResponse?.meta?.total || 0;
  const currentPage = (citiesResponse?.meta?.page || 1) - 1;

  const deleteCityMutation = useDeleteCity();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = citiesResponse?.stats;
  const totalCities = stats?.total || totalCount;
  const activeCities =
    stats?.active || cities.filter(c => c.is_active === 'Y').length;
  const inactiveCities =
    stats?.inactive || cities.filter(c => c.is_active === 'N').length;

  const handleCreateCity = useCallback(() => {
    setSelectedCity(null);
    setDrawerOpen(true);
  }, []);

  const handleImportCity = useCallback(() => {
    setImportDrawerOpen(true);
  }, []);

  const handleEditCity = useCallback((city: City) => {
    setSelectedCity(city);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCity = useCallback(
    async (id: number) => {
      try {
        await deleteCityMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting city:', error);
      }
    },
    [deleteCityMutation]
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
        tableName: 'cities',
        filters,
      });
    } catch (error) {
      console.error('Error exporting cities:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const cityColumns: TableColumn<City>[] = [
    {
      id: 'name',
      label: 'City Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Building className="w-5 h-5" />
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
      id: 'cities_districts.name',
      label: 'District',
      render: (_value, row) => row.cities_districts?.name || '-',
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
            render: (_value: any, row: City) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCity(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCity(row.id)}
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
            City Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage cities associated with districts
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatsCard
          title="Total Cities"
          value={totalCities}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Cities"
          value={activeCities}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Cities"
          value={inactiveCities}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load cities. Please try again.
        </Alert>
      )}

      <Table
        data={cities}
        columns={cityColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Cities..."
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
                    title="Export Cities"
                    description="Are you sure you want to export the current cities data to Excel? This will include all filtered results."
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
                      onClick={handleImportCity}
                    >
                      Import
                    </Button>
                    <Button
                      variant="contained"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Add />}
                      onClick={handleCreateCity}
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
        getRowId={city => city.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No cities found matching "${search}"`
            : 'No cities found in the system'
        }
      />

      <ManageCity
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCity
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default CitiesPage;
