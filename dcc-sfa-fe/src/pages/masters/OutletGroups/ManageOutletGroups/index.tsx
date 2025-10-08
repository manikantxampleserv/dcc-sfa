import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateOutletGroup,
  useUpdateOutletGroup,
  type OutletGroup,
} from 'hooks/useOutletGroups';
import React from 'react';
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

  const formik = useFormik({
    initialValues: {
      name: selectedOutletGroup?.name || '',
      description: selectedOutletGroup?.description || '',
      discount_percentage: selectedOutletGroup?.discount_percentage || '',
      credit_terms: selectedOutletGroup?.credit_terms || '',
      payment_terms: selectedOutletGroup?.payment_terms || '',
      price_group: selectedOutletGroup?.price_group || '',
      is_active: selectedOutletGroup?.is_active || 'Y',
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
          </Box>

          <Box className="!flex !justify-end !gap-3">
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
