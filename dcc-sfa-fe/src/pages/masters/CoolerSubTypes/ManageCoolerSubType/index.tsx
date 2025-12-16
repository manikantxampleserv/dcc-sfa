import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCoolerSubType,
  useUpdateCoolerSubType,
  type CoolerSubType,
} from 'hooks/useCoolerSubTypes';
import { useCoolerTypesDropdown } from 'hooks/useCoolerTypes';
import React from 'react';
import { coolerSubTypeValidationSchema } from 'schemas/coolerSubType.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCoolerSubTypeProps {
  selectedCoolerSubType?: CoolerSubType | null;
  setSelectedCoolerSubType: (coolerSubType: CoolerSubType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCoolerSubType: React.FC<ManageCoolerSubTypeProps> = ({
  selectedCoolerSubType,
  setSelectedCoolerSubType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCoolerSubType;
  const { data: coolerTypesDropdown } = useCoolerTypesDropdown();

  const handleCancel = () => {
    setSelectedCoolerSubType(null);
    setDrawerOpen(false);
  };

  const createCoolerSubTypeMutation = useCreateCoolerSubType();
  const updateCoolerSubTypeMutation = useUpdateCoolerSubType();

  const formik = useFormik({
    initialValues: {
      name: selectedCoolerSubType?.name || '',
      code: selectedCoolerSubType?.code || '',
      cooler_type_id: selectedCoolerSubType?.cooler_type_id || '',
      description: selectedCoolerSubType?.description || '',
      is_active: selectedCoolerSubType?.is_active || 'Y',
    },
    validationSchema: coolerSubTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const coolerSubTypeData = {
          name: values.name,
          code: values.code || undefined,
          cooler_type_id: Number(values.cooler_type_id),
          description: values.description || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedCoolerSubType) {
          await updateCoolerSubTypeMutation.mutateAsync({
            id: selectedCoolerSubType.id,
            ...coolerSubTypeData,
          });
        } else {
          await createCoolerSubTypeMutation.mutateAsync(coolerSubTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving cooler sub type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Cooler Sub Type' : 'Create Cooler Sub Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Sub Type"
                placeholder="Enter sub type"
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

            <Select
              name="cooler_type_id"
              label="Cooler Type"
              formik={formik}
              required
            >
              <MenuItem value="">Select Cooler Type</MenuItem>
              {coolerTypesDropdown?.data?.map(ct => (
                <MenuItem key={ct.id} value={ct.id}>
                  {ct.name}
                </MenuItem>
              ))}
            </Select>

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
                createCoolerSubTypeMutation.isPending ||
                updateCoolerSubTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCoolerSubTypeMutation.isPending ||
                updateCoolerSubTypeMutation.isPending
              }
            >
              {createCoolerSubTypeMutation.isPending ||
              updateCoolerSubTypeMutation.isPending
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

export default ManageCoolerSubType;
