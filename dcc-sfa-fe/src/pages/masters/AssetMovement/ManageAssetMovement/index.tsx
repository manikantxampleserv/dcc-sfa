import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useAssetMaster, type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCreateAssetMovement,
  useUpdateAssetMovement,
  type AssetMovement,
} from 'hooks/useAssetMovement';
import { useUsers, type User } from 'hooks/useUsers';
import React from 'react';
import { assetMovementValidationSchema } from 'schemas/assetMovement.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageAssetMovementProps {
  selectedMovement?: AssetMovement | null;
  setSelectedMovement: (movement: AssetMovement | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetMovement: React.FC<ManageAssetMovementProps> = ({
  selectedMovement,
  setSelectedMovement,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMovement;

  const { data: assetsResponse } = useAssetMaster({
    page: 1,
    limit: 1000,
    status: 'active',
  });
  const assets = assetsResponse?.data || [];

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
    isActive: 'Y',
  });
  const users = usersResponse?.data || [];

  const createAssetMovementMutation = useCreateAssetMovement();
  const updateAssetMovementMutation = useUpdateAssetMovement();

  const handleCancel = () => {
    setSelectedMovement(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      asset_id: selectedMovement?.asset_id?.toString() || '',
      from_location: selectedMovement?.from_location || '',
      to_location: selectedMovement?.to_location || '',
      movement_type: selectedMovement?.movement_type || '',
      movement_date: formatForDateInput(selectedMovement?.movement_date),
      performed_by: selectedMovement?.performed_by?.toString() || '',
      notes: selectedMovement?.notes || '',
      is_active: selectedMovement?.is_active || 'Y',
    },
    validationSchema: assetMovementValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          asset_id: Number(values.asset_id),
          from_location: values.from_location || undefined,
          to_location: values.to_location || undefined,
          movement_type: values.movement_type || undefined,
          movement_date: values.movement_date,
          performed_by: Number(values.performed_by),
          notes: values.notes || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedMovement) {
          await updateAssetMovementMutation.mutateAsync({
            id: selectedMovement.id,
            data: submitData,
          });
        } else {
          await createAssetMovementMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset movement:', error);
      }
    },
  });

  const movementTypeOptions = [
    { value: 'transfer', label: 'Transfer' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'disposal', label: 'Disposal' },
    { value: 'return', label: 'Return' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Movement' : 'Create Asset Movement'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="asset_id" label="Asset" formik={formik} required>
              <MenuItem value="">Select Asset</MenuItem>
              {assets.map((asset: AssetMaster) => (
                <MenuItem key={asset.id} value={asset.id?.toString() || ''}>
                  {asset.asset_master_asset_types?.name} ({asset.serial_number})
                </MenuItem>
              ))}
            </Select>

            <Select name="movement_type" label="Movement Type" formik={formik}>
              <MenuItem value="">Select Movement Type</MenuItem>
              {movementTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="from_location"
              label="From Location"
              placeholder="Enter source location"
              formik={formik}
            />

            <Input
              name="to_location"
              label="To Location"
              placeholder="Enter destination location"
              formik={formik}
            />

            <Input
              name="movement_date"
              label="Movement Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Select
              name="performed_by"
              label="Performed By"
              formik={formik}
              required
            >
              <MenuItem value="">Select User</MenuItem>
              {users.map((user: User) => (
                <MenuItem key={user.id} value={user.id?.toString() || ''}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Input
            name="notes"
            label="Notes"
            placeholder="Enter additional notes about the movement"
            formik={formik}
            multiline
            rows={3}
          />

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createAssetMovementMutation.isPending ||
                updateAssetMovementMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetMovementMutation.isPending ||
                updateAssetMovementMutation.isPending
              }
            >
              {createAssetMovementMutation.isPending ||
              updateAssetMovementMutation.isPending
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

export default ManageAssetMovement;
