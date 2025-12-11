import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useProducts } from 'hooks/useProducts';
import { useUpsertStockMovement } from 'hooks/useStockMovements';
import { useWarehouses } from 'hooks/useWarehouses';
import { useVanInventory } from 'hooks/useVanInventory';
import React from 'react';
import { stockMovementValidationSchema } from 'schemas/stockMovement.schema';
import type { StockMovement } from 'services/masters/StockMovements';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';

interface ManageStockMovementProps {
  open: boolean;
  onClose: () => void;
  movement?: StockMovement | null;
}

const ManageStockMovement: React.FC<ManageStockMovementProps> = ({
  open,
  onClose,
  movement,
}) => {
  const isEdit = !!movement;

  const { data: warehousesResponse } = useWarehouses({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: vanInventoryResponse } = useVanInventory({ limit: 1000 });

  const warehouses = warehousesResponse?.data || [];
  const products = productsResponse?.data || [];
  const vanInventory = vanInventoryResponse?.data || [];

  const upsertMovementMutation = useUpsertStockMovement();

  const getLoadingTypeLabel = (type: string) => {
    switch (type) {
      case 'L':
        return 'Load';
      case 'U':
        return 'Unload';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'D':
        return 'Draft';
      case 'A':
        return 'Confirmed';
      case 'C':
        return 'Canceled';
      default:
        return status;
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const handleCancel = () => {
    onClose();
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      product_id: movement?.product_id || '',
      batch_id: movement?.batch_id || '',
      serial_id: movement?.serial_id || '',
      movement_type: movement?.movement_type || '',
      reference_type: movement?.reference_type || '',
      reference_id: movement?.reference_id || '',
      from_location_id: movement?.from_location_id || '',
      to_location_id: movement?.to_location_id || '',
      quantity: movement?.quantity || '',
      movement_date: movement?.movement_date || '',
      remarks: movement?.remarks || '',
      van_inventory_id: movement?.van_inventory_id || '',
      is_active: movement?.is_active || 'Y',
    },
    validationSchema: stockMovementValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...(isEdit && movement ? { id: movement.id } : {}),
          product_id: Number(values.product_id),
          batch_id: values.batch_id ? Number(values.batch_id) : null,
          serial_id: values.serial_id ? Number(values.serial_id) : null,
          movement_type: values.movement_type,
          reference_type: values.reference_type || null,
          reference_id: values.reference_id
            ? Number(values.reference_id)
            : null,
          from_location_id: values.from_location_id
            ? Number(values.from_location_id)
            : null,
          to_location_id: values.to_location_id
            ? Number(values.to_location_id)
            : null,
          quantity: Number(values.quantity),
          movement_date: values.movement_date || null,
          remarks: values.remarks || null,
          van_inventory_id: values.van_inventory_id
            ? Number(values.van_inventory_id)
            : null,
          is_active: values.is_active,
        };

        await upsertMovementMutation.mutateAsync(submitData);
        handleCancel();
      } catch (error) {
        console.log('Error submitting stock movement:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Stock Movement' : 'Create Stock Movement'}
      size="large"
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <ProductSelect name="product_id" label="Product" formik={formik} required />

            <Select
              name="movement_type"
              label="Movement Type"
              formik={formik}
              required
            >
              <MenuItem value="IN">Stock In</MenuItem>
              <MenuItem value="OUT">Stock Out</MenuItem>
              <MenuItem value="TRANSFER">Transfer</MenuItem>
            </Select>

            <Input
              name="batch_id"
              label="Batch ID"
              placeholder="Optional"
              formik={formik}
              type="number"
            />

            <Input
              name="serial_id"
              label="Serial ID"
              placeholder="Optional"
              formik={formik}
              type="number"
            />

            <Input
              name="reference_type"
              label="Reference Type"
              placeholder="e.g., ORDER, PURCHASE, ADJUSTMENT"
              formik={formik}
            />

            <Input
              name="reference_id"
              label="Reference ID"
              placeholder="Optional"
              formik={formik}
              type="number"
            />

            <Select
              name="from_location_id"
              label="From Location"
              formik={formik}
            >
              <MenuItem value="">No Location</MenuItem>
              {warehouses.map(warehouse => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>

            <Select name="to_location_id" label="To Location" formik={formik}>
              <MenuItem value="">No Location</MenuItem>
              {warehouses.map(warehouse => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="quantity"
              label="Quantity"
              placeholder="Enter quantity"
              formik={formik}
              type="number"
              required
            />

            <Input
              name="movement_date"
              label="Movement Date"
              type="datetime-local"
              formik={formik}
            />

            <Select
              name="van_inventory_id"
              label="Van Inventory"
              formik={formik}
            >
              <MenuItem value="">
                <em>No Van Inventory</em>
              </MenuItem>
              {vanInventory.map((item: any) => {
                const displayText = [
                  item.user?.name || 'Unknown User',
                  getLoadingTypeLabel(item.loading_type || 'L'),
                  getStatusLabel(item.status || 'D'),
                  item.vehicle?.vehicle_number
                    ? `- ${item.vehicle.vehicle_number}`
                    : '',
                  item.document_date
                    ? `(${formatDate(item.document_date)})`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <MenuItem key={item.id} value={item.id}>
                    {displayText}
                  </MenuItem>
                );
              })}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!space-y-3">
            <Typography
              variant="body1"
              className="!font-semibold !text-gray-900"
            >
              Remarks
            </Typography>
            <Input
              name="remarks"
              label="Remarks"
              placeholder="Enter any additional remarks about this movement"
              formik={formik}
              multiline
              rows={3}
            />
          </Box>

          <Box className="!flex !justify-end !gap-2 !pt-3">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={upsertMovementMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={upsertMovementMutation.isPending}
            >
              {upsertMovementMutation.isPending
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

export default ManageStockMovement;
