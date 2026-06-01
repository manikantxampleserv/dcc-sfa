import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateAssetBrand,
  useUpdateAssetBrand,
  type AssetBrand,
} from 'hooks/useAssetBrands';
import React from 'react';
import { assetBrandValidationSchema } from 'schemas/assetBrand.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

interface ManageAssetBrandProps {
  selectedAssetBrand?: AssetBrand | null;
  setSelectedAssetBrand: (assetBrand: AssetBrand | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetBrand: React.FC<ManageAssetBrandProps> = ({
  selectedAssetBrand,
  setSelectedAssetBrand,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedAssetBrand;

  const handleCancel = () => {
    setSelectedAssetBrand(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createAssetBrandMutation = useCreateAssetBrand();
  const updateAssetBrandMutation = useUpdateAssetBrand();

  const formik = useFormik({
    initialValues: {
      name: selectedAssetBrand?.name || '',
      code: selectedAssetBrand?.code || '',
      description: selectedAssetBrand?.description || '',
      is_active: selectedAssetBrand?.is_active || 'Y',
    },
    validationSchema: assetBrandValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const assetBrandData = {
          name: values.name,
          code: values.code,
          description: values.description,
          is_active: values.is_active,
        };

        if (isEdit && selectedAssetBrand) {
          await updateAssetBrandMutation.mutateAsync({
            id: selectedAssetBrand.id,
            ...assetBrandData,
          });
        } else {
          await createAssetBrandMutation.mutateAsync(assetBrandData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving asset brand:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset Brand' : 'Create Asset Brand'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Input
              name="name"
              label="Asset Brand Name"
              placeholder="Enter asset brand name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (optional)"
              formik={formik}
            />

            <ActiveInactiveField
              name="is_active"
              formik={formik}
              required
              className="md:!col-span-2"
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
                createAssetBrandMutation.isPending ||
                updateAssetBrandMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetBrandMutation.isPending ||
                updateAssetBrandMutation.isPending
              }
            >
              {createAssetBrandMutation.isPending ||
              updateAssetBrandMutation.isPending
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

export default ManageAssetBrand;
