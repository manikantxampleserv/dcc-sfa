import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateAssetSubType,
  useUpdateAssetSubType,
  type AssetSubType,
} from 'hooks/useAssetSubTypes';
import { useAssetTypes } from 'hooks/useAssetTypes';
import React from 'react';
import { assetSubTypeValidationSchema } from 'schemas/assetSubType.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageAssetSubTypeProps {
  selectedAssetSubType?: AssetSubType | null;
  setSelectedAssetSubType: (assetSubType: AssetSubType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetSubType: React.FC<ManageAssetSubTypeProps> = ({
  selectedAssetSubType,
  setSelectedAssetSubType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedAssetSubType;

  // Fetch asset types for dropdown
  const { data: assetTypesResponse } = useAssetTypes({
    page: 1,
    limit: 1000, // Get all asset types for dropdown
  });

  const assetTypes = assetTypesResponse?.data || [];

  const handleCancel = () => {
    setSelectedAssetSubType(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createAssetSubTypeMutation = useCreateAssetSubType();
  const updateAssetSubTypeMutation = useUpdateAssetSubType();

  const formik = useFormik({
    initialValues: {
      name: selectedAssetSubType?.name || '',
      description: selectedAssetSubType?.description || '',
      asset_type_id: selectedAssetSubType?.asset_type_id || '',
      is_active: selectedAssetSubType?.is_active || 'Y',
    },
    validationSchema: assetSubTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const assetSubTypeData = {
          name: values.name,
          description: values.description,
          asset_type_id: values.asset_type_id
            ? Number(values.asset_type_id)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedAssetSubType) {
          await updateAssetSubTypeMutation.mutateAsync({
            id: selectedAssetSubType.id,
            ...assetSubTypeData,
          });
        } else {
          await createAssetSubTypeMutation.mutateAsync(assetSubTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving asset sub type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Sub Type' : 'Create Asset Sub Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Asset Sub Type Name"
                placeholder="Enter asset sub type name"
                formik={formik}
                required
              />
            </Box>

            <Select
              name="asset_type_id"
              label="Asset Type"
              placeholder="Select asset type"
              formik={formik}
              required
            >
              {assetTypes.map(assetType => (
                <MenuItem key={assetType.id} value={assetType.id}>
                  {assetType.name}
                </MenuItem>
              ))}
            </Select>

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="col-span-2"
            />

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createAssetSubTypeMutation.isPending ||
                updateAssetSubTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetSubTypeMutation.isPending ||
                updateAssetSubTypeMutation.isPending
              }
            >
              {createAssetSubTypeMutation.isPending ||
              updateAssetSubTypeMutation.isPending
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

export default ManageAssetSubType;
