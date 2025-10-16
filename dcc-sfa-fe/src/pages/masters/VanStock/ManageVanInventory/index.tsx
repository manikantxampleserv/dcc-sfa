import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useProducts } from 'hooks/useProducts';
import { useUsers } from 'hooks/useUsers';
import { useVehicles } from 'hooks/useVehicles';
import { useDepots } from 'hooks/useDepots';
import {
  useCreateVanInventory,
  useUpdateVanInventory,
  type VanInventory,
} from 'hooks/useVanInventory';
import React, { useEffect, useState } from 'react';
import { vanInventoryValidationSchema } from 'schemas/vanInventory.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageVanInventoryProps {
  selectedVanInventory?: VanInventory | null;
  setSelectedVanInventory: (vanInventory: VanInventory | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageVanInventory: React.FC<ManageVanInventoryProps> = ({
  selectedVanInventory,
  setSelectedVanInventory,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedVanInventory;
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const handleCancel = () => {
    setSelectedVanInventory(null);
    setDrawerOpen(false);
    setSelectedProductId(null);
  };

  const createVanInventoryMutation = useCreateVanInventory();
  const updateVanInventoryMutation = useUpdateVanInventory();

  // Fetch related data
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: vehiclesResponse } = useVehicles({ limit: 1000 });
  const { data: depotsResponse } = useDepots({ limit: 1000 });
  // TODO: Implement batch lots and serial numbers hooks
  const users = usersResponse?.data || [];
  const products = productsResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const batchLots: any[] = [];
  const serialNumbers: any[] = [];

  const formik = useFormik({
    initialValues: {
      user_id: selectedVanInventory?.user_id || '',
      product_id: selectedVanInventory?.product_id || '',
      batch_id: selectedVanInventory?.batch_id || '',
      serial_no_id: selectedVanInventory?.serial_no_id || '',
      quantity: selectedVanInventory?.quantity || '',
      reserved_quantity: selectedVanInventory?.reserved_quantity || 0,
      available_quantity: selectedVanInventory?.available_quantity || '',
      vehicle_id: selectedVanInventory?.vehicle_id || '',
      location_type: selectedVanInventory?.location_type || 'van',
      location_id: selectedVanInventory?.location_id || '',
      is_active: selectedVanInventory?.is_active || 'Y',
    },
    validationSchema: vanInventoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const vanInventoryData = {
          user_id: Number(values.user_id),
          product_id: Number(values.product_id),
          batch_id: values.batch_id ? Number(values.batch_id) : null,
          serial_no_id: values.serial_no_id
            ? Number(values.serial_no_id)
            : null,
          quantity: Number(values.quantity),
          reserved_quantity: Number(values.reserved_quantity),
          available_quantity: values.available_quantity
            ? Number(values.available_quantity)
            : undefined,
          vehicle_id: values.vehicle_id ? Number(values.vehicle_id) : null,
          location_type: values.location_type,
          location_id: values.location_id ? Number(values.location_id) : null,
          is_active: values.is_active,
        };

        if (isEdit && selectedVanInventory) {
          await updateVanInventoryMutation.mutateAsync({
            id: selectedVanInventory.id,
            ...vanInventoryData,
          });
        } else {
          await createVanInventoryMutation.mutateAsync(vanInventoryData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving van inventory:', error);
      }
    },
  });

  // Update available quantity when quantity or reserved quantity changes
  useEffect(() => {
    const quantity = Number(formik.values.quantity) || 0;
    const reservedQuantity = Number(formik.values.reserved_quantity) || 0;
    const availableQuantity = quantity - reservedQuantity;

    if (availableQuantity >= 0) {
      formik.setFieldValue('available_quantity', availableQuantity.toString());
    }
  }, [formik.values.quantity, formik.values.reserved_quantity]);

  // Update selected product when product changes
  useEffect(() => {
    const productId = Number(formik.values.product_id);
    if (productId && productId !== selectedProductId) {
      setSelectedProductId(productId);
      // Reset batch and serial when product changes
      formik.setFieldValue('batch_id', '');
      formik.setFieldValue('serial_no_id', '');
    }
  }, [formik.values.product_id]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Van Stock' : 'Load Stock to Van'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box>
              <Select
                name="user_id"
                label="Van Inventory User"
                formik={formik}
                required
                fullWidth
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <Select
                name="product_id"
                label="Product"
                formik={formik}
                required
                fullWidth
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Select name="batch_id" label="Batch/Lot" formik={formik}>
              <MenuItem value="">
                <em>No Batch</em>
              </MenuItem>
              {batchLots.map((batch: any) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.batch_number} (Qty: {batch.remaining_quantity})
                </MenuItem>
              ))}
            </Select>

            <Select name="serial_no_id" label="Serial Number" formik={formik}>
              <MenuItem value="">
                <em>No Serial Number</em>
              </MenuItem>
              {serialNumbers.map((serial: any) => (
                <MenuItem key={serial.id} value={serial.id}>
                  {serial.serial_number} ({serial.status})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="quantity"
              label="Total Quantity"
              placeholder="Enter total quantity"
              formik={formik}
              type="number"
              required
            />

            <Input
              name="reserved_quantity"
              label="Reserved Quantity"
              placeholder="Enter reserved quantity"
              formik={formik}
              type="number"
            />

            <Input
              name="available_quantity"
              label="Available Quantity"
              placeholder="Calculated automatically"
              formik={formik}
              type="number"
              disabled
            />

            <Select name="vehicle_id" label="Vehicle" formik={formik}>
              <MenuItem value="">
                <em>No Vehicle</em>
              </MenuItem>
              {vehicles.map((vehicle: any) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} ({vehicle.type})
                </MenuItem>
              ))}
            </Select>

            <Select name="location_type" label="Location Type" formik={formik}>
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
              <MenuItem value="store">Store</MenuItem>
            </Select>

            <Select name="location_id" label="Location/Depot" formik={formik}>
              <MenuItem value="">
                <em>No Location</em>
              </MenuItem>
              {depots.map((depot: any) => (
                <MenuItem key={depot.id} value={depot.id}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createVanInventoryMutation.isPending ||
                updateVanInventoryMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createVanInventoryMutation.isPending ||
                updateVanInventoryMutation.isPending
              }
            >
              {createVanInventoryMutation.isPending ||
              updateVanInventoryMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageVanInventory;
