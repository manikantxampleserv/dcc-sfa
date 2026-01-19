import { Add, Block, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { useDeleteOrder, useOrders, type Order } from 'hooks/useOrders';
import { usePermission } from 'hooks/usePermission';
import { useCurrency } from 'hooks/useCurrency';
import {
  Calendar,
  CheckCircle as CheckCircleIcon,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportOrder from './ImportOrder';
import ManageOrder from './ManageOrder';
import { formatDate } from 'utils/dateUtils';

const OrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('order');

  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useOrders(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      enabled: isRead,
    }
  );

  const orders = ordersResponse?.data || [];
  const totalCount = ordersResponse?.meta?.total || 0;
  const currentPage = (ordersResponse?.meta?.page || 1) - 1;

  const deleteOrderMutation = useDeleteOrder();
  const exportToExcelMutation = useExportToExcel();

  const totalOrders = ordersResponse?.stats?.total_orders || 0;
  const activeOrders = ordersResponse?.stats?.active_orders || 0;
  const ordersThisMonth = ordersResponse?.stats?.orders_this_month || 0;
  const inactiveOrders = ordersResponse?.stats?.inactive_orders || 0;

  const handleCreateOrder = useCallback(() => {
    setSelectedOrder(null);
    setDrawerOpen(true);
  }, []);

  const handleEditOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }, []);

  const handleDeleteOrder = useCallback(
    async (id: number) => {
      try {
        await deleteOrderMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    },
    [deleteOrderMutation]
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
        status: statusFilter === 'all' ? undefined : statusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'orders',
        filters,
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'info',
      pending: 'warning',
      confirmed: 'info',
      processing: 'warning',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'success',
      urgent: 'error',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getApprovalColor = (status: string) => {
    const normalizedStatus = status?.slice(0, 1)?.toUpperCase();
    const colors = {
      P: 'warning',
      A: 'success',
      R: 'error',
    };
    return colors[normalizedStatus as keyof typeof colors] || 'default';
  };
  const getApprovalStatusLabel = (status: string) => {
    const normalizedStatus = status?.slice(0, 1)?.toUpperCase();
    const labels = {
      P: 'Pending',
      R: 'Pending',
      A: 'Approved',
    };
    return labels[normalizedStatus as keyof typeof labels] || 'Pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Package className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const orderColumns: TableColumn<Order>[] = [
    {
      id: 'order_number',
      label: 'Order Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.order_number}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <FileText className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight !cursor-pointer !hover:!text-primary-600 !transition-colors"
              onClick={() => navigate(`/transactions/orders/${row.id}`)}
            >
              {row.order_number}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !capitalize !text-xs !block !mt-0.5"
            >
              {row.order_type || 'regular'} order •{' '}
              {row.order_items?.length || 0} items
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer.name',
      label: 'Customer',
      render: (_value, row) => (
        <Box className="flex items-center !gap-2">
          <Avatar
            alt={row.customer?.name}
            src={row.customer?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <Typography variant="body2" className="!text-gray-900 !font-medium">
              {row.customer?.name || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.customer?.code || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'salesperson.name',
      label: 'Sales Person',
      render: (_value, row) => (
        <Box className="flex items-center !gap-2">
          <Avatar
            alt={row.salesperson?.name}
            src={row.salesperson?.profile_image || 'mkx'}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <Typography
              variant="body2"
              className="!text-gray-900 !leading-tight"
            >
              {row.salesperson?.name || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.salesperson?.email || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status & Priority',
      render: (_value, row) => (
        <Box className="flex !gap-2 items-center">
          <Chip
            icon={getStatusIcon(row.status || 'draft')}
            label={row.status || 'draft'}
            size="small"
            variant="outlined"
            className={`!text-xs !capitalize !pl-1 !justify-start`}
            color={
              getStatusColor(row.status || 'draft') as
                | 'default'
                | 'info'
                | 'success'
                | 'warning'
                | 'error'
            }
          />
          <Chip
            label={(row.priority || 'medium').toUpperCase()}
            size="small"
            variant="outlined"
            className={`!text-xs !capitalize`}
            color={
              getPriorityColor(row.priority || 'medium') as
                | 'default'
                | 'info'
                | 'error'
                | 'success'
                | 'warning'
            }
          />
        </Box>
      ),
    },
    {
      id: 'order_date',
      label: 'Dates',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            Order: {row.order_date ? formatDate(row.order_date) : 'N/A'}
          </Box>
          {row.delivery_date && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Truck className="w-4 h-4 text-gray-400 mr-1" />
              Delivery: {formatDate(row.delivery_date)}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'total_amount',
      label: 'Amount',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {formatCurrency(row.total_amount || 0)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Subtotal: {formatCurrency(row.subtotal || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'approval',
      label: 'Approval',
      render: (_value, row) => (
        <Box>
          <Chip
            label={getApprovalStatusLabel(row.approval_status as string)}
            variant="outlined"
            size="small"
            icon={
              row.approval_status?.slice(0, 1)?.toUpperCase() === 'A' ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : row.approval_status?.slice(0, 1)?.toUpperCase() === 'R' ? (
                <XCircle className="w-4 h-4" />
              ) : row.approval_status?.slice(0, 1)?.toUpperCase() === 'P' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )
            }
            className={`!capitalize !pl-0.5`}
            color={
              getApprovalColor(row.approval_status || 'P') as
                | 'default'
                | 'success'
                | 'error'
                | 'warning'
                | 'info'
            }
          />
        </Box>
      ),
    },
    ...(isUpdate || isDelete
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Order) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditOrder(row)}
                    tooltip={`Edit ${row.order_number}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteOrder(row.id)}
                    tooltip={`Delete ${row.order_number}`}
                    itemName={row.order_number}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        Error loading orders: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Order Entry</p>
          <p className="!text-gray-500 text-sm">
            Manage customer orders, track status, and process deliveries
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Orders"
          value={activeOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Orders"
          value={inactiveOrders}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Orders This Month"
          value={ordersThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load orders. Please try again.
        </Alert>
      )}

      <Table
        data={orders}
        columns={orderColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between gap-3 items-center flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Orders..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-40"
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {isRead && (
                  <div className="flex gap-2 items-center">
                    <PopConfirm
                      title="Export Orders"
                      description="Are you sure you want to export the current orders data to Excel? This will include all filtered results."
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
                      onClick={() => setImportModalOpen(true)}
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
                    onClick={handleCreateOrder}
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
        getRowId={order => order.id}
        initialOrderBy="order_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No orders found matching "${search}"`
            : 'No orders found in the system'
        }
      />

      <ManageOrder
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
      />

      <ImportOrder
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default OrdersManagement;
