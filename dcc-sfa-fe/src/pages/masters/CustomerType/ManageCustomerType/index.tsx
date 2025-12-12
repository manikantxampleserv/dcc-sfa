import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import {
  useCreateCustomerType,
  useCustomerTypeById,
  useUpdateCustomerType,
  type CustomerType,
} from 'hooks/useCustomerType';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCustomerTypeProps {
  selectedCustomerType?: CustomerType | null;
  setSelectedCustomerType: (customerType: CustomerType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const customerTypeValidationSchema = Yup.object({
  type_name: Yup.string()
    .required('Type name is required')
    .min(2, 'Type name must be at least 2 characters')
    .max(255, 'Type name must be less than 255 characters'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageCustomerType: React.FC<ManageCustomerTypeProps> = ({
  selectedCustomerType,
  setSelectedCustomerType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCustomerType;

  const handleCancel = () => {
    setSelectedCustomerType(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createCustomerTypeMutation = useCreateCustomerType();
  const updateCustomerTypeMutation = useUpdateCustomerType();

  const { data: customerTypeDetailResponse } = useCustomerTypeById(
    selectedCustomerType?.id || 0,
    { enabled: isEdit && !!selectedCustomerType?.id }
  );

  const formik = useFormik({
    initialValues: {
      type_name: selectedCustomerType?.type_name || '',
      is_active: selectedCustomerType?.is_active || 'Y',
    },
    validationSchema: customerTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const customerTypeData = {
          type_name: values.type_name,
          is_active: values.is_active,
        };

        if (isEdit && selectedCustomerType) {
          await updateCustomerTypeMutation.mutateAsync({
            id: selectedCustomerType.id,
            data: customerTypeData,
          });
        } else {
          await createCustomerTypeMutation.mutateAsync(customerTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving customer type:', error);
      }
    },
  });

  React.useEffect(() => {
    if (customerTypeDetailResponse && isEdit) {
      formik.setValues({
        type_name: customerTypeDetailResponse.type_name || '',
        is_active: customerTypeDetailResponse.is_active || 'Y',
      });
    }
  }, [customerTypeDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Customer Type' : 'Create Customer Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="type_name"
              label="Type Name"
              placeholder="Enter type name"
              formik={formik}
              required
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createCustomerTypeMutation.isPending ||
                updateCustomerTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCustomerTypeMutation.isPending ||
                updateCustomerTypeMutation.isPending
              }
            >
              {createCustomerTypeMutation.isPending ||
              updateCustomerTypeMutation.isPending
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

export default ManageCustomerType;
