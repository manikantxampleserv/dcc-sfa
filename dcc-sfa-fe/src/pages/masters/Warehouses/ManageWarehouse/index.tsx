import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateWarehouse,
  useUpdateWarehouse,
  type Warehouse,
} from 'hooks/useWarehouses';
import React from 'react';
import { warehouseValidationSchema } from 'schemas/warehouse.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageWarehouseProps {
  selectedWarehouse?: Warehouse | null;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageWarehouse: React.FC<ManageWarehouseProps> = ({
  selectedWarehouse,
  setSelectedWarehouse,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedWarehouse;

  const handleCancel = () => {
    setSelectedWarehouse(null);
    setDrawerOpen(false);
  };

  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();

  const formik = useFormik({
    initialValues: {
      name: selectedWarehouse?.name || '',
      type: selectedWarehouse?.type || '',
      location: selectedWarehouse?.location || '',
      is_active: selectedWarehouse?.is_active || 'Y',
    },
    validationSchema: warehouseValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const warehouseData = {
          name: values.name,
          type: values.type || undefined,
          location: values.location || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedWarehouse) {
          await updateWarehouseMutation.mutateAsync({
            id: selectedWarehouse.id,
            ...warehouseData,
          });
        } else {
          await createWarehouseMutation.mutateAsync(warehouseData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving warehouse:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Warehouse' : 'Create Warehouse'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Warehouse Name"
                placeholder="Enter warehouse name"
                formik={formik}
                required
              />
            </Box>

            <Input
              name="type"
              label="Warehouse Type"
              placeholder="Enter warehouse type (e.g., Storage, Distribution)"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="location"
                label="Location"
                placeholder="Enter warehouse location"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center ">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createWarehouseMutation.isPending ||
                updateWarehouseMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createWarehouseMutation.isPending ||
                updateWarehouseMutation.isPending
              }
            >
              {createWarehouseMutation.isPending ||
              updateWarehouseMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
              Warehouse
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageWarehouse;
