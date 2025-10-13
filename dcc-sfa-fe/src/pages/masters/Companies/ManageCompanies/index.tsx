import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCompany,
  useUpdateCompany,
  type Company,
} from 'hooks/useCompanies';
import React, { useState } from 'react';
import companyValidationSchema from 'schemas/masters/Companies';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCompanyProps {
  selectedCompany?: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCompany: React.FC<ManageCompanyProps> = ({
  selectedCompany,
  setSelectedCompany,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCompany;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Create company mutation
  const createCompanyMutation = useCreateCompany({
    onSuccess: () => {
      handleCancel();
    },
  });

  // Update company mutation
  const updateCompanyMutation = useUpdateCompany({
    onSuccess: () => {
      handleCancel();
    },
  });

  const handleCancel = () => {
    setSelectedCompany(null);
    setDrawerOpen(false);
    setUploadedFile(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: selectedCompany?.name || '',
      address: selectedCompany?.address || '',
      city: selectedCompany?.city || '',
      state: selectedCompany?.state || '',
      country: selectedCompany?.country || '',
      zipcode: selectedCompany?.zipcode || '',
      phone_number: selectedCompany?.phone_number || '',
      email: selectedCompany?.email || '',
      website: selectedCompany?.website || '',
      is_active: selectedCompany?.is_active || 'Y',
    },
    validationSchema: companyValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('address', values.address || '');
        formData.append('city', values.city || '');
        formData.append('state', values.state || '');
        formData.append('country', values.country || '');
        formData.append('zipcode', values.zipcode || '');
        formData.append('phone_number', values.phone_number || '');
        formData.append('email', values.email || '');
        formData.append('website', values.website || '');
        formData.append('is_active', values.is_active);

        if (uploadedFile) {
          formData.append('logo', uploadedFile);
        }

        if (isEdit && selectedCompany) {
          await updateCompanyMutation.mutateAsync({
            id: selectedCompany.id,
            companyData: formData,
          });
        } else {
          await createCompanyMutation.mutateAsync(formData);
        }
      } catch (error) {
        console.error('Error saving company:', error);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById(
      'logo-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Company' : 'Create Company'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          {/* Logo Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Logo preview"
                      className="h-24 w-24 object-cover rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeUploadedFile();
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : selectedCompany?.logo ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <img
                      src={selectedCompany.logo}
                      alt="Current logo"
                      className="h-24 w-24 object-cover rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Current Logo</p>
                  <p className="text-xs text-blue-600">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to upload company logo
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </label>
          </div>

          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Company Name"
              placeholder="Enter company name"
              formik={formik}
              required
              className="md:!col-span-2"
            />

            <Box className="md:!col-span-2">
              <Input
                name="address"
                label="Address"
                placeholder="Enter company address"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>

            <Input
              name="city"
              label="City"
              placeholder="Enter city"
              formik={formik}
            />

            <Input
              name="state"
              label="State"
              placeholder="Enter state"
              formik={formik}
            />

            <Input
              name="country"
              label="Country"
              placeholder="Enter country"
              formik={formik}
            />

            <Input
              name="zipcode"
              label="Zip Code"
              placeholder="Enter zip code"
              formik={formik}
            />

            <Input
              name="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              formik={formik}
              type="tel"
            />

            <Input
              name="email"
              label="Email"
              placeholder="Enter email address"
              formik={formik}
              type="email"
            />

            <Input
              name="website"
              label="Website"
              placeholder="Enter website URL"
              formik={formik}
              type="url"
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!capitalize"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="!capitalize"
              disableElevation
              disabled={
                formik.isSubmitting ||
                createCompanyMutation.isPending ||
                updateCompanyMutation.isPending
              }
            >
              {formik.isSubmitting ||
              createCompanyMutation.isPending ||
              updateCompanyMutation.isPending
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

export default ManageCompany;
