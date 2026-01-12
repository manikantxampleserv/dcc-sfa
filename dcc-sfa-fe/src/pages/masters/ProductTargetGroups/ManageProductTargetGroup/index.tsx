import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductTargetGroup,
  useUpdateProductTargetGroup,
  type ProductTargetGroup,
} from 'hooks/useProductTargetGroups';
import React from 'react';
import { productTargetGroupValidationSchema } from 'schemas/productTargetGroup.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

interface ManageProductTargetGroupProps {
  selectedProductTargetGroup?: ProductTargetGroup | null;
  setSelectedProductTargetGroup: (
    productTargetGroup: ProductTargetGroup | null
  ) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductTargetGroup: React.FC<ManageProductTargetGroupProps> = ({
  selectedProductTargetGroup,
  setSelectedProductTargetGroup,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedProductTargetGroup;

  const handleCancel = () => {
    setSelectedProductTargetGroup(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createProductTargetGroupMutation = useCreateProductTargetGroup();
  const updateProductTargetGroupMutation = useUpdateProductTargetGroup();

  const formik = useFormik({
    initialValues: {
      name: selectedProductTargetGroup?.name || '',
      code: selectedProductTargetGroup?.code || '',
      is_active: selectedProductTargetGroup?.is_active || 'Y',
    },
    validationSchema: productTargetGroupValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productTargetGroupData = {
          name: values.name,
          code: values.code,
          is_active: values.is_active,
        };

        if (isEdit && selectedProductTargetGroup) {
          await updateProductTargetGroupMutation.mutateAsync({
            id: selectedProductTargetGroup.id,
            ...productTargetGroupData,
          });
        } else {
          await createProductTargetGroupMutation.mutateAsync(
            productTargetGroupData
          );
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product target group:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit ? 'Edit Product Target Group' : 'Create Product Target Group'
      }
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Product Target Group Name"
              placeholder="Enter product target group name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (optional)"
              formik={formik}
              disabled={isEdit}
            />

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createProductTargetGroupMutation.isPending ||
                updateProductTargetGroupMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createProductTargetGroupMutation.isPending ||
                updateProductTargetGroupMutation.isPending
              }
            >
              {createProductTargetGroupMutation.isPending ||
              updateProductTargetGroupMutation.isPending
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

export default ManageProductTargetGroup;
