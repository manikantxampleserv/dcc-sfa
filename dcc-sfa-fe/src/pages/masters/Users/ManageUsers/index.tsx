import { Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRolesDropdown } from 'hooks/useRoles';
import { useCreateUser, useUpdateUser, type User } from 'hooks/useUsers';
import React, { useState } from 'react';
import validationSchema from 'schemas/masters/Users';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import { formatForDateInput } from 'utils/dateUtils';

interface ManageUsersProps {
  selectedUser?: User | null;
  setSelectedUser: (user: User | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageUsers: React.FC<ManageUsersProps> = ({
  selectedUser,
  setSelectedUser,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const isEdit = !!selectedUser;

  const { data: rolesResponse, isLoading: rolesLoading } = useRolesDropdown({
    enabled: drawerOpen,
  });
  const roles = rolesResponse?.data || [];

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      handleCancel();
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      handleCancel();
    },
  });

  const initialValues = {
    name: selectedUser?.name || '',
    email: selectedUser?.email || '',
    role_id: selectedUser?.role_id || '',
    phone_number: selectedUser?.phone_number || '',
    address: selectedUser?.address || '',
    joining_date: formatForDateInput(selectedUser?.joining_date),
    reporting_to: selectedUser?.reporting_to || '',
    password: '',
    is_active: selectedUser?.is_active || 'Y',
    isEdit: !!selectedUser,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('role_id', values.role_id.toString());
        formData.append('phone_number', values.phone_number);
        formData.append('address', values.address);
        formData.append('joining_date', values.joining_date);
        formData.append('reporting_to', values.reporting_to.toString());
        formData.append('is_active', values.is_active);

        if (values.password) {
          formData.append('password', values.password);
        }

        if (uploadedFile) {
          formData.append('profile_image', uploadedFile);
        }

        if (isEdit && selectedUser) {
          await updateUserMutation.mutateAsync({
            id: selectedUser.id,
            userData: formData,
          });
        } else {
          await createUserMutation.mutateAsync(formData);
        }
      } catch (error) {
        console.error('Error saving user:', error);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    formik.resetForm();
    setSelectedUser(null);
    setUploadedFile(null);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? `Edit User: ${selectedUser?.name}` : 'Create New User'}
      size="large"
    >
      <Box component="form" onSubmit={handleSubmit} className="p-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          {uploadedFile ? (
            <div className="flex items-center gap-2">
              <Typography variant="body2">{uploadedFile.name}</Typography>
              <IconButton size="small" onClick={removeUploadedFile}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ) : (
            <>
              <Button variant="contained" sx={{ mb: 1 }}>
                Upload file
              </Button>
              <Typography variant="body2" color="text.secondary">
                JPG, GIF or PNG. Max size of 800K
              </Typography>
            </>
          )}
        </div>

        {/* User Basic Information */}
        <Box className="mb-6">
          <p className="!font-semibold !mb-4 !text-gray-900">
            User Information
          </p>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input
              name="name"
              formik={formik}
              label="Full Name"
              placeholder="Enter full name"
              required
            />
            <Input
              name="email"
              formik={formik}
              label="Email"
              placeholder="Enter email address"
              type="email"
              required
            />
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Select
              name="role_id"
              formik={formik}
              label="Role"
              fullWidth
              required
            >
              {rolesLoading ? (
                <MenuItem disabled>Loading roles...</MenuItem>
              ) : (
                roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <Select
              required
              name="is_active"
              formik={formik}
              label="Status"
              fullWidth
            >
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input
              name="phone_number"
              formik={formik}
              label="Phone Number"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input
              name="joining_date"
              formik={formik}
              label="Joining Date"
              type="date"
            />
            <UserSelect
              name="reporting_to"
              label="Reporting Manager"
              formik={formik}
              required
            />
          </div>

          <Input
            name="address"
            formik={formik}
            label="Address"
            placeholder="Enter address"
            multiline
            rows={3}
          />

          {!isEdit && (
            <Input
              name="password"
              formik={formik}
              label="Password"
              placeholder="Enter password"
              type="password"
              required
              className="!mt-4"
            />
          )}

          {isEdit && (
            <Input
              name="password"
              formik={formik}
              label="New Password (Optional)"
              placeholder="Enter new password to change"
              type="password"
              className="!mt-4"
            />
          )}
        </Box>

        <div className="flex gap-4 justify-end">
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              createUserMutation.isPending || updateUserMutation.isPending
            }
          >
            {createUserMutation.isPending || updateUserMutation.isPending
              ? 'Saving...'
              : isEdit
                ? 'Update'
                : 'Create'}
          </Button>
        </div>
      </Box>
    </CustomDrawer>
  );
};

export default ManageUsers;
