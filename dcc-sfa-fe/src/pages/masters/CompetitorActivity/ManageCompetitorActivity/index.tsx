import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCompetitorActivity,
  useUpdateCompetitorActivity,
  type CompetitorActivity,
} from 'hooks/useCompetitorActivity';
import { useVisits } from 'hooks/useVisits';
import React from 'react';
import { competitorActivityValidationSchema } from 'schemas/competitorActivity.schema';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCompetitorActivityProps {
  selectedActivity?: CompetitorActivity | null;
  setSelectedActivity: (activity: CompetitorActivity | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCompetitorActivity: React.FC<ManageCompetitorActivityProps> = ({
  selectedActivity,
  setSelectedActivity,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedActivity;

  const { data: visitsResponse } = useVisits({
    page: 1,
    limit: 1000,
    status: 'completed',
  });
  const visits = visitsResponse?.data || [];

  const createCompetitorActivityMutation = useCreateCompetitorActivity();
  const updateCompetitorActivityMutation = useUpdateCompetitorActivity();

  const handleCancel = () => {
    setSelectedActivity(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      customer_id: selectedActivity?.customer_id?.toString() || '',
      visit_id: selectedActivity?.visit_id?.toString() || '',
      brand_name: selectedActivity?.brand_name || '',
      product_name: selectedActivity?.product_name || '',
      observed_price: selectedActivity?.observed_price?.toString() || '',
      promotion_details: selectedActivity?.promotion_details || '',
      visibility_score: selectedActivity?.visibility_score?.toString() || '',
      image_url: selectedActivity?.image_url || '',
      remarks: selectedActivity?.remarks || '',
      is_active: selectedActivity?.is_active || 'Y',
    },
    validationSchema: competitorActivityValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          customer_id: Number(values.customer_id),
          visit_id: values.visit_id ? Number(values.visit_id) : undefined,
          brand_name: values.brand_name,
          product_name: values.product_name || undefined,
          observed_price: values.observed_price
            ? Number(values.observed_price)
            : undefined,
          promotion_details: values.promotion_details || undefined,
          visibility_score: values.visibility_score
            ? Number(values.visibility_score)
            : undefined,
          image_url: values.image_url || undefined,
          remarks: values.remarks || undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedActivity) {
          await updateCompetitorActivityMutation.mutateAsync({
            id: selectedActivity.id,
            data: submitData,
          });
        } else {
          await createCompetitorActivityMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting competitor activity:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Competitor Activity' : 'Create Competitor Activity'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <CustomerSelect
              name="customer_id"
              label="Customer"
              formik={formik}
              required
            />

            <Select name="visit_id" label="Visit (Optional)" formik={formik}>
              <MenuItem value="">No Visit</MenuItem>
              {visits.map(visit => (
                <MenuItem key={visit.id} value={visit.id?.toString() || ''}>
                  Visit #{visit.id} - {visit.purpose || 'General'}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="brand_name"
              label="Brand Name"
              placeholder="Enter competitor brand name"
              formik={formik}
              required
            />

            <Input
              name="product_name"
              label="Product Name"
              placeholder="Enter product name (optional)"
              formik={formik}
            />

            <Input
              name="observed_price"
              label="Observed Price"
              type="number"
              placeholder="Enter observed price"
              formik={formik}
            />

            <Input
              name="visibility_score"
              label="Visibility Score"
              type="number"
              placeholder="Enter visibility score (0-100)"
              formik={formik}
            />

            <Input
              name="image_url"
              label="Image URL"
              placeholder="Enter image URL (optional)"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Input
            name="promotion_details"
            label="Promotion Details"
            placeholder="Enter promotion details"
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
                createCompetitorActivityMutation.isPending ||
                updateCompetitorActivityMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCompetitorActivityMutation.isPending ||
                updateCompetitorActivityMutation.isPending
              }
            >
              {createCompetitorActivityMutation.isPending ||
              updateCompetitorActivityMutation.isPending
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

export default ManageCompetitorActivity;
