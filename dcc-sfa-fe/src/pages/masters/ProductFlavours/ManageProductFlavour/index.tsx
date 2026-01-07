import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductFlavour,
  useUpdateProductFlavour,
  type ProductFlavour,
} from 'hooks/useProductFlavours';
import React from 'react';
import { productFlavourValidationSchema } from 'schemas/productFlavour.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductFlavourProps {
  selectedFlavour?: ProductFlavour | null;
  setSelectedFlavour: (flavour: ProductFlavour | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductFlavour: React.FC<ManageProductFlavourProps> = ({
  selectedFlavour,
  setSelectedFlavour,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedFlavour;

  const handleCancel = () => {
    setSelectedFlavour(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createFlavourMutation = useCreateProductFlavour();
  const updateFlavourMutation = useUpdateProductFlavour();

  const formik = useFormik({
    initialValues: {
      name: selectedFlavour?.name || '',
      code: selectedFlavour?.code || '',
      is_active: selectedFlavour?.is_active || 'Y',
    },
    validationSchema: productFlavourValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const flavourData = {
          name: values.name,
          code: values.code || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedFlavour) {
          await updateFlavourMutation.mutateAsync({
            id: selectedFlavour.id,
            ...flavourData,
          });
        } else {
          await createFlavourMutation.mutateAsync(flavourData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product flavour:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Flavour' : 'Create Product Flavour'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Flavour Name"
                placeholder="Enter flavour name"
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
                createFlavourMutation.isPending ||
                updateFlavourMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createFlavourMutation.isPending ||
                updateFlavourMutation.isPending
              }
            >
              {createFlavourMutation.isPending ||
              updateFlavourMutation.isPending
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

export default ManageProductFlavour;
