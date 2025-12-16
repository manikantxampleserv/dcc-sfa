import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCoolerTypes,
  useDeleteCoolerType,
  type CoolerType,
} from 'hooks/useCoolerTypes';
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
import ImportCoolerType from './ImportCoolerType';
import ManageCoolerType from './ManageCoolerType';

const CoolerTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCoolerType, setSelectedCoolerType] =
    useState<CoolerType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('cooler-type');

  const {
    data: coolerTypesResponse,
    isLoading,
    error,
  } = useCoolerTypes(
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
    },
    {
      enabled: isRead,
    }
  );

  const coolerTypes = coolerTypesResponse?.data || [];
  const totalCount = coolerTypesResponse?.meta?.total_count || 0;
  const currentPage = (coolerTypesResponse?.meta?.current_page || 1) - 1;

  const deleteCoolerTypeMutation = useDeleteCoolerType();
  const exportToExcelMutation = useExportToExcel();

  const stats = coolerTypesResponse?.stats as any;
  const totalCoolerTypes = stats?.total_cooler_types ?? coolerTypes.length;
  const activeCoolerTypes =
    stats?.active_cooler_types ??
    coolerTypes.filter(ct => ct.is_active === 'Y').length;
  const inactiveCoolerTypes =
    stats?.inactive_cooler_types ??
    coolerTypes.filter(ct => ct.is_active === 'N').length;
  const newCoolerTypesThisMonth = stats?.new_cooler_types ?? 0;

  const handleCreateCoolerType = useCallback(() => {
    setSelectedCoolerType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCoolerType = useCallback((coolerType: CoolerType) => {
    setSelectedCoolerType(coolerType);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCoolerType = useCallback(
    async (id: number) => {
      try {
        await deleteCoolerTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting cooler type:', error);
      }
    },
    [deleteCoolerTypeMutation]
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
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'cooler_types',
        filters,
      });
    } catch (error) {
      console.error('Error exporting cooler types:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const coolerTypeColumns: TableColumn<CoolerType>[] = [
    {
      id: 'name',
      label: 'Cooler Type Name',
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
            render: (_value: any, row: CoolerType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCoolerType(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCoolerType(row.id)}
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
            Cooler Types Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage cooler types for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Cooler Types"
          value={totalCoolerTypes}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Types"
          value={activeCoolerTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Types"
          value={inactiveCoolerTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newCoolerTypesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load cooler types. Please try again.
        </Alert>
      )}

      <Table
        data={coolerTypes}
        columns={coolerTypeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Cooler Types..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="!w-32"
                      label="Status"
                      placeholder="Select Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Cooler Types"
                    description="Are you sure you want to export the current cooler types data to Excel?"
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
                    onClick={handleCreateCoolerType}
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
        getRowId={coolerType => coolerType.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No cooler types found matching "${search}"`
            : 'No cooler types found in the system'
        }
      />

      <ManageCoolerType
        selectedCoolerType={selectedCoolerType}
        setSelectedCoolerType={setSelectedCoolerType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCoolerType
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CoolerTypesPage;
