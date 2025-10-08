import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import {
  useCreateSurvey,
  useUpdateSurvey,
  type Survey,
} from '../../../../hooks/useSurveys';
import { surveyValidationSchema } from '../../../../schemas/survey.schema';

interface ManageSurveyProps {
  selectedSurvey?: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageSurvey: React.FC<ManageSurveyProps> = ({
  selectedSurvey,
  setSelectedSurvey,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedSurvey;

  const handleCancel = () => {
    setSelectedSurvey(null);
    setDrawerOpen(false);
  };

  const createSurveyMutation = useCreateSurvey();
  const updateSurveyMutation = useUpdateSurvey();

  const formik = useFormik({
    initialValues: {
      title: selectedSurvey?.title || '',
      description: selectedSurvey?.description || '',
      category: selectedSurvey?.category || 'general',
      target_roles: selectedSurvey?.target_roles || '',
      expires_at: selectedSurvey?.expires_at
        ? new Date(selectedSurvey.expires_at).toISOString().split('T')[0]
        : '',
      is_active: selectedSurvey?.is_active || 'Y',
    },
    validationSchema: surveyValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const surveyData = {
          title: values.title,
          description: values.description || undefined,
          category: values.category,
          target_roles: values.target_roles || undefined,
          expires_at: values.expires_at
            ? new Date(values.expires_at).toISOString()
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedSurvey) {
          await updateSurveyMutation.mutateAsync({
            id: selectedSurvey.id,
            ...surveyData,
          });
        } else {
          await createSurveyMutation.mutateAsync(surveyData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving survey:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Survey' : 'Create Survey'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="title"
                label="Survey Title"
                placeholder="Enter survey title"
                formik={formik}
                required
              />
            </Box>

            <Select name="category" label="Category" formik={formik} required>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="cooler_inspection">Cooler Inspection</MenuItem>
              <MenuItem value="customer_feedback">Customer Feedback</MenuItem>
              <MenuItem value="outlet_audit">Outlet Audit</MenuItem>
              <MenuItem value="competitor_analysis">
                Competitor Analysis
              </MenuItem>
              <MenuItem value="brand_visibility">Brand Visibility</MenuItem>
            </Select>

            <Input
              name="target_roles"
              label="Target Roles"
              placeholder="e.g., Sales Representative, Field Supervisor"
              formik={formik}
            />

            <Input
              name="expires_at"
              label="Expiry Date"
              placeholder="Select expiry date"
              formik={formik}
              type="date"
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter survey description"
                formik={formik}
                multiline
                rows={4}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createSurveyMutation.isPending || updateSurveyMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createSurveyMutation.isPending || updateSurveyMutation.isPending
              }
            >
              {createSurveyMutation.isPending || updateSurveyMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
              Survey
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageSurvey;
