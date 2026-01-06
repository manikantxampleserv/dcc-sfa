import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCoolerSubTypes,
  useDeleteCoolerSubType,
  type CoolerSubType,
} from 'hooks/useCoolerSubTypes';
import { useCoolerTypesDropdown } from 'hooks/useCoolerTypes';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Package, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportCoolerSubType from './ImportCoolerSubType';
import ManageCoolerSubType from './ManageCoolerSubType';

const CoolerSubTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coolerTypeFilter, setCoolerTypeFilter] = useState<number | ''>('');
  const [selectedCoolerSubType, setSelectedCoolerSubType] =
    useState<CoolerSubType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('cooler-sub-type');

  const { data: coolerTypesDropdown } = useCoolerTypesDropdown();

  const {
    data: coolerSubTypesResponse,
    isFetching,
    error,
  } = useCoolerSubTypes(
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
      coolerTypeId: coolerTypeFilter ? Number(coolerTypeFilter) : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const coolerSubTypes = coolerSubTypesResponse?.data || [];
  const totalCount = coolerSubTypesResponse?.meta?.total_count || 0;
  const currentPage = (coolerSubTypesResponse?.meta?.current_page || 1) - 1;

  const deleteCoolerSubTypeMutation = useDeleteCoolerSubType();
  const exportToExcelMutation = useExportToExcel();

  const stats = coolerSubTypesResponse?.stats as any;
  const totalCoolerSubTypes =
    stats?.total_cooler_sub_types ?? coolerSubTypes.length;
  const activeCoolerSubTypes =
    stats?.active_cooler_sub_types ??
    coolerSubTypes.filter(cst => cst.is_active === 'Y').length;
  const inactiveCoolerSubTypes =
    stats?.inactive_cooler_sub_types ??
    coolerSubTypes.filter(cst => cst.is_active === 'N').length;
  const newCoolerSubTypesThisMonth = stats?.new_cooler_sub_types ?? 0;

  const handleCreateCoolerSubType = useCallback(() => {
    setSelectedCoolerSubType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCoolerSubType = useCallback(
    (coolerSubType: CoolerSubType) => {
      setSelectedCoolerSubType(coolerSubType);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteCoolerSubType = useCallback(
    async (id: number) => {
      try {
        await deleteCoolerSubTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting cooler sub type:', error);
      }
    },
    [deleteCoolerSubTypeMutation]
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
        coolerTypeId: coolerTypeFilter ? Number(coolerTypeFilter) : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'cooler_sub_types',
        filters,
      });
    } catch (error) {
      console.error('Error exporting cooler sub types:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, coolerTypeFilter]);

  const coolerSubTypeColumns: TableColumn<CoolerSubType>[] = [
    {
      id: 'name',
      label: 'Sub Type',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body1" className="!text-gray-900">
              {row.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },

    {
      id: 'cooler_type',
      label: 'Cooler Type',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.cooler_type?.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography variant="body1" className="!text-gray-900">
              {row.cooler_type?.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.cooler_type?.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-600">
          {row.description || (
            <span className="italic text-gray-400">No Description</span>
          )}
        </Typography>
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
            render: (_value: any, row: CoolerSubType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCoolerSubType(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCoolerSubType(row.id)}
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
            Cooler Sub Types Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage cooler sub types for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Cooler Sub Types"
          value={totalCoolerSubTypes}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Sub Types"
          value={activeCoolerSubTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Sub Types"
          value={inactiveCoolerSubTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newCoolerSubTypesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load cooler sub types. Please try again.
        </Alert>
      )}

      <Table
        data={coolerSubTypes}
        columns={coolerSubTypeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Cooler Sub Types..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={coolerTypeFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCoolerTypeFilter(
                          e.target.value === '' ? '' : Number(e.target.value)
                        );
                        setPage(1);
                      }}
                      className="!w-48"
                      label="Cooler Type"
                      placeholder="Select Cooler Type"
                    >
                      {coolerTypesDropdown?.data?.map(ct => (
                        <MenuItem key={ct.id} value={ct.id}>
                          {ct.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={statusFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
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
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Cooler Sub Types"
                    description="Are you sure you want to export the current cooler sub types data to Excel?"
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
                    onClick={handleCreateCoolerSubType}
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
        getRowId={coolerSubType => coolerSubType.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No cooler sub types found matching "${search}"`
            : 'No cooler sub types found in the system'
        }
      />

      <ManageCoolerSubType
        selectedCoolerSubType={selectedCoolerSubType}
        setSelectedCoolerSubType={setSelectedCoolerSubType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCoolerSubType
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CoolerSubTypesPage;
