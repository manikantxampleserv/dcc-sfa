import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductWebOrder,
  useUpdateProductWebOrder,
  type ProductWebOrder,
} from 'hooks/useProductWebOrders';
import React from 'react';
import { productWebOrderValidationSchema } from 'schemas/productWebOrder.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductWebOrderProps {
  selectedProductWebOrder?: ProductWebOrder | null;
  setSelectedProductWebOrder: (productWebOrder: ProductWebOrder | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductWebOrder: React.FC<ManageProductWebOrderProps> = ({
  selectedProductWebOrder,
  setSelectedProductWebOrder,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedProductWebOrder;

  const handleCancel = () => {
    setSelectedProductWebOrder(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createProductWebOrderMutation = useCreateProductWebOrder();
  const updateProductWebOrderMutation = useUpdateProductWebOrder();

  const formik = useFormik({
    initialValues: {
      name: selectedProductWebOrder?.name || '',
      code: selectedProductWebOrder?.code || '',
      is_active: selectedProductWebOrder?.is_active || 'Y',
    },
    validationSchema: productWebOrderValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productWebOrderData = {
          name: values.name,
          code: values.code,
          is_active: values.is_active,
        };

        if (isEdit && selectedProductWebOrder) {
          await updateProductWebOrderMutation.mutateAsync({
            id: selectedProductWebOrder.id,
            ...productWebOrderData,
          });
        } else {
          await createProductWebOrderMutation.mutateAsync(productWebOrderData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product web order:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Web Order' : 'Create Product Web Order'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Product Web Order Name"
                placeholder="Enter product web order name"
                formik={formik}
                required
              />
            </Box>

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (optional)"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createProductWebOrderMutation.isPending ||
                updateProductWebOrderMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createProductWebOrderMutation.isPending ||
                updateProductWebOrderMutation.isPending
              }
            >
              {createProductWebOrderMutation.isPending ||
              updateProductWebOrderMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageProductWebOrder;
