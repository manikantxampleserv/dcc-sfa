import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateVehicle,
  useUpdateVehicle,
  type Vehicle,
} from 'hooks/useVehicles';
import React from 'react';
import { vehicleValidationSchema } from 'schemas/vehicle.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageVehicleProps {
  selectedVehicle?: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageVehicle: React.FC<ManageVehicleProps> = ({
  selectedVehicle,
  setSelectedVehicle,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVehicle;

  const handleCancel = () => {
    setSelectedVehicle(null);
    setDrawerOpen(false);
  };

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const formik = useFormik({
    initialValues: {
      vehicle_number: selectedVehicle?.vehicle_number || '',
      type: selectedVehicle?.type || '',
      make: selectedVehicle?.make || '',
      model: selectedVehicle?.model || '',
      year: selectedVehicle?.year || '',
      capacity: selectedVehicle?.capacity || '',
      fuel_type: selectedVehicle?.fuel_type || '',
      status: selectedVehicle?.status || 'available',
      mileage: selectedVehicle?.mileage || '',
      is_active: selectedVehicle?.is_active || 'Y',
    },
    validationSchema: vehicleValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const vehicleData = {
          vehicle_number: values.vehicle_number,
          type: values.type,
          make: values.make || undefined,
          model: values.model || undefined,
          year: values.year ? Number(values.year) : undefined,
          capacity: values.capacity ? Number(values.capacity) : undefined,
          fuel_type: values.fuel_type || undefined,
          status: values.status || undefined,
          mileage: values.mileage ? Number(values.mileage) : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedVehicle) {
          await updateVehicleMutation.mutateAsync({
            id: selectedVehicle.id,
            ...vehicleData,
          });
        } else {
          await createVehicleMutation.mutateAsync(vehicleData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving vehicle:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Vehicle' : 'Create Vehicle'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="vehicle_number"
              label="Vehicle Number"
              placeholder="Enter vehicle number"
              formik={formik}
              required
            />

            <Input
              name="type"
              label="Vehicle Type"
              placeholder="Enter vehicle type (e.g., Truck, Van)"
              formik={formik}
              required
            />

            <Input
              name="make"
              label="Make"
              placeholder="Enter vehicle make"
              formik={formik}
            />

            <Input
              name="model"
              label="Model"
              placeholder="Enter vehicle model"
              formik={formik}
            />

            <Input
              name="year"
              label="Year"
              placeholder="Enter manufacturing year"
              type="number"
              formik={formik}
            />

            <Input
              name="capacity"
              label="Capacity"
              placeholder="Enter capacity (tons)"
              type="number"
              formik={formik}
            />

            <Input
              name="fuel_type"
              label="Fuel Type"
              placeholder="Enter fuel type (e.g., Diesel, Petrol)"
              formik={formik}
            />

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in-use">In Use</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="out-of-service">Out of Service</MenuItem>
            </Select>

            <Input
              name="mileage"
              label="Mileage (km)"
              placeholder="Enter current mileage"
              type="number"
              formik={formik}
            />

            <Select
              name="is_active"
              label="Active Status"
              formik={formik}
              required
            >
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end items-center ">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createVehicleMutation.isPending ||
                updateVehicleMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createVehicleMutation.isPending ||
                updateVehicleMutation.isPending
              }
            >
              {createVehicleMutation.isPending ||
              updateVehicleMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
              Vehicle
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageVehicle;
