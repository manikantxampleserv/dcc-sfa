import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import {
  useCreatePayment,
  useUpdatePayment,
  type Payment,
} from 'hooks/usePayments';
import { useUsers } from 'hooks/useUsers';
import React from 'react';
import { paymentValidationSchema } from 'schemas/payment.schema';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManagePaymentProps {
  selectedPayment?: Payment | null;
  setSelectedPayment: (payment: Payment | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManagePayment: React.FC<ManagePaymentProps> = ({
  selectedPayment,
  setSelectedPayment,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedPayment;

  const handleCancel = () => {
    setSelectedPayment(null);
    setDrawerOpen(false);
  };

  const createPaymentMutation = useCreatePayment();
  const updatePaymentMutation = useUpdatePayment();

  // Fetch data for dropdowns
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: currenciesResponse } = useCurrencies({ limit: 1000 });

  const users = usersResponse?.data || [];
  const currencies = currenciesResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      customer_id: selectedPayment?.customer_id?.toString() || '',
      payment_date: selectedPayment?.payment_date
        ? selectedPayment.payment_date.split('T')[0]
        : '',
      collected_by: selectedPayment?.collected_by?.toString() || '',
      method: selectedPayment?.method || 'cash',
      total_amount: selectedPayment?.total_amount?.toString() || '',
      notes: selectedPayment?.notes || '',
      currency_id: selectedPayment?.currency_id?.toString() || '',
      is_active: selectedPayment?.is_active || 'Y',
    },
    validationSchema: paymentValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const paymentData = {
          customer_id: Number(values.customer_id),
          payment_date: values.payment_date || '',
          collected_by: Number(values.collected_by),
          method: values.method || 'cash',
          total_amount: Number(values.total_amount),
          notes: values.notes || undefined,
          currency_id: values.currency_id
            ? Number(values.currency_id)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedPayment) {
          await updatePaymentMutation.mutateAsync({
            id: selectedPayment.id,
            ...paymentData,
          });
        } else {
          await createPaymentMutation.mutateAsync(paymentData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving payment:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Payment' : 'Create Payment'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <CustomerSelect
                name="customer_id"
                label="Customer"
                formik={formik}
                required
              />
            </Box>

            <Input
              name="payment_date"
              label="Payment Date"
              type="date"
              formik={formik}
              required
            />

            <Select
              name="collected_by"
              label="Collected By"
              formik={formik}
              required
            >
              <MenuItem value="">Select User</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Select
              name="method"
              label="Payment Method"
              formik={formik}
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="credit">Credit Card</MenuItem>
              <MenuItem value="debit">Debit Card</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="online">Online Payment</MenuItem>
            </Select>

            <Input
              name="total_amount"
              label="Total Amount"
              type="number"
              placeholder="Enter amount"
              formik={formik}
              required
            />

            <Select name="currency_id" label="Currency" formik={formik}>
              <MenuItem value="">Select Currency</MenuItem>
              {currencies.map(currency => (
                <MenuItem key={currency.id} value={currency.id.toString()}>
                  {currency.name} ({currency.code})
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="notes"
                label="Notes"
                placeholder="Enter notes"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createPaymentMutation.isPending ||
                updatePaymentMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createPaymentMutation.isPending ||
                updatePaymentMutation.isPending
              }
            >
              {createPaymentMutation.isPending ||
              updatePaymentMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManagePayment;
