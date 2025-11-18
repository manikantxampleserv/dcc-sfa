import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCustomerComplaint,
  useUpdateCustomerComplaint,
  type CustomerComplaint,
} from 'hooks/useCustomerComplaints';
import React from 'react';
import CustomerSelect from 'shared/CustomerSelect';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import * as yup from 'yup';

interface ManageCustomerComplaintProps {
  selectedComplaint?: CustomerComplaint | null;
  setSelectedComplaint: (complaint: CustomerComplaint | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const validationSchema = yup.object({
  customer_id: yup.number().required('Customer is required'),
  complaint_title: yup
    .string()
    .required('Complaint title is required')
    .max(255, 'Complaint title must be less than 255 characters'),
  complaint_description: yup
    .string()
    .required('Complaint description is required')
    .min(10, 'Complaint description must be at least 10 characters'),
  status: yup.string().oneOf(['P', 'R', 'C'], 'Invalid status'),
  submitted_by: yup.number().required('Submitted by is required'),
});

const ManageCustomerComplaint: React.FC<ManageCustomerComplaintProps> = ({
  selectedComplaint,
  setSelectedComplaint,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedComplaint;

  const handleCancel = () => {
    setSelectedComplaint(null);
    setDrawerOpen(false);
  };

  const createComplaintMutation = useCreateCustomerComplaint();
  const updateComplaintMutation = useUpdateCustomerComplaint();

  const formik = useFormik({
    initialValues: {
      customer_id: selectedComplaint?.customer_id || 0,
      complaint_title: selectedComplaint?.complaint_title || '',
      complaint_description: selectedComplaint?.complaint_description || '',
      status: selectedComplaint?.status || 'P',
      submitted_by: selectedComplaint?.submitted_by_user?.id || 0,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const complaintData = {
          customer_id: values.customer_id,
          complaint_title: values.complaint_title,
          complaint_description: values.complaint_description,
          status: values.status,
          submitted_by: values.submitted_by,
        };

        if (isEdit && selectedComplaint) {
          await updateComplaintMutation.mutateAsync({
            id: selectedComplaint.id,
            ...complaintData,
          });
        } else {
          await createComplaintMutation.mutateAsync(complaintData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving customer complaint:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Customer Complaint' : 'Create Customer Complaint'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <CustomerSelect
                name="customer_id"
                label="Customer"
                formik={formik}
                required
                nameToSearch={selectedComplaint?.customer?.name || ''}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="complaint_title"
                label="Complaint Title"
                placeholder="Enter complaint title"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="complaint_description"
                label="Complaint Description"
                placeholder="Enter complaint description"
                formik={formik}
                multiline
                rows={4}
                required
              />
            </Box>

            <UserSelect
              name="submitted_by"
              label="Submitted By"
              formik={formik}
              required
            />

            <Select name="status" label="Status" formik={formik} required>
              <MenuItem value="P">Pending</MenuItem>
              <MenuItem value="R">Resolved</MenuItem>
              <MenuItem value="C">Closed</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createComplaintMutation.isPending ||
                updateComplaintMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createComplaintMutation.isPending ||
                updateComplaintMutation.isPending
              }
            >
              {createComplaintMutation.isPending ||
              updateComplaintMutation.isPending
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

export default ManageCustomerComplaint;
