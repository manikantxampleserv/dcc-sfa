import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { usePayment } from 'hooks/usePayments';
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Info,
  Plus,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';
import PaymentLinesManager from '../PaymentLinesManager';
import PaymentRefundsManager from '../PaymentRefundsManager';

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentLinesDrawerOpen, setPaymentLinesDrawerOpen] = useState(false);
  const [paymentRefundsDrawerOpen, setPaymentRefundsDrawerOpen] =
    useState(false);

  const { data: paymentResponse, isLoading, error } = usePayment(Number(id));
  const payment = paymentResponse?.data;

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Completed',
      paid: 'Paid',
      pending: 'Pending',
      processing: 'Processing',
      failed: 'Failed',
      cancelled: 'Cancelled',
      active: 'Active',
      inactive: 'Inactive',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'credit':
      case 'debit':
        return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer':
        return <RefreshCw className="w-4 h-4" />;
      case 'online':
        return <Receipt className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleBack = () => {
    navigate('/transactions/payments');
  };

  if (isLoading) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
          {/* Main Payment Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="!absolute !top-3 !right-3">
              <Skeleton
                variant="circular"
                width={10}
                height={10}
                className="!bg-green-200"
              />
            </div>

            <div className="!relative !mb-4">
              <Skeleton
                variant="circular"
                width={96}
                height={96}
                className="!mx-auto !border-3 !border-white"
              />
            </div>

            <Skeleton
              variant="text"
              width="70%"
              height={24}
              className="!mx-auto !mb-1"
            />
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              className="!mx-auto !mb-3"
            />

            <Skeleton
              variant="rectangular"
              width="60%"
              height={24}
              className="!mx-auto !mb-4 !bg-green-50"
            />

            <div className="!space-y-2 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="30%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="25%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="50%" height={14} />
              </div>
            </div>
          </div>

          {/* Payment Information Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={140} height={20} />
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                {[1, 2, 3, 4].map(field => (
                  <div key={field} className="!space-y-1">
                    <Skeleton
                      variant="text"
                      width={`${40 + field * 8}%`}
                      height={12}
                    />
                    <Skeleton
                      variant="text"
                      width={`${60 + field * 6}%`}
                      height={16}
                    />
                    {field === 1 && (
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={12}
                        className="!mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Payment Lines Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={200} height={20} />
              </div>

              <div className="!flex !items-center !justify-between !mb-4">
                <Skeleton variant="text" width={120} height={14} />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  className="!rounded"
                />
              </div>

              <div className="!space-y-3">
                {[1, 2].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between !mb-2">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="40%" height={12} />
                      </div>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={16}
                        className="!text-right"
                      />
                    </div>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={12}
                      className="!mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Refunds Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={150} height={20} />
              </div>

              <div className="!flex !items-center !justify-between !mb-4">
                <Skeleton variant="text" width={140} height={14} />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  className="!rounded"
                />
              </div>

              <div className="!space-y-3">
                {[1].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between !mb-2">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="70%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="50%" height={12} />
                      </div>
                      <div className="!text-right">
                        <Skeleton
                          variant="text"
                          width={80}
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={20}
                          className="!rounded-full"
                        />
                      </div>
                    </div>
                    <div className="!flex !items-center !justify-between !text-xs">
                      <Skeleton variant="text" width="30%" height={10} />
                      <Skeleton variant="text" width="40%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load payment details
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
          Back to Payments
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
    <>
      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  payment.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                      payment.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      payment.is_active !== 'Y',
                  }
                )}
              >
                <DollarSign className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              Payment #{payment.payment_number}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {payment.customer?.name || 'Unknown Customer'}
            </Typography>

            <Chip
              label={getStatusLabel(
                payment.is_active === 'Y' ? 'active' : 'inactive'
              )}
              className={`${getStatusColor(payment.is_active === 'Y' ? 'active' : 'inactive')} font-semibold`}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Amount
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  ${payment.total_amount?.toFixed(2)}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Payment Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.payment_date
                    ? formatDate(payment.payment_date)
                    : 'Not specified'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Method
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !capitalize !text-gray-900"
                >
                  {payment.method?.replaceAll('_', ' ')}
                </Typography>
              </div>
            </div>
          </div>

          <InfoCard title="Payment Information" icon={Info}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Customer
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.customer?.name || 'Unknown Customer'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {payment.customer?.code}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Collected By
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.collected_by_user?.name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {payment.collected_by_user?.email}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Payment Method
                </Typography>
                <div className="!flex !items-center !gap-2 !mt-1">
                  {getMethodIcon(payment.method)}
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900 !capitalize"
                  >
                    {payment.method?.replaceAll('_', ' ')}
                  </Typography>
                </div>
              </div>

              {payment.currency && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Currency
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {payment.currency.name} ({payment.currency.code})
                  </Typography>
                </div>
              )}

              {payment.reference_number && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Reference Number
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900 !font-mono"
                  >
                    {payment.reference_number}
                  </Typography>
                </div>
              )}

              {payment.notes && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Notes
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {payment.notes}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Payment Lines */}
          <InfoCard title="Payment Lines (Invoice Allocations)" icon={Receipt}>
            <div className="!flex !items-center !justify-between !mb-4">
              <Typography variant="body2" className="!text-gray-600">
                {payment.payment_lines?.length || 0} lines allocated
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus />}
                onClick={() => setPaymentLinesDrawerOpen(true)}
              >
                Manage Lines
              </Button>
            </div>

            {payment.payment_lines && payment.payment_lines.length > 0 ? (
              <div className="!space-y-2">
                {payment.payment_lines.map((line: any, index: number) => (
                  <div
                    key={line.id || index}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between">
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {line.invoice_number || `Invoice #${line.invoice_id}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {formatDate(line.invoice_date)}
                        </Typography>
                      </div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-green-600"
                      >
                        ${line.amount_applied?.toFixed(2)}
                      </Typography>
                    </div>
                    {line.notes && (
                      <Typography
                        variant="caption"
                        className="!text-gray-600 !mt-1 !block"
                      >
                        {line.notes}
                      </Typography>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="!text-center !py-8">
                <Receipt className="!text-gray-400 !text-4xl !mx-auto !mb-2" />
                <Typography variant="body2" className="!text-gray-500 !mb-4">
                  No payment lines found. Click "Manage Lines" to allocate this
                  payment to invoices.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={() => setPaymentLinesDrawerOpen(true)}
                >
                  Add Payment Line
                </Button>
              </div>
            )}
          </InfoCard>

          {/* Payment Refunds */}
          <InfoCard title="Payment Refunds" icon={RefreshCw}>
            <div className="!flex !items-center !justify-between !mb-4">
              <Typography variant="body2" className="!text-gray-600">
                {payment.payment_refunds?.length || 0} refunds processed
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus />}
                onClick={() => setPaymentRefundsDrawerOpen(true)}
              >
                Manage Refunds
              </Button>
            </div>

            {payment.payment_refunds && payment.payment_refunds.length > 0 ? (
              <div className="!space-y-2">
                {payment.payment_refunds.map((refund: any, index: number) => (
                  <div
                    key={refund.id || index}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between !mb-2">
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {refund.reason}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {formatDate(refund.refund_date)}
                        </Typography>
                      </div>
                      <div className="!text-right">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-red-600"
                        >
                          ${refund.amount?.toFixed(2)}
                        </Typography>
                        <Chip
                          label={getStatusLabel(refund.status || '')}
                          className={`${getStatusColor(refund.status || '')} font-semibold`}
                          size="small"
                        />
                      </div>
                    </div>
                    <div className="!flex !items-center !justify-between !text-xs !text-gray-500">
                      <span className="!capitalize">
                        {refund.method || 'N/A'}
                      </span>
                      {refund.reference_number && (
                        <span className="!font-mono">
                          {refund.reference_number}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!text-center !py-8">
                <RefreshCw className="!text-gray-400 !text-4xl !mx-auto !mb-2" />
                <Typography variant="body2" className="!text-gray-500 !mb-4">
                  No payment refunds found. Click "Manage Refunds" to process a
                  refund.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={() => setPaymentRefundsDrawerOpen(true)}
                >
                  Add Payment Refund
                </Button>
              </div>
            )}
          </InfoCard>
        </div>
      </div>

      {/* Management Components */}
      <PaymentLinesManager
        paymentId={Number(id)}
        drawerOpen={paymentLinesDrawerOpen}
        setDrawerOpen={setPaymentLinesDrawerOpen}
      />

      <PaymentRefundsManager
        paymentId={Number(id)}
        drawerOpen={paymentRefundsDrawerOpen}
        setDrawerOpen={setPaymentRefundsDrawerOpen}
      />
    </>
  );
};

export default PaymentDetail;
