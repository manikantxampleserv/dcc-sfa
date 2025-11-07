import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useOrder } from 'hooks/useOrders';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Info,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : 0;

  const { data: orderResponse, isLoading, error } = useOrder(orderId);
  const orderData = orderResponse?.data;

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Package className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getApprovalColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleBack = () => {
    navigate('/transactions/orders');
  };

  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <Skeleton
              variant="circular"
              width={96}
              height={96}
              className="!mx-auto !mb-4"
            />
            <Skeleton
              variant="text"
              width="70%"
              height={24}
              className="!mx-auto !mb-2"
            />
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              className="!mx-auto !mb-3"
            />
            <div className="!flex !justify-center !gap-2 !mb-4">
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={80} height={24} />
            </div>
            <div className="!space-y-1 !text-left !mt-4">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                className="!mb-2"
              />
              <Skeleton variant="rectangular" width="100%" height={60} />
            </div>
          </div>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              {[1, 2, 3].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="!flex-4 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Skeleton
              variant="text"
              width="30%"
              height={24}
              className="!mb-4"
            />
            <div className="!space-y-2">
              {[1, 2, 3].map(item => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  width="100%"
                  height={80}
                />
              ))}
            </div>
          </div>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Skeleton
              variant="text"
              width="30%"
              height={24}
              className="!mb-4"
            />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="!p-6">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load order details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-200">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="mt-4"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-2 !mb-4">
          {Icon && (
            <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex items-start gap-4">
      <div className="!flex-2 flex flex-col gap-4">
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
          <div className="!relative !mb-4">
            <Avatar
              className={classNames(
                '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                {
                  '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                    orderData.status === 'delivered',
                  '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                    orderData.status === 'confirmed' ||
                    orderData.status === 'processing',
                  '!bg-gradient-to-br !from-indigo-400 !to-indigo-600 !text-white':
                    orderData.status === 'shipped',
                  '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white':
                    orderData.status === 'cancelled',
                  '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                    orderData.status === 'draft' ||
                    orderData.status === 'pending',
                }
              )}
            >
              <ShoppingCart className="!w-8 !h-8" />
            </Avatar>
          </div>

          <Typography variant="h6" className="!font-bold !text-gray-900 !mb-1">
            {orderData.order_number}
          </Typography>

          <Typography variant="body2" className="!text-gray-600 !mb-3">
            {orderData.customer?.name || 'Unknown Customer'}
          </Typography>

          <div className="!flex !justify-center !gap-2 !mb-4">
            <Chip
              icon={getStatusIcon(orderData.status || 'draft')}
              label={getStatusLabel(orderData.status || 'draft')}
              className={`${getStatusColor(orderData.status || 'draft')} font-semibold`}
              size="small"
            />
            <Chip
              label={(orderData.priority || 'medium').toUpperCase()}
              className={`${getPriorityColor(orderData.priority || 'medium')} font-semibold`}
              size="small"
            />
            <Chip
              label={orderData.approval_status || 'pending'}
              className={`${getApprovalColor(orderData.approval_status || 'pending')} font-semibold`}
              size="small"
            />
          </div>

          <div className="!space-y-1 !text-left !mt-4">
            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Total Amount
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.total_amount)}
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Items Count
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {orderData.order_items?.length || 0} items
              </Typography>
            </div>
          </div>
        </div>
        <InfoCard title="Order Information" icon={Info}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Order Date
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(orderData.order_date)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Delivery Date
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(orderData.delivery_date)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Order Type
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900 !capitalize"
              >
                {orderData.order_type || 'regular'}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Payment Method
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900 !capitalize"
              >
                {orderData.payment_method?.replaceAll('_', ' ') || 'N/A'}
              </Typography>
            </div>
            <div className="!space-y-0.5 md:!col-span-2">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Payment Terms
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {orderData.payment_terms || 'N/A'}
              </Typography>
            </div>
          </div>
        </InfoCard>
        <InfoCard title="Customer Information" icon={Package}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Customer Name
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {orderData.customer?.name || 'N/A'}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Customer Code
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {orderData.customer?.code || 'N/A'}
              </Typography>
            </div>
            <div className="!space-y-0.5 md:!col-span-2">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Customer Type
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900 !capitalize"
              >
                {orderData.customer?.type || 'N/A'}
              </Typography>
            </div>
          </div>
        </InfoCard>
      </div>

      <div className="!flex-4 flex flex-col gap-4">
        <InfoCard title="Order Items" icon={Package}>
          <div className="!space-y-2">
            {orderData.order_items && orderData.order_items.length > 0 ? (
              orderData.order_items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                >
                  <div className="!flex !justify-between !items-start !mb-1">
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {item.product_name || `Product #${item.product_id}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {formatCurrency(item.total_amount)}
                    </Typography>
                  </div>
                  <div className="!flex !justify-between !text-xs !text-gray-500">
                    <span>
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      {item.unit && ` (${item.unit})`}
                    </span>
                    {item.discount_amount && item.discount_amount > 0 && (
                      <span className="!text-green-600">
                        Discount: -{formatCurrency(item.discount_amount)}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <Typography
                      variant="caption"
                      className="!text-gray-600 !block !mt-1"
                    >
                      {item.notes}
                    </Typography>
                  )}
                </div>
              ))
            ) : (
              <Typography
                variant="body2"
                className="!text-gray-500 !text-center !py-4"
              >
                No items found
              </Typography>
            )}
          </div>
        </InfoCard>
        <InfoCard title="Amount Breakdown" icon={DollarSign}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Subtotal
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.subtotal)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Discount
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-green-600"
              >
                -{formatCurrency(orderData.discount_amount)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Tax
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.tax_amount)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Shipping
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.shipping_amount)}
              </Typography>
            </div>
            <div className="!space-y-0.5 md:!col-span-2">
              <div className="!border-t !border-gray-300 !pt-2 !mt-2">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Total
                </Typography>
                <Typography variant="subtitle2" className="!font-bold">
                  {formatCurrency(orderData.total_amount)}
                </Typography>
              </div>
            </div>
          </div>
        </InfoCard>

        {orderData.notes && (
          <InfoCard title="Notes" icon={FileText}>
            <Typography variant="body2" className="!text-gray-700">
              {orderData.notes}
            </Typography>
          </InfoCard>
        )}

        {orderData.shipping_address && (
          <InfoCard title="Shipping Address" icon={Info}>
            <Typography variant="body2" className="!text-gray-700">
              {orderData.shipping_address}
            </Typography>
          </InfoCard>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
