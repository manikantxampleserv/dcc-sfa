import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductShelfLife,
  useUpdateProductShelfLife,
  type ProductShelfLife,
} from 'hooks/useProductShelfLife';
import React from 'react';
import { productShelfLifeValidationSchema } from 'schemas/productShelfLife.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductShelfLifeProps {
  selectedShelfLife?: ProductShelfLife | null;
  setSelectedShelfLife: (shelfLife: ProductShelfLife | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductShelfLife: React.FC<ManageProductShelfLifeProps> = ({
  selectedShelfLife,
  setSelectedShelfLife,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedShelfLife;

  const handleCancel = () => {
    setSelectedShelfLife(null);
    setDrawerOpen(false);
  };

  const createShelfLifeMutation = useCreateProductShelfLife();
  const updateShelfLifeMutation = useUpdateProductShelfLife();

  const formik = useFormik({
    initialValues: {
      name: selectedShelfLife?.name || '',
      code: selectedShelfLife?.code || '',
      is_active: selectedShelfLife?.is_active || 'Y',
    },
    validationSchema: productShelfLifeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const shelfLifeData = {
          name: values.name,
          code: values.code || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedShelfLife) {
          await updateShelfLifeMutation.mutateAsync({
            id: selectedShelfLife.id,
            ...shelfLifeData,
          });
        } else {
          await createShelfLifeMutation.mutateAsync(shelfLifeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product shelf life:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Shelf Life' : 'Create Product Shelf Life'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Shelf Life Name"
                placeholder="Enter shelf life name"
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
                createShelfLifeMutation.isPending ||
                updateShelfLifeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createShelfLifeMutation.isPending ||
                updateShelfLifeMutation.isPending
              }
            >
              {createShelfLifeMutation.isPending ||
              updateShelfLifeMutation.isPending
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

export default ManageProductShelfLife;
