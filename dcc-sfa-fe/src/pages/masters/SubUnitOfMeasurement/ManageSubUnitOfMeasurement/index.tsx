import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateSubUnitOfMeasurement,
  useUpdateSubUnitOfMeasurement,
  type SubUnitOfMeasurement,
} from 'hooks/useSubUnitOfMeasurement';
import React from 'react';
import {
  subUnitOfMeasurementValidationSchema,
  type SubUnitOfMeasurementFormValues,
} from 'schemas/subUnitOfMeasurement.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import UnitOfMeasurementSelect from 'shared/UnitOfMeasurementSelect';
import SubUnitProductSelect from 'shared/SubUnitProductSelect';

interface ManageSubUnitOfMeasurementProps {
  selectedSubUnit?: SubUnitOfMeasurement | null;
  setSelectedSubUnit: (subUnit: SubUnitOfMeasurement | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

/**
 * ManageSubUnitOfMeasurement component for creating and editing sub units of measurement
 * Uses drawer-based form with formik validation<Box className="md:!col-span-1">
  <UnitOfMeasurementSelect
    name="unit_of_measurement_id"
    label="Unit of Measurement"
    formik={formik}
  />
</Box>

<Box className="md:!col-span-1">
  <SubUnitProductSelect formik={formik} />
</Box>
 */
const ManageSubUnitOfMeasurement: React.FC<ManageSubUnitOfMeasurementProps> = ({
  selectedSubUnit,
  setSelectedSubUnit,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedSubUnit;

  const handleCancel = () => {
    setSelectedSubUnit(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createSubUnitOfMeasurementMutation = useCreateSubUnitOfMeasurement();
  const updateSubUnitOfMeasurementMutation = useUpdateSubUnitOfMeasurement();

  const formik = useFormik<SubUnitOfMeasurementFormValues>({
    initialValues: {
      name: selectedSubUnit?.name || '',
      code: selectedSubUnit?.code || '',
      description: selectedSubUnit?.description || '',
      unit_of_measurement_id: selectedSubUnit?.unit_of_measurement_id || 0,
      product_id: selectedSubUnit?.product_id || 0,
      is_active: (selectedSubUnit?.is_active || 'Y') as 'Y' | 'N',
    },
    validationSchema: subUnitOfMeasurementValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (isEdit && selectedSubUnit) {
          await updateSubUnitOfMeasurementMutation.mutateAsync({
            id: selectedSubUnit.id,
            data: values,
          });
        } else {
          await createSubUnitOfMeasurementMutation.mutateAsync(values);
        }
        handleCancel();
      } catch (error) {
        console.error('Error saving sub unit of measurement:', error);
      }
    },
  });

  const isLoading =
    createSubUnitOfMeasurementMutation.isPending ||
    updateSubUnitOfMeasurementMutation.isPending;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit
          ? 'Edit Sub Unit of Measurement'
          : 'Create Sub Unit of Measurement'
      }
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Sub Unit Name"
                placeholder="Enter sub unit name"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-1">
              <Input
                name="code"
                label="Code"
                placeholder="Enter code (optional)"
                formik={formik}
                helperText="Leave empty to auto-generate"
              />
            </Box>

            <Box className="md:!col-span-1">
              <UnitOfMeasurementSelect
                name="unit_of_measurement_id"
                label="Unit of Measurement"
                formik={formik}
              />
            </Box>

            <Box className="md:!col-span-1">
              <SubUnitProductSelect formik={formik} />
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading
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

export default ManageSubUnitOfMeasurement;
