import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useCurrency } from 'hooks/useCurrency';
import { usePayment } from 'hooks/usePayments';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Receipt,
  RefreshCw,
  User,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate, formatDateTime } from 'utils/dateUtils';

/**
 * Reusable InfoCard component matching application design system.
 *
 * @param {object} props Component properties.
 * @param {string} props.title Card title.
 * @param {React.ReactNode} props.children Content inside card.
 * @param {React.ElementType} [props.icon] Optional header icon.
 * @param {React.ReactNode} [props.action] Optional right-side header action.
 * @returns {React.ReactElement} Styled card with decorative gradient.
 */
const InfoCard = ({
  title,
  children,
  icon: Icon,
  action,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) => (
  <div className="!relative !overflow-hidden !rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
    <div className="!absolute !top-0 !right-0 !h-16 !w-16 !translate-x-8 !-translate-y-8 !rounded-full !bg-gradient-to-br !from-blue-50 !to-purple-50" />
    <div className="!relative !z-10">
      <div className="!mb-4 !flex !items-center !justify-between">
        <div className="!flex !items-center !gap-2">
          {Icon && (
            <div className="flex !h-10 !w-10 items-center justify-center !rounded-md !bg-primary-100 !p-1.5">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        {action}
      </div>
      {children}
    </div>
  </div>
);

/**
 * PaymentDetail Component.
 * Full page view matching the DCC-SFA detail page pattern (OrderDetail, VisitDetail).
 * Reflects read-only 100% full settlement at invoice creation.
 *
 * @returns {React.ReactElement} Payment detail page.
 */
const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const { data: paymentResponse, isLoading, error } = usePayment(Number(id));
  const payment = paymentResponse?.data;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completed',
      paid: 'Paid',
      pending: 'Pending',
      processing: 'Processing',
      failed: 'Failed',
      cancelled: 'Cancelled',
      active: 'Active',
      inactive: 'Inactive',
    };
    return labels[status.toLowerCase()] || status;
  };

  const handleBack = () => {
    navigate('/transactions/payments');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <Skeleton variant="text" width={220} height={28} />
              <Skeleton variant="text" width={160} height={16} />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton
              variant="rectangular"
              width={110}
              height={26}
              className="!rounded-full"
            />
            <Skeleton
              variant="rectangular"
              width={70}
              height={26}
              className="!rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-1 flex flex-col gap-4">
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
                <Skeleton
                  variant="rectangular"
                  width={90}
                  height={24}
                  className="!rounded-full"
                />
                <Skeleton
                  variant="rectangular"
                  width={70}
                  height={24}
                  className="!rounded-full"
                />
              </div>
              <div className="!space-y-2 !text-left !mt-4">
                <Skeleton
                  variant="rectangular"
                  height={60}
                  className="!rounded-md"
                />
                <Skeleton
                  variant="rectangular"
                  height={50}
                  className="!rounded-md"
                />
                <Skeleton
                  variant="rectangular"
                  height={50}
                  className="!rounded-md"
                />
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
                {[1, 2, 3, 4, 5, 6].map(item => (
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
                {[1, 2, 3, 4].map(item => (
                  <div key={item} className="!space-y-2">
                    <Skeleton variant="text" width="60%" height={12} />
                    <Skeleton variant="text" width="80%" height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="!rounded-lg !border !border-gray-200 !bg-white !p-6 !shadow">
              <Skeleton
                variant="text"
                width="30%"
                height={24}
                className="!mb-4"
              />
              <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div key={item} className="!space-y-2">
                    <Skeleton variant="text" width="50%" height={12} />
                    <Skeleton variant="text" width="75%" height={16} />
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
              <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
                {[1, 2, 3, 4].map(item => (
                  <div key={item} className="!space-y-2">
                    <Skeleton variant="text" width="50%" height={12} />
                    <Skeleton variant="text" width="75%" height={16} />
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
              <div className="!space-y-3">
                {[1, 2].map(item => (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    height={80}
                    className="!rounded-md"
                  />
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
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-600 p-4 text-white shadow-lg mb-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <Typography variant="h6" className="!font-bold !text-white">
              Failed to load payment details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-100">
            Unable to retrieve the requested payment collection. Please check
            your network or try again.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Payments
        </Button>
      </div>
    );
  }

  const linesCount = payment.payment_lines?.length || 0;
  const customerName =
    payment.customer?.name || payment.customer_name || 'Retail Customer';
  const customerCode = payment.customer?.code || 'N/A';
  const paymentMethodLabel = payment.method
    ? payment.method.replaceAll('_', ' ').toUpperCase()
    : 'CASH';

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h5" className="!font-bold !text-gray-900">
            Payment #{payment.payment_number}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Collected on{' '}
            {formatDateTime(payment.payment_date || payment.createdate)}
          </Typography>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            icon={<CheckCircle2 size={14} className="!text-emerald-700" />}
            label="100% Fully Paid"
            className="!bg-emerald-100 !text-emerald-800 !font-bold"
            size="small"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="!relative !rounded-lg !border !border-gray-200 !bg-white !p-6 !text-center !shadow">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  payment.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              />
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  '!bg-gradient-to-br !from-emerald-400 !to-emerald-600 !text-white'
                )}
              >
                <DollarSign className="!w-10 !h-10" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {payment.payment_number}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {customerName}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4 flex-wrap">
              <Chip
                icon={<CheckCircle2 size={14} className="!text-emerald-700" />}
                label="100% Fully Paid"
                className="!bg-emerald-100 !text-emerald-800 !font-bold"
                size="small"
              />
              <Chip
                label={paymentMethodLabel}
                className="!bg-blue-100 !text-blue-800 !font-semibold"
                size="small"
              />
            </div>

            <div className="!space-y-2 !text-left !mt-4">
              <div className="!rounded-md !bg-emerald-50 !p-3 !border !border-emerald-100">
                <Typography
                  variant="caption"
                  className="!text-emerald-700 !text-xs !uppercase !tracking-wide !mb-0.5 !block !font-semibold"
                >
                  Total Amount Paid (100%)
                </Typography>
                <Typography
                  variant="h5"
                  className="!font-bold !text-emerald-700"
                >
                  {formatCurrency(payment.total_amount || 0)}
                </Typography>
              </div>

              <div className="!rounded-md !bg-gray-50 !p-2.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Collection Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(payment.payment_date || payment.createdate)}
                </Typography>
              </div>

              <div className="!rounded-md !bg-gray-50 !p-2.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Settled Invoices
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {linesCount > 0
                    ? `${linesCount} Invoice(s) Settled`
                    : '1 Invoice (Full Settlement)'}
                </Typography>
              </div>

              <div className="!rounded-md !bg-gray-50 !p-2.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Reference Number
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {payment.reference_number ||
                    payment.slip_number ||
                    'Direct Field Settlement'}
                </Typography>
              </div>
            </div>
          </div>

          <InfoCard title="Customer Information" icon={Building2}>
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
                  {customerName}
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
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {customerCode}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Contact Person
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.customer?.contact_person || 'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Phone Number
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.customer?.phone_number ||
                    (payment.customer as any)?.phone ||
                    'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5 md:!col-span-2">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Email
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.customer?.email || 'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5 md:!col-span-2">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Address
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.customer?.address || payment.customer?.city || 'N/A'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Audit Information" icon={Info}>
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  System Record ID
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  #{payment.id}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Currency
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.currency?.name || 'Tanzanian Shilling'} (
                  {payment.currency?.code || 'TZS'})
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Created At
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDateTime(payment.createdate || payment.payment_date)}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Last Updated
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDateTime(payment.updatedate || payment.createdate)}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Auto Settled
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-emerald-700"
                >
                  Yes (At Invoice Creation)
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Sync Status
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.is_synced ? 'Synced' : 'Active'}
                </Typography>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <InfoCard title="Payment Information" icon={Receipt}>
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Payment Number
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {payment.payment_number}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Payment Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(payment.payment_date || payment.createdate)}
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
                  {paymentMethodLabel}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Reference / Cheque #
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {payment.reference_number || 'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Deposit Slip #
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {payment.slip_number || 'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Settlement Mode
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-emerald-700"
                >
                  100% Full Payment at Invoice Creation
                </Typography>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Collector Details" icon={User}>
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Collector Name
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.collected_by_user?.name || 'Sales Representative'}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Collector Email
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {payment.collected_by_user?.email || 'N/A'}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Employee ID
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-mono !font-semibold !text-gray-900"
                >
                  {payment.collected_by_user?.employee_id ||
                    `#${payment.collected_by}`}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Designation / Role
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  Route Sales Representative
                </Typography>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Settled Invoices & Line Allocations"
            icon={FileText}
            action={
              <Chip
                label="100% Settled"
                size="small"
                className="!bg-emerald-100 !text-emerald-800 !font-bold"
              />
            }
          >
            <div className="!space-y-3">
              {payment.payment_lines && payment.payment_lines.length > 0 ? (
                payment.payment_lines.map((line: any, index: number) => {
                  const inv = line.invoices;
                  const invoiceNum =
                    line.invoice_number ||
                    inv?.invoice_number ||
                    `Invoice #${line.invoice_id}`;
                  const invoiceDate = line.invoice_date || inv?.invoice_date;
                  const lineAmount =
                    Number(line.amount_applied) ||
                    Number(payment.total_amount) ||
                    0;

                  return (
                    <div
                      key={line.id || index}
                      className="!rounded-md !border !border-gray-200 !bg-gray-50 !p-3.5 hover:!bg-gray-100/80 transition-colors"
                    >
                      <div className="!mb-1 !flex !items-start !justify-between">
                        <div className="flex items-center gap-2">
                          <div className="!p-1 !bg-white !rounded !border !border-gray-200 !text-primary-600">
                            <Receipt className="!w-4 !h-4" />
                          </div>
                          <Typography
                            variant="body2"
                            className="!font-bold !text-gray-900 font-mono"
                          >
                            {invoiceNum}
                          </Typography>
                        </div>
                        <Typography
                          variant="body2"
                          className="!font-bold !text-emerald-700 text-base"
                        >
                          {formatCurrency(lineAmount)}
                        </Typography>
                      </div>

                      <div className="!flex !justify-between !items-center !text-xs !text-gray-500 !pt-1">
                        <span>
                          {invoiceDate
                            ? `Invoice Date: ${formatDate(invoiceDate)}`
                            : 'Created with invoice'}
                        </span>
                        <Chip
                          label="PAID IN FULL"
                          size="small"
                          className="!bg-emerald-100 !text-emerald-800 !text-[10px] !font-bold !h-5"
                        />
                      </div>

                      {line.notes && (
                        <Typography
                          variant="caption"
                          className="!mt-1.5 !block !text-gray-600 !pt-1 !border-t !border-gray-200"
                        >
                          {line.notes}
                        </Typography>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="!p-5 !bg-emerald-50/60 !rounded-lg !border !border-emerald-200/80 !text-center !space-y-2">
                  <Typography
                    variant="subtitle2"
                    className="!font-bold !text-emerald-950"
                  >
                    Full Invoice Clearance Recorded
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!text-emerald-800 !text-xs max-w-md !mx-auto"
                  >
                    This payment was recorded at invoice creation as a 100% full
                    settlement. All invoice dues were cleared immediately upon
                    collection.
                  </Typography>
                  <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2 text-xs">
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <span className="text-gray-500 block text-[11px]">
                        Total Due
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(payment.total_amount || 0)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <span className="text-gray-500 block text-[11px]">
                        Amount Paid
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(payment.total_amount || 0)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <span className="text-gray-500 block text-[11px]">
                        Balance Due
                      </span>
                      <span className="font-bold text-emerald-700">0.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Financial Breakdown" icon={DollarSign}>
            <div className="!grid !grid-cols-1 !gap-4 md:!grid-cols-2">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Total Invoiced Amount
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatCurrency(payment.total_amount || 0)}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Total Collected Amount
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-emerald-700"
                >
                  {formatCurrency(payment.total_amount || 0)}
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Outstanding Balance Due
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-emerald-700"
                >
                  0.00 (Fully Settled)
                </Typography>
              </div>
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-xs !tracking-wide !text-gray-500 !uppercase"
                >
                  Settlement Status
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-emerald-700"
                >
                  100% Complete Clearance
                </Typography>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Notes & Remarks" icon={FileText}>
            {payment.notes ? (
              <div className="!p-4 !bg-gray-50 !rounded-md !border-l-4 !border-primary-500">
                <Typography variant="body2" className="!text-gray-800 !italic">
                  "{payment.notes}"
                </Typography>
              </div>
            ) : (
              <Typography variant="body2" className="!text-gray-500 !italic">
                No additional notes or remarks recorded for this payment.
              </Typography>
            )}
          </InfoCard>

          <InfoCard title="Refunds & Adjustments" icon={RefreshCw}>
            {payment.payment_refunds && payment.payment_refunds.length > 0 ? (
              <div className="!space-y-2">
                {payment.payment_refunds.map((refund: any, index: number) => (
                  <div
                    key={refund.id || index}
                    className="!rounded-md !border !border-gray-200 !bg-gray-50 !p-3 !flex !items-center !justify-between"
                  >
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {refund.reason || 'Refund adjustment'}
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(refund.refund_date)} ·{' '}
                        {refund.method || 'N/A'}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography
                        variant="body2"
                        className="!font-bold !text-red-600"
                      >
                        {formatCurrency(refund.amount)}
                      </Typography>
                      <Chip
                        label={getStatusLabel(refund.status || 'processed')}
                        size="small"
                        className="!text-[10px] !h-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!flex !items-center !gap-3 !p-3 !bg-gray-50 !border !border-gray-200 !rounded-md !text-gray-700 !text-sm">
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 flex-shrink-0"
                />
                <span>
                  No refunds or adjustments recorded. Net collection{' '}
                  <strong>{formatCurrency(payment.total_amount || 0)}</strong>{' '}
                  remains 100% settled.
                </span>
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
