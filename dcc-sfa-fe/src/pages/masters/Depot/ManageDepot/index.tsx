import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import {
  useCreateDepot,
  useUpdateDepot,
  type Depot,
} from '../../../../hooks/useDepots';
import type { Company } from '../../../../services/masters/Companies';
import type { User } from '../../../../services/masters/Users';
import { depotValidationSchema } from '../../../../schemas/depot.schema';

interface ManageDepotProps {
  selectedDepot?: Depot | null;
  setSelectedDepot: (depot: Depot | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  companies: Company[];
  users: User[];
}

const ManageDepot: React.FC<ManageDepotProps> = ({
  selectedDepot,
  setSelectedDepot,
  drawerOpen,
  setDrawerOpen,
  companies,
  users,
}) => {
  const isEdit = !!selectedDepot;

  const handleCancel = () => {
    setSelectedDepot(null);
    setDrawerOpen(false);
  };

  const createDepotMutation = useCreateDepot();
  const updateDepotMutation = useUpdateDepot();

  const formik = useFormik({
    initialValues: {
      parent_id: selectedDepot?.parent_id?.toString() || '',
      name: selectedDepot?.name || '',
      address: selectedDepot?.address || '',
      city: selectedDepot?.city || '',
      state: selectedDepot?.state || '',
      zipcode: selectedDepot?.zipcode || '',
      phone_number: selectedDepot?.phone_number || '',
      email: selectedDepot?.email || '',
      manager_id: selectedDepot?.manager_id?.toString() || '',
      supervisor_id: selectedDepot?.supervisor_id?.toString() || '',
      coordinator_id: selectedDepot?.coordinator_id?.toString() || '',
      latitude: selectedDepot?.latitude?.toString() || '',
      longitude: selectedDepot?.longitude?.toString() || '',
      is_active: selectedDepot?.is_active || 'Y',
    },
    validationSchema: depotValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const depotData = {
          parent_id: Number(values.parent_id),
          name: values.name,
          address: values.address || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          zipcode: values.zipcode || undefined,
          phone_number: values.phone_number || undefined,
          email: values.email || undefined,
          manager_id: values.manager_id ? Number(values.manager_id) : undefined,
          supervisor_id: values.supervisor_id
            ? Number(values.supervisor_id)
            : undefined,
          coordinator_id: values.coordinator_id
            ? Number(values.coordinator_id)
            : undefined,
          latitude: values.latitude ? Number(values.latitude) : undefined,
          longitude: values.longitude ? Number(values.longitude) : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedDepot) {
          await updateDepotMutation.mutateAsync({
            id: selectedDepot.id,
            ...depotData,
          });
        } else {
          await createDepotMutation.mutateAsync(depotData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving depot:', error);
      }
    },
  });

  const managers = users;
  const supervisors = users;
  const coordinators = users;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Depot' : 'Create Depot'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="parent_id" label="Company" formik={formik} required>
              <MenuItem value="">Select Company</MenuItem>
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.name} ({company.code})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="name"
              label="Depot Name"
              placeholder="Enter depot name"
              formik={formik}
              required
            />

            <Box className="md:!col-span-2">
              <Input
                name="address"
                label="Address"
                placeholder="Enter depot address"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Input
              name="city"
              label="City"
              placeholder="Enter city"
              formik={formik}
            />

            <Input
              name="state"
              label="State"
              placeholder="Enter state"
              formik={formik}
            />

            <Input
              name="zipcode"
              label="Zip Code"
              placeholder="Enter zip code"
              formik={formik}
            />

            <Input
              name="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              formik={formik}
              type="tel"
            />

            <Input
              name="email"
              label="Email"
              placeholder="Enter email address"
              formik={formik}
              type="email"
            />

            <Select name="manager_id" label="Manager" formik={formik}>
              <MenuItem value="">Select Manager</MenuItem>
              {managers.map(manager => (
                <MenuItem key={manager.id} value={manager.id.toString()}>
                  {manager.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="supervisor_id" label="Supervisor" formik={formik}>
              <MenuItem value="">Select Supervisor</MenuItem>
              {supervisors.map(supervisor => (
                <MenuItem key={supervisor.id} value={supervisor.id.toString()}>
                  {supervisor.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="coordinator_id" label="Coordinator" formik={formik}>
              <MenuItem value="">Select Coordinator</MenuItem>
              {coordinators.map(coordinator => (
                <MenuItem
                  key={coordinator.id}
                  value={coordinator.id.toString()}
                >
                  {coordinator.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="latitude"
              label="Latitude"
              placeholder="Enter latitude"
              formik={formik}
              type="number"
            />

            <Input
              name="longitude"
              label="Longitude"
              placeholder="Enter longitude"
              formik={formik}
              type="number"
            />

            <Select name="is_active" label="Status" formik={formik} required>
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
                createDepotMutation.isPending || updateDepotMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createDepotMutation.isPending || updateDepotMutation.isPending
              }
            >
              {createDepotMutation.isPending || updateDepotMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
              Depot
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageDepot;
