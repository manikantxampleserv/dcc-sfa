import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useCreditNote, type CreditNote } from 'hooks/useCreditNotes';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Info,
  Package,
  Receipt,
  XCircle,
} from 'lucide-react';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import { formatDate } from 'utils/dateUtils';

interface CreditNoteDetailProps {
  open: boolean;
  onClose: () => void;
  creditNote?: CreditNote | null;
}

const CreditNoteDetail: React.FC<CreditNoteDetailProps> = ({
  open,
  onClose,
  creditNote,
}) => {
  const {
    data: creditNoteResponse,
    isLoading,
    error,
  } = useCreditNote(creditNote?.id || 0);
  const creditNoteData = creditNoteResponse?.data || creditNote;

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const currencyCode = creditNoteData?.currency?.code || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const isOverdue = (creditNote: CreditNote) => {
    if (!creditNote.due_date || !creditNote.balance_due) return false;
    return (
      new Date(creditNote.due_date) < new Date() && creditNote.balance_due > 0
    );
  };

  const handleBack = () => {
    onClose();
  };

  if (isLoading) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Credit Note Details"
        size="large"
      >
        <div className="!p-6 !space-y-6">
          {/* Header Skeleton */}
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

          {/* Content Skeleton */}
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

  if (error || !creditNoteData) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Credit Note Details"
        size="large"
      >
        <div className="!p-6">
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 text-white relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <Typography variant="h6" className="!text-white !font-bold">
                Failed to load credit note details
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
            Back to Credit Notes
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
            <div className="!p-1.5 !w-8 !h-8 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="subtitle1" className="!font-bold !text-gray-900">
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
      title="Credit Note Details"
      size="large"
    >
      <div className="!p-5 mb-10 !space-y-5">
        {/* Header Card */}
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
          <div className="absolute top-3 right-3">
            <div
              className={`!w-2.5 !h-2.5 !rounded-full ${
                creditNoteData.is_active === 'Y'
                  ? '!bg-green-400'
                  : '!bg-gray-400'
              }`}
            ></div>
          </div>

          <div className="!relative !mb-4">
            <Avatar
              className={classNames(
                '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                {
                  '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                    creditNoteData.status === 'approved',
                  '!bg-gradient-to-br !from-yellow-400 !to-yellow-600 !text-white':
                    creditNoteData.status === 'pending',
                  '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white':
                    creditNoteData.status === 'rejected' ||
                    creditNoteData.status === 'cancelled',
                  '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                    creditNoteData.status === 'draft',
                }
              )}
            >
              <Receipt className="!w-8 !h-8" />
            </Avatar>
          </div>

          <Typography variant="h6" className="!font-bold !text-gray-900 !mb-1">
            {creditNoteData.credit_note_number}
          </Typography>

          <Typography variant="body2" className="!text-gray-600 !mb-3">
            {creditNoteData.customer?.name || 'Unknown Customer'}
          </Typography>

          <div className="!flex !justify-center !gap-2 !mb-4">
            <Chip
              icon={getStatusIcon(creditNoteData.status || 'draft')}
              label={getStatusLabel(creditNoteData.status || 'draft')}
              className={`${getStatusColor(creditNoteData.status || 'draft')} font-semibold`}
              size="small"
            />
            {isOverdue(creditNoteData) && (
              <Chip
                label="OVERDUE"
                className="!bg-red-100 !text-red-800 !font-bold"
                size="small"
              />
            )}
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
                {formatCurrency(creditNoteData.total_amount)}
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Amount Applied
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-green-600"
              >
                {formatCurrency(creditNoteData.amount_applied)}
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
                {formatCurrency(creditNoteData.balance_due)}
              </Typography>
            </div>
          </div>
        </div>

        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
          {/* Credit Note Information */}
          <InfoCard title="Credit Note Information" icon={Info}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Credit Note Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(creditNoteData.credit_note_date)}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Due Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(creditNoteData.due_date)}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Payment Method:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !capitalize"
                >
                  {creditNoteData.payment_method?.replaceAll('_', ' ') || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Related Order:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  #{creditNoteData.parent_id}
                </Typography>
              </div>
            </div>
          </InfoCard>

          {/* Customer Information */}
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
                  {creditNoteData.customer?.name || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Customer ID:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {creditNoteData.customer?.id || 'N/A'}
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
                  {(creditNoteData.customer as any)?.code || 'N/A'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          {/* Amount Breakdown */}
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
                  {formatCurrency(creditNoteData.subtotal)}
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
                  -{formatCurrency(creditNoteData.discount_amount)}
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
                  {formatCurrency(creditNoteData.tax_amount)}
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
                  {formatCurrency(creditNoteData.shipping_amount)}
                </Typography>
              </div>
              <div className="!border-t !border-gray-300 !pt-2 !mt-2">
                <div className="!flex !justify-between">
                  <Typography variant="subtitle2" className="!font-bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle2" className="!font-bold">
                    {formatCurrency(creditNoteData.total_amount)}
                  </Typography>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Credit Note Items */}
          <InfoCard title="Credit Note Items" icon={Package}>
            <div className="!space-y-2">
              {creditNoteData.creditNoteItems &&
              creditNoteData.creditNoteItems.length > 0 ? (
                creditNoteData.creditNoteItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !justify-between !items-start !mb-1">
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {item.product_name ||
                          (item as any).product?.name ||
                          `Product #${item.product_id}`}
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
                        Qty: {(item as any).quantity || 'N/A'} ×{' '}
                        {formatCurrency(item.unit_price)}
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
        </div>

        {/* Reason and Notes */}
        {(creditNoteData.reason ||
          creditNoteData.notes ||
          creditNoteData.billing_address) && (
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {creditNoteData.reason && (
              <InfoCard title="Reason for Credit Note" icon={FileText}>
                <Typography variant="body2" className="!text-gray-700">
                  {creditNoteData.reason}
                </Typography>
              </InfoCard>
            )}
            {creditNoteData.notes && (
              <InfoCard title="Notes" icon={FileText}>
                <Typography variant="body2" className="!text-gray-700">
                  {creditNoteData.notes}
                </Typography>
              </InfoCard>
            )}
            {creditNoteData.billing_address && (
              <InfoCard title="Billing Address" icon={Info}>
                <Typography variant="body2" className="!text-gray-700">
                  {creditNoteData.billing_address}
                </Typography>
              </InfoCard>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="!flex !justify-end">
          <Button
            variant="outlined"
            startIcon={<ArrowLeft />}
            onClick={handleBack}
          >
            Back to Credit Notes
          </Button>
        </div>
      </div>
    </CustomDrawer>
  );
};

export default CreditNoteDetail;
