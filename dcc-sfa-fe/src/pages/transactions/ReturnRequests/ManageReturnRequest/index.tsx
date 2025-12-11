import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateReturnRequest,
  useUpdateReturnRequest,
  type ReturnRequest,
} from 'hooks/useReturnRequests';
import React from 'react';
import { returnRequestValidationSchema } from 'schemas/returnRequest.schema';
import type { Product } from 'services/masters/Products';
import type { User } from 'services/masters/Users';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';

interface ManageReturnRequestProps {
  selectedReturnRequest?: ReturnRequest | null;
  setSelectedReturnRequest: (returnRequest: ReturnRequest | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  users: User[];
  products: Product[];
}

const ManageReturnRequest: React.FC<ManageReturnRequestProps> = ({
  selectedReturnRequest,
  setSelectedReturnRequest,
  drawerOpen,
  setDrawerOpen,
  users,
  products,
}) => {
  const isEdit = !!selectedReturnRequest;

  const handleCancel = () => {
    setSelectedReturnRequest(null);
    setDrawerOpen(false);
  };

  const createReturnRequestMutation = useCreateReturnRequest();
  const updateReturnRequestMutation = useUpdateReturnRequest();

  const formik = useFormik({
    initialValues: {
      customer_id: selectedReturnRequest?.customer_id?.toString() || '',
      product_id: selectedReturnRequest?.product_id?.toString() || '',
      serial_id: selectedReturnRequest?.serial_id?.toString() || '',
      return_date: selectedReturnRequest?.return_date
        ? selectedReturnRequest.return_date.split('T')[0]
        : '',
      reason: selectedReturnRequest?.reason || '',
      status: selectedReturnRequest?.status || 'pending',
      approved_by: selectedReturnRequest?.approved_by?.toString() || '',
      approved_date: selectedReturnRequest?.approved_date
        ? selectedReturnRequest.approved_date.split('T')[0]
        : '',
      resolution_notes: selectedReturnRequest?.resolution_notes || '',
      is_active: selectedReturnRequest?.is_active || 'Y',
    },
    validationSchema: returnRequestValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const returnRequestData = {
          customer_id: Number(values.customer_id),
          product_id: Number(values.product_id),
          serial_id: values.serial_id ? Number(values.serial_id) : undefined,
          return_date: values.return_date || undefined,
          reason: values.reason || undefined,
          status: values.status || undefined,
          approved_by: values.approved_by
            ? Number(values.approved_by)
            : undefined,
          approved_date: values.approved_date || undefined,
          resolution_notes: values.resolution_notes || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedReturnRequest) {
          await updateReturnRequestMutation.mutateAsync({
            id: selectedReturnRequest.id,
            ...returnRequestData,
          });
        } else {
          await createReturnRequestMutation.mutateAsync(returnRequestData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving return request:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Return Request' : 'Create Return Request'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
            />

            <ProductSelect name="product_id" label="Product" formik={formik} required />

            <Input
              name="serial_id"
              label="Serial ID"
              type="number"
              placeholder="Enter serial ID (optional)"
              formik={formik}
            />

            <Input
              name="return_date"
              label="Return Date"
              type="date"
              formik={formik}
            />

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>

            <Select name="approved_by" label="Approved By" formik={formik}>
              <MenuItem value="">Select Approver</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="approved_date"
              label="Approved Date"
              type="date"
              formik={formik}
            />

            <Select
              name="is_active"
              label="Active Status"
              formik={formik}
              required
            >
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="reason"
                label="Return Reason"
                placeholder="Enter reason for return"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="resolution_notes"
                label="Resolution Notes"
                placeholder="Enter resolution notes"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center !gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createReturnRequestMutation.isPending ||
                updateReturnRequestMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createReturnRequestMutation.isPending ||
                updateReturnRequestMutation.isPending
              }
            >
              {createReturnRequestMutation.isPending
                ? 'Creating...'
                : updateReturnRequestMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Return Request'
                    : 'Create Return Request'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageReturnRequest;
