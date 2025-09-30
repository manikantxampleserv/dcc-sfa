import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import type { Depot, Company, Employee } from 'types/Depot';

interface ManageDepotProps {
  selectedDepot?: Depot | null;
  setSelectedDepot: (depot: Depot | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  companies: Company[];
  employees: Employee[];
}

const ManageDepot: React.FC<ManageDepotProps> = ({
  selectedDepot,
  setSelectedDepot,
  drawerOpen,
  setDrawerOpen,
  companies,
  employees,
}) => {
  const isEdit = !!selectedDepot;

  const handleCancel = () => {
    setSelectedDepot(null);
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      parent_id: selectedDepot?.parent_id?.toString() || '',
      name: selectedDepot?.name || '',
      code: selectedDepot?.code || '',
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
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        console.log('Depot data:', values);
        // Here you would call the API
        handleCancel();
      } catch (error) {
        console.error('Error saving depot:', error);
      }
    },
  });

  const managers = employees.filter(emp => emp.role === 'Manager');
  const supervisors = employees.filter(emp => emp.role === 'Supervisor');
  const coordinators = employees.filter(emp => emp.role === 'Coordinator');

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Depot' : 'Create Depot'}
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

            <Input
              name="code"
              label="Depot Code"
              placeholder="Enter depot code"
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

          <Box className="!flex !justify-end !gap-3 !pt-6 !border-t !border-gray-200">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!capitalize"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="!capitalize"
              disableElevation
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
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

export default ManageDepot;
