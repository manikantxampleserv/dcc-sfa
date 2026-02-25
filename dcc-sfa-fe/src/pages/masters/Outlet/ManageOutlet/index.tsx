import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useCustomerChannels } from 'hooks/useCustomerChannel';
import {
  useCreateCustomer,
  useUpdateCustomer,
  type Customer,
} from 'hooks/useCustomers';
import { useCustomerTypes } from 'hooks/useCustomerType';
import React from 'react';
import { customerValidationSchema } from 'schemas/customer.schema';
import type { Route } from 'services/masters/Routes';
import type { Zone } from 'services/masters/Zones';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import DepotSelect from 'shared/DepotSelect';
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
    formik.resetForm();
  };

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const { data: customerTypesResponse } = useCustomerTypes({
    limit: 1000,
    is_active: 'Y',
  });
  const { data: customerChannelsResponse } = useCustomerChannels({
    limit: 1000,
    is_active: 'Y',
  });

  const customerTypes = customerTypesResponse?.data || [];
  const customerChannels = customerChannelsResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      name: selectedOutlet?.name || '',
      short_name: selectedOutlet?.short_name || '',
      depot_id: selectedOutlet?.depot_id?.toString() || '',
      zones_id: selectedOutlet?.zones_id?.toString() || '',
      customer_type_id: selectedOutlet?.customer_type_id?.toString() || '',
      customer_channel_id:
        selectedOutlet?.customer_channel_id?.toString() || '',
      type: selectedOutlet?.type || 'Retail',
      internal_code_one: selectedOutlet?.internal_code_one || '',
      internal_code_two: selectedOutlet?.internal_code_two || '',
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
      nfc_tag_code: selectedOutlet?.nfc_tag_code || '',
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
          short_name: values.short_name,
          depot_id: values.depot_id ? Number(values.depot_id) : undefined,
          zones_id: values.zones_id ? Number(values.zones_id) : undefined,
          customer_type_id: values.customer_type_id
            ? Number(values.customer_type_id)
            : undefined,
          customer_channel_id: values.customer_channel_id
            ? Number(values.customer_channel_id)
            : undefined,
          type: values.type,
          internal_code_one: values.internal_code_one,
          internal_code_two: values.internal_code_two,
          contact_person: values.contact_person,
          phone_number: values.phone_number,
          email: values.email,
          address: values.address,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
          latitude: values.latitude,
          longitude: values.longitude,
          credit_limit: values.credit_limit,
          outstanding_amount: values.outstanding_amount || '0',
          route_id: values.route_id ? Number(values.route_id) : undefined,
          salesperson_id: values.salesperson_id
            ? Number(values.salesperson_id)
            : undefined,
          nfc_tag_code: values.nfc_tag_code,
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

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet' : 'Create Outlet'}
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Outlet Name"
              placeholder="Enter outlet name"
              formik={formik}
              required
            />

            <DepotSelect
              name="depot_id"
              label="Depot"
              formik={formik}
              required
            />

            <Select name="zones_id" label="Zone" formik={formik}>
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="customer_type_id"
              label="Customer Type"
              formik={formik}
            >
              {customerTypes.map(ct => (
                <MenuItem key={ct.id} value={ct.id.toString()}>
                  {ct.type_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="customer_channel_id"
              label="Customer Channel"
              formik={formik}
            >
              {customerChannels.map(cc => (
                <MenuItem key={cc.id} value={cc.id.toString()}>
                  {cc.channel_name}
                </MenuItem>
              ))}
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

            <Input
              name="internal_code_one"
              label="Internal Code One"
              placeholder="Enter internal code one"
              formik={formik}
            />

            <Input
              name="internal_code_two"
              label="Internal Code Two"
              placeholder="Enter internal code two"
              formik={formik}
            />

            <Select name="route_id" label="Route" formik={formik}>
              {routes.map(route => (
                <MenuItem key={route.id} value={route.id.toString()}>
                  {route.name} ({route.code})
                </MenuItem>
              ))}
            </Select>

            <UserSelect
              name="salesperson_id"
              label="Sales Person"
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

            <Box className="md:!col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>

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
