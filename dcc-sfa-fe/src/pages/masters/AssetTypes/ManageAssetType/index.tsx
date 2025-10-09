import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateAssetType,
  useUpdateAssetType,
  type AssetType,
} from 'hooks/useAssetTypes';
import React from 'react';
import { assetTypeValidationSchema } from 'schemas/assetType.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageAssetTypeProps {
  selectedAssetType?: AssetType | null;
  setSelectedAssetType: (assetType: AssetType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetType: React.FC<ManageAssetTypeProps> = ({
  selectedAssetType,
  setSelectedAssetType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedAssetType;

  const handleCancel = () => {
    setSelectedAssetType(null);
    setDrawerOpen(false);
  };

  const createAssetTypeMutation = useCreateAssetType();
  const updateAssetTypeMutation = useUpdateAssetType();

  const formik = useFormik({
    initialValues: {
      name: selectedAssetType?.name || '',
      description: selectedAssetType?.description || '',
      category: selectedAssetType?.category || '',
      brand: selectedAssetType?.brand || '',
      is_active: selectedAssetType?.is_active || 'Y',
    },
    validationSchema: assetTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const assetTypeData = {
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          brand: values.brand || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedAssetType) {
          await updateAssetTypeMutation.mutateAsync({
            id: selectedAssetType.id,
            ...assetTypeData,
          });
        } else {
          await createAssetTypeMutation.mutateAsync(assetTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving asset type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Type' : 'Create Asset Type'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Asset Type Name"
                placeholder="Enter asset type name"
                formik={formik}
                required
              />
            </Box>

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

            <Input
              name="category"
              label="Category"
              placeholder="Enter category"
              formik={formik}
            />

            <Input
              name="brand"
              label="Brand"
              placeholder="Enter brand"
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
                createAssetTypeMutation.isPending ||
                updateAssetTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetTypeMutation.isPending ||
                updateAssetTypeMutation.isPending
              }
            >
              {createAssetTypeMutation.isPending ||
              updateAssetTypeMutation.isPending
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

export default ManageAssetType;
