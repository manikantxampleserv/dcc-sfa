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
        return <Package className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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
    const normalizedStatus = status?.slice(0, 1)?.toUpperCase();
    const colors = {
      P: 'bg-yellow-100 text-yellow-800',
      A: 'bg-green-100 text-green-800',
      R: 'bg-red-100 text-red-800',
    };
    return (
      colors[normalizedStatus as keyof typeof colors] ||
      'bg-gray-100 text-gray-800'
    );
  };

  const getApprovalLabel = (status: string) => {
    const normalizedStatus = status?.slice(0, 1)?.toUpperCase();
    const labels = {
      P: 'Pending',
      A: 'Approved',
      R: 'Rejected',
    };
    return labels[normalizedStatus as keyof typeof labels] || status || 'N/A';
  };

  const getApprovalIcon = (status: string) => {
    const normalizedStatus = status?.slice(0, 1)?.toUpperCase();
    if (normalizedStatus === 'A') return <CheckCircle className="h-4 w-4" />;
    if (normalizedStatus === 'R') return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatCurrency = (
    amount: number | null | undefined,
    currency = 'USD'
  ) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleBack = () => {
    navigate('/transactions/orders');
  };

  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex !flex-2 flex-col gap-4">
          <div className="!relative !rounded-lg !border !border-gray-200 !bg-white !p-6 !text-center !shadow">
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
            <div className="!mb-4 !flex !justify-center !gap-2">
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={80} height={24} />
            </div>
            <div className="!mt-4 !space-y-1 !text-left">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                className="!mb-2"
              />
              <Skeleton variant="rectangular" width="100%" height={60} />
            </div>
          </div>

          <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              {[1, 2, 3].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex !flex-4 flex-col gap-4">
          <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
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

          <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              className="!mb-4"
            />
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="!space-y-2">
                  <Skeleton variant="text" width="60%" height={12} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
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
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-pink-600 to-red-600 p-6 text-white shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <Typography variant="h6" className="!font-bold !text-white">
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

  const currencyCode = orderData?.currency?.code || 'USD';

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!relative !overflow-hidden !rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
      <div className="!absolute !top-0 !right-0 !h-16 !w-16 !translate-x-8 !-translate-y-8 !rounded-full !bg-gradient-to-br !from-blue-50 !to-purple-50"></div>
      <div className="!relative !z-10">
        <div className="!mb-4 !flex !items-center !gap-2">
          {Icon && (
            <div className="flex !h-10 !w-10 items-center justify-center !rounded-md !bg-primary-100 !p-1.5">
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
      <div className="flex !flex-2 flex-col gap-4">
        <div className="!relative !rounded-lg !border !border-gray-200 !bg-white !p-6 !text-center !shadow">
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
              <ShoppingCart className="!h-8 !w-8" />
            </Avatar>
          </div>

          <Typography variant="h6" className="!mb-1 !font-bold !text-gray-900">
            {orderData.order_number}
          </Typography>

          <Typography variant="body2" className="!mb-3 !text-gray-600">
            {orderData.customer?.name || 'Unknown Customer'}
          </Typography>

          <div className="!mb-4 !flex !justify-center !gap-2">
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
              icon={getApprovalIcon(orderData.approval_status || 'P')}
              label={getApprovalLabel(orderData.approval_status || 'P')}
              className={`${getApprovalColor(orderData.approval_status || 'P')} font-semibold`}
              size="small"
            />
          </div>

          <div className="!mt-4 !space-y-1 !text-left">
            <div className="!rounded-md !bg-gray-50 !p-2">
              <Typography
                variant="caption"
                className="!mb-0.5 !text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Total Amount
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.total_amount, currencyCode)}
              </Typography>
            </div>

            <div className="!rounded-md !bg-gray-50 !p-2">
              <Typography
                variant="caption"
                className="!mb-0.5 !text-xs !tracking-wide !text-gray-500 !uppercase"
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
          <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Approval Status
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {getApprovalLabel(orderData.approval_status || 'P')}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Approved At
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {orderData.approved_at
                  ? formatDate(orderData.approved_at)
                  : 'N/A'}
              </Typography>
            </div>
          </div>
        </InfoCard>
        <InfoCard title="Customer Information" icon={Package}>
          <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
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

      <div className="flex !flex-4 flex-col gap-4">
        <InfoCard title="Order Items" icon={Package}>
          <div className="!space-y-2">
            {orderData.order_items && orderData.order_items.length > 0 ? (
              orderData.order_items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="!rounded-md !border !border-gray-200 !bg-gray-50 !p-3"
                >
                  <div className="!mb-1 !flex !items-start !justify-between">
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
                      {formatCurrency(item.total_amount, currencyCode)}
                    </Typography>
                  </div>
                  <div className="!flex !justify-between !text-xs !text-gray-500">
                    <span>
                      Qty: {item.quantity} ×{' '}
                      {formatCurrency(item.unit_price, currencyCode)}
                      {item.unit && ` (${item.unit})`}
                    </span>
                  </div>
                  {Array.isArray((item as any).product_batches) &&
                    (item as any).product_batches.length > 0 && (
                      <div className="!mt-2 !text-xs !text-gray-600">
                        <span className="!font-semibold">Batches:</span>{' '}
                        {(item as any).product_batches
                          .filter((b: any) => Number(b?.quantity || 0) > 0)
                          .map((b: any, idx: number) => {
                            const label =
                              b?.batch_number ||
                              b?.lot_number ||
                              `Batch ${idx + 1}`;
                            return `${label} (${b?.quantity})`;
                          })
                          .join(', ') || 'N/A'}
                      </div>
                    )}
                  {Array.isArray((item as any).product_serials) &&
                    (item as any).product_serials.length > 0 && (
                      <div className="!mt-1 !text-xs !text-gray-600">
                        <span className="!font-semibold">Serials:</span>{' '}
                        {(item as any).product_serials
                          .filter((s: any) => s?.selected !== false)
                          .map((s: any) => s?.serial_number)
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </div>
                    )}
                  {item.notes && (
                    <Typography
                      variant="caption"
                      className="!mt-1 !block !text-gray-600"
                    >
                      {item.notes}
                    </Typography>
                  )}
                </div>
              ))
            ) : (
              <Typography
                variant="body2"
                className="!py-4 !text-center !text-gray-500"
              >
                No items found
              </Typography>
            )}
          </div>
        </InfoCard>
        <InfoCard title="Amount Breakdown" icon={DollarSign}>
          <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Subtotal
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.subtotal, currencyCode)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Discount
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-green-600"
              >
                -{formatCurrency(orderData.discount_amount, currencyCode)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Tax
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.tax_amount, currencyCode)}
              </Typography>
            </div>
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-xs !tracking-wide !text-gray-500 !uppercase"
              >
                Shipping
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrency(orderData.shipping_amount, currencyCode)}
              </Typography>
            </div>
            <div className="!space-y-0.5 md:!col-span-2">
              <div className="!mt-2 !border-t !border-gray-300 !pt-2">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Total
                </Typography>
                <Typography variant="subtitle2" className="!font-bold">
                  {formatCurrency(orderData.total_amount, currencyCode)}
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
