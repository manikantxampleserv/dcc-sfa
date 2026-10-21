/**
 * @fileoverview Promotional Materials Master Management Page
 * @description Catalog management page for marketing collateral and promotional giveaway materials
 * @version 1.0.0
 */

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
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeletePromotionalMaterial,
  usePromotionalMaterials,
  type PromotionalMaterial,
} from 'hooks/usePromotionalMaterials';
import { Megaphone, Package, TrendingUp } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';
import ImportPromotionalMaterial from './ImportPromotionalMaterial';
import ManagePromotionalMaterial from './ManagePromotionalMaterial';

const PromotionalMaterialsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMaterial, setSelectedMaterial] =
    useState<PromotionalMaterial | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'promotion-materials'
  );

  const {
    data: materialsResponse,
    isFetching,
    error,
    refetch,
  } = usePromotionalMaterials(
    {
      search,
      page,
      limit,
      status:
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

  const materials = materialsResponse?.data || [];
  const totalCount = materialsResponse?.pagination?.total || 0;
  const currentPage = (materialsResponse?.pagination?.page || 1) - 1;

  const deleteMaterialMutation = useDeletePromotionalMaterial();
  const exportToExcelMutation = useExportToExcel();

  const totalMaterials =
    materialsResponse?.stats?.total_materials ?? materials.length;
  const activeMaterials =
    materialsResponse?.stats?.active_materials ??
    materials.filter((m: { is_active: string }) => m.is_active === 'Y').length;
  const inactiveMaterials =
    materialsResponse?.stats?.inactive_materials ??
    materials.filter((m: { is_active: string }) => m.is_active === 'N').length;
  const newMaterialsThisMonth =
    materialsResponse?.stats?.new_materials_this_month ?? 0;

  const handleCreateMaterial = useCallback(() => {
    setSelectedMaterial(null);
    setDrawerOpen(true);
  }, []);

  const handleEditMaterial = useCallback((material: PromotionalMaterial) => {
    setSelectedMaterial(material);
    setDrawerOpen(true);
  }, []);

  const handleDeleteMaterial = useCallback(
    async (id: number) => {
      try {
        await deleteMaterialMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting material:', err);
      }
    },
    [deleteMaterialMutation]
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
        status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
      };
      await exportToExcelMutation.mutateAsync({
        tableName: 'promotional_materials',
        filters,
      });
    } catch (err) {
      console.error('Error exporting promotional materials:', err);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const columns: TableColumn<PromotionalMaterial>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Material Info',
        render: (_value, row) => (
          <Box className="!flex !gap-2 !items-center">
            <Avatar
              alt={row.name}
              className="!rounded !bg-primary-100 !text-primary-500"
            >
              <Megaphone className="w-5 h-5" />
            </Avatar>
            <Box className="!max-w-xs">
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
        id: 'uom',
        label: 'UOM',
        render: value => (
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {value || 'Pcs'}
          </Typography>
        ),
      },
      {
        id: 'default_unit_value',
        label: 'Default Unit Value',
        render: value => (
          <Typography variant="body2" className="!font-medium !text-gray-900">
            {value !== null && value !== undefined
              ? `TZS ${Number(value).toLocaleString()}`
              : '-'}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        render: value =>
          value ? (
            <Tooltip title={value} placement="top" arrow>
              <Typography
                variant="body2"
                className="!text-gray-900 !max-w-xs !truncate"
              >
                {value}
              </Typography>
            </Tooltip>
          ) : (
            <span className="italic text-gray-400">No Description</span>
          ),
      },
      {
        id: 'is_active',
        label: 'Status',
        render: value => (
          <Chip
            icon={value === 'Y' ? <CheckCircle /> : <Block />}
            label={value === 'Y' ? 'Active' : 'Inactive'}
            size="small"
            variant="outlined"
            color={value === 'Y' ? 'success' : 'error'}
          />
        ),
      },
      {
        id: 'createdate',
        label: 'Created Date',
        render: (_value, row) => formatDateTime(row.createdate),
      },
      ...(isUpdate || isDelete
        ? [
            {
              id: 'action',
              label: 'Actions',
              sortable: false,
              render: (_value: any, row: PromotionalMaterial) => (
                <div className="!flex !gap-2 !items-center">
                  {isUpdate && (
                    <EditButton
                      onClick={() => handleEditMaterial(row)}
                      tooltip={`Edit ${row.name}`}
                    />
                  )}
                  {isDelete && (
                    <DeleteButton
                      onClick={() => handleDeleteMaterial(row.id)}
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
    ],
    [isUpdate, isDelete, handleEditMaterial, handleDeleteMaterial]
  );

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Promotional Materials
          </p>
          <p className="!text-gray-500 text-sm">
            Manage promotional materials for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Materials"
          value={totalMaterials}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Materials"
          value={activeMaterials}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Materials"
          value={inactiveMaterials}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newMaterialsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load promotional materials. Please try again.
        </Alert>
      )}

      <Table
        data={materials}
        columns={columns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Promotional Materials..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
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
                    title="Export Promotional Materials"
                    description="Are you sure you want to export the current promotional materials data to Excel? This will include all filtered results."
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
                    onClick={handleCreateMaterial}
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
        getRowId={material => material.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No promotional materials found matching "${search}"`
            : 'No promotional materials found in the system'
        }
      />

      <ManagePromotionalMaterial
        selectedMaterial={selectedMaterial}
        setSelectedMaterial={setSelectedMaterial}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportPromotionalMaterial
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
        onSuccess={refetch}
      />
    </>
  );
};

export default PromotionalMaterialsManagement;
