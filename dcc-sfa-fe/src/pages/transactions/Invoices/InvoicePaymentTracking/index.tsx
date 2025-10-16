import { Box, Chip, MenuItem, Skeleton, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useInvoice } from 'hooks/useInvoices';
import { usePayments } from 'hooks/usePayments';
import {
  useInvoicePaymentLines,
  useBulkUpdateInvoicePaymentLines,
  useDeleteInvoicePaymentLine,
} from 'hooks/useInvoicePaymentLines';
import {
  CreditCard,
  DollarSign,
  Plus,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import { PopConfirm } from 'shared/DeleteConfirmation';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface InvoicePaymentTrackingProps {
  open: boolean;
  onClose: () => void;
  invoiceId: number;
}

interface PaymentLineFormData {
  id?: number;
  payment_id: number | '';
  invoice_id: number;
  invoice_number: string;
  invoice_date: string;
  amount_applied: string;
  notes: string;
  payment?: {
    payment_number: string;
    payment_date: string;
    method: string;
    collected_by_user?: {
      name: string;
    };
  };
}

const validationSchema = Yup.object({
  payment_id: Yup.number()
    .required('Payment is required')
    .min(1, 'Please select a valid payment'),
  amount_applied: Yup.number()
    .required('Amount applied is required')
    .min(0.01, 'Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  notes: Yup.string().max(500, 'Notes cannot exceed 500 characters'),
});

const InvoicePaymentTracking: React.FC<InvoicePaymentTrackingProps> = ({
  open,
  onClose,
  invoiceId,
}) => {
  const [paymentLines, setPaymentLines] = useState<PaymentLineFormData[]>([]);
  const [editingLine, setEditingLine] = useState<PaymentLineFormData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);

  const { data: invoiceResponse, isLoading: invoiceLoading } =
    useInvoice(invoiceId);
  const { data: paymentsResponse, isLoading: paymentsLoading } = usePayments({
    limit: 1000,
  });
  const { data: paymentLinesResponse, isLoading: paymentLinesLoading } =
    useInvoicePaymentLines(invoiceId, {
      enabled: open && !!invoiceId,
    });

  const invoice = invoiceResponse?.data;
  const payments = paymentsResponse?.data || [];
  const existingPaymentLines = paymentLinesResponse?.data || [];
  const isLoading = invoiceLoading || paymentsLoading || paymentLinesLoading;

  const bulkUpdatePaymentLinesMutation = useBulkUpdateInvoicePaymentLines();
  const deletePaymentLineMutation = useDeleteInvoicePaymentLine();
  React.useEffect(() => {
    if (existingPaymentLines && existingPaymentLines.length > 0) {
      const lines = existingPaymentLines.map(line => ({
        id: line.id,
        payment_id: line.parent_id,
        invoice_id: invoiceId,
        invoice_number: line.invoice_number || '',
        invoice_date: line.invoice_date?.split('T')[0] || '',
        amount_applied: line.amount_applied.toString(),
        notes: line.notes || '',
        payment: line.payments
          ? {
              payment_number: line.payments.payment_number,
              payment_date: line.payments.payment_date,
              method: line.payments.method,
              collected_by_user:
                line.payments.users_payments_collected_byTousers,
            }
          : undefined,
      }));
      setPaymentLines(lines);
    } else {
      setPaymentLines([]);
    }
  }, [existingPaymentLines, invoiceId]);
  React.useEffect(() => {
    if (open) {
      setIsEditing(false);
      setEditingLine(null);
      formik.resetForm();
    }
  }, [open, invoiceId]);

  const formik = useFormik({
    initialValues: {
      payment_id: '',
      amount_applied: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async values => {
      try {
        const selectedPayment = payments.find(
          p => p.id === Number(values.payment_id)
        );

        if (!selectedPayment) {
          toast.error('Selected payment not found');
          return;
        }

        const paymentTotal = Number(selectedPayment.total_amount);
        const amountApplied = Number(values.amount_applied);

        if (amountApplied > paymentTotal) {
          toast.error(
            `Amount applied ($${amountApplied.toFixed(2)}) cannot exceed payment total ($${paymentTotal.toFixed(2)})`
          );
          return;
        }

        const invoiceTotal = Number(invoice?.total_amount || 0);
        const currentTotalApplied = paymentLines.reduce(
          (sum, line) => sum + Number(line.amount_applied),
          0
        );
        const newTotalApplied = isEditing
          ? currentTotalApplied -
            Number(editingLine?.amount_applied || 0) +
            amountApplied
          : currentTotalApplied + amountApplied;

        if (newTotalApplied > invoiceTotal) {
          toast.error(
            `Total amount applied ($${newTotalApplied.toFixed(2)}) cannot exceed invoice total ($${invoiceTotal.toFixed(2)})`
          );
          return;
        }

        const existingPaymentLine = paymentLines.find(
          line =>
            line.payment_id === Number(values.payment_id) &&
            line.id !== editingLine?.id
        );

        if (existingPaymentLine) {
          toast.error('This payment has already been applied to this invoice');
          return;
        }

        const newLine: PaymentLineFormData = {
          ...values,
          payment_id: Number(values.payment_id),
          invoice_id: invoiceId,
          invoice_number: invoice?.invoice_number || '',
          invoice_date: invoice?.invoice_date?.split('T')[0] || '',
          payment: selectedPayment
            ? {
                payment_number: selectedPayment.payment_number,
                payment_date: selectedPayment.payment_date?.split('T')[0] || '',
                method: selectedPayment.method,
                collected_by_user: selectedPayment.collected_by_user,
              }
            : undefined,
        };

        if (isEditing && editingLine) {
          const updatedLines = paymentLines.map(line =>
            line.id === editingLine.id
              ? { ...newLine, id: editingLine.id }
              : line
          );
          setPaymentLines(updatedLines);
          setIsEditing(false);
          setEditingLine(null);
        } else {
          const newLineWithId = {
            ...newLine,
            id: Date.now(),
          };
          setPaymentLines([...paymentLines, newLineWithId]);
        }

        formik.resetForm();
        setShowAddPaymentForm(false);

        toast.success(
          isEditing
            ? 'Payment line updated successfully'
            : 'Payment line added successfully'
        );
      } catch (error) {
        console.error('Error managing payment line:', error);
        toast.error('Failed to save payment line. Please try again.');
      }
    },
  });

  const handleEditLine = (line: PaymentLineFormData) => {
    setEditingLine(line);
    setIsEditing(true);
    setShowAddPaymentForm(true);
    formik.setValues({
      payment_id: line.payment_id.toString(),
      amount_applied: line.amount_applied,
      notes: line.notes,
    });
  };

  const handleDeleteLine = async (lineId: number) => {
    try {
      if (lineId > 1000000) {
        setPaymentLines(paymentLines.filter(line => line.id !== lineId));
        return;
      }

      await deletePaymentLineMutation.mutateAsync({
        invoiceId,
        lineId,
      });

      setPaymentLines(paymentLines.filter(line => line.id !== lineId));
    } catch (error) {
      console.error('Error deleting payment line:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLine(null);
    setShowAddPaymentForm(false);
    formik.resetForm();
  };

  const handleSaveChanges = async () => {
    try {
      const validPaymentLines = paymentLines.filter(
        line => line.payment_id !== ''
      );

      if (validPaymentLines.length === 0) {
        toast.error('No valid payment lines to save');
        return;
      }

      const paymentIds = validPaymentLines.map(line => line.payment_id);
      const uniquePaymentIds = new Set(paymentIds);

      if (paymentIds.length !== uniquePaymentIds.size) {
        toast.error(
          'Duplicate payment lines detected. Please remove duplicates before saving.'
        );
        return;
      }

      const paymentLinesToSave = validPaymentLines.map(line => ({
        parent_id: Number(line.payment_id),
        invoice_id: invoiceId,
        payment_id: Number(line.payment_id),
        amount_applied: Number(line.amount_applied),
        notes: line.notes || undefined,
      }));

      await bulkUpdatePaymentLinesMutation.mutateAsync({
        invoiceId,
        paymentLines: paymentLinesToSave,
      });

      toast.success('Payment lines saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving payment lines:', error);
      toast.error('Failed to save payment lines. Please try again.');
    }
  };

  const calculatePaymentSummary = () => {
    const totalApplied = paymentLines.reduce(
      (sum, line) => sum + Number(line.amount_applied),
      0
    );
    const invoiceTotal = Number(invoice?.total_amount || 0);
    const balanceDue = invoiceTotal - totalApplied;
    const paymentPercentage =
      invoiceTotal > 0 ? (totalApplied / invoiceTotal) * 100 : 0;

    return {
      totalApplied,
      invoiceTotal,
      balanceDue,
      paymentPercentage,
      isFullyPaid: balanceDue <= 0,
      isOverpaid: balanceDue < 0,
    };
  };

  const summary = calculatePaymentSummary();

  const getPaymentStatusColor = () => {
    if (summary.isOverpaid) return 'error';
    if (summary.isFullyPaid) return 'success';
    if (summary.paymentPercentage > 50) return 'warning';
    return 'default';
  };

  const getPaymentStatusLabel = () => {
    if (summary.isOverpaid) return 'Overpaid';
    if (summary.isFullyPaid) return 'Fully Paid';
    if (summary.paymentPercentage > 50) return 'Partially Paid';
    return 'Unpaid';
  };

  const getPaymentStatusIcon = () => {
    if (summary.isOverpaid) return <AlertTriangle className="w-4 h-4" />;
    if (summary.isFullyPaid) return <CheckCircle className="w-4 h-4" />;
    if (summary.paymentPercentage > 50) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const paymentLinesColumns: TableColumn<PaymentLineFormData>[] = [
    {
      id: 'payment_info',
      label: 'Payment Info',
      render: (_value, row) => (
        <Box className="!flex !flex-col">
          <Typography variant="caption" className="!font-medium !text-xs">
            {row.payment?.payment_number || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 capitalize !text-xs"
          >
            {row.payment?.method?.replaceAll('_', ' ') || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'payment_date',
      label: 'Payment Date',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-xs">
          {row.payment?.payment_date
            ? new Date(row.payment.payment_date).toLocaleDateString()
            : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'collected_by',
      label: 'Collected By',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-xs">
          {row.payment?.collected_by_user?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'amount_applied',
      label: 'Amount Applied',
      render: (_value, row) => (
        <Typography
          variant="caption"
          className="!font-medium !text-green-600 !text-xs"
        >
          ${Number(row.amount_applied).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      render: (_value, row) => (
        <Typography variant="caption" className="!text-gray-600 !text-xs">
          {row.notes || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !gap-1">
          <EditButton
            onClick={() => handleEditLine(row)}
            tooltip="Edit payment line"
            size="small"
          />
          <PopConfirm
            title="Delete Payment Line"
            description="Are you sure you want to delete this payment line? This action cannot be undone."
            onConfirm={() => handleDeleteLine(row.id!)}
          >
            <DeleteButton tooltip="Delete payment line" size="small" />
          </PopConfirm>
        </Box>
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={onClose}
      title={`Payment Tracking - ${invoice?.invoice_number || 'N/A'}`}
      size="larger"
    >
      <Box className="!p-4">
        <Box className="!space-y-4">
          {/* Invoice Summary */}
          <Box className="!bg-gray-50 !rounded-lg !p-3">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-sm"
            >
              Invoice Information
            </Typography>
            <Box className="!grid !grid-cols-2 !gap-3">
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Invoice Number
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="60%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.invoice_number || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Customer
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="80%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.customer?.name || 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Invoice Date
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="50%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.invoice_date
                      ? new Date(invoice.invoice_date).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-xs"
                >
                  Due Date
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="50%" height={20} />
                ) : (
                  <Typography variant="body2" className="!font-medium !text-sm">
                    {invoice?.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Payment Summary */}
          <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-3">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-sm"
            >
              Payment Summary
            </Typography>
            <Box className="!grid !grid-cols-1 md:!grid-cols-4 !gap-3">
              <Box className="!text-center !p-2 !bg-blue-50 !rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                {isLoading ? (
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    className="!mx-auto !mb-1"
                  />
                ) : (
                  <Typography
                    variant="subtitle2"
                    className="!font-bold !text-blue-900 !text-sm"
                  >
                    ${summary.invoiceTotal.toFixed(2)}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="!text-blue-700 !text-xs"
                >
                  Invoice Total
                </Typography>
              </Box>
              <Box className="!text-center !p-2 !bg-green-50 !rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                {isLoading ? (
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    className="!mx-auto !mb-1"
                  />
                ) : (
                  <Typography
                    variant="subtitle2"
                    className="!font-bold !text-green-900 !text-sm"
                  >
                    ${summary.totalApplied.toFixed(2)}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="!text-green-700 !text-xs"
                >
                  Total Paid
                </Typography>
              </Box>
              <Box className="!text-center !p-2 !bg-orange-50 !rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                {isLoading ? (
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    className="!mx-auto !mb-1"
                  />
                ) : (
                  <Typography
                    variant="subtitle2"
                    className="!font-bold !text-orange-900 !text-sm"
                  >
                    ${Math.abs(summary.balanceDue).toFixed(2)}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="!text-orange-700 !text-xs"
                >
                  {summary.isOverpaid ? 'Overpaid' : 'Balance Due'}
                </Typography>
              </Box>
              <Box className="!text-center !p-2 !bg-purple-50 !rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                {isLoading ? (
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    className="!mx-auto !mb-1"
                  />
                ) : (
                  <Typography
                    variant="subtitle2"
                    className="!font-bold !text-purple-900 !text-sm"
                  >
                    {summary.paymentPercentage.toFixed(1)}%
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="!text-purple-700 !text-xs"
                >
                  Paid
                </Typography>
              </Box>
            </Box>
            <Box className="!mt-3 !flex !justify-center">
              {isLoading ? (
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={24}
                  className="!rounded-full"
                />
              ) : (
                <Chip
                  label={getPaymentStatusLabel()}
                  icon={getPaymentStatusIcon()}
                  color={getPaymentStatusColor() as any}
                  className="!font-semibold !text-xs"
                  size="small"
                />
              )}
            </Box>
          </Box>

          {/* Add Payment Form */}
          {showAddPaymentForm && (
            <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !mb-3 !text-sm"
              >
                {isEditing ? 'Edit Payment Line' : 'Add Payment Line'}
              </Typography>

              <form onSubmit={formik.handleSubmit} className="!space-y-4">
                <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  <Select
                    name="payment_id"
                    label="Payment"
                    formik={formik}
                    required
                    disabled={isEditing}
                  >
                    <MenuItem value="">Select Payment</MenuItem>
                    {payments.map(payment => (
                      <MenuItem key={payment.id} value={payment.id}>
                        {payment.payment_number} - $
                        {Number(payment.total_amount).toFixed(2)} (
                        {payment.method})
                      </MenuItem>
                    ))}
                  </Select>

                  <Input
                    name="amount_applied"
                    label="Amount Applied"
                    type="number"
                    formik={formik}
                    required
                    placeholder="0.00"
                  />

                  <Box className="md:!col-span-2">
                    <Input
                      name="notes"
                      label="Notes"
                      formik={formik}
                      placeholder="Payment notes..."
                      multiline
                      rows={2}
                    />
                  </Box>
                </Box>

                <Box className="!flex !justify-end !gap-2">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Plus />}
                  >
                    {isEditing ? 'Update Payment Line' : 'Add Payment Line'}
                  </Button>
                </Box>
              </form>
            </Box>
          )}

          {/* Payment Lines Table */}
          <Box>
            <Box className="!flex !justify-between !items-center !mb-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !text-sm"
              >
                Payment History ({paymentLines.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Plus />}
                onClick={() => setShowAddPaymentForm(true)}
                disabled={showAddPaymentForm}
                size="small"
                className="!text-xs"
              >
                Add Payment Line
              </Button>
            </Box>

            {isLoading ? (
              <Box className="!space-y-2">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </Box>
            ) : paymentLines.length > 0 ? (
              <Table
                data={paymentLines}
                columns={paymentLinesColumns}
                getRowId={row => row.id?.toString() || ''}
                pagination={false}
                sortable={false}
                emptyMessage="No payment lines found."
              />
            ) : (
              <Box className="!text-center !py-6 !text-gray-500">
                <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <Typography variant="caption" className="!text-xs">
                  No payments recorded yet. Add payment lines to track payments
                  against this invoice.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Payment Progress Bar */}
          {summary.invoiceTotal > 0 && (
            <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-3">
              <Typography
                variant="subtitle1"
                className="!font-semibold !mb-3 !text-sm"
              >
                Payment Progress
              </Typography>
              <Box className="!w-full !bg-gray-200 !rounded-full !h-3 !mb-2">
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    height={12}
                    className="!rounded-full"
                  />
                ) : (
                  <Box
                    className={`!h-3 !rounded-full !transition-all !duration-300 ${
                      summary.isOverpaid
                        ? '!bg-red-500'
                        : summary.isFullyPaid
                          ? '!bg-green-500'
                          : summary.paymentPercentage > 50
                            ? '!bg-yellow-500'
                            : '!bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(summary.paymentPercentage, 100)}%`,
                    }}
                  />
                )}
              </Box>
              {isLoading ? (
                <Skeleton
                  variant="text"
                  width="60%"
                  height={16}
                  className="!mx-auto"
                />
              ) : (
                <Typography
                  variant="caption"
                  className="!text-gray-600 !text-center !text-xs"
                >
                  {summary.paymentPercentage.toFixed(1)}% of invoice total paid
                </Typography>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box className="!flex !justify-end !gap-2">
            <Button type="button" variant="outlined" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleSaveChanges}
              disabled={
                paymentLines.length === 0 ||
                bulkUpdatePaymentLinesMutation.isPending
              }
            >
              {bulkUpdatePaymentLinesMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default InvoicePaymentTracking;
