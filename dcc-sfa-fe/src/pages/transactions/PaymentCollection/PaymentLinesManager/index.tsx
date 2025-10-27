import { Chip, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreatePaymentLine,
  useDeletePaymentLine,
  usePaymentLines,
  type PaymentLine,
} from 'hooks/usePayments';
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Edit,
  Plus,
  Receipt,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import { formatDate } from 'utils/dateUtils';
import * as Yup from 'yup';

interface PaymentLinesManagerProps {
  paymentId: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

interface PaymentLineFormData {
  invoice_id: string;
  amount_applied: string;
  notes: string;
}

const paymentLineValidationSchema = Yup.object({
  invoice_id: Yup.string().required('Invoice ID is required'),
  amount_applied: Yup.number()
    .required('Amount applied is required')
    .min(0.01, 'Amount must be greater than 0'),
  notes: Yup.string().optional(),
});

const PaymentLinesManager: React.FC<PaymentLinesManagerProps> = ({
  paymentId,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [editingLine, setEditingLine] = useState<PaymentLine | null>(null);

  const { data: paymentLinesResponse, isLoading } = usePaymentLines(paymentId);
  const paymentLines = paymentLinesResponse?.data || [];

  const createPaymentLineMutation = useCreatePaymentLine();
  const deletePaymentLineMutation = useDeletePaymentLine();

  const handleCancel = () => {
    setEditingLine(null);
    formik.resetForm();
    setDrawerOpen(false);
  };

  const formik = useFormik<PaymentLineFormData>({
    initialValues: {
      invoice_id: editingLine?.invoice_id?.toString() || '',
      amount_applied: editingLine?.amount_applied?.toString() || '',
      notes: editingLine?.notes || '',
    },
    validationSchema: paymentLineValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await createPaymentLineMutation.mutateAsync({
          paymentId,
          invoice_id: Number(values.invoice_id),
          amount_applied: Number(values.amount_applied),
          notes: values.notes || undefined,
        });
        handleCancel();
      } catch (error) {
        console.error('Error creating payment line:', error);
      }
    },
  });

  const handleDeleteLine = async (lineId: number) => {
    try {
      await deletePaymentLineMutation.mutateAsync({
        paymentId,
        lineId,
      });
    } catch (error) {
      console.error('Error deleting payment line:', error);
    }
  };

  const totalAllocated = paymentLines.reduce(
    (sum, line) => sum + Number(line.amount_applied || '0'),
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
      <div className="!absolute !top-0 !right-0 !w-12 !h-12 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-6 !translate-x-6"></div>
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
      title="Payment Lines Management"
      size="large"
    >
      <div className="!p-4 !space-y-4">
        {/* Summary Card */}
        <InfoCard title="Payment Lines Summary" icon={Receipt}>
          <div className="!flex !items-center !justify-between">
            <div className="!flex !items-center !gap-2">
              <div className="!p-1.5 !bg-green-100 !rounded-lg">
                <DollarSign className="!text-green-600 !w-4 !h-4" />
              </div>
              <div>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !text-sm"
                >
                  Total Allocated
                </Typography>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  ${Number(totalAllocated || '0').toFixed(2)}
                </Typography>
              </div>
            </div>
            <Chip
              label={`${paymentLines.length} lines`}
              color="primary"
              size="small"
            />
          </div>
        </InfoCard>

        {/* Add New Payment Line Form */}
        <InfoCard
          title={editingLine ? 'Edit Payment Line' : 'Add New Payment Line'}
          icon={Plus}
        >
          <form onSubmit={formik.handleSubmit} className="!space-y-3">
            <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3">
              <Input
                name="invoice_id"
                label="Invoice ID"
                placeholder="Enter invoice ID"
                formik={formik}
                required
                type="number"
              />

              <Input
                name="amount_applied"
                label="Amount Applied"
                placeholder="Enter amount"
                formik={formik}
                required
                type="number"
              />

              <Input
                name="notes"
                label="Notes"
                placeholder="Optional notes"
                formik={formik}
              />
            </div>

            <div className="!flex !justify-end !gap-2 !mt-3">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={
                  createPaymentLineMutation.isPending ||
                  deletePaymentLineMutation.isPending
                }
                startIcon={<X className="!w-3 !h-3" />}
                className="!text-xs !px-3 !py-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={
                  createPaymentLineMutation.isPending ||
                  deletePaymentLineMutation.isPending
                }
                loading={createPaymentLineMutation.isPending}
                startIcon={<CheckCircle className="!w-3 !h-3" />}
                className="!text-xs !px-3 !py-1"
              >
                {editingLine ? 'Update Line' : 'Add Line'}
              </Button>
            </div>
          </form>
        </InfoCard>

        {/* Payment Lines List */}
        <InfoCard
          title={`Payment Lines (${paymentLines.length})`}
          icon={Receipt}
        >
          {isLoading ? (
            <div className="!space-y-2">
              {[1, 2, 3].map(item => (
                <div key={item} className="!p-2 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={14}
                    className="!mb-1"
                  />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              ))}
            </div>
          ) : paymentLines.length === 0 ? (
            <div className="!text-center !py-6">
              <Receipt className="!text-gray-400 !text-3xl !mx-auto !mb-2" />
              <Typography variant="caption" className="!text-gray-500 !text-xs">
                No payment lines found. Add one above to allocate payment to
                invoices.
              </Typography>
            </div>
          ) : (
            <div className="!space-y-2">
              {paymentLines.map(line => (
                <div
                  key={line.id}
                  className="!p-3 !bg-gray-50 !rounded-lg !border !border-gray-200 !relative"
                >
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !flex-col !gap-1">
                      <Typography
                        variant="caption"
                        className="!font-semibold !text-gray-900 !text-xs"
                      >
                        Invoice #{line.invoice_number || line.invoice_id}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs"
                      >
                        {formatDate(line.invoice_date)}
                      </Typography>
                    </div>
                    <div className="!flex !items-center !gap-2">
                      <Typography
                        variant="caption"
                        className="!font-semibold !text-green-600 !text-xs"
                      >
                        ${Number(line.amount_applied || '0').toFixed(2)}
                      </Typography>
                      <div className="!flex !items-center !gap-1">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingLine(line)}
                          className="!min-w-0 !p-1 !h-6"
                          title="Edit line"
                        >
                          <Edit className="!w-3 !h-3" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDeleteLine(line.id)}
                          disabled={deletePaymentLineMutation.isPending}
                          className="!min-w-0 !p-1 !h-6 !text-red-500 !border-red-200 hover:!bg-red-50"
                          title="Delete line"
                        >
                          <Trash2 className="!w-3 !h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {line.notes && (
                    <Typography
                      variant="caption"
                      className="!text-gray-600 !block !mt-1 !text-xs"
                    >
                      {line.notes}
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          )}
        </InfoCard>

        {/* Error Display */}
        {(createPaymentLineMutation.error ||
          deletePaymentLineMutation.error) && (
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-3 text-white relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <Typography variant="caption" className="!text-white !text-xs">
                {createPaymentLineMutation.error?.message ||
                  deletePaymentLineMutation.error?.message ||
                  'An error occurred while managing payment lines'}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </CustomDrawer>
  );
};

export default PaymentLinesManager;
