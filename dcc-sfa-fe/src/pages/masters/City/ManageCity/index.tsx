import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCity,
  useCityById,
  useUpdateCity,
  type City,
} from 'hooks/useCity';
import { useDistricts } from 'hooks/useDistrict';
import React from 'react';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import * as Yup from 'yup';

interface ManageCityProps {
  selectedCity?: City | null;
  setSelectedCity: (city: City | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const cityValidationSchema = Yup.object({
  district_id: Yup.number().required('District is required'),
  name: Yup.string()
    .required('City name is required')
    .min(2, 'City name must be at least 2 characters')
    .max(255, 'City name must be less than 255 characters'),
  code: Yup.string()
    .max(50, 'Code must be less than 50 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  is_active: Yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

const ManageCity: React.FC<ManageCityProps> = ({
  selectedCity,
  setSelectedCity,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCity;

  const handleCancel = () => {
    setSelectedCity(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();

  const { data: districtsResponse } = useDistricts({ limit: 1000, is_active: 'Y' });
  const districts = districtsResponse?.data || [];

  const { data: cityDetailResponse } = useCityById(
    selectedCity?.id || 0,
    { enabled: isEdit && !!selectedCity?.id }
  );

  const formik = useFormik({
    initialValues: {
      district_id: selectedCity?.district_id || '',
      name: selectedCity?.name || '',
      code: selectedCity?.code || '',
      description: selectedCity?.description || '',
      is_active: selectedCity?.is_active || 'Y',
    },
    validationSchema: cityValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const cityData = {
          district_id: Number(values.district_id),
          name: values.name,
          code: values.code,
          description: values.description,
          is_active: values.is_active,
        };

        if (isEdit && selectedCity) {
          await updateCityMutation.mutateAsync({
            id: selectedCity.id,
            data: cityData,
          });
        } else {
          await createCityMutation.mutateAsync(cityData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving city:', error);
      }
    },
  });

  React.useEffect(() => {
    if (cityDetailResponse && isEdit) {
      formik.setValues({
        district_id: cityDetailResponse.district_id || '',
        name: cityDetailResponse.name || '',
        code: cityDetailResponse.code || '',
        description: cityDetailResponse.description || '',
        is_active: cityDetailResponse.is_active || 'Y',
      });
    }
  }, [cityDetailResponse, isEdit]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit City' : 'Create City'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-5">
          <Box className="!grid !grid-cols-1 !gap-5">
            <Select
              name="district_id"
              label="District"
              formik={formik}
              required
            >
              {districts.map(district => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="name"
              label="City Name"
              placeholder="Enter city name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="City Code"
              placeholder="Enter city code (optional)"
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
                createCityMutation.isPending ||
                updateCityMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCityMutation.isPending ||
                updateCityMutation.isPending
              }
            >
              {createCityMutation.isPending ||
              updateCityMutation.isPending
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

export default ManageCity;
