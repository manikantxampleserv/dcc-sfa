import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateRegion,
  useRegionById,
  useUpdateRegion,
  type Region,
} from 'hooks/useRegion';
import React from 'react';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import * as Yup from 'yup';

interface ManageRegionProps {
  selectedRegion?: Region | null;
  setSelectedRegion: (region: Region | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const regionValidationSchema = Yup.object({
  name: Yup.string()
    .required('Region name is required')
    .min(2, 'Region name must be at least 2 characters')
    .max(255, 'Region name must be less than 255 characters'),
  code: Yup.string()
    .max(50, 'Code must be less than 50 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageRegion: React.FC<ManageRegionProps> = ({
  selectedRegion,
  setSelectedRegion,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedRegion;

  const handleCancel = () => {
    setSelectedRegion(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createRegionMutation = useCreateRegion();
  const updateRegionMutation = useUpdateRegion();

  const { data: regionDetailResponse } = useRegionById(
    selectedRegion?.id || 0,
    { enabled: isEdit && !!selectedRegion?.id }
  );

  const formik = useFormik({
    initialValues: {
      name: selectedRegion?.name || '',
      code: selectedRegion?.code || '',
      description: selectedRegion?.description || '',
      is_active: selectedRegion?.is_active || 'Y',
    },
    validationSchema: regionValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const regionData = {
          name: values.name,
          code: values.code,
          description: values.description,
          is_active: values.is_active,
        };

        if (isEdit && selectedRegion) {
          await updateRegionMutation.mutateAsync({
            id: selectedRegion.id,
            data: regionData,
          });
        } else {
          await createRegionMutation.mutateAsync(regionData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving region:', error);
      }
    },
  });

  React.useEffect(() => {
    if (regionDetailResponse && isEdit) {
      formik.setValues({
        name: regionDetailResponse.name || '',
        code: regionDetailResponse.code || '',
        description: regionDetailResponse.description || '',
        is_active: regionDetailResponse.is_active || 'Y',
      });
    }
  }, [regionDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Region' : 'Create Region'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 !gap-5">
            <Input
              name="name"
              label="Region Name"
              placeholder="Enter region name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Region Code"
              placeholder="Enter region code (optional)"
              formik={formik}
            />

            <Input
              name="description"
              label="Description"
              placeholder="Enter description (optional)"
              formik={formik}
              multiline
              rows={3}
            />

            <Box>
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createRegionMutation.isPending ||
                updateRegionMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createRegionMutation.isPending ||
                updateRegionMutation.isPending
              }
            >
              {createRegionMutation.isPending ||
              updateRegionMutation.isPending
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

export default ManageRegion;
