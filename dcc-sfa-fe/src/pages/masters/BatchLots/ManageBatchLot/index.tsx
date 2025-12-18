import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateBatchLot,
  useUpdateBatchLot,
  type BatchLot,
} from 'hooks/useBatchLots';
import React from 'react';
import { batchLotValidationSchema } from 'schemas/batchLot.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageBatchLotProps {
  selectedBatchLot?: BatchLot | null;
  setSelectedBatchLot: (batchLot: BatchLot | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageBatchLot: React.FC<ManageBatchLotProps> = ({
  selectedBatchLot,
  setSelectedBatchLot,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedBatchLot;

  const handleCancel = () => {
    setSelectedBatchLot(null);
    setDrawerOpen(false);
  };

  const createBatchLotMutation = useCreateBatchLot();
  const updateBatchLotMutation = useUpdateBatchLot();

  const formik = useFormik({
    initialValues: {
      batch_number: selectedBatchLot?.batch_number || '',
      lot_number: selectedBatchLot?.lot_number || '',
      manufacturing_date: selectedBatchLot?.manufacturing_date
        ? new Date(selectedBatchLot.manufacturing_date)
            .toISOString()
            .split('T')[0]
        : '',
      expiry_date: selectedBatchLot?.expiry_date
        ? new Date(selectedBatchLot.expiry_date).toISOString().split('T')[0]
        : '',
      quantity: selectedBatchLot?.quantity || '',
      remaining_quantity: selectedBatchLot?.remaining_quantity || '',
      supplier_name: selectedBatchLot?.supplier_name || '',
      purchase_price: selectedBatchLot?.purchase_price || '',
      quality_grade: selectedBatchLot?.quality_grade || 'A',
      storage_location: selectedBatchLot?.storage_location || '',
      is_active: selectedBatchLot?.is_active || 'Y',
    },
    validationSchema: batchLotValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const batchLotData = {
          batch_number: values.batch_number,
          lot_number: values.lot_number || undefined,
          manufacturing_date: values.manufacturing_date,
          expiry_date: values.expiry_date,
          quantity: Number(values.quantity),
          remaining_quantity: values.remaining_quantity
            ? Number(values.remaining_quantity)
            : undefined,
          supplier_name: values.supplier_name || undefined,
          purchase_price: values.purchase_price
            ? Number(values.purchase_price)
            : undefined,
          quality_grade: values.quality_grade || undefined,
          storage_location: values.storage_location || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedBatchLot) {
          await updateBatchLotMutation.mutateAsync({
            id: selectedBatchLot.id,
            ...batchLotData,
          });
        } else {
          await createBatchLotMutation.mutateAsync(batchLotData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving batch lot:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Batch Lot' : 'Create Batch Lot'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="batch_number"
              label="Batch Number"
              placeholder="Enter batch number"
              formik={formik}
              required
            />

            <Input
              name="lot_number"
              label="Lot Number"
              placeholder="Enter lot number (optional)"
              formik={formik}
            />

            <Input
              name="manufacturing_date"
              label="Manufacturing Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="expiry_date"
              label="Expiry Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="quantity"
              label="Total Quantity"
              placeholder="Enter total quantity"
              formik={formik}
              type="number"
              required
            />

            <Input
              name="remaining_quantity"
              label="Remaining Quantity"
              placeholder="Enter remaining quantity"
              formik={formik}
              type="number"
            />

            <Input
              name="supplier_name"
              label="Supplier Name"
              placeholder="Enter supplier name"
              formik={formik}
            />

            <Input
              name="purchase_price"
              label="Purchase Price"
              placeholder="Enter purchase price"
              formik={formik}
              type="number"
            />

            <Select name="quality_grade" label="Quality Grade" formik={formik}>
              <MenuItem value="A">Grade A - Excellent</MenuItem>
              <MenuItem value="B">Grade B - Good</MenuItem>
              <MenuItem value="C">Grade C - Average</MenuItem>
              <MenuItem value="D">Grade D - Below Average</MenuItem>
              <MenuItem value="F">Grade F - Poor</MenuItem>
            </Select>

            <Input
              name="storage_location"
              label="Storage Location"
              placeholder="Enter storage location"
              formik={formik}
            />

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
                createBatchLotMutation.isPending ||
                updateBatchLotMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createBatchLotMutation.isPending ||
                updateBatchLotMutation.isPending
              }
            >
              {createBatchLotMutation.isPending ||
              updateBatchLotMutation.isPending
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

export default ManageBatchLot;
