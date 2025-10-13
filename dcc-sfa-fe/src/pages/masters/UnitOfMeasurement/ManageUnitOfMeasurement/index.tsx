import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateUnitOfMeasurement,
  useUpdateUnitOfMeasurement,
  type UnitOfMeasurement,
} from 'hooks/useUnitOfMeasurement';
import React from 'react';
import { unitOfMeasurementValidationSchema } from 'schemas/unitOfMeasurement.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageUnitOfMeasurementProps {
  selectedUnit?: UnitOfMeasurement | null;
  setSelectedUnit: (unit: UnitOfMeasurement | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageUnitOfMeasurement: React.FC<ManageUnitOfMeasurementProps> = ({
  selectedUnit,
  setSelectedUnit,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedUnit;

  const handleCancel = () => {
    setSelectedUnit(null);
    setDrawerOpen(false);
  };

  const createUnitMutation = useCreateUnitOfMeasurement();
  const updateUnitMutation = useUpdateUnitOfMeasurement();

  const formik = useFormik({
    initialValues: {
      name: selectedUnit?.name || '',
      description: selectedUnit?.description || '',
      category: selectedUnit?.category || '',
      symbol: selectedUnit?.symbol || '',
      is_active: selectedUnit?.is_active || 'Y',
    },
    validationSchema: unitOfMeasurementValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const unitData = {
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          symbol: values.symbol || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedUnit) {
          await updateUnitMutation.mutateAsync({
            id: selectedUnit.id,
            data: unitData,
          });
        } else {
          await createUnitMutation.mutateAsync(unitData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving unit of measurement:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Unit of Measurement' : 'Create Unit of Measurement'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Unit Name"
                placeholder="Enter unit name"
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

            <Input
              name="category"
              label="Category"
              placeholder="Enter category (e.g., Weight, Volume, Length)"
              formik={formik}
            />

            <Input
              name="symbol"
              label="Symbol"
              placeholder="Enter symbol (e.g., kg, L, m)"
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
                createUnitMutation.isPending || updateUnitMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createUnitMutation.isPending || updateUnitMutation.isPending
              }
            >
              {createUnitMutation.isPending || updateUnitMutation.isPending
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

export default ManageUnitOfMeasurement;
