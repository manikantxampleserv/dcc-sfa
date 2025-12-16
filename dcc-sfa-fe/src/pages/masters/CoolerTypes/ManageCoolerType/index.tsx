import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCoolerType,
  useUpdateCoolerType,
  type CoolerType,
} from 'hooks/useCoolerTypes';
import React from 'react';
import { coolerTypeValidationSchema } from 'schemas/coolerType.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCoolerTypeProps {
  selectedCoolerType?: CoolerType | null;
  setSelectedCoolerType: (coolerType: CoolerType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCoolerType: React.FC<ManageCoolerTypeProps> = ({
  selectedCoolerType,
  setSelectedCoolerType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCoolerType;

  const handleCancel = () => {
    setSelectedCoolerType(null);
    setDrawerOpen(false);
  };

  const createCoolerTypeMutation = useCreateCoolerType();
  const updateCoolerTypeMutation = useUpdateCoolerType();

  const formik = useFormik({
    initialValues: {
      name: selectedCoolerType?.name || '',
      code: selectedCoolerType?.code || '',
      description: selectedCoolerType?.description || '',
      is_active: selectedCoolerType?.is_active || 'Y',
    },
    validationSchema: coolerTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const coolerTypeData = {
          name: values.name,
          code: values.code || undefined,
          description: values.description || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedCoolerType) {
          await updateCoolerTypeMutation.mutateAsync({
            id: selectedCoolerType.id,
            ...coolerTypeData,
          });
        } else {
          await createCoolerTypeMutation.mutateAsync(coolerTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving cooler type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Cooler Type' : 'Create Cooler Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Cooler Type Name"
                placeholder="Enter cooler type name"
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
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createCoolerTypeMutation.isPending ||
                updateCoolerTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCoolerTypeMutation.isPending ||
                updateCoolerTypeMutation.isPending
              }
            >
              {createCoolerTypeMutation.isPending ||
              updateCoolerTypeMutation.isPending
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

export default ManageCoolerType;

