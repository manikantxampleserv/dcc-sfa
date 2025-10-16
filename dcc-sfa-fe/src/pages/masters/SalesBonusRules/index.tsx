import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteSalesBonusRule,
  useSalesBonusRules,
  type SalesBonusRule,
} from 'hooks/useSalesBonusRules';
import { Award, Percent, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportSalesBonusRule from './ImportSalesBonusRule';
import ManageSalesBonusRule from './ManageSalesBonusRule';

const SalesBonusRulesManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState<SalesBonusRule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: rulesResponse,
    isLoading,
    error,
  } = useSalesBonusRules({
    search,
    page,
    limit,
    status:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
          ? 'active'
          : 'inactive',
  });

  const rules = rulesResponse?.data || [];
  const totalCount = rulesResponse?.pagination?.total || 0;
  const currentPage = (rulesResponse?.pagination?.page || 1) - 1;

  const deleteRuleMutation = useDeleteSalesBonusRule();
  const exportToExcelMutation = useExportToExcel();

  const totalRules = rulesResponse?.stats?.total_rules ?? 0;
  const activeRules = rulesResponse?.stats?.active_rules ?? 0;
  const inactiveRules = rulesResponse?.stats?.inactive_rules ?? 0;
  const rulesThisMonth =
    rulesResponse?.stats?.sales_bonus_rules_this_month ?? 0;

  const handleCreateRule = useCallback(() => {
    setSelectedRule(null);
    setDrawerOpen(true);
  }, []);

  const handleEditRule = useCallback((rule: SalesBonusRule) => {
    setSelectedRule(rule);
    setDrawerOpen(true);
  }, []);

  const handleDeleteRule = useCallback(
    async (id: number) => {
      try {
        await deleteRuleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting sales bonus rule:', error);
      }
    },
    [deleteRuleMutation]
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
              ? 'active'
              : 'inactive',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'sales_bonus_rules',
        filters,
      });
    } catch (error) {
      console.error('Error exporting sales bonus rules:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  // Define table columns
  const ruleColumns: TableColumn<SalesBonusRule>[] = [
    {
      id: 'rule_info',
      label: 'Rule Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={`Rule ${row.id}`}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Award className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              Rule #{row.id}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.sales_targets?.sales_targets_groups?.group_name ||
                'Unknown Group'}{' '}
              -{' '}
              {row.sales_targets?.sales_targets_product_categories
                ?.category_name || 'Unknown Category'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'achievement_range',
      label: 'Achievement Range',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Percent className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.achievement_min_percent}% - {row.achievement_max_percent}%
          </span>
        </Box>
      ),
    },
    {
      id: 'bonus_info',
      label: 'Bonus',
      render: (_value, row) => (
        <Box className="flex flex-col items-start">
          {row.bonus_amount && (
            <Typography variant="body2" className="!text-gray-900">
              ${row.bonus_amount}
            </Typography>
          )}
          {row.bonus_percent && (
            <Typography variant="body2" className="!text-gray-900">
              {row.bonus_percent}%
            </Typography>
          )}
          {!row.bonus_amount && !row.bonus_percent && (
            <Typography variant="body2" className="!text-gray-400">
              No bonus
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'target_info',
      label: 'Target Info',
      render: (_value, row) => (
        <Box className="flex flex-col items-start">
          <Typography variant="body2" className="!text-gray-900">
            Qty: {row.sales_targets?.target_quantity || 'N/A'}
          </Typography>
          {row.sales_targets?.target_amount && (
            <Typography variant="body2" className="!text-gray-600">
              Amount: ${row.sales_targets.target_amount}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          className="w-26"
          color={row.is_active === 'Y' ? 'success' : 'error'}
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
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditRule(row)}
            tooltip={`Edit Rule ${row.id}`}
          />
          <DeleteButton
            onClick={() => handleDeleteRule(row.id)}
            tooltip={`Delete Rule ${row.id}`}
            itemName={`Rule ${row.id}`}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Sales Bonus Rules Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage bonus rules for sales target achievements
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{totalRules}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeRules}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Rules
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveRules}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {rulesThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load sales bonus rules. Please try again.
        </Alert>
      )}

      <Table
        data={rules}
        columns={ruleColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Sales Bonus Rules"
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
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <PopConfirm
                title="Export Sales Bonus Rules"
                description="Are you sure you want to export the current sales bonus rules data to Excel? This will include all filtered results."
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
                  {exportToExcelMutation.isPending ? 'Exporting...' : 'Export'}
                </Button>
              </PopConfirm>
              <Button
                variant="outlined"
                className="!capitalize"
                startIcon={<Upload />}
                onClick={() => setImportModalOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="contained"
                className="!capitalize"
                disableElevation
                startIcon={<Add />}
                onClick={handleCreateRule}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={rule => rule.id}
        initialOrderBy="achievement_min_percent"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No sales bonus rules found matching "${search}"`
            : 'No sales bonus rules found in the system'
        }
      />

      <ManageSalesBonusRule
        selectedRule={selectedRule}
        setSelectedRule={setSelectedRule}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportSalesBonusRule
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SalesBonusRulesManagement;
