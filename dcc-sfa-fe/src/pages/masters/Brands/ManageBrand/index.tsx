import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateBrand, useUpdateBrand, type Brand } from 'hooks/useBrands';
import React from 'react';
import { brandValidationSchema } from 'schemas/brand.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageBrandProps {
  selectedBrand?: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageBrand: React.FC<ManageBrandProps> = ({
  selectedBrand,
  setSelectedBrand,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedBrand;

  const handleCancel = () => {
    setSelectedBrand(null);
    setDrawerOpen(false);
  };

  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const formik = useFormik({
    initialValues: {
      name: selectedBrand?.name || '',
      description: selectedBrand?.description || '',
      is_active: selectedBrand?.is_active || 'Y',
    },
    validationSchema: brandValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const brandData = {
          name: values.name,
          description: values.description || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedBrand) {
          await updateBrandMutation.mutateAsync({
            id: selectedBrand.id,
            data: brandData,
          });
        } else {
          await createBrandMutation.mutateAsync(brandData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving brand:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Brand' : 'Create Brand'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Brand Name"
                placeholder="Enter brand name"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Select
              fullWidth
              name="is_active"
              label="Status"
              formik={formik}
              required
            >
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
                createBrandMutation.isPending || updateBrandMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createBrandMutation.isPending || updateBrandMutation.isPending
              }
            >
              {createBrandMutation.isPending || updateBrandMutation.isPending
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

export default ManageBrand;
