import { Add, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  AlertTriangle,
  Calendar,
  CheckCircle as CheckCircleIcon,
  Clock,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useDeleteOrder,
  useOrders,
  type Order,
} from '../../../hooks/useOrders';
import ImportOrder from './ImportOrder';
import ManageOrder from './ManageOrder';

const OrdersManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useOrders({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const orders = ordersResponse?.data || [];
  const totalCount = ordersResponse?.meta?.total || 0;
  const currentPage = (ordersResponse?.meta?.page || 1) - 1;

  const deleteOrderMutation = useDeleteOrder();
  const exportToExcelMutation = useExportToExcel();

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;
  const pendingApproval = orders.filter(
    o => o.approval_status === 'pending'
  ).length;

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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '!bg-gray-100 !text-gray-800',
      pending: '!bg-yellow-100 !text-yellow-800',
      confirmed: '!bg-blue-100 !text-blue-800',
      processing: '!bg-purple-100 !text-purple-800',
      shipped: '!bg-indigo-100 !text-indigo-800',
      delivered: '!bg-green-100 !text-green-800',
      cancelled: '!bg-red-100 !text-red-800',
    };
    return (
      colors[status as keyof typeof colors] || '!bg-gray-100 !text-gray-800'
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '!bg-green-100 !text-green-800',
      medium: '!bg-yellow-100 !text-yellow-800',
      high: '!bg-orange-100 !text-orange-800',
      urgent: '!bg-red-100 !text-red-800',
    };
    return (
      colors[priority as keyof typeof colors] || '!bg-gray-100 !text-gray-800'
    );
  };

  const getApprovalColor = (status: string) => {
    const colors = {
      pending: '!bg-yellow-100 !text-yellow-800',
      approved: '!bg-green-100 !text-green-800',
      rejected: '!bg-red-100 !text-red-800',
    };
    return (
      colors[status as keyof typeof colors] || '!bg-gray-100 !text-gray-800'
    );
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
      id: 'order_info',
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
              className="!text-gray-900 !leading-tight"
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
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => (
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
          {row.customer?.type && (
            <Chip
              label={row.customer.type}
              size="small"
              className={`!text-xs !mt-1 ${
                row.customer.type === 'distributor'
                  ? '!bg-purple-100 !text-purple-800'
                  : row.customer.type === 'retailer'
                    ? '!bg-blue-100 !text-blue-800'
                    : '!bg-green-100 !text-green-800'
              }`}
            />
          )}
        </Box>
      ),
    },
    {
      id: 'salesperson',
      label: 'Sales erson',
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
            className={`!text-xs !capitalize ${getStatusColor(row.status || 'draft')} !min-w-20`}
          />
          <Chip
            label={(row.priority || 'medium').toUpperCase()}
            size="small"
            className={`!text-xs !capitalize ${getPriorityColor(row.priority || 'medium')} !min-w-20`}
          />
        </Box>
      ),
    },
    {
      id: 'dates',
      label: 'Dates',
      render: (_value, row) => (
        <Box>
          <Box className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            Order:{' '}
            {row.order_date
              ? new Date(row.order_date).toLocaleDateString()
              : 'N/A'}
          </Box>
          {row.delivery_date && (
            <Box className="flex items-center text-sm text-gray-500 mt-1">
              <Truck className="w-4 h-4 text-gray-400 mr-1" />
              Delivery: {new Date(row.delivery_date).toLocaleDateString()}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" className="!text-gray-900 !font-medium">
            {formatCurrency(row.total_amount)}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            Subtotal: {formatCurrency(row.subtotal)}
          </Typography>
          {row.discount_amount && row.discount_amount > 0 && (
            <Typography
              variant="caption"
              className="!text-green-600 !text-xs !block !mt-0.5"
            >
              Discount: -{formatCurrency(row.discount_amount)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'approval',
      label: 'Approval',
      render: (_value, row) => (
        <Box>
          <Chip
            label={row.approval_status || 'pending'}
            size="small"
            className={`!text-xs !capitalize ${getApprovalColor(row.approval_status || 'pending')} !min-w-20`}
          />
          {row.approved_at && (
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-1"
            >
              by {row.salesperson?.name || 'N/A'}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditOrder(row)}
            tooltip={`Edit ${row.order_number}`}
          />
          <DeleteButton
            onClick={() => handleDeleteOrder(row.id)}
            tooltip={`Delete ${row.order_number}`}
            itemName={row.order_number}
            confirmDelete={true}
          />
        </div>
      ),
    },
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
          <p className="!font-bold text-xl !text-gray-900">Orders Management</p>
          <p className="!text-gray-500 text-sm">
            Manage customer orders, track status, and process deliveries
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Orders
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalOrders}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">Total Value</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalValue)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Avg Order Value
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(avgOrderValue)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Pending Approval
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-orange-600">
                  {pendingApproval}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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
          <div className="flex justify-between gap-3 items-center flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
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
            </div>
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
                onClick={handleCreateOrder}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={order => order.id}
        initialOrderBy="order_number"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
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
