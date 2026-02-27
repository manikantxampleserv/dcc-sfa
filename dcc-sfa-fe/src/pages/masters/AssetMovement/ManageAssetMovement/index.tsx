import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useAssetMaster, type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCreateAssetMovement,
  useUpdateAssetMovement,
  type AssetMovement,
} from 'hooks/useAssetMovement';
import React from 'react';
import { assetMovementValidationSchema } from 'schemas/assetMovement.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import DepotSelect from 'shared/DepotSelect';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
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

  const createAssetMovementMutation = useCreateAssetMovement();
  const updateAssetMovementMutation = useUpdateAssetMovement();

  const handleCancel = () => {
    setSelectedMovement(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const handleDirectionChange = (fieldName: string, value: string) => {
    formik.setFieldValue(fieldName, value);

    if (fieldName === 'from_direction') {
      formik.setFieldValue('from_outlet', '');
      formik.setFieldValue('from_depot', '');
    } else if (fieldName === 'to_direction') {
      formik.setFieldValue('to_outlet', '');
      formik.setFieldValue('to_depot', '');
    }
  };

  const formik = useFormik({
    initialValues: {
      asset_id: selectedMovement?.asset_ids?.[0]?.toString() || '',
      from_direction: selectedMovement?.from_direction || '',
      from_outlet: selectedMovement?.from_customer_id?.toString() || '',
      from_depot: selectedMovement?.from_depot_id?.toString() || '',
      to_direction: selectedMovement?.to_direction || '',
      to_outlet: selectedMovement?.to_customer_id?.toString() || '',
      to_depot: selectedMovement?.to_depot_id?.toString() || '',
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
          from_direction: values.from_direction,
          from_customer_id:
            values.from_direction === 'outlet'
              ? Number(values.from_outlet)
              : null,
          from_depot_id:
            values.from_direction === 'depot'
              ? Number(values.from_depot)
              : null,
          to_direction: values.to_direction,
          to_customer_id:
            values.to_direction === 'outlet' ? Number(values.to_outlet) : null,
          to_depot_id:
            values.to_direction === 'depot' ? Number(values.to_depot) : null,
          movement_type: values.movement_type,
          movement_date: values.movement_date,
          performed_by: Number(values.performed_by),
          notes: values.notes,
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
    { value: 'installation', label: 'Installation' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'disposal', label: 'Disposal' },
    { value: 'return', label: 'Return' },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Movement' : 'Create Asset Movement'}
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select name="asset_id" label="Asset" formik={formik} required>
              {assets.map((asset: AssetMaster) => (
                <MenuItem key={asset.id} value={asset.id?.toString() || ''}>
                  {asset.asset_master_asset_types?.name} ({asset.serial_number})
                </MenuItem>
              ))}
            </Select>

            <Select name="movement_type" label="Movement Type" formik={formik}>
              {movementTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              name="from_direction"
              label="From Direction"
              formik={formik}
              required
              onChange={e =>
                handleDirectionChange('from_direction', e.target.value)
              }
            >
              <MenuItem value="outlet">Outlet</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
            </Select>
            <Select
              name="to_direction"
              label="To Direction"
              formik={formik}
              required
              onChange={e =>
                handleDirectionChange('to_direction', e.target.value)
              }
            >
              <MenuItem value="outlet">Outlet</MenuItem>
              <MenuItem value="depot">Depot</MenuItem>
            </Select>

            {formik.values.from_direction === 'outlet' && (
              <CustomerSelect
                name="from_outlet"
                label="From Outlet"
                formik={formik}
                required
              />
            )}

            {formik.values.from_direction === 'depot' && (
              <DepotSelect
                name="from_depot"
                label="From Depot"
                formik={formik}
                required
              />
            )}

            {formik.values.to_direction === 'outlet' && (
              <CustomerSelect
                name="to_outlet"
                label="To Outlet"
                formik={formik}
                required
              />
            )}

            {formik.values.to_direction === 'depot' && (
              <DepotSelect
                name="to_depot"
                label="To Depot"
                formik={formik}
                required
              />
            )}

            <Input
              name="movement_date"
              label="Movement Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <UserSelect
              name="performed_by"
              label="Performed By"
              formik={formik}
              required
            />

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="col-span-2"
            />
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
