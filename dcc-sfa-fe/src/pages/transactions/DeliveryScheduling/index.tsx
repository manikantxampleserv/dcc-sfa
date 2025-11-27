import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Package,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { usePermission } from '../../../hooks/usePermission';
import {
  useDeleteDeliverySchedule,
  useDeliverySchedules,
  type DeliverySchedule,
} from '../../../hooks/useDeliverySchedules';
import { useOrders } from '../../../hooks/useOrders';
import { useUsers } from '../../../hooks/useUsers';
import { useVehicles } from '../../../hooks/useVehicles';
import ImportDeliverySchedule from './ImportDeliverySchedule';
import ManageDeliverySchedule from './ManageDeliverySchedule';

const DeliveryScheduling: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDeliverySchedule, setSelectedDeliverySchedule] =
    useState<DeliverySchedule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('delivery-schedule');

  const {
    data: deliverySchedulesResponse,
    isLoading,
    error,
  } = useDeliverySchedules(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      isActive: 'Y',
    },
    {
      enabled: isRead,
    }
  );

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
  });

  const { data: vehiclesResponse } = useVehicles({
    page: 1,
    limit: 1000,
  });

  const { data: ordersResponse } = useOrders({
    page: 1,
    limit: 1000,
  });

  const deliverySchedules = deliverySchedulesResponse?.data || [];
  const users = usersResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];
  const orders = ordersResponse?.data || [];
  const totalCount = deliverySchedulesResponse?.meta?.total || 0;
  const currentPage = (deliverySchedulesResponse?.meta?.page || 1) - 1;

  const deleteDeliveryScheduleMutation = useDeleteDeliverySchedule();
  const exportToExcelMutation = useExportToExcel();

  const totalDeliveries =
    (deliverySchedulesResponse?.stats as any)?.total_deliveries ??
    deliverySchedules.length;
  const activeDeliveries =
    (deliverySchedulesResponse?.stats as any)?.active_deliveries ??
    deliverySchedules.filter(d => d.is_active === 'Y').length;
  const inactiveDeliveries =
    (deliverySchedulesResponse?.stats as any)?.inactive_deliveries ??
    deliverySchedules.filter(d => d.is_active === 'N').length;
  const newDeliveriesThisMonth =
    (deliverySchedulesResponse?.stats as any)?.new_deliveries_this_month || 0;

  const handleCreateDeliverySchedule = useCallback(() => {
    setSelectedDeliverySchedule(null);
    setDrawerOpen(true);
  }, []);

  const handleImportDeliverySchedules = useCallback(() => {
    setImportDrawerOpen(true);
  }, []);

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        isActive: 'Y',
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'delivery_schedules',
        filters,
      });
    } catch (error) {
      console.error('Error exporting delivery schedules:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, priorityFilter]);

  const handleEditDeliverySchedule = useCallback(
    (deliverySchedule: DeliverySchedule) => {
      setSelectedDeliverySchedule(deliverySchedule);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteDeliverySchedule = useCallback(
    async (id: number) => {
      try {
        await deleteDeliveryScheduleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting delivery schedule:', error);
      }
    },
    [deleteDeliveryScheduleMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rescheduled: 'bg-gray-100 text-gray-800',
      returned: 'bg-gray-100 text-gray-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Scheduled',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      failed: 'Failed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const deliveryScheduleColumns: TableColumn<DeliverySchedule>[] = [
    {
      id: 'order_customer',
      label: 'Order & Customer',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.customer?.name || 'Customer'}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              Order #{row.order?.order_number || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.customer?.name || 'Unknown Customer'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'scheduled_info',
      label: 'Scheduled Info',
      render: (_value, row) => (
        <Box>
          {row.scheduled_date && (
            <Box className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {new Date(row.scheduled_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          {row.scheduled_time_slot && (
            <Box className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {row.scheduled_time_slot}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'assignment',
      label: 'Vehicle & Driver',
      render: (_value, row) => (
        <Box>
          {row.vehicle && (
            <Box className="flex items-center gap-1 mb-1">
              <Truck className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {row.vehicle.vehicle_number} - {row.vehicle.type}
              </Typography>
            </Box>
          )}
          {row.driver && (
            <Box className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              <Typography variant="caption" className="!text-gray-600">
                {row.driver.name}
              </Typography>
            </Box>
          )}
          {!row.vehicle && !row.driver && (
            <Typography variant="caption" className="!text-gray-400 !italic">
              Not assigned
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status_priority',
      label: 'Status & Priority',
      render: (_value, row) => (
        <Box className="!space-y-1">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              row.status || ''
            )}`}
          >
            {getStatusLabel(row.status || '')}
          </span>
          {row.priority && (
            <div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                  row.priority
                )}`}
              >
                {getPriorityLabel(row.priority)}
              </span>
            </div>
          )}
        </Box>
      ),
    },
    {
      id: 'delivery_info',
      label: 'Delivery Info',
      render: (_value, row) => {
        const hasActualDeliveryTime = row.actual_delivery_time;
        const hasFailureReason = row.failure_reason;
        const hasDeliveryInstructions = row.delivery_instructions;

        if (
          !hasActualDeliveryTime &&
          !hasFailureReason &&
          !hasDeliveryInstructions
        ) {
          return (
            <Typography variant="caption" className="!text-gray-400 !italic">
              No info
            </Typography>
          );
        }

        return (
          <Box>
            {hasActualDeliveryTime && (
              <Box className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-green-400" />
                <Typography variant="caption" className="!text-green-600">
                  Delivered:{' '}
                  {new Date(
                    row.actual_delivery_time as string
                  ).toLocaleString()}
                </Typography>
              </Box>
            )}
            {hasFailureReason && (
              <Box className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <Typography
                  variant="caption"
                  className="!text-red-600 !truncate"
                >
                  {row.failure_reason}
                </Typography>
              </Box>
            )}
            {hasDeliveryInstructions && (
              <Typography
                variant="caption"
                className="!text-gray-600 !block !mt-1"
              >
                {row.delivery_instructions?.length &&
                row.delivery_instructions?.length > 30
                  ? `${row.delivery_instructions?.substring(0, 30)}...`
                  : row.delivery_instructions}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'is_active',
      label: 'Active Status',
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
    ...(isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: DeliverySchedule) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditDeliverySchedule(row)}
                    tooltip={`Edit delivery schedule for order ${row.order?.order_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteDeliverySchedule(row.id)}
                    tooltip={`Delete delivery schedule for order ${row.order?.order_number}`}
                    itemName={`delivery schedule for order ${row.order?.order_number}`}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const drivers = users;

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Delivery Scheduling
          </p>
          <p className="!text-gray-500 text-sm">
            Manage delivery schedules, track vehicle assignments, and monitor
            delivery status
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Deliveries"
          value={totalDeliveries}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Deliveries"
          value={activeDeliveries}
          icon={<Truck className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Deliveries"
          value={inactiveDeliveries}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newDeliveriesThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load delivery schedules. Please try again.
        </Alert>
      )}

      <Table
        data={deliverySchedules}
        columns={deliveryScheduleColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between items-center flex-wrap w-full gap-2">
              <div className="flex gap-2 items-center flex-wrap">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Delivery Schedules"
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
                      className="!min-w-40"
                      size="small"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="in_transit">In Transit</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="rescheduled">Rescheduled</MenuItem>
                      <MenuItem value="returned">Returned</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                    <Select
                      value={priorityFilter}
                      onChange={e => setPriorityFilter(e.target.value)}
                      className="!min-w-40"
                      size="small"
                    >
                      <MenuItem value="all">All Priority</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              {isRead && (
                <div className="flex items-center gap-2">
                  <PopConfirm
                    title="Export Delivery Schedules"
                    description="Are you sure you want to export the current delivery schedules data to Excel? This will include all filtered results."
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
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={handleImportDeliverySchedules}
                  >
                    Import
                  </Button>
                </div>
              )}
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Add />}
                  onClick={handleCreateDeliverySchedule}
                >
                  Schedule
                </Button>
              )}
            </div>
          ) : (
            false
          )
        }
        getRowId={deliverySchedule => deliverySchedule.id}
        initialOrderBy="scheduled_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No delivery schedules found matching "${search}"`
            : 'No delivery schedules found in the system'
        }
      />

      <ManageDeliverySchedule
        selectedDeliverySchedule={selectedDeliverySchedule}
        setSelectedDeliverySchedule={setSelectedDeliverySchedule}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        users={drivers}
        vehicles={vehicles}
        orders={orders}
      />

      <ImportDeliverySchedule
        drawerOpen={importDrawerOpen}
        setDrawerOpen={setImportDrawerOpen}
      />
    </>
  );
};

export default DeliveryScheduling;
