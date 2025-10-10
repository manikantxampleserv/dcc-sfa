import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCurrency,
  useUpdateCurrency,
  type Currency,
} from 'hooks/useCurrencies';
import React from 'react';
import { currencyValidationSchema } from 'schemas/currency.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCurrencyProps {
  selectedCurrency?: Currency | null;
  setSelectedCurrency: (currency: Currency | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCurrency: React.FC<ManageCurrencyProps> = ({
  selectedCurrency,
  setSelectedCurrency,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCurrency;

  const handleCancel = () => {
    setSelectedCurrency(null);
    setDrawerOpen(false);
  };

  const createCurrencyMutation = useCreateCurrency();
  const updateCurrencyMutation = useUpdateCurrency();

  const formik = useFormik({
    initialValues: {
      name: selectedCurrency?.name || '',
      code: selectedCurrency?.code || '',
      symbol: selectedCurrency?.symbol || '',
      exchange_rate_to_base: selectedCurrency?.exchange_rate_to_base || '',
      is_base: selectedCurrency?.is_base || 'N',
      is_active: selectedCurrency?.is_active || 'Y',
    },
    validationSchema: currencyValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const currencyData = {
          name: values.name,
          code: values.code || undefined,
          symbol: values.symbol || undefined,
          exchange_rate_to_base: values.exchange_rate_to_base
            ? Number(values.exchange_rate_to_base)
            : undefined,
          is_base: values.is_base,
          is_active: values.is_active,
        };

        if (isEdit && selectedCurrency) {
          await updateCurrencyMutation.mutateAsync({
            id: selectedCurrency.id,
            ...currencyData,
          });
        } else {
          await createCurrencyMutation.mutateAsync(currencyData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Currency' : 'Create Currency'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Currency Name"
              placeholder="Enter currency name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Currency Code"
              placeholder="Enter currency code (e.g., USD, EUR, INR)"
              formik={formik}
              required
            />

            <Input
              name="symbol"
              label="Currency Symbol"
              placeholder="Enter currency symbol (e.g., $, €, ¥)"
              formik={formik}
            />

            <Input
              name="exchange_rate_to_base"
              label="Exchange Rate to Base"
              placeholder="Enter exchange rate"
              type="number"
              formik={formik}
            />

            <Select
              name="is_base"
              label="Is Base Currency"
              formik={formik}
              required
            >
              <MenuItem value="N">No</MenuItem>
              <MenuItem value="Y">Yes</MenuItem>
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end !gap-2 items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createCurrencyMutation.isPending ||
                updateCurrencyMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createCurrencyMutation.isPending ||
                updateCurrencyMutation.isPending
              }
            >
              {createCurrencyMutation.isPending
                ? 'Creating...'
                : updateCurrencyMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Currency'
                    : 'Create Currency'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageCurrency;
