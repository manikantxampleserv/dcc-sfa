import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateDeliverySchedule,
  useUpdateDeliverySchedule,
  type DeliverySchedule,
} from 'hooks/useDeliverySchedules';
import React, { useRef, useState } from 'react';
import { deliveryScheduleValidationSchema } from 'schemas/deliverySchedule.schema';
import type { Order } from 'services/masters/Orders';
import type { User } from 'services/masters/Users';
import type { Vehicle } from 'services/masters/Vehicles';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageDeliveryScheduleProps {
  selectedDeliverySchedule?: DeliverySchedule | null;
  setSelectedDeliverySchedule: (
    deliverySchedule: DeliverySchedule | null
  ) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  users: User[];
  vehicles: Vehicle[];
  orders: Order[];
}

const ManageDeliverySchedule: React.FC<ManageDeliveryScheduleProps> = ({
  selectedDeliverySchedule,
  setSelectedDeliverySchedule,
  drawerOpen,
  setDrawerOpen,
  users,
  vehicles,
  orders,
}) => {
  const isEdit = !!selectedDeliverySchedule;
  const [customerSignatureFile, setCustomerSignatureFile] =
    useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    setSelectedDeliverySchedule(null);
    setDrawerOpen(false);
    setCustomerSignatureFile(null);
  };

  const createDeliveryScheduleMutation = useCreateDeliverySchedule();
  const updateDeliveryScheduleMutation = useUpdateDeliverySchedule();

  const formik = useFormik({
    initialValues: {
      order_id: selectedDeliverySchedule?.order_id?.toString() || '',
      customer_id: selectedDeliverySchedule?.customer_id?.toString() || '',
      scheduled_date: selectedDeliverySchedule?.scheduled_date
        ? selectedDeliverySchedule.scheduled_date.split('T')[0]
        : '',
      scheduled_time_slot: selectedDeliverySchedule?.scheduled_time_slot || '',
      assigned_vehicle_id:
        selectedDeliverySchedule?.assigned_vehicle_id?.toString() || '',
      assigned_driver_id:
        selectedDeliverySchedule?.assigned_driver_id?.toString() || '',
      status: selectedDeliverySchedule?.status || 'scheduled',
      priority: selectedDeliverySchedule?.priority || 'medium',
      delivery_instructions:
        selectedDeliverySchedule?.delivery_instructions || '',
      actual_delivery_time: selectedDeliverySchedule?.actual_delivery_time
        ? selectedDeliverySchedule.actual_delivery_time.slice(0, 16)
        : '',
      delivery_proof: selectedDeliverySchedule?.delivery_proof || '',
      failure_reason: selectedDeliverySchedule?.failure_reason || '',
      rescheduled_date: selectedDeliverySchedule?.rescheduled_date
        ? selectedDeliverySchedule.rescheduled_date.slice(0, 16)
        : '',
      is_active: selectedDeliverySchedule?.is_active || 'Y',
    },
    validationSchema: deliveryScheduleValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const deliveryScheduleData = {
          order_id: Number(values.order_id),
          customer_id: Number(values.customer_id),
          scheduled_date: values.scheduled_date,
          scheduled_time_slot: values.scheduled_time_slot || undefined,
          assigned_vehicle_id: values.assigned_vehicle_id
            ? Number(values.assigned_vehicle_id)
            : undefined,
          assigned_driver_id: values.assigned_driver_id
            ? Number(values.assigned_driver_id)
            : undefined,
          status: values.status || undefined,
          priority: values.priority || undefined,
          delivery_instructions: values.delivery_instructions || undefined,
          actual_delivery_time: values.actual_delivery_time
            ? new Date(values.actual_delivery_time).toISOString()
            : undefined,
          delivery_proof: values.delivery_proof || undefined,
          failure_reason: values.failure_reason || undefined,
          rescheduled_date: values.rescheduled_date
            ? new Date(values.rescheduled_date).toISOString()
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedDeliverySchedule) {
          await updateDeliveryScheduleMutation.mutateAsync({
            id: selectedDeliverySchedule.id,
            ...deliveryScheduleData,
          });
        } else {
          await createDeliveryScheduleMutation.mutateAsync(
            deliveryScheduleData
          );
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving delivery schedule:', error);
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomerSignatureFile(file);
    }
  };

  const handleRemoveFile = () => {
    setCustomerSignatureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show all users as potential drivers
  const drivers = users;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Delivery Schedule' : 'Create Delivery Schedule'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="order_id" label="Order" formik={formik} required>
              <MenuItem value="">Select Order</MenuItem>
              {orders.map(order => (
                <MenuItem key={order.id} value={order.id.toString()}>
                  #{order.order_number} -{' '}
                  {order.customer?.name || 'Unknown Customer'}
                </MenuItem>
              ))}
            </Select>

            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
            />

            <Input
              name="scheduled_date"
              label="Scheduled Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="scheduled_time_slot"
              label="Scheduled Time Slot"
              placeholder="e.g., 9:00 AM - 11:00 AM"
              formik={formik}
            />

            <Select
              name="assigned_vehicle_id"
              label="Assigned Vehicle"
              formik={formik}
            >
              <MenuItem value="">Select Vehicle</MenuItem>
              {vehicles.map(vehicle => (
                <MenuItem key={vehicle.id} value={vehicle.id.toString()}>
                  {vehicle.vehicle_number} - {vehicle.type || 'Unknown Type'}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="assigned_driver_id"
              label="Assigned Driver"
              formik={formik}
            >
              <MenuItem value="">Select Driver</MenuItem>
              {drivers.map(driver => (
                <MenuItem key={driver.id} value={driver.id.toString()}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="rescheduled">Rescheduled</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>

            <Select name="priority" label="Priority" formik={formik}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>

            <Input
              name="actual_delivery_time"
              label="Actual Delivery Time"
              type="datetime-local"
              formik={formik}
            />

            <Input
              name="delivery_proof"
              label="Delivery Proof"
              placeholder="e.g., Photo URL or reference number"
              formik={formik}
            />

            <Input
              name="rescheduled_date"
              label="Rescheduled Date"
              type="datetime-local"
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
                name="delivery_instructions"
                label="Delivery Instructions"
                placeholder="Enter delivery instructions"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Box className="md:!col-span-2">
              <Input
                name="failure_reason"
                label="Failure Reason"
                placeholder="Enter failure reason if delivery failed"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            {/* Customer Signature Upload */}
            <Box className="md:!col-span-2">
              <Box className="!mb-2">
                <label className="!text-sm !font-medium !text-gray-700">
                  Customer Signature
                </label>
              </Box>
              {!customerSignatureFile ? (
                <Box
                  className="!border-2 !border-dashed !border-gray-300 !rounded-lg !p-4 !text-center hover:!border-primary-400 !transition-colors !cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="!text-gray-600 !mb-2">
                    Click to upload customer signature
                  </p>
                  <p className="!text-sm !text-gray-500">
                    PNG, JPG, PDF files only
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileSelect}
                    className="!hidden"
                  />
                </Box>
              ) : (
                <Box className="!flex !items-center !justify-between !p-3 !bg-gray-50 !rounded-lg">
                  <Box className="!flex !items-center !gap-3">
                    <Box>
                      <p className="!text-sm !font-medium !text-gray-900">
                        {customerSignatureFile.name}
                      </p>
                      <p className="!text-xs !text-gray-500">
                        {(customerSignatureFile.size / 1024).toFixed(1)} KB
                      </p>
                    </Box>
                  </Box>
                  <Button
                    color="error"
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center !gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createDeliveryScheduleMutation.isPending ||
                updateDeliveryScheduleMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createDeliveryScheduleMutation.isPending ||
                updateDeliveryScheduleMutation.isPending
              }
            >
              {createDeliveryScheduleMutation.isPending
                ? 'Creating...'
                : updateDeliveryScheduleMutation.isPending
                  ? 'Updating...'
                  : isEdit
                    ? 'Update Delivery Schedule'
                    : 'Create Delivery Schedule'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageDeliverySchedule;
