import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCoolerInstallation,
  useUpdateCoolerInstallation,
  type CoolerInstallation,
} from 'hooks/useCoolerInstallations';
import { useUsers } from 'hooks/useUsers';
import React from 'react';
import { coolerInstallationValidationSchema } from 'schemas/coolerInstallation.schema';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageCoolerInstallationProps {
  selectedInstallation?: CoolerInstallation | null;
  setSelectedInstallation: (installation: CoolerInstallation | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCoolerInstallation: React.FC<ManageCoolerInstallationProps> = ({
  selectedInstallation,
  setSelectedInstallation,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedInstallation;

  const handleCancel = () => {
    setSelectedInstallation(null);
    setDrawerOpen(false);
  };

  const createCoolerInstallationMutation = useCreateCoolerInstallation();
  const updateCoolerInstallationMutation = useUpdateCoolerInstallation();

  // Fetch users for dropdowns
  const { data: usersResponse } = useUsers({ limit: 1000 });

  const users = usersResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      customer_id: selectedInstallation?.customer_id || '',
      code: selectedInstallation?.code || '',
      brand: selectedInstallation?.brand || '',
      model: selectedInstallation?.model || '',
      serial_number: selectedInstallation?.serial_number || '',
      capacity: selectedInstallation?.capacity || '',
      install_date: selectedInstallation?.install_date
        ? formatForDateInput(selectedInstallation.install_date)
        : '',
      last_service_date: selectedInstallation?.last_service_date
        ? formatForDateInput(selectedInstallation.last_service_date)
        : '',
      next_service_due: selectedInstallation?.next_service_due
        ? formatForDateInput(selectedInstallation.next_service_due)
        : '',
      status: selectedInstallation?.status || 'working',
      temperature: selectedInstallation?.temperature || '',
      energy_rating: selectedInstallation?.energy_rating || '',
      warranty_expiry: selectedInstallation?.warranty_expiry
        ? formatForDateInput(selectedInstallation.warranty_expiry)
        : '',
      maintenance_contract: selectedInstallation?.maintenance_contract || '',
      technician_id: selectedInstallation?.technician_id || '',
      last_scanned_date: selectedInstallation?.last_scanned_date
        ? formatForDateInput(selectedInstallation.last_scanned_date)
        : '',
      is_active: selectedInstallation?.is_active || 'Y',
    },
    validationSchema: coolerInstallationValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const installationData = {
          customer_id: Number(values.customer_id),
          code: values.code,
          brand: values.brand || undefined,
          model: values.model || undefined,
          serial_number: values.serial_number || undefined,
          capacity: values.capacity ? Number(values.capacity) : undefined,
          install_date: values.install_date || undefined,
          last_service_date: values.last_service_date || undefined,
          next_service_due: values.next_service_due || undefined,
          status: values.status || undefined,
          temperature: values.temperature
            ? Number(values.temperature)
            : undefined,
          energy_rating: values.energy_rating || undefined,
          warranty_expiry: values.warranty_expiry || undefined,
          maintenance_contract: values.maintenance_contract || undefined,
          technician_id: values.technician_id
            ? Number(values.technician_id)
            : undefined,
          last_scanned_date: values.last_scanned_date || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedInstallation) {
          await updateCoolerInstallationMutation.mutateAsync({
            id: selectedInstallation.id,
            ...installationData,
          });
        } else {
          await createCoolerInstallationMutation.mutateAsync(installationData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving cooler installation:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Cooler Installation' : 'Create Cooler Installation'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {/* Customer Selection */}
            <Box className="md:!col-span-2">
              <CustomerSelect
                name="customer_id"
                label="Customer"
                formik={formik}
                required
              />
            </Box>

            {/* Cooler Code */}
            <Box className="md:!col-span-2">
              <Input
                name="code"
                label="Cooler Code"
                placeholder="Enter unique cooler code"
                formik={formik}
                required
              />
            </Box>

            {/* Brand and Model */}
            <Input
              name="brand"
              label="Brand"
              placeholder="Enter cooler brand"
              formik={formik}
            />

            <Input
              name="model"
              label="Model"
              placeholder="Enter cooler model"
              formik={formik}
            />

            {/* Serial Number and Capacity */}
            <Input
              name="serial_number"
              label="Serial Number"
              placeholder="Enter serial number"
              formik={formik}
            />

            <Input
              name="capacity"
              label="Capacity (Liters)"
              placeholder="Enter capacity"
              formik={formik}
              type="number"
            />

            {/* Installation Date */}
            <Input
              name="install_date"
              label="Installation Date"
              formik={formik}
              type="date"
            />

            {/* Status */}
            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="working">Working</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="broken">Broken</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>

            {/* Temperature */}
            <Input
              name="temperature"
              label="Temperature (°C)"
              placeholder="Enter current temperature"
              formik={formik}
              type="number"
            />

            {/* Energy Rating */}
            <Input
              name="energy_rating"
              label="Energy Rating"
              placeholder="e.g., A++, A+, A"
              formik={formik}
            />

            {/* Last Service Date */}
            <Input
              name="last_service_date"
              label="Last Service Date"
              formik={formik}
              type="date"
            />

            {/* Next Service Due */}
            <Input
              name="next_service_due"
              label="Next Service Due"
              formik={formik}
              type="date"
            />

            {/* Warranty Expiry */}
            <Input
              name="warranty_expiry"
              label="Warranty Expiry"
              formik={formik}
              type="date"
            />

            {/* Technician */}
            <Select name="technician_id" label="Technician" formik={formik}>
              <MenuItem value="">
                <em>Select Technician</em>
              </MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            {/* Last Scanned Date */}
            <Input
              name="last_scanned_date"
              label="Last Scanned Date"
              formik={formik}
              type="date"
            />

            {/* Maintenance Contract */}
            <Box className="md:!col-span-2">
              <Input
                name="maintenance_contract"
                label="Maintenance Contract"
                placeholder="Enter maintenance contract details"
                formik={formik}
                multiline
                rows={2}
              />
            </Box>

            {/* Active Status */}
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
                createCoolerInstallationMutation.isPending ||
                updateCoolerInstallationMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCoolerInstallationMutation.isPending ||
                updateCoolerInstallationMutation.isPending
              }
            >
              {createCoolerInstallationMutation.isPending ||
              updateCoolerInstallationMutation.isPending
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

export default ManageCoolerInstallation;
