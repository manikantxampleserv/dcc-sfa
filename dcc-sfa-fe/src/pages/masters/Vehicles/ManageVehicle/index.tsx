import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateVehicle,
  useUpdateVehicle,
  type Vehicle,
} from 'hooks/useVehicles';
import React from 'react';
import { vehicleValidationSchema } from 'schemas/vehicle.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
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
    formik.resetForm();
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
          make: values.make,
          model: values.model,
          year: values.year ? Number(values.year) : undefined,
          capacity: values.capacity ? Number(values.capacity) : undefined,
          fuel_type: values.fuel_type,
          status: values.status,
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

            <Select name="type" label="Vehicle Type" formik={formik} required>
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Trailer">Trailer</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
              <MenuItem value="Pickup">Pickup</MenuItem>
              <MenuItem value="Motorcycle">Motorcycle</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Bus">Bus</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>

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

            <Select name="fuel_type" label="Fuel Type" formik={formik}>
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="CNG">CNG</MenuItem>
              <MenuItem value="LPG">LPG</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>

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

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>
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
