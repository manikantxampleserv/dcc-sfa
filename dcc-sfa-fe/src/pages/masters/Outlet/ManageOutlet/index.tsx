import { Box, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { useFormik } from 'formik';
import { useCities } from 'hooks/useCity';
import { useCustomerCategories } from 'hooks/useCustomerCategory';
import { useCustomerChannels } from 'hooks/useCustomerChannel';
import {
  useCreateCustomer,
  useUpdateCustomer,
  type Customer,
} from 'hooks/useCustomers';
import { useCustomerTypes } from 'hooks/useCustomerType';
import { useDistricts } from 'hooks/useDistrict';
import { useRegions } from 'hooks/useRegion';
import { useRoutes } from 'hooks/useRoutes';
import { useZones } from 'hooks/useZones';
import React from 'react';
import { customerValidationSchema } from 'schemas/customer.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import DepotSelect from 'shared/DepotSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageOutletProps {
  selectedOutlet?: Customer | null;
  setSelectedOutlet: (outlet: Customer | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageOutlet: React.FC<ManageOutletProps> = ({
  selectedOutlet,
  setSelectedOutlet,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedOutlet;

  const handleCancel = () => {
    setSelectedOutlet(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const { data: customerTypesResponse } = useCustomerTypes(
    {
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen }
  );
  const { data: customerChannelsResponse } = useCustomerChannels(
    {
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen }
  );
  const { data: customerCategoriesResponse } = useCustomerCategories(
    {
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen }
  );

  const { data: regionsResponse } = useRegions(
    { limit: 1000, is_active: 'Y' },
    { enabled: drawerOpen }
  );
  const regions = regionsResponse?.data || [];

  const customerTypes = customerTypesResponse?.data || [];
  const customerChannels = customerChannelsResponse?.data || [];
  const customerCategories = customerCategoriesResponse?.data || [];

  const formik = useFormik({
    initialValues: {
      name: selectedOutlet?.name || '',
      code: selectedOutlet?.code || '',
      depot_id: selectedOutlet?.depot_id?.toString() || '',
      zones_id: selectedOutlet?.zones_id?.toString() || '',
      customer_type_id: selectedOutlet?.customer_type_id?.toString() || '',
      customer_channel_id:
        selectedOutlet?.customer_channel_id?.toString() || '',
      customer_category_id:
        selectedOutlet?.customer_category_id?.toString() || '',
      region_id: selectedOutlet?.region_id?.toString() || '',
      district_id: selectedOutlet?.district_id?.toString() || '',
      city_id: selectedOutlet?.city_id?.toString() || '',
      type: selectedOutlet?.type || 'Retail',
      contact_person: selectedOutlet?.contact_person || '',
      phone_number: selectedOutlet?.phone_number || '',
      email: selectedOutlet?.email || '',
      address: selectedOutlet?.address || '',
      zipcode: selectedOutlet?.zipcode || '',
      latitude: selectedOutlet?.latitude || '',
      longitude: selectedOutlet?.longitude || '',
      credit_limit: selectedOutlet?.credit_limit || '',
      outstanding_amount: selectedOutlet?.outstanding_amount || '0',
      route_id: selectedOutlet?.route_id?.toString() || '',
      nfc_tag_code: selectedOutlet?.nfc_tag_code || '',
      last_visit_date: selectedOutlet?.last_visit_date
        ? selectedOutlet.last_visit_date.split('T')[0]
        : '',
      is_active: selectedOutlet?.is_active || 'Y',
      is_default_for_depot: selectedOutlet?.default_for_depots
        ? selectedOutlet.default_for_depots.length > 0
        : false,
    },
    validationSchema: customerValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const customerData = {
          name: values.name,
          code: values.code,
          depot_id: values.depot_id ? Number(values.depot_id) : undefined,
          zones_id: values.zones_id ? Number(values.zones_id) : undefined,
          customer_type_id: values.customer_type_id
            ? Number(values.customer_type_id)
            : undefined,
          customer_channel_id: values.customer_channel_id
            ? Number(values.customer_channel_id)
            : undefined,
          customer_category_id: values.customer_category_id
            ? Number(values.customer_category_id)
            : undefined,
          region_id: values.region_id ? Number(values.region_id) : undefined,
          district_id: values.district_id
            ? Number(values.district_id)
            : undefined,
          city_id: values.city_id ? Number(values.city_id) : undefined,
          type: values.type,
          contact_person: values.contact_person,
          phone_number: values.phone_number,
          email: values.email,
          address: values.address,
          zipcode: values.zipcode,
          latitude: values.latitude,
          longitude: values.longitude,
          credit_limit: values.credit_limit,
          outstanding_amount: values.outstanding_amount || '0',
          route_id: values.route_id ? Number(values.route_id) : undefined,
          nfc_tag_code: values.nfc_tag_code,
          last_visit_date: values.last_visit_date
            ? new Date(values.last_visit_date).toISOString()
            : undefined,
          is_active: values.is_active,
          is_default_for_depot: values.is_default_for_depot,
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

  const { data: districtsResponse, isFetching: isFetchingDistricts } =
    useDistricts(
      {
        region_id: formik.values.region_id
          ? Number(formik.values.region_id)
          : undefined,
        limit: 1000,
        is_active: 'Y',
      },
      { enabled: drawerOpen && !!formik.values.region_id }
    );
  const districts = districtsResponse?.data || [];

  const { data: citiesResponse, isFetching: isFetchingCities } = useCities(
    {
      district_id: formik.values.district_id
        ? Number(formik.values.district_id)
        : undefined,
      limit: 1000,
      is_active: 'Y',
    },
    { enabled: drawerOpen && !!formik.values.district_id }
  );
  const cities = citiesResponse?.data || [];

  const { data: zonesResponse, isFetching: isFetchingZones } = useZones(
    {
      parent_id: formik.values.depot_id
        ? Number(formik.values.depot_id)
        : undefined,
      limit: 1000,
      isActive: 'Y',
    },
    { enabled: drawerOpen && !!formik.values.depot_id }
  );
  const zones = zonesResponse?.data || [];

  const { data: routesResponse, isFetching: isFetchingRoutes } = useRoutes(
    {
      parent_id: formik.values.zones_id
        ? Number(formik.values.zones_id)
        : undefined,
      depot_id: formik.values.depot_id
        ? Number(formik.values.depot_id)
        : undefined,
      limit: 1000,
      status: 'active',
    },
    { enabled: drawerOpen && !!formik.values.zones_id }
  );
  const routes = routesResponse?.data || [];

  const handleRegionChange = (e: any) => {
    formik.setFieldValue('region_id', e.target.value);
    formik.setFieldValue('district_id', '');
    formik.setFieldValue('city_id', '');
  };

  const handleDistrictChange = (e: any) => {
    formik.setFieldValue('district_id', e.target.value);
    formik.setFieldValue('city_id', '');
  };

  const handleCityChange = (e: any) => {
    const cityId = e.target.value;
    formik.setFieldValue('city_id', cityId);
  };

  const handleDepotChange = (_: any, value: any) => {
    formik.setFieldValue('depot_id', value?.id?.toString() || '');
    formik.setFieldValue('zones_id', '');
    formik.setFieldValue('route_id', '');
  };

  const handleZoneChange = (e: any) => {
    formik.setFieldValue('zones_id', e.target.value);
    formik.setFieldValue('route_id', '');
  };

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

            <Input
              name="code"
              label="Outlet Code"
              placeholder="Enter outlet code"
              formik={formik}
              required
            />

            <DepotSelect
              name="depot_id"
              label="Depot"
              formik={formik}
              required
              onChange={handleDepotChange}
            />

            {formik.values.depot_id && (
              <Box className="!flex !items-center !p-px !bg-gray-50 !border !border-gray-200 !rounded">
                <FormControlLabel
                  control={
                    <Checkbox
                      id="is_default_for_depot"
                      name="is_default_for_depot"
                      checked={formik.values.is_default_for_depot}
                      onChange={formik.handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <span className="!text-sm !font-semibold !text-gray-700 select-none">
                      Set as Default Outlet
                    </span>
                  }
                  className="!m-0"
                />
              </Box>
            )}

            <Select
              name="zones_id"
              label="Zone"
              formik={formik}
              loading={isFetchingZones}
              disabled={!formik.values.depot_id}
              onChange={handleZoneChange}
            >
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="route_id"
              label="Route"
              formik={formik}
              loading={isFetchingRoutes}
              disabled={!formik.values.zones_id}
            >
              {routes.map(route => (
                <MenuItem key={route.id} value={route.id.toString()}>
                  {route.name} ({route.code})
                </MenuItem>
              ))}
            </Select>

            <Select name="customer_type_id" label="Outlet Type" formik={formik}>
              {customerTypes.map(ct => (
                <MenuItem key={ct.id} value={ct.id.toString()}>
                  {ct.type_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="customer_channel_id"
              label="Outlet Channel"
              formik={formik}
              disabled={isFetchingDistricts}
            >
              {customerChannels.map(cc => (
                <MenuItem key={cc.id} value={cc.id.toString()}>
                  {cc.channel_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="customer_category_id"
              label="Outlet Category"
              formik={formik}
            >
              {customerCategories.map(cc => (
                <MenuItem key={cc.id} value={cc.id.toString()}>
                  {cc.category_name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="region_id"
              label="Region"
              formik={formik}
              onChange={handleRegionChange}
            >
              {regions.map(region => (
                <MenuItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="district_id"
              label="District"
              formik={formik}
              loading={isFetchingDistricts}
              disabled={!formik.values.region_id}
              onChange={handleDistrictChange}
            >
              {districts.map(district => (
                <MenuItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="city_id"
              label="City"
              formik={formik}
              disabled={!formik.values.district_id}
              loading={isFetchingCities}
              onChange={handleCityChange}
            >
              {cities.map(city => (
                <MenuItem key={city.id} value={city.id.toString()}>
                  {city.name}
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
                    ? 'Update'
                    : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageOutlet;
