import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useCurrencies,
  useDeleteCurrency,
  type Currency,
} from 'hooks/useCurrencies';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { DollarSign, TrendingUp, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportCurrency from './ImportCurrency';
import ManageCurrency from './ManageCurrency';

const CurrenciesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [baseFilter, setBaseFilter] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('currency');

  const {
    data: currenciesResponse,
    isLoading,
    error,
  } = useCurrencies(
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

  const currencies = currenciesResponse?.data || [];
  const totalCount = currenciesResponse?.meta?.total || 0;
  const currentPage = (currenciesResponse?.meta?.page || 1) - 1;

  const deleteCurrencyMutation = useDeleteCurrency();
  const exportToExcelMutation = useExportToExcel();

  const totalCurrencies = currenciesResponse?.stats?.total_currencies ?? 0;
  const activeCurrencies = currenciesResponse?.stats?.active_currencies ?? 0;
  const inactiveCurrencies =
    currenciesResponse?.stats?.inactive_currencies ?? 0;
  const baseCurrencies = currenciesResponse?.stats?.base_currencies ?? 0;

  const handleCreateCurrency = useCallback(() => {
    setSelectedCurrency(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCurrency = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCurrency = useCallback(
    async (id: number) => {
      try {
        await deleteCurrencyMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting currency:', error);
      }
    },
    [deleteCurrencyMutation]
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
        tableName: 'currencies',
        filters,
      });
    } catch (error) {
      console.error('Error exporting currencies:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  // Define table columns
  const currencyColumns: TableColumn<Currency>[] = [
    {
      id: 'name',
      label: 'Currency & Code',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <DollarSign className="w-5 h-5" />
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
      id: 'symbol',
      label: 'Symbol',
      render: symbol => (
        <Typography variant="body2" className="!text-gray-900 !font-mono">
          {symbol || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'exchange_rate_to_base',
      label: 'Exchange Rate',
      render: rate => (
        <Typography variant="body2" className="!text-gray-900">
          {rate ? Number(rate).toFixed(2) : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'is_base',
      label: 'Base Currency',
      render: is_base => (
        <Chip
          icon={is_base === 'Y' ? <CheckCircle /> : <Block />}
          label={is_base === 'Y' ? 'Yes' : 'No'}
          size="small"
          variant="outlined"
          color={is_base === 'Y' ? 'success' : 'default'}
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
            render: (_value: any, row: Currency) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCurrency(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCurrency(row.id)}
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
            Currency Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage currency settings, exchange rates, and base currency
            configuration
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Currencies"
          value={totalCurrencies}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Currencies"
          value={activeCurrencies}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Currencies"
          value={inactiveCurrencies}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Base Currencies"
          value={baseCurrencies}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load currencies. Please try again.
        </Alert>
      )}

      <Table
        data={currencies}
        columns={currencyColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Currencies"
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
                      value={baseFilter}
                      onChange={e => setBaseFilter(e.target.value)}
                      className="!min-w-40"
                      size="small"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="base">Base Currency</MenuItem>
                      <MenuItem value="non-base">Non-Base</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Currencies"
                    description="Are you sure you want to export the current currencies data to Excel? This will include all filtered results."
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
                    onClick={handleCreateCurrency}
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
        getRowId={currency => currency.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No currencies found matching "${search}"`
            : 'No currencies found in the system'
        }
      />

      <ManageCurrency
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCurrency
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CurrenciesManagement;
