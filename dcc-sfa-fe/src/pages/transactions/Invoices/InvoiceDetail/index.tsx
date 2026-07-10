import { Avatar, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useInvoice, type Invoice } from 'hooks/useInvoices';
import {
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  FileText,
  Info,
  Package,
  Receipt,
} from 'lucide-react';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import { formatCurrency, type Currency } from 'utils/currencyUtils';
import { formatDateTime } from 'utils/dateUtils';

interface InvoiceDetailProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  open,
  onClose,
  invoice,
}) => {
  const {
    data: invoiceResponse,
    isLoading,
    error,
  } = useInvoice(invoice?.id || 0);
  const invoiceData = invoiceResponse?.data || invoice;

  // const getStatusColor = (status: string) => {
  //   const colors = {
  //     draft: 'bg-gray-100 text-gray-800',
  //     sent: 'bg-blue-100 text-blue-800',
  //     paid: 'bg-green-100 text-green-800',
  //     overdue: 'bg-red-100 text-red-800',
  //     cancelled: 'bg-gray-100 text-gray-800',
  //   };
  //   return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  // };

  // const getStatusLabel = (status: string) => {
  //   const labels = {
  //     draft: 'Draft',
  //     sent: 'Sent',
  //     paid: 'Paid',
  //     overdue: 'Overdue',
  //     cancelled: 'Cancelled',
  //   };
  //   return labels[status as keyof typeof labels] || status;
  // };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'draft':
  //       return <FileText className="w-4 h-4" />;
  //     case 'sent':
  //       return <Clock className="w-4 h-4" />;
  //     case 'paid':
  //       return <CheckCircle className="w-4 h-4" />;
  //     case 'overdue':
  //       return <AlertTriangle className="w-4 h-4" />;
  //     case 'cancelled':
  //       return <XCircle className="w-4 h-4" />;
  //     default:
  //       return <FileText className="w-4 h-4" />;
  //   }
  // };

  const formatCurrencyWithInvoiceCurrency = (
    amount: number | null | undefined
  ) => {
    if (amount === null || amount === undefined) return 'N/A';

    const currencyId = invoiceData?.currency_id || 1;
    const currencies: Currency[] = [];

    return formatCurrency(amount, undefined, currencies, currencyId);
  };

  // const isOverdue = (invoice: Invoice) => {
  //   if (!invoice.due_date || !invoice.balance_due) return false;
  //   return new Date(invoice.due_date) < new Date() && invoice.balance_due > 0;
  // };

  const handleBack = () => {
    onClose();
  };

  if (isLoading) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Invoice Details"
        size="large"
      >
        <div className="!p-6 !space-y-6">
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
            <Skeleton
              variant="rectangular"
              width="60%"
              height={24}
              className="!mx-auto"
            />
          </div>

          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6"
              >
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  className="!mb-4"
                />
                <div className="!space-y-3">
                  {[1, 2, 3].map(field => (
                    <div key={field} className="!flex !justify-between">
                      <Skeleton variant="text" width="30%" height={16} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CustomDrawer>
    );
  }

  if (error || !invoiceData) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Invoice Details"
        size="large"
      >
        <div className="!p-6">
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 text-white relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <Typography variant="h6" className="!text-white !font-bold">
                Failed to load invoice details
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
            Back to Invoices
          </Button>
        </div>
      </CustomDrawer>
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
    <CustomDrawer
      open={open}
      setOpen={onClose}
      title="Invoice Details"
      size="large"
    >
      <div className="!p-5 mb-10 !space-y-5">
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
          <div className="absolute top-3 right-3">
            <div
              className={`!w-2.5 !h-2.5 !rounded-full ${
                invoiceData.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
              }`}
            ></div>
          </div>

          <div className="!relative !mb-4">
            <Avatar
              className={classNames(
                '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                {
                  '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                    invoiceData.status === 'paid',
                  '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                    invoiceData.status === 'sent',
                  '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white':
                    invoiceData.status === 'overdue',
                  '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                    invoiceData.status === 'draft' ||
                    invoiceData.status === 'cancelled',
                }
              )}
            >
              <Receipt className="!w-8 !h-8" />
            </Avatar>
          </div>

          <Typography variant="h6" className="!font-bold !text-gray-900 !mb-1">
            {invoiceData.invoice_number}
          </Typography>

          <Typography variant="body2" className="!text-gray-600 !mb-3">
            {invoiceData.customer?.name || 'Unknown Customer'}
          </Typography>

          <div className="!flex !justify-center !gap-2 !mb-4">
            {formatDateTime(invoiceData.invoice_date)}
          </div>

          {/* <div className="!space-y-1 !text-left !mt-4">
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
                {formatCurrencyWithInvoiceCurrency(invoiceData.total_amount)}
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Amount Paid
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-green-600"
              >
                {formatCurrencyWithInvoiceCurrency(
                  invoiceData.balance_due === 0
                    ? invoiceData.total_amount
                    : invoiceData.amount_paid
                )}
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Balance Due
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-red-600"
              >
                {formatCurrencyWithInvoiceCurrency(invoiceData.balance_due)}
              </Typography>
            </div>
          </div> */}
        </div>

        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
          {/* <InfoCard title="Invoice Information" icon={Info}> */}
          {/* <div className="!space-y-3"> */}
          {/* <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Invoice Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(invoiceData.invoice_date)}
                </Typography>
              </div> */}
          {/* <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Due Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(invoiceData.due_date) || (
                    <span className="!text-gray-500 font-normal">
                      No Due Date
                    </span>
                  )}
                </Typography>
              </div> */}
          {/* <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Payment Method:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !capitalize"
                >
                  {invoiceData.payment_method?.replaceAll('_', ' ') || 'N/A'}
                </Typography>
              </div> */}
          {/* {invoiceData.parent_id && (
                <div className="!flex !justify-between">
                  <Typography variant="body2" className="!text-gray-600">
                    Order Number:
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    #{invoiceData.parent_id}
                  </Typography>
                </div>
              )} */}
          {/* </div> */}
          {/* </InfoCard> */}

          <InfoCard title="Customer Information" icon={Package}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Customer Name:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {invoiceData.customer?.name || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Customer Code:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {invoiceData.customer?.code || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Customer Type:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !capitalize"
                >
                  {invoiceData.customer?.type || 'N/A'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Invoice Items" icon={Package}>
            <div className="!space-y-2">
              {invoiceData.invoice_items &&
              invoiceData.invoice_items.length > 0 ? (
                invoiceData.invoice_items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !justify-between !items-start !mb-1">
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {item.product?.name ||
                            item.product_name ||
                            `Product #${item.product_id}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !block !mt-0.5"
                        >
                          Tracking:{' '}
                          {item.tracking_type ||
                            item.product?.tracking_type ||
                            'None'}
                        </Typography>
                      </div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {formatCurrencyWithInvoiceCurrency(
                          (item.quantity || item.base_quantity || 1) *
                            item.unit_price -
                            (item.discount_amount || 0)
                        )}
                      </Typography>
                    </div>
                    <div className="!flex !justify-between !text-xs !text-gray-500">
                      <span>
                        Qty: {item.quantity || item.base_quantity}{' '}
                        {item.quantity
                          ? 'Crates x '
                          : item.base_quantity
                            ? 'PCs x '
                            : ''}
                        {formatCurrencyWithInvoiceCurrency(item.unit_price)}
                      </span>
                      {item.discount_amount && item.discount_amount > 0 ? (
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-green-600"
                        >
                          Discount: -{formatCurrency(item.discount_amount)}
                        </Typography>
                      ) : null}
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
        </div>
        <InfoCard title="Amount Breakdown" icon={DollarSign}>
          <div className="!space-y-3">
            <div className="!flex !justify-between">
              <Typography variant="body2" className="!text-gray-600">
                Subtotal:
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrencyWithInvoiceCurrency(
                  invoiceData.subtotal ||
                    Number(invoiceData.total_amount) -
                      Number(invoiceData.tax_amount) +
                      Number(invoiceData.discount_amount)
                )}
              </Typography>
            </div>
            <div className="!flex !justify-between">
              <Typography variant="body2" className="!text-gray-600">
                Discount:
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-green-600"
              >
                -
                {formatCurrencyWithInvoiceCurrency(invoiceData.discount_amount)}
              </Typography>
            </div>
            <div className="!flex !justify-between">
              <Typography variant="body2" className="!text-gray-600">
                Tax:
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrencyWithInvoiceCurrency(invoiceData.tax_amount)}
              </Typography>
            </div>
            <div className="!flex !justify-between">
              <Typography variant="body2" className="!text-gray-600">
                Shipping:
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatCurrencyWithInvoiceCurrency(invoiceData.shipping_amount)}
              </Typography>
            </div>
            <div className="!border-t !border-gray-300 !pt-2 !mt-2">
              <div className="!flex !justify-between">
                <Typography variant="subtitle2" className="!font-bold">
                  Total:
                </Typography>
                <Typography variant="subtitle2" className="!font-bold">
                  {formatCurrencyWithInvoiceCurrency(
                    Number(invoiceData.subtotal) +
                      Number(invoiceData.tax_amount) +
                      Number(invoiceData.shipping_amount) -
                      Number(invoiceData.discount_amount)
                  )}
                </Typography>
              </div>
            </div>
          </div>
        </InfoCard>
        {(invoiceData.notes || invoiceData.billing_address) && (
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {invoiceData.notes && (
              <InfoCard title="Notes" icon={FileText}>
                <Typography variant="body2" className="!text-gray-700">
                  {invoiceData.notes}
                </Typography>
              </InfoCard>
            )}
            {invoiceData.billing_address && (
              <InfoCard title="Billing Address" icon={Info}>
                <Typography variant="body2" className="!text-gray-700">
                  {invoiceData.billing_address}
                </Typography>
              </InfoCard>
            )}
          </div>
        )}
      </div>
    </CustomDrawer>
  );
};

export default InvoiceDetail;
