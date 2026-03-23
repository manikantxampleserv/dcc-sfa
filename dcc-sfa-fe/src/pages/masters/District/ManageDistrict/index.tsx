import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateDistrict,
  useDistrictById,
  useUpdateDistrict,
  type District,
} from 'hooks/useDistrict';
import { useRegions } from 'hooks/useRegion';
import React from 'react';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import * as Yup from 'yup';

interface ManageDistrictProps {
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const districtValidationSchema = Yup.object({
  region_id: Yup.number().required('Region is required'),
  name: Yup.string()
    .required('District name is required')
    .min(2, 'District name must be at least 2 characters')
    .max(255, 'District name must be less than 255 characters'),
  code: Yup.string().max(50, 'Code must be less than 50 characters'),
  description: Yup.string().max(
    500,
    'Description must be less than 500 characters'
  ),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageDistrict: React.FC<ManageDistrictProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedDistrict;

  const handleCancel = () => {
    setSelectedDistrict(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createDistrictMutation = useCreateDistrict();
  const updateDistrictMutation = useUpdateDistrict();

  const { data: regionsResponse } = useRegions({ limit: 1000, is_active: 'Y' });
  const regions = regionsResponse?.data || [];

  const { data: districtDetailResponse } = useDistrictById(
    selectedDistrict?.id || 0,
    { enabled: isEdit && !!selectedDistrict?.id }
  );

  const formik = useFormik({
    initialValues: {
      region_id: selectedDistrict?.region_id || '',
      name: selectedDistrict?.name || '',
      code: selectedDistrict?.code || '',
      description: selectedDistrict?.description || '',
      is_active: selectedDistrict?.is_active || 'Y',
    },
    validationSchema: districtValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const districtData = {
          region_id: Number(values.region_id),
          name: values.name,
          code: values.code,
          description: values.description,
          is_active: values.is_active,
        };

        if (isEdit && selectedDistrict) {
          await updateDistrictMutation.mutateAsync({
            id: selectedDistrict.id,
            data: districtData,
          });
        } else {
          await createDistrictMutation.mutateAsync(districtData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving district:', error);
      }
    },
  });

  React.useEffect(() => {
    if (districtDetailResponse && isEdit) {
      formik.setValues({
        region_id: districtDetailResponse.region_id || '',
        name: districtDetailResponse.name || '',
        code: districtDetailResponse.code || '',
        description: districtDetailResponse.description || '',
        is_active: districtDetailResponse.is_active || 'Y',
      });
    }
  }, [districtDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit District' : 'Create District'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 !gap-5">
            <Select name="region_id" label="Region" formik={formik} required>
              {regions.map(region => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="name"
              label="District Name"
              placeholder="Enter district name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="District Code"
              placeholder="Enter district code (optional)"
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
                createDistrictMutation.isPending ||
                updateDistrictMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createDistrictMutation.isPending ||
                updateDistrictMutation.isPending
              }
            >
              {createDistrictMutation.isPending ||
              updateDistrictMutation.isPending
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

export default ManageDistrict;
