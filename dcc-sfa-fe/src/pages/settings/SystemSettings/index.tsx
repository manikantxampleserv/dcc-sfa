import {
  Avatar,
  Box,
  Divider,
  IconButton,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSettings, useUpdateSettings } from 'hooks/useSettings';
import {
  Building2,
  CheckCircle,
  Settings as SettingsIcon,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Company name is required'),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  country: Yup.string(),
  zipcode: Yup.string(),
  phone_number: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  website: Yup.string().url('Invalid URL'),
  smtp_host: Yup.string(),
  smtp_port: Yup.number().nullable(),
  smtp_username: Yup.string(),
  smtp_password: Yup.string(),
});

const SystemSettings: React.FC = () => {
  const { data: settingsResponse, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const settings = settingsResponse?.data;

  const formik = useFormik({
    initialValues: {
      name: settings?.name || '',
      address: settings?.address || '',
      city: settings?.city || '',
      state: settings?.state || '',
      country: settings?.country || '',
      zipcode: settings?.zipcode || '',
      phone_number: settings?.phone_number || '',
      email: settings?.email || '',
      website: settings?.website || '',
      is_active: settings?.is_active || 'Y',
      smtp_host: settings?.smtp_host || '',
      smtp_port: settings?.smtp_port || null,
      smtp_username: settings?.smtp_username || '',
      smtp_password: settings?.smtp_password || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (!settings?.id) {
          return;
        }

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
        formData.append('smtp_host', values.smtp_host || '');
        formData.append(
          'smtp_port',
          values.smtp_port ? values.smtp_port.toString() : ''
        );
        formData.append('smtp_username', values.smtp_username || '');
        formData.append('smtp_password', values.smtp_password || '');

        if (uploadedFile) {
          formData.append('logo', uploadedFile);
        }

        await updateSettingsMutation.mutateAsync({
          id: settings.id,
          settingsData: formData,
        });

        setUploadedFile(null);
        setLogoPreview(null);
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setLogoPreview(null);
  };

  if (isLoading) {
    return (
      <Box>
        <Box className="mb-2">
          <Skeleton variant="text" width={200} height={32} className="!mb-1" />
          <Skeleton variant="text" width={400} height={20} />
        </Box>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Divider className="!mb-6" />

          <Box className="mb-6">
            <Skeleton
              variant="text"
              width={120}
              height={16}
              className="!mb-4"
            />
            <Box className="flex items-center gap-4">
              <Skeleton
                variant="circular"
                width={96}
                height={96}
                className="!bg-gray-200"
              />
              <Box>
                <Skeleton variant="rectangular" width={140} height={36} />
                <Skeleton
                  variant="text"
                  width={200}
                  height={14}
                  className="!mt-2"
                />
              </Box>
            </Box>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(field => (
              <Box key={field} className="space-y-2">
                <Skeleton variant="text" width="40%" height={14} />
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Box>
            ))}
          </Box>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Divider className="!mb-6" />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(field => (
              <Box key={field} className="space-y-2">
                <Skeleton variant="text" width="40%" height={14} />
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Box>
            ))}
          </Box>
        </div>

        <Box className="flex justify-end gap-3">
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={140} height={36} />
        </Box>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box>
        <Typography variant="h6" className="!text-gray-900">
          No settings found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="mb-2">
        <Typography variant="h5" className="!font-semibold !text-gray-900">
          System Settings
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mt-1">
          Manage your company settings and configuration
        </Typography>
      </Box>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary-600" />
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              Company Information
            </Typography>
          </Box>
          <Divider className="!mb-6" />

          <Box className="mb-6">
            <Typography
              variant="body2"
              className="!font-medium !text-gray-700 !mb-4"
            >
              Company Logo
            </Typography>
            <Box className="flex items-center gap-4">
              <Avatar
                src={logoPreview || settings.logo || undefined}
                alt={settings.name}
                className="!w-24 !h-24 !bg-primary-100"
              >
                <Building2 className="w-12 h-12 text-primary-600" />
              </Avatar>
              <Box>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload className="w-4 h-4" />}
                    size="small"
                  >
                    {uploadedFile ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                </label>
                {uploadedFile && (
                  <IconButton
                    size="small"
                    onClick={removeUploadedFile}
                    className="!ml-2"
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                )}
                <Typography
                  variant="caption"
                  className="!block !mt-2 !text-gray-500"
                >
                  JPG, PNG or GIF. Max size of 2MB
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              formik={formik}
              label="Company Name"
              placeholder="Enter company name"
              required
              fullWidth
            />
            <Input
              name="code"
              label="Company Code"
              value={settings.code}
              disabled
              fullWidth
            />
            <Input
              name="address"
              formik={formik}
              label="Address"
              placeholder="Enter address"
              fullWidth
              className="md:col-span-2"
            />
            <Input
              name="city"
              formik={formik}
              label="City"
              placeholder="Enter city"
              fullWidth
            />
            <Input
              name="state"
              formik={formik}
              label="State"
              placeholder="Enter state"
              fullWidth
            />
            <Input
              name="country"
              formik={formik}
              label="Country"
              placeholder="Enter country"
              fullWidth
            />
            <Input
              name="zipcode"
              formik={formik}
              label="Zip Code"
              placeholder="Enter zip code"
              fullWidth
            />
            <Input
              name="phone_number"
              formik={formik}
              label="Phone Number"
              placeholder="Enter phone number"
              fullWidth
            />
            <Input
              name="email"
              formik={formik}
              label="Email"
              placeholder="Enter email address"
              type="email"
              fullWidth
            />
            <Input
              name="website"
              formik={formik}
              label="Website"
              placeholder="https://example.com"
              fullWidth
            />
            <Select name="is_active" formik={formik} label="Status" fullWidth>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              SMTP Configuration
            </Typography>
          </Box>
          <Divider className="!mb-6" />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="smtp_host"
              formik={formik}
              label="SMTP Host"
              placeholder="smtp.example.com"
              fullWidth
            />
            <Input
              name="smtp_port"
              formik={formik}
              label="SMTP Port"
              placeholder="587"
              type="number"
              fullWidth
            />
            <Input
              name="smtp_username"
              formik={formik}
              label="SMTP Username"
              placeholder="Enter SMTP username"
              fullWidth
            />
            <Input
              name="smtp_password"
              formik={formik}
              label="SMTP Password"
              placeholder="Enter SMTP password"
              type="password"
              fullWidth
            />
          </Box>
        </div>

        <Box className="flex justify-end gap-3">
          <Button
            variant="outlined"
            onClick={() => {
              formik.resetForm();
              setUploadedFile(null);
              setLogoPreview(null);
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={updateSettingsMutation.isPending}
            startIcon={<CheckCircle className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemSettings;
