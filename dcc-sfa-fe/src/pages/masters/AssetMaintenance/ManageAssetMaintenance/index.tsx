import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useAssetMaster, type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCreateAssetMaintenance,
  useUpdateAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useUsers, type User } from 'hooks/useUsers';
import React from 'react';
import { assetMaintenanceValidationSchema } from 'schemas/assetMaintenance.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageAssetMaintenanceProps {
  selectedMaintenance?: AssetMaintenance | null;
  setSelectedMaintenance: (maintenance: AssetMaintenance | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetMaintenance: React.FC<ManageAssetMaintenanceProps> = ({
  selectedMaintenance,
  setSelectedMaintenance,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMaintenance;

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

  const createAssetMaintenanceMutation = useCreateAssetMaintenance();
  const updateAssetMaintenanceMutation = useUpdateAssetMaintenance();

  const handleCancel = () => {
    setSelectedMaintenance(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      asset_id: selectedMaintenance?.asset_id?.toString() || '',
      maintenance_date: formatForDateInput(
        selectedMaintenance?.maintenance_date
      ),
      issue_reported: selectedMaintenance?.issue_reported || '',
      action_taken: selectedMaintenance?.action_taken || '',
      technician_id: selectedMaintenance?.technician_id?.toString() || '',
      cost: selectedMaintenance?.cost?.toString() || '',
      remarks: selectedMaintenance?.remarks || '',
      is_active: selectedMaintenance?.is_active || 'Y',
    },
    validationSchema: assetMaintenanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          asset_id: Number(values.asset_id),
          maintenance_date: values.maintenance_date,
          issue_reported: values.issue_reported || undefined,
          action_taken: values.action_taken || undefined,
          technician_id: Number(values.technician_id),
          cost: values.cost ? Number(values.cost) : undefined,
          remarks: values.remarks || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedMaintenance) {
          await updateAssetMaintenanceMutation.mutateAsync({
            id: selectedMaintenance.id,
            data: submitData,
          });
        } else {
          await createAssetMaintenanceMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset maintenance:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Maintenance' : 'Create Asset Maintenance'}
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

            <Select
              name="technician_id"
              label="Technician"
              formik={formik}
              required
            >
              <MenuItem value="">Select Technician</MenuItem>
              {users.map((user: User) => (
                <MenuItem key={user.id} value={user.id?.toString() || ''}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="maintenance_date"
              label="Maintenance Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="cost"
              label="Cost"
              type="number"
              placeholder="Enter maintenance cost"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Input
            name="issue_reported"
            label="Issue Reported"
            placeholder="Describe the issue that was reported"
            formik={formik}
            multiline
            rows={3}
          />

          <Input
            name="action_taken"
            label="Action Taken"
            placeholder="Describe the action taken to resolve the issue"
            formik={formik}
            multiline
            rows={3}
          />

          <Input
            name="remarks"
            label="Remarks"
            placeholder="Enter additional remarks"
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
                createAssetMaintenanceMutation.isPending ||
                updateAssetMaintenanceMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetMaintenanceMutation.isPending ||
                updateAssetMaintenanceMutation.isPending
              }
            >
              {createAssetMaintenanceMutation.isPending ||
              updateAssetMaintenanceMutation.isPending
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

export default ManageAssetMaintenance;
