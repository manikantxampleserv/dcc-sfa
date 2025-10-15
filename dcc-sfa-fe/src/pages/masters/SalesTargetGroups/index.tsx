import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import {
  useSalesTargetGroups,
  useDeleteSalesTargetGroup,
  type SalesTargetGroup,
} from 'hooks/useSalesTargetGroups';
import { useExportToExcel } from 'hooks/useImportExport';
import { Users, TrendingUp, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportSalesTargetGroup from './ImportSalesTargetGroup';
import ManageSalesTargetGroup from './ManageSalesTargetGroup';

const SalesTargetGroupsManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<SalesTargetGroup | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: groupsResponse,
    isLoading,
    error,
  } = useSalesTargetGroups({
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

  const groups = groupsResponse?.data || [];
  const totalCount = groupsResponse?.meta?.total || 0;
  const currentPage = (groupsResponse?.meta?.page || 1) - 1;

  const deleteGroupMutation = useDeleteSalesTargetGroup();
  const exportToExcelMutation = useExportToExcel();

  const totalGroups = groupsResponse?.stats?.total_sales_target_groups ?? 0;
  const activeGroups = groupsResponse?.stats?.active_sales_target_groups ?? 0;
  const inactiveGroups =
    groupsResponse?.stats?.inactive_sales_target_groups ?? 0;
  const groupsThisMonth =
    groupsResponse?.stats?.sales_target_groups_this_month ?? 0;

  const handleCreateGroup = useCallback(() => {
    setSelectedGroup(null);
    setDrawerOpen(true);
  }, []);

  const handleEditGroup = useCallback((group: SalesTargetGroup) => {
    setSelectedGroup(group);
    setDrawerOpen(true);
  }, []);

  const handleDeleteGroup = useCallback(
    async (id: number) => {
      try {
        await deleteGroupMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting sales target group:', error);
      }
    },
    [deleteGroupMutation]
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
        tableName: 'sales_target_groups',
        filters,
      });
    } catch (error) {
      console.error('Error exporting sales target groups:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  // Define table columns
  const groupColumns: TableColumn<SalesTargetGroup>[] = [
    {
      id: 'group_name',
      label: 'Group Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.group_name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Users className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.group_name}
            </Typography>
            {row.description && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {row.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'sales_target_group_members',
      label: 'Members',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.sales_target_group_members?.length || 0} members
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
          className="w-26"
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
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditGroup(row)}
            tooltip={`Edit ${row.group_name}`}
          />
          <DeleteButton
            onClick={() => handleDeleteGroup(row.id)}
            tooltip={`Delete ${row.group_name}`}
            itemName={row.group_name}
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
            Sales Target Groups Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage sales target groups and assign sales personnel to groups
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalGroups}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {activeGroups}
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
                Inactive Groups
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {inactiveGroups}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
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
                  {groupsThisMonth}
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
          Failed to load sales target groups. Please try again.
        </Alert>
      )}

      <Table
        data={groups}
        columns={groupColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Sales Target Groups"
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
                title="Export Sales Target Groups"
                description="Are you sure you want to export the current sales target groups data to Excel? This will include all filtered results."
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
                onClick={handleCreateGroup}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={group => group.id}
        initialOrderBy="group_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No sales target groups found matching "${search}"`
            : 'No sales target groups found in the system'
        }
      />

      <ManageSalesTargetGroup
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
      />

      <ImportSalesTargetGroup
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SalesTargetGroupsManagement;
