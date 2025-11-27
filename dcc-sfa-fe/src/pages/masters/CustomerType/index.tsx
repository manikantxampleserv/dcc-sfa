import { Add, Block, CheckCircle, Download } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Building2, Tag } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useCustomerTypes,
  useDeleteCustomerType,
  type CustomerType,
} from '../../../hooks/useCustomerType';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ManageCustomerType from './ManageCustomerType';

const CustomerTypePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomerType, setSelectedCustomerType] =
    useState<CustomerType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('customer-type');

  const {
    data: customerTypesResponse,
    isLoading,
    error,
  } = useCustomerTypes(
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

  const customerTypes = customerTypesResponse?.data || [];
  const totalCount = customerTypesResponse?.meta?.total || 0;
  const currentPage = (customerTypesResponse?.meta?.page || 1) - 1;

  const deleteCustomerTypeMutation = useDeleteCustomerType();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = customerTypesResponse?.stats;
  const totalCustomerTypes = stats?.total || customerTypes.length;
  const activeCustomerTypes =
    stats?.active || customerTypes.filter(ct => ct.is_active === 'Y').length;
  const inactiveCustomerTypes =
    stats?.inactive || customerTypes.filter(ct => ct.is_active === 'N').length;
  const newCustomerTypesThisMonth = stats?.new_this_month || 0;

  const handleCreateCustomerType = useCallback(() => {
    setSelectedCustomerType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCustomerType = useCallback((customerType: CustomerType) => {
    setSelectedCustomerType(customerType);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCustomerType = useCallback(
    async (id: number) => {
      try {
        await deleteCustomerTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting customer type:', error);
      }
    },
    [deleteCustomerTypeMutation]
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
        tableName: 'customer_type',
        filters,
      });
    } catch (error) {
      console.error('Error exporting customer types:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const customerTypeColumns: TableColumn<CustomerType>[] = [
    {
      id: 'type_name',
      label: 'Type Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.type_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Tag className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.type_name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.type_code}
            </Typography>
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
            render: (_value: any, row: CustomerType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCustomerType(row)}
                    tooltip={`Edit ${row.type_name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCustomerType(row.id)}
                    tooltip={`Delete ${row.type_name}`}
                    itemName={row.type_name}
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
            Customer Type Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage customer types and their associations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Types"
          value={totalCustomerTypes}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Types"
          value={activeCustomerTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Types"
          value={inactiveCustomerTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newCustomerTypesThisMonth}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load customer types. Please try again.
        </Alert>
      )}

      <Table
        data={customerTypes}
        columns={customerTypeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Customer Types..."
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
                    title="Export Customer Types"
                    description="Are you sure you want to export the current customer types data to Excel? This will include all filtered results."
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
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateCustomerType}
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
        getRowId={customerType => customerType.id}
        initialOrderBy="type_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No customer types found matching "${search}"`
            : 'No customer types found in the system'
        }
      />

      <ManageCustomerType
        selectedCustomerType={selectedCustomerType}
        setSelectedCustomerType={setSelectedCustomerType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default CustomerTypePage;
