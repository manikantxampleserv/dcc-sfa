import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { MapPin, Tag } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useDistricts,
  useDeleteDistrict,
  type District,
} from 'hooks/useDistrict';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from 'utils/dateUtils';
import ManageDistrict from './ManageDistrict';
import ImportDistrict from './ImportDistrict';

const DistrictsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDistrict, setSelectedDistrict] =
    useState<District | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('district');

  const {
    data: districtsResponse,
    isFetching,
    error,
  } = useDistricts(
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

  const districts = districtsResponse?.data || [];
  const totalCount = districtsResponse?.meta?.total || 0;
  const currentPage = (districtsResponse?.meta?.page || 1) - 1;

  const deleteDistrictMutation = useDeleteDistrict();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = districtsResponse?.stats;
  const totalDistricts = stats?.total || totalCount;
  const activeDistricts =
    stats?.active || districts.filter(d => d.is_active === 'Y').length;
  const inactiveDistricts =
    stats?.inactive || districts.filter(d => d.is_active === 'N').length;

  const handleCreateDistrict = useCallback(() => {
    setSelectedDistrict(null);
    setDrawerOpen(true);
  }, []);

  const handleImportDistrict = useCallback(() => {
    setImportDrawerOpen(true);
  }, []);

  const handleEditDistrict = useCallback((district: District) => {
    setSelectedDistrict(district);
    setDrawerOpen(true);
  }, []);

  const handleDeleteDistrict = useCallback(
    async (id: number) => {
      try {
        await deleteDistrictMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting district:', error);
      }
    },
    [deleteDistrictMutation]
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
        tableName: 'districts',
        filters,
      });
    } catch (error) {
      console.error('Error exporting districts:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const districtColumns: TableColumn<District>[] = [
    {
      id: 'name',
      label: 'District Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <MapPin className="w-5 h-5" />
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
      id: 'district_regions.name',
      label: 'Region',
      render: (_value, row) => row.district_regions?.name || '-',
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
            render: (_value: any, row: District) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditDistrict(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteDistrict(row.id)}
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
            District Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage districts associated with regions
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatsCard
          title="Total Districts"
          value={totalDistricts}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Districts"
          value={activeDistricts}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Districts"
          value={inactiveDistricts}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load districts. Please try again.
        </Alert>
      )}

      <Table
        data={districts}
        columns={districtColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Districts..."
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
                    title="Export Districts"
                    description="Are you sure you want to export the current districts data to Excel? This will include all filtered results."
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
                      onClick={handleImportDistrict}
                    >
                      Import
                    </Button>
                    <Button
                      variant="contained"
                      className="!capitalize"
                      disableElevation
                      startIcon={<Add />}
                      onClick={handleCreateDistrict}
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
        getRowId={district => district.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No districts found matching "${search}"`
            : 'No districts found in the system'
        }
      />

      <ManageDistrict
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportDistrict
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default DistrictsPage;
