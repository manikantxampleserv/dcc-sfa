import { Close } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCompetitorActivity,
  useUpdateCompetitorActivity,
  type CompetitorActivity,
} from 'hooks/useCompetitorActivity';
import { useVisits } from 'hooks/useVisits';
import React from 'react';
import { competitorActivityValidationSchema } from 'schemas/competitorActivity.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
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
        const hasFile =
          values.image_url && values.image_url.startsWith('data:image/');

        let submitData;

        if (hasFile) {
          const formData = new FormData();
          formData.append('customer_id', values.customer_id.toString());
          formData.append('visit_id', values.visit_id || '');
          formData.append('brand_name', values.brand_name);
          formData.append('product_name', values.product_name);
          formData.append(
            'observed_price',
            values.observed_price ? values.observed_price.toString() : ''
          );
          formData.append('promotion_details', values.promotion_details);
          formData.append(
            'visibility_score',
            values.visibility_score ? values.visibility_score.toString() : ''
          );

          if (values.image_url && values.image_url.startsWith('data:image/')) {
            const base64Data = values.image_url.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            const file = new File([blob], 'competition-image.jpg', {
              type: 'image/jpeg',
            });
            formData.append('image_url', file);
          }

          formData.append('remarks', values.remarks);
          formData.append('is_active', values.is_active);

          submitData = formData;
        } else {
          submitData = {
            customer_id: Number(values.customer_id),
            visit_id: values.visit_id ? Number(values.visit_id) : undefined,
            brand_name: values.brand_name,
            product_name: values.product_name,
            observed_price: values.observed_price
              ? Number(values.observed_price)
              : undefined,
            promotion_details: values.promotion_details,
            visibility_score: values.visibility_score
              ? Number(values.visibility_score)
              : undefined,
            image_url: values.image_url,
            remarks: values.remarks,
            is_active: values.is_active,
          };
        }

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
              {visits.map(visit => (
                <MenuItem key={visit.id} value={visit.id?.toString() || ''}>
                  {`Visit #${visit.id} - ${visit.purpose || 'General'}`}
                </MenuItem>
              ))}
            </Select>

            <Box className="md:!col-span-2">
              <Typography
                component="label"
                className="!text-gray-700 !text-sm !font-medium !mb-2 !block"
              >
                Competition Image
              </Typography>
              <Box
                className="!border-2 flex items-center justify-center !border-dashed !border-gray-300 !rounded !p-3 !text-center !cursor-pointer hover:!border-blue-400 !transition-colors"
                component="label"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  },
                }}
              >
                <input
                  type="file"
                  name="image_url"
                  accept="image/*"
                  hidden
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        formik.setFieldValue('image_url', reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      formik.setFieldValue('image_url', '');
                    }
                    formik.handleChange(e);
                  }}
                />

                {formik.values.image_url ? (
                  <Box className="!relative">
                    <img
                      src={formik.values.image_url}
                      alt="Competition image"
                      className="!max-h-20 !max-w-xs !rounded !mx-auto !border !border-gray-200"
                    />
                    <IconButton
                      size="small"
                      className="!absolute !h-6 !w-6 !top-1 !right-1  !text-red-600"
                      onClick={e => {
                        e.preventDefault();
                        formik.setFieldValue('image_url', '');
                      }}
                      sx={{ position: 'absolute' }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ) : (
                  <Box className="!py-4">
                    <Box className="!text-2xl !text-gray-400 !mb-1">📷</Box>
                    <Typography className="!text-gray-600 !text-xs !mb-1">
                      Click to upload image
                    </Typography>
                    <Typography className="!text-gray-400 !text-xs">
                      PNG, JPG, GIF up to 10MB
                    </Typography>
                  </Box>
                )}
              </Box>
              {formik.touched.image_url && formik.errors.image_url && (
                <Typography className="!text-red-500 !text-xs !mt-1">
                  {formik.errors.image_url}
                </Typography>
              )}
            </Box>

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

            <ActiveInactiveField
              name="is_active"
              label="Status"
              formik={formik}
            />
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
