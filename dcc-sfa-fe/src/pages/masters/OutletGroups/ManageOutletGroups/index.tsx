import {
  Autocomplete,
  Box,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCustomers, type Customer } from 'hooks/useCustomers';
import {
  useCreateOutletGroup,
  useUpdateOutletGroup,
  type OutletGroup,
} from 'hooks/useOutletGroups';
import React, { useEffect } from 'react';
import { outletGroupValidationSchema } from 'schemas/outletGroup.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageOutletGroupProps {
  selectedOutletGroup?: OutletGroup | null;
  setSelectedOutletGroup: (outletGroup: OutletGroup | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageOutletGroup: React.FC<ManageOutletGroupProps> = ({
  selectedOutletGroup,
  setSelectedOutletGroup,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedOutletGroup;

  const handleCancel = () => {
    setSelectedOutletGroup(null);
    setDrawerOpen(false);
  };

  const createOutletGroupMutation = useCreateOutletGroup();
  const updateOutletGroupMutation = useUpdateOutletGroup();

  // Fetch all customers for selection
  const { data: customersResponse, isLoading: customersLoading } = useCustomers(
    {
      page: 1,
      limit: 1000, // Get all customers
      isActive: 'Y',
    }
  );

  const customers = customersResponse?.data || [];

  // Get selected customer IDs from the group members
  const getSelectedCustomers = () => {
    if (!selectedOutletGroup?.members) return [];
    return customers.filter(customer =>
      selectedOutletGroup.members?.some(
        member => member.customer_id === customer.id
      )
    );
  };

  const formik = useFormik({
    initialValues: {
      name: selectedOutletGroup?.name || '',
      description: selectedOutletGroup?.description || '',
      discount_percentage: selectedOutletGroup?.discount_percentage || '',
      credit_terms: selectedOutletGroup?.credit_terms || '',
      payment_terms: selectedOutletGroup?.payment_terms || '',
      price_group: selectedOutletGroup?.price_group || '',
      is_active: selectedOutletGroup?.is_active || 'Y',
      selectedCustomers: getSelectedCustomers(),
      customerGroups:
        selectedOutletGroup?.members?.map(member => ({
          customer_id: member.customer_id,
          is_active: 'Y',
        })) || [],
    },
    validationSchema: outletGroupValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const outletGroupData = {
          name: values.name,
          description: values.description || undefined,
          discount_percentage: values.discount_percentage
            ? Number(values.discount_percentage)
            : undefined,
          credit_terms: values.credit_terms
            ? Number(values.credit_terms)
            : undefined,
          payment_terms: values.payment_terms || undefined,
          price_group: values.price_group || undefined,
          is_active: values.is_active,
          customerGroups: values.customerGroups,
        };

        if (isEdit && selectedOutletGroup) {
          await updateOutletGroupMutation.mutateAsync({
            id: selectedOutletGroup.id,
            ...outletGroupData,
          });
        } else {
          await createOutletGroupMutation.mutateAsync(outletGroupData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving outlet group:', error);
      }
    },
  });

  // Update customerGroups when selectedCustomers changes
  useEffect(() => {
    if (formik.values.selectedCustomers) {
      formik.setFieldValue(
        'customerGroups',
        formik.values.selectedCustomers.map((customer: Customer) => ({
          customer_id: customer.id,
          is_active: 'Y',
        }))
      );
    }
  }, [formik.values.selectedCustomers]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet Group' : 'Create Outlet Group'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Group Name"
              placeholder="Enter outlet group name"
              formik={formik}
              required
            />

            <Input
              name="discount_percentage"
              label="Discount Percentage (%)"
              type="number"
              placeholder="Enter discount percentage"
              formik={formik}
            />

            <Input
              name="credit_terms"
              label="Credit Terms (Days)"
              type="number"
              placeholder="Enter credit terms in days"
              formik={formik}
            />

            <Input
              name="payment_terms"
              label="Payment Terms"
              placeholder="Enter payment terms"
              formik={formik}
            />

            <Input
              name="price_group"
              label="Price Group"
              placeholder="Enter price group"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter group description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Typography
                variant="body2"
                className="!mb-2 !font-medium !text-gray-700"
              >
                Select Customers <span className="!text-red-500">*</span>
              </Typography>
              <Autocomplete
                multiple
                size="small"
                id="customers-autocomplete"
                options={customers}
                value={formik.values.selectedCustomers}
                onChange={(_event, newValue) => {
                  formik.setFieldValue('selectedCustomers', newValue);
                }}
                getOptionLabel={option => `${option.name}`}
                loading={customersLoading}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder="Select customers"
                    error={
                      formik.touched.customerGroups &&
                      Boolean(formik.errors.customerGroups)
                    }
                    helperText={
                      formik.touched.customerGroups &&
                      typeof formik.errors.customerGroups === 'string'
                        ? formik.errors.customerGroups
                        : ''
                    }
                  />
                )}
                slotProps={{
                  chip: {
                    size: 'small',
                    color: 'primary',
                    variant: 'outlined',
                  },
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box className="!flex !flex-col">
                      <Typography variant="body2" className="!font-medium">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {option.code} • {option.type || 'N/A'} •{' '}
                        {option.city || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <Typography variant="caption" className="!text-gray-500 !mt-1">
                {formik.values.selectedCustomers?.length || 0} customer(s)
                selected
              </Typography>
            </Box>
          </Box>

          <Box className="!flex !justify-end !gap-3 !items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createOutletGroupMutation.isPending ||
                updateOutletGroupMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createOutletGroupMutation.isPending ||
                updateOutletGroupMutation.isPending
              }
            >
              {createOutletGroupMutation.isPending
                ? 'Creating...'
                : updateOutletGroupMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Outlet Group'
                    : 'Create Outlet Group'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageOutletGroup;
