import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useSubUnitOfMeasurements,
  useDeleteSubUnitOfMeasurement,
  type SubUnitOfMeasurement,
} from 'hooks/useSubUnitOfMeasurement';
import { usePermission } from 'hooks/usePermission';
import { useExportToExcel } from 'hooks/useImportExport';
import { Layers, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportSubUnitOfMeasurement from './ImportSubUnitOfMeasurement';
import ManageSubUnitOfMeasurement from './ManageSubUnitOfMeasurement';

const SubUnitOfMeasurementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubUnit, setSelectedSubUnit] =
    useState<SubUnitOfMeasurement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'unit-of-measurement'
  );

  const {
    data: subUnitsResponse,
    isFetching,
    error,
  } = useSubUnitOfMeasurements(
    {
      search,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
      page,
      limit,
    },
    { enabled: isRead }
  );

  const deleteSubUnitMutation = useDeleteSubUnitOfMeasurement();
  const exportToExcelMutation = useExportToExcel();

  const subUnits = subUnitsResponse?.data || [];
  const totalCount = subUnitsResponse?.meta?.total || 0;
  const currentPage = (subUnitsResponse?.meta?.page || 1) - 1;
  const stats = subUnitsResponse?.stats;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleEdit = useCallback((subUnit: SubUnitOfMeasurement) => {
    setSelectedSubUnit(subUnit);
    setDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (subUnit: SubUnitOfMeasurement) => {
      try {
        await deleteSubUnitMutation.mutateAsync(subUnit.id);
      } catch (error) {
        console.error('Error deleting sub unit of measurement:', error);
      }
    },
    [deleteSubUnitMutation]
  );

  const handleAdd = useCallback(() => {
    setSelectedSubUnit(null);
    setDrawerOpen(true);
  }, []);

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
        tableName: 'subunits',
        filters,
      });
    } catch (error) {
      console.error('Error exporting sub units of measurement:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const columns: TableColumn<SubUnitOfMeasurement>[] = [
    {
      id: 'name',
      label: 'Sub Unit Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Layers className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.code || 'No Code'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) =>
        row.description ? (
          <Tooltip title={row.description} placement="top" arrow>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxWidth: '300px',
                cursor: 'help',
              }}
            >
              {row.description}
            </Typography>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      id: 'unit_of_measurement_id',
      label: 'Unit of Measurement',
      render: (_value, row) => (
        <Chip
          label={row.subunits_unit_of_measurement?.name || '-'}
          size="small"
          variant="outlined"
        />
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
      render: (_value, row) => formatDate(row.createdate),
    },
    ...(isUpdate || isDelete
      ? [
          {
            id: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: SubUnitOfMeasurement) => (
              <Box className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEdit(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <PopConfirm
                    title="Delete Sub Unit"
                    description={`Are you sure you want to delete "${row.name || 'this sub unit'}"? This action cannot be undone.`}
                    onConfirm={() => handleDelete(row)}
                  >
                    <Tooltip title="Delete Sub Unit">
                      <DeleteButton />
                    </Tooltip>
                  </PopConfirm>
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  if (!isRead) {
    return (
      <Alert severity="warning">
        You don't have permission to view sub units of measurement.
      </Alert>
    );
  }

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Sub Units of Measurement Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage sub units of measurement for your organization
          </p>
        </Box>
      </Box>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Sub Units"
          value={stats?.total_sub_units || 0}
          icon={<Layers className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Sub Units"
          value={stats?.active_sub_units || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Sub Units"
          value={stats?.inactive_sub_units || 0}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={stats?.new_sub_units_this_month || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load sub units of measurement. Please try again.
        </Alert>
      )}

      {/* Table Actions */}
      <Table
        data={subUnits}
        columns={columns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search sub units..."
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
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Sub Units"
                    description="Are you sure you want to export the current sub units of measurement data to Excel? This will include all filtered results."
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
                    onClick={handleAdd}
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
        getRowId={row => row.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? 'No sub units found matching your search criteria.'
            : 'No sub units of measurement found.'
        }
      />

      {/* Manage Drawer */}
      <ManageSubUnitOfMeasurement
        selectedSubUnit={selectedSubUnit}
        setSelectedSubUnit={setSelectedSubUnit}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      {/* Import Modal */}
      <ImportSubUnitOfMeasurement
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SubUnitOfMeasurementPage;
