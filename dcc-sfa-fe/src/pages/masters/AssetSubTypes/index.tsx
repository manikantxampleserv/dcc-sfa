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
  useAssetSubTypes,
  useDeleteAssetSubType,
  type AssetSubType,
} from 'hooks/useAssetSubTypes';
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
import ImportAssetSubType from './ImportAssetSubType';
import ManageAssetSubType from './ManageAssetSubType';

const AssetSubTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssetSubType, setSelectedAssetSubType] =
    useState<AssetSubType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('asset-type');

  const {
    data: assetSubTypesResponse,
    isFetching,
    error,
  } = useAssetSubTypes(
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

  const assetSubTypes = assetSubTypesResponse?.data || [];
  const totalCount = assetSubTypesResponse?.meta?.total_count || 0;
  const currentPage = (assetSubTypesResponse?.meta?.current_page || 1) - 1;

  const deleteAssetSubTypeMutation = useDeleteAssetSubType();
  const exportToExcelMutation = useExportToExcel();

  const totalAssetSubTypes =
    assetSubTypesResponse?.stats?.total_asset_sub_types ?? assetSubTypes.length;
  const activeAssetSubTypes =
    assetSubTypesResponse?.stats?.active_asset_sub_types ??
    assetSubTypes.filter(at => at.is_active === 'Y').length;
  const inactiveAssetSubTypes =
    assetSubTypesResponse?.stats?.inactive_asset_sub_types ??
    assetSubTypes.filter(at => at.is_active === 'N').length;
  const newAssetSubTypesThisMonth =
    assetSubTypesResponse?.stats?.new_asset_sub_types ?? 0;

  const handleCreateAssetSubType = useCallback(() => {
    setSelectedAssetSubType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditAssetSubType = useCallback((assetSubType: AssetSubType) => {
    setSelectedAssetSubType(assetSubType);
    setDrawerOpen(true);
  }, []);

  const handleDeleteAssetSubType = useCallback(
    async (id: number) => {
      try {
        await deleteAssetSubTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset sub type:', error);
      }
    },
    [deleteAssetSubTypeMutation]
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
        tableName: 'asset_sub_types',
        filters,
      });
    } catch (error) {
      console.error('Error exporting asset sub types:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const assetSubTypeColumns: TableColumn<AssetSubType>[] = [
    {
      id: 'name',
      label: 'Asset Sub Type Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            {row.description && (
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
            )}
          </Box>
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
            render: (_value: any, row: AssetSubType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditAssetSubType(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteAssetSubType(row.id)}
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
            Asset Sub Types Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage asset sub types for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Asset Sub Types"
          value={totalAssetSubTypes}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Types"
          value={activeAssetSubTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Types"
          value={inactiveAssetSubTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newAssetSubTypesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load asset sub types. Please try again.
        </Alert>
      )}

      <Table
        data={assetSubTypes}
        columns={assetSubTypeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Asset Sub Types..."
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
                    title="Export Asset Sub Types"
                    description="Are you sure you want to export the current asset sub types data to Excel? This will include all filtered results."
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
                    onClick={handleCreateAssetSubType}
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
        getRowId={assetSubType => assetSubType.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No asset sub types found matching "${search}"`
            : 'No asset sub types found in the system'
        }
      />

      <ManageAssetSubType
        selectedAssetSubType={selectedAssetSubType}
        setSelectedAssetSubType={setSelectedAssetSubType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportAssetSubType
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default AssetSubTypesPage;
