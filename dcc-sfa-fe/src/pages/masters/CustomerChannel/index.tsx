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
  useCustomerChannels,
  useDeleteCustomerChannel,
  type CustomerChannel,
} from '../../../hooks/useCustomerChannel';
import { useExportToExcel } from '../../../hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { formatDate } from '../../../utils/dateUtils';
import ManageCustomerChannel from './ManageCustomerChannel';

const CustomerChannelPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomerChannel, setSelectedCustomerChannel] =
    useState<CustomerChannel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('customer-channel');

  const {
    data: customerChannelsResponse,
    isLoading,
    error,
  } = useCustomerChannels(
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

  const customerChannels = customerChannelsResponse?.data || [];
  const totalCount = customerChannelsResponse?.meta?.total || 0;
  const currentPage = (customerChannelsResponse?.meta?.page || 1) - 1;

  const deleteCustomerChannelMutation = useDeleteCustomerChannel();
  const exportToExcelMutation = useExportToExcel();

  const stats: any = customerChannelsResponse?.stats;
  const totalCustomerChannels = stats?.total || customerChannels.length;
  const activeCustomerChannels =
    stats?.active || customerChannels.filter(cc => cc.is_active === 'Y').length;
  const inactiveCustomerChannels =
    stats?.inactive ||
    customerChannels.filter(cc => cc.is_active === 'N').length;
  const newCustomerChannelsThisMonth = stats?.new_this_month || 0;

  const handleCreateCustomerChannel = useCallback(() => {
    setSelectedCustomerChannel(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCustomerChannel = useCallback(
    (customerChannel: CustomerChannel) => {
      setSelectedCustomerChannel(customerChannel);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteCustomerChannel = useCallback(
    async (id: number) => {
      try {
        await deleteCustomerChannelMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting outlet channel:', error);
      }
    },
    [deleteCustomerChannelMutation]
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
        tableName: 'customer_channel',
        filters,
      });
    } catch (error) {
      console.error('Error exporting outlet channels:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const customerChannelColumns: TableColumn<CustomerChannel>[] = [
    {
      id: 'channel_name',
      label: 'Channel Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.channel_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Tag className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !font-medium"
            >
              {row.channel_name}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.channel_code}
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
            render: (_value: any, row: CustomerChannel) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCustomerChannel(row)}
                    tooltip={`Edit ${row.channel_name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCustomerChannel(row.id)}
                    tooltip={`Delete ${row.channel_name}`}
                    itemName={row.channel_name}
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
            Outlet Channel Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage outlet channels and their associations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Channels"
          value={totalCustomerChannels}
          icon={<Tag className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Channels"
          value={activeCustomerChannels}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Channels"
          value={inactiveCustomerChannels}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newCustomerChannelsThisMonth}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load outlet channels. Please try again.
        </Alert>
      )}

      <Table
        data={customerChannels}
        columns={customerChannelColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Outlet Channels..."
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
                    title="Export Outlet Channels"
                    description="Are you sure you want to export the current outlet channels data to Excel? This will include all filtered results."
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
                    onClick={handleCreateCustomerChannel}
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
        getRowId={customerChannel => customerChannel.id}
        initialOrderBy="channel_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No outlet channels found matching "${search}"`
            : 'No outlet channels found in the system'
        }
      />

      <ManageCustomerChannel
        selectedCustomerChannel={selectedCustomerChannel}
        setSelectedCustomerChannel={setSelectedCustomerChannel}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default CustomerChannelPage;
