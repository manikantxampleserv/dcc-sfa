import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCustomer,
  useUpdateCustomer,
  type Customer,
} from 'hooks/useCustomers';
import React from 'react';
import { customerValidationSchema } from 'schemas/customer.schema';
import type { Route } from 'services/masters/Routes';
import type { Zone } from 'services/masters/Zones';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';

interface ManageOutletProps {
  selectedOutlet?: Customer | null;
  setSelectedOutlet: (outlet: Customer | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  routes: Route[];
  zones: Zone[];
}

const ManageOutlet: React.FC<ManageOutletProps> = ({
  selectedOutlet,
  setSelectedOutlet,
  drawerOpen,
  setDrawerOpen,
  routes,
  zones,
}) => {
  const isEdit = !!selectedOutlet;

  const handleCancel = () => {
    setSelectedOutlet(null);
    setDrawerOpen(false);
  };

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const formik = useFormik({
    initialValues: {
      name: selectedOutlet?.name || '',
      zones_id: selectedOutlet?.zones_id?.toString() || '',
      type: selectedOutlet?.type || 'Retail',
      contact_person: selectedOutlet?.contact_person || '',
      phone_number: selectedOutlet?.phone_number || '',
      email: selectedOutlet?.email || '',
      address: selectedOutlet?.address || '',
      city: selectedOutlet?.city || '',
      state: selectedOutlet?.state || '',
      zipcode: selectedOutlet?.zipcode || '',
      latitude: selectedOutlet?.latitude || '',
      longitude: selectedOutlet?.longitude || '',
      credit_limit: selectedOutlet?.credit_limit || '',
      outstanding_amount: selectedOutlet?.outstanding_amount || '0',
      route_id: selectedOutlet?.route_id?.toString() || '',
      salesperson_id: selectedOutlet?.salesperson_id?.toString() || '',
      last_visit_date: selectedOutlet?.last_visit_date
        ? selectedOutlet.last_visit_date.split('T')[0]
        : '',
      is_active: selectedOutlet?.is_active || 'Y',
    },
    validationSchema: customerValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const customerData = {
          name: values.name,
          zones_id: values.zones_id ? Number(values.zones_id) : undefined,
          type: values.type || undefined,
          contact_person: values.contact_person || undefined,
          phone_number: values.phone_number || undefined,
          email: values.email || undefined,
          address: values.address || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          zipcode: values.zipcode || undefined,
          latitude: values.latitude || undefined,
          longitude: values.longitude || undefined,
          credit_limit: values.credit_limit || undefined,
          outstanding_amount: values.outstanding_amount || '0',
          route_id: values.route_id ? Number(values.route_id) : undefined,
          salesperson_id: values.salesperson_id
            ? Number(values.salesperson_id)
            : undefined,
          last_visit_date: values.last_visit_date
            ? new Date(values.last_visit_date).toISOString()
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedOutlet) {
          await updateCustomerMutation.mutateAsync({
            id: selectedOutlet.id,
            ...customerData,
          });
        } else {
          await createCustomerMutation.mutateAsync(customerData);
        }

        handleCancel();
      } catch (error) {
        console.log('Error saving customer:', error);
      }
    },
  });

  console.log(formik.errors);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet' : 'Create Outlet'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Outlet Name"
              placeholder="Enter outlet name"
              formik={formik}
              required
            />

            <Select name="type" label="Outlet Type" formik={formik}>
              <MenuItem value="Retail">Retail</MenuItem>
              <MenuItem value="Wholesale">Wholesale</MenuItem>
              <MenuItem value="Corporate">Corporate</MenuItem>
              <MenuItem value="Industrial">Industrial</MenuItem>
              <MenuItem value="Healthcare">Healthcare</MenuItem>
              <MenuItem value="Automotive">Automotive</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
              <MenuItem value="Manufacturing">Manufacturing</MenuItem>
              <MenuItem value="Distribution">Distribution</MenuItem>
            </Select>

            <Input
              name="contact_person"
              label="Contact Person"
              placeholder="Enter contact person name"
              formik={formik}
            />

            <Input
              name="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              formik={formik}
            />

            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
              formik={formik}
            />

            <Select name="zones_id" label="Zone" formik={formik}>
              <MenuItem value="">Select Zone</MenuItem>
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="route_id" label="Route" formik={formik}>
              <MenuItem value="">Select Route</MenuItem>
              {routes.map(route => (
                <MenuItem key={route.id} value={route.id.toString()}>
                  {route.name} ({route.code})
                </MenuItem>
              ))}
            </Select>

            <UserSelect
              name="salesperson_id"
              label="Salesperson"
              formik={formik}
            />

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
              name="latitude"
              label="Latitude"
              placeholder="Enter latitude"
              formik={formik}
            />

            <Input
              name="longitude"
              label="Longitude"
              placeholder="Enter longitude"
              formik={formik}
            />

            <Input
              name="credit_limit"
              label="Credit Limit"
              placeholder="Enter credit limit"
              formik={formik}
            />

            <Input
              name="outstanding_amount"
              label="Outstanding Amount"
              placeholder="Enter outstanding amount"
              formik={formik}
            />

            <Input
              name="last_visit_date"
              label="Last Visit Date"
              type="date"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="address"
                label="Address"
                placeholder="Enter full address"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center !gap-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createCustomerMutation.isPending ||
                updateCustomerMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createCustomerMutation.isPending ||
                updateCustomerMutation.isPending
              }
            >
              {createCustomerMutation.isPending
                ? 'Creating...'
                : updateCustomerMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Outlet'
                    : 'Create Outlet'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageOutlet;
