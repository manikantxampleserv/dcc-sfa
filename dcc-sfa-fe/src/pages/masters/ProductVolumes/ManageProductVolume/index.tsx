import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateProductVolume,
  useUpdateProductVolume,
  type ProductVolume,
} from 'hooks/useProductVolumes';
import React from 'react';
import { productVolumeValidationSchema } from 'schemas/productVolume.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageProductVolumeProps {
  selectedVolume?: ProductVolume | null;
  setSelectedVolume: (volume: ProductVolume | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageProductVolume: React.FC<ManageProductVolumeProps> = ({
  selectedVolume,
  setSelectedVolume,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVolume;

  const handleCancel = () => {
    setSelectedVolume(null);
    setDrawerOpen(false);
  };

  const createVolumeMutation = useCreateProductVolume();
  const updateVolumeMutation = useUpdateProductVolume();

  const formik = useFormik({
    initialValues: {
      name: selectedVolume?.name || '',
      code: selectedVolume?.code || '',
      is_active: selectedVolume?.is_active || 'Y',
    },
    validationSchema: productVolumeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const volumeData = {
          name: values.name,
          code: values.code || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedVolume) {
          await updateVolumeMutation.mutateAsync({
            id: selectedVolume.id,
            ...volumeData,
          });
        } else {
          await createVolumeMutation.mutateAsync(volumeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving product volume:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Product Volume' : 'Create Product Volume'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Volume Name"
                placeholder="Enter volume name"
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
                createVolumeMutation.isPending || updateVolumeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createVolumeMutation.isPending || updateVolumeMutation.isPending
              }
            >
              {createVolumeMutation.isPending || updateVolumeMutation.isPending
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

export default ManageProductVolume;
