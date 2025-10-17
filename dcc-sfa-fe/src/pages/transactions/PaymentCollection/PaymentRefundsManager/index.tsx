import { Chip, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreatePaymentRefund,
  useDeletePaymentRefund,
  usePaymentRefunds,
  useUpdatePaymentRefund,
  type PaymentRefund,
} from 'hooks/usePayments';
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatDate } from 'utils/dateUtils';
import * as Yup from 'yup';

interface PaymentRefundsManagerProps {
  paymentId: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

interface PaymentRefundFormData {
  refund_date: string;
  amount: string;
  reason: string;
  reference_number: string;
  method: string;
  status: string;
  notes: string;
}

const paymentRefundValidationSchema = Yup.object({
  refund_date: Yup.string().required('Refund date is required'),
  amount: Yup.number()
    .required('Refund amount is required')
    .min(0.01, 'Amount must be greater than 0'),
  reason: Yup.string().required('Refund reason is required'),
  reference_number: Yup.string().optional(),
  method: Yup.string().optional(),
  status: Yup.string().required('Status is required'),
  notes: Yup.string().optional(),
});

const PaymentRefundsManager: React.FC<PaymentRefundsManagerProps> = ({
  paymentId,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [editingRefund, setEditingRefund] = useState<PaymentRefund | null>(
    null
  );

  const { data: paymentRefundsResponse, isLoading } =
    usePaymentRefunds(paymentId);
  const paymentRefunds = paymentRefundsResponse?.data || [];

  const createPaymentRefundMutation = useCreatePaymentRefund();
  const updatePaymentRefundMutation = useUpdatePaymentRefund();
  const deletePaymentRefundMutation = useDeletePaymentRefund();

  const handleCancel = () => {
    setEditingRefund(null);
    formik.resetForm();
    setDrawerOpen(false);
  };

  const formik = useFormik<PaymentRefundFormData>({
    initialValues: {
      refund_date:
        editingRefund?.refund_date?.split('T')[0] ||
        new Date().toISOString().split('T')[0],
      amount: editingRefund?.amount?.toString() || '',
      reason: editingRefund?.reason || '',
      reference_number: editingRefund?.reference_number || '',
      method: editingRefund?.method || 'cash',
      status: editingRefund?.status || 'initiated',
      notes: editingRefund?.notes || '',
    },
    validationSchema: paymentRefundValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (editingRefund) {
          await updatePaymentRefundMutation.mutateAsync({
            paymentId,
            refundId: editingRefund.id,
            refund_date: values.refund_date,
            amount: Number(values.amount),
            reason: values.reason,
            reference_number: values.reference_number || undefined,
            method: values.method || undefined,
            status: values.status,
            notes: values.notes || undefined,
            updatedby: 1,
          });
        } else {
          await createPaymentRefundMutation.mutateAsync({
            paymentId,
            refund_date: values.refund_date,
            amount: Number(values.amount),
            reason: values.reason,
            reference_number: values.reference_number || undefined,
            method: values.method || undefined,
            status: values.status,
            notes: values.notes || undefined,
            createdby: 1,
            log_inst: 1,
          });
        }
        handleCancel();
      } catch (error) {
        console.error('Error managing payment refund:', error);
      }
    },
  });

