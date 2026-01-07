import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductType,
  useUpdateProductType,
  type ProductType,
} from 'hooks/useProductTypes';
import React from 'react';
import { productTypeValidationSchema } from 'schemas/productType.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductTypeProps {
  selectedProductType?: ProductType | null;
  setSelectedProductType: (productType: ProductType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductType: React.FC<ManageProductTypeProps> = ({
  selectedProductType,
  setSelectedProductType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedProductType;

  const handleCancel = () => {
    setSelectedProductType(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createProductTypeMutation = useCreateProductType();
  const updateProductTypeMutation = useUpdateProductType();

  const formik = useFormik({
    initialValues: {
      name: selectedProductType?.name || '',
      code: selectedProductType?.code || '',
      is_active: selectedProductType?.is_active || 'Y',
    },
    validationSchema: productTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const productTypeData = {
          name: values.name,
          code: values.code,
          is_active: values.is_active,
        };

        if (isEdit && selectedProductType) {
          await updateProductTypeMutation.mutateAsync({
            id: selectedProductType.id,
            ...productTypeData,
          });
        } else {
          await createProductTypeMutation.mutateAsync(productTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Type' : 'Create Product Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Product Type Name"
                placeholder="Enter product type name"
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
                createProductTypeMutation.isPending ||
                updateProductTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createProductTypeMutation.isPending ||
                updateProductTypeMutation.isPending
              }
            >
              {createProductTypeMutation.isPending ||
              updateProductTypeMutation.isPending
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

export default ManageProductType;
