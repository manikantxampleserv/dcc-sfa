import { Box } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import {
  useCreateCustomerChannel,
  useCustomerChannelById,
  useUpdateCustomerChannel,
  type CustomerChannel,
} from 'hooks/useCustomerChannel';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

interface ManageCustomerChannelProps {
  selectedCustomerChannel?: CustomerChannel | null;
  setSelectedCustomerChannel: (customerChannel: CustomerChannel | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const customerChannelValidationSchema = Yup.object({
  channel_name: Yup.string()
    .required('Channel name is required')
    .min(2, 'Channel name must be at least 2 characters')
    .max(255, 'Channel name must be less than 255 characters'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageCustomerChannel: React.FC<ManageCustomerChannelProps> = ({
  selectedCustomerChannel,
  setSelectedCustomerChannel,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCustomerChannel;

  const handleCancel = () => {
    setSelectedCustomerChannel(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createCustomerChannelMutation = useCreateCustomerChannel();
  const updateCustomerChannelMutation = useUpdateCustomerChannel();

  const { data: customerChannelDetailResponse } = useCustomerChannelById(
    selectedCustomerChannel?.id || 0,
    { enabled: isEdit && !!selectedCustomerChannel?.id }
  );

  const formik = useFormik({
    initialValues: {
      channel_name: selectedCustomerChannel?.channel_name || '',
      is_active: selectedCustomerChannel?.is_active || 'Y',
    },
    validationSchema: customerChannelValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const customerChannelData = {
          channel_name: values.channel_name,
          is_active: values.is_active,
        };

        if (isEdit && selectedCustomerChannel) {
          await updateCustomerChannelMutation.mutateAsync({
            id: selectedCustomerChannel.id,
            data: customerChannelData,
          });
        } else {
          await createCustomerChannelMutation.mutateAsync(customerChannelData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving outlet channel:', error);
      }
    },
  });

  React.useEffect(() => {
    if (customerChannelDetailResponse && isEdit) {
      formik.setValues({
        channel_name: customerChannelDetailResponse.channel_name || '',
        is_active: customerChannelDetailResponse.is_active || 'Y',
      });
    }
  }, [customerChannelDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Outlet Channel' : 'Create Outlet Channel'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Input
            name="channel_name"
            label="Channel Name"
            placeholder="Enter channel name"
            formik={formik}
            required
          />

          <ActiveInactiveField
            name="is_active"
            label="Status"
            formik={formik}
            required
          />

          <Box className="!flex !justify-end items-center gap-2 !mt-6 !pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createCustomerChannelMutation.isPending ||
                updateCustomerChannelMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCustomerChannelMutation.isPending ||
                updateCustomerChannelMutation.isPending
              }
            >
              {createCustomerChannelMutation.isPending ||
              updateCustomerChannelMutation.isPending
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

export default ManageCustomerChannel;