  const handleDeleteRefund = async (refundId: number) => {
    try {
      await deletePaymentRefundMutation.mutateAsync({
        paymentId,
        refundId,
      });
    } catch (error) {
      console.error('Error deleting payment refund:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      initiated: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Completed',
      initiated: 'Initiated',
      processing: 'Processing',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalRefunded = paymentRefunds.reduce(
    (sum, refund) => sum + (refund.amount || 0),
    0
  );

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-4 !relative !overflow-hidden">
      <div className="!absolute !top-0 !right-0 !w-12 !h-12 !bg-gradient-to-br !from-blue-100 !to-purple-100 !rounded-full !-translate-y-6 !translate-x-6"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-2 !mb-3">
          {Icon && (
            <div className="!p-1 !w-8 !h-8 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500 !w-4 !h-4" />
            </div>
          )}
          <Typography
            variant="body1"
            className="!font-semibold !text-gray-900 !text-sm"
          >
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title="Payment Refunds Management"
      size="large"
    >
      <div className="!p-4 !space-y-4">
        {/* Summary Card */}
        <InfoCard title="Payment Refunds Summary" icon={RefreshCw}>
          <div className="!flex !items-center !justify-between">
            <div className="!flex !items-center !gap-2">
              <div className="!p-1.5 !bg-red-100 !rounded-lg">
                <DollarSign className="!text-red-600 !w-4 !h-4" />
              </div>
              <div>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !text-sm"
                >
                  Total Refunded
                </Typography>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  ${Number(totalRefunded || '0').toFixed(2)}
                </Typography>
              </div>
            </div>
            <Chip
              label={`${paymentRefunds.length} refunds`}
              color="primary"
              size="small"
            />
          </div>
        </InfoCard>

        {/* Add/Edit Refund Form */}
        <InfoCard
          title={
            editingRefund ? 'Edit Payment Refund' : 'Add New Payment Refund'
          }
          icon={Plus}
        >
          <form onSubmit={formik.handleSubmit} className="!space-y-4">
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Input
                name="refund_date"
                label="Refund Date"
                type="date"
                formik={formik}
                required
              />

              <Input
                name="amount"
                label="Refund Amount"
                placeholder="Enter amount"
                formik={formik}
                required
                type="number"
              />

              <Input
                name="reason"
                label="Refund Reason"
                placeholder="Enter reason for refund"
                formik={formik}
                required
              />

              <Input
                name="reference_number"
                label="Reference Number"
                placeholder="Optional reference number"
                formik={formik}
              />

              <Select name="method" label="Refund Method" formik={formik}>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="debit">Debit Card</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="online">Online Payment</MenuItem>
              </Select>

              <Select
                name="status"
                label="Refund Status"
                formik={formik}
                required
              >
                <MenuItem value="initiated">Initiated</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </div>

            <Input
              name="notes"
              label="Notes"
              placeholder="Additional notes"
              formik={formik}
              multiline
              rows={3}
            />

            <div className="!flex !justify-end !gap-2">
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={
                  createPaymentRefundMutation.isPending ||
                  updatePaymentRefundMutation.isPending ||
                  deletePaymentRefundMutation.isPending
                }
                startIcon={<X />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  createPaymentRefundMutation.isPending ||
                  updatePaymentRefundMutation.isPending ||
                  deletePaymentRefundMutation.isPending
                }
                loading={
                  createPaymentRefundMutation.isPending ||
                  updatePaymentRefundMutation.isPending
                }
                startIcon={<CheckCircle />}
              >
                {editingRefund ? 'Update Refund' : 'Add Refund'}
              </Button>
            </div>
          </form>
        </InfoCard>

        {/* Payment Refunds List */}
        <InfoCard
          title={`Payment Refunds (${paymentRefunds.length})`}
          icon={RefreshCw}
        >
          {isLoading ? (
            <div className="!space-y-3">
              {[1, 2, 3].map(item => (
                <div key={item} className="!p-3 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={16}
                    className="!mb-2"
                  />
                  <Skeleton variant="text" width="40%" height={14} />
                </div>
              ))}
            </div>
          ) : paymentRefunds.length === 0 ? (
            <div className="!text-center !py-8">
              <RefreshCw className="!text-gray-400 !text-4xl !mx-auto !mb-2" />
              <Typography variant="body2" className="!text-gray-500">
                No payment refunds found. Add one above to process a refund.
              </Typography>
            </div>
          ) : (
            <div className="!space-y-3">
              {paymentRefunds.map(refund => (
                <div
                  key={refund.id}
                  className="!p-4 !bg-gray-50 !rounded-lg !border !border-gray-200 !relative"
                >
                  <div className="!flex !items-center !justify-between !mb-2">
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {refund.reason}
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(refund.refund_date)}
                      </Typography>
                    </div>
                    <div className="!flex !items-center !gap-2">
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-red-600"
                      >
                        ${Number(refund.amount || '0')?.toFixed(2)}
                      </Typography>
                      <div className="!flex !items-center !gap-1">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingRefund(refund)}
                          className="!min-w-0 !p-1"
                          title="Edit refund"
                        >
                          <Edit className="!w-4 !h-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDeleteRefund(refund.id)}
                          disabled={deletePaymentRefundMutation.isPending}
                          className="!min-w-0 !p-1 !text-red-500 !border-red-200 hover:!bg-red-50"
                          title="Delete refund"
                        >
                          <Trash2 className="!w-4 !h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="!flex !items-center !justify-between !mb-2">
                    <div className="!flex !items-center !gap-2">
                      <CreditCard className="!w-4 !h-4 !text-gray-400" />
                      <Typography
                        variant="caption"
                        className="!text-gray-600 !capitalize"
                      >
                        {refund.method || 'N/A'}
                      </Typography>
                    </div>
                    <Chip
                      label={getStatusLabel(refund.status || '')}
                      className={`${getStatusColor(refund.status || '')} font-semibold`}
                      size="small"
                    />
                  </div>

                  {refund.reference_number && (
                    <Typography
                      variant="caption"
                      className="!text-gray-600 !font-mono !block"
                    >
                      Ref: {refund.reference_number}
                    </Typography>
                  )}

                  {refund.notes && (
                    <Typography
                      variant="caption"
                      className="!text-gray-600 !block !mt-2"
                    >
                      {refund.notes}
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          )}
        </InfoCard>

        {/* Error Display */}
        {(createPaymentRefundMutation.error ||
          updatePaymentRefundMutation.error ||
          deletePaymentRefundMutation.error) && (
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-4 text-white relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <Typography variant="caption" className="!text-white !text-xs">
                {createPaymentRefundMutation.error?.message ||
                  updatePaymentRefundMutation.error?.message ||
                  deletePaymentRefundMutation.error?.message ||
                  'An error occurred while managing payment refunds'}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </CustomDrawer>
  );
};

export default PaymentRefundsManager;
