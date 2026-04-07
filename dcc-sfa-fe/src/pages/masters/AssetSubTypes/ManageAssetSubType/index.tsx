import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateAssetSubType,
  useUpdateAssetSubType,
  type AssetSubType,
} from 'hooks/useAssetSubTypes';
import React from 'react';
import { assetSubTypeValidationSchema } from 'schemas/assetSubType.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

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
      is_active: selectedAssetSubType?.is_active || 'Y',
    },
    validationSchema: assetSubTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const assetSubTypeData = {
          name: values.name,
          description: values.description,
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
      size="small"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-1 !gap-4">
            <Input
              name="name"
              label="Asset Sub Type Name"
              placeholder="Enter asset sub type name"
              formik={formik}
              required
            />


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
