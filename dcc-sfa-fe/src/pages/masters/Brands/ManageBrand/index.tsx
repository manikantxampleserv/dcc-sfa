import { Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useCreateBrand, useUpdateBrand, type Brand } from 'hooks/useBrands';
import React, { useState } from 'react';
import { brandValidationSchema } from 'schemas/brand.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import YesNoField from 'shared/YesNoField';

interface ManageBrandProps {
  selectedBrand?: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageBrand: React.FC<ManageBrandProps> = ({
  selectedBrand,
  setSelectedBrand,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const isEdit = !!selectedBrand;

  const handleCancel = () => {
    setSelectedBrand(null);
    setDrawerOpen(false);
    setUploadedFile(null);
    formik.resetForm();
  };

  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      formik.setFieldValue('logo', file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    formik.setFieldValue('logo', null);
  };

  const formik = useFormik({
    initialValues: {
      name: selectedBrand?.name || '',
      description: selectedBrand?.description || '',
      is_active: selectedBrand?.is_active || 'Y',
      is_asset_brand: selectedBrand?.is_asset_brand || 'N',
      logo: null,
    },
    validationSchema: brandValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('is_active', values.is_active);
        formData.append('is_asset_brand', values.is_asset_brand);

        if (uploadedFile) {
          formData.append('logo', uploadedFile);
        }

        if (isEdit && selectedBrand) {
          await updateBrandMutation.mutateAsync({
            id: selectedBrand.id,
            data: formData,
          });
        } else {
          await createBrandMutation.mutateAsync(formData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving brand:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Brand' : 'Create Brand'}
      size="medium"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Box className="md:!col-span-2">
              <Input
                name="name"
                label="Brand Name"
                placeholder="Enter brand name"
                formik={formik}
                required
              />
            </Box>

            <Box className="md:!col-span-2">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                {uploadedFile ? (
                  <div className="flex items-center gap-2">
                    <Typography variant="body2">{uploadedFile.name}</Typography>
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        removeUploadedFile();
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <Button variant="contained" component="span">
                      Upload Logo
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      JPG, PNG or GIF. Max size of 5MB
                    </Typography>
                    {selectedBrand?.logo && (
                      <Typography variant="caption" color="text.secondary">
                        Current: {selectedBrand.logo.split('/').pop()}
                      </Typography>
                    )}
                  </>
                )}
              </div>
              {formik.touched.logo && formik.errors.logo && (
                <Typography variant="caption" color="error" className="!mt-1">
                  {formik.errors.logo}
                </Typography>
              )}
            </Box>

            <Box className="grid grid-cols-2 col-span-2">
              <ActiveInactiveField name="is_active" formik={formik} />
              <YesNoField
                name="is_asset_brand"
                label="Asset Brand"
                formik={formik}
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
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createBrandMutation.isPending || updateBrandMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createBrandMutation.isPending || updateBrandMutation.isPending
              }
            >
              {createBrandMutation.isPending || updateBrandMutation.isPending
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

export default ManageBrand;
