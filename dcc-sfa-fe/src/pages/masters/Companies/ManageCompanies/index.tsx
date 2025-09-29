import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import type { Company } from 'types/Company';

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

  const handleCancel = () => {
    setSelectedCompany(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: selectedCompany?.name || '',
      code: selectedCompany?.code || '',
      address: selectedCompany?.address || '',
      city: selectedCompany?.city || '',
      state: selectedCompany?.state || '',
      country: selectedCompany?.country || '',
      zipcode: selectedCompany?.zipcode || '',
      phone_number: selectedCompany?.phone_number || '',
      email: selectedCompany?.email || '',
      website: selectedCompany?.website || '',
      logo: selectedCompany?.logo || '',
      is_active: selectedCompany?.is_active || 'Y',
    },
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        console.log('Company data:', values);
        handleCancel();
      } catch (error) {
        console.error('Error saving company:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Company' : 'Create Company'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="name"
              label="Company Name"
              placeholder="Enter company name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Company Code"
              placeholder="Enter company code"
              formik={formik}
              required
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

            <Input
              name="logo"
              label="Logo URL"
              placeholder="Enter logo URL"
              formik={formik}
              type="url"
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!flex !justify-end !gap-3">
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
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
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
