import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Building2, Receipt } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useTaxMasters,
  useDeleteTaxMaster,
  type TaxMaster,
} from '../../../hooks/useTaxMaster';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ManageTaxMaster from './ManageTaxMaster';
import ImportTaxMaster from './ImportTaxMaster';

const TaxMasterPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTaxMaster, setSelectedTaxMaster] = useState<TaxMaster | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('tax-master');

  const {
    data: taxMastersResponse,
    isFetching,
    error,
  } = useTaxMasters(
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

  const taxMasters = taxMastersResponse?.data || [];
  const totalCount = taxMastersResponse?.meta?.total || 0;
  const currentPage = (taxMastersResponse?.meta?.page || 1) - 1;

  const deleteTaxMasterMutation = useDeleteTaxMaster();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = taxMastersResponse?.stats;
  const totalTaxMasters = stats?.total || taxMasters.length;
  const activeTaxMasters =
    stats?.active || taxMasters.filter(tm => tm.is_active === 'Y').length;
  const inactiveTaxMasters =
    stats?.inactive || taxMasters.filter(tm => tm.is_active === 'N').length;
  const newTaxMastersThisMonth = stats?.new_this_month || 0;

  const handleCreateTaxMaster = useCallback(() => {
    setSelectedTaxMaster(null);
    setDrawerOpen(true);
  }, []);

  const handleEditTaxMaster = useCallback((taxMaster: TaxMaster) => {
    setSelectedTaxMaster(taxMaster);
    setDrawerOpen(true);
  }, []);

  const handleDeleteTaxMaster = useCallback(
    async (id: number) => {
      try {
        await deleteTaxMasterMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting tax master:', error);
      }
    },
    [deleteTaxMasterMutation]
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
        tableName: 'tax_master',
        filters,
      });
    } catch (error) {
      console.error('Error exporting tax masters:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const taxMasterColumns: TableColumn<TaxMaster>[] = [
    {
      id: 'name',
      label: 'Tax Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Receipt className="w-5 h-5" />
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
      id: 'tax_rate',
      label: 'Tax Rate (%)',
      render: tax_rate => (
        <Typography variant="body2" className="!font-medium">
          {tax_rate}%
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: description =>
        description ? (
          <Typography variant="body2" className="!text-gray-600">
            {description.length > 50
              ? `${description.substring(0, 50)}...`
              : description}
          </Typography>
        ) : (
          <span className="italic text-gray-400">No description</span>
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
            render: (_value: any, row: TaxMaster) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditTaxMaster(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteTaxMaster(row.id)}
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
            Tax Master Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage tax rates and their configurations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Taxes"
          value={totalTaxMasters}
          icon={<Receipt className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Active Taxes"
          value={activeTaxMasters}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Inactive Taxes"
          value={inactiveTaxMasters}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newTaxMastersThisMonth}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load tax masters. Please try again.
        </Alert>
      )}

      <Table
        data={taxMasters}
        columns={taxMasterColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Tax Masters..."
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
                  <>
                    <PopConfirm
                      title="Export Tax Masters"
                      description="Are you sure you want to export the current tax masters data to Excel? This will include all filtered results."
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
                    {isCreate && (
                      <Button
                        variant="outlined"
                        className="!capitalize"
                        startIcon={<Upload />}
                        onClick={() => setImportDrawerOpen(true)}
                      >
                        Import
                      </Button>
                    )}
                  </>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateTaxMaster}
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
        getRowId={taxMaster => taxMaster.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No tax masters found matching "${search}"`
            : 'No tax masters found in the system'
        }
      />

      <ManageTaxMaster
        selectedTaxMaster={selectedTaxMaster}
        setSelectedTaxMaster={setSelectedTaxMaster}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportTaxMaster
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default TaxMasterPage;
