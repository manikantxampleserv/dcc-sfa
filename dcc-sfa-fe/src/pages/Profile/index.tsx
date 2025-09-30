/**
 * @fileoverview User Profile Page Component
 * @description Allows users to view and edit their profile information
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PhotoCamera } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrentUser, useUpdateUserProfile } from 'hooks/useUsers';
import React, { useState } from 'react';
import profileValidationSchema from 'schemas/Profile';
import Button from 'shared/Button';
import Input from 'shared/Input';
import { formatForDateInput } from 'utils/dateUtils';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch current user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useCurrentUser();

  // Update profile mutation
  const updateProfileMutation = useUpdateUserProfile({
    onSuccess: () => {
      setIsEditing(false);
      setUploadedFile(null);
      setPreviewUrl(null);
      refetch(); // Refresh user data
    },
  });

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    joining_date: formatForDateInput(user?.joining_date),
    password: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('phone_number', values.phone_number);
        formData.append('address', values.address);
        formData.append('joining_date', values.joining_date);

        if (values.password) {
          formData.append('password', values.password);
        }

        if (uploadedFile) {
          formData.append('profile_image', uploadedFile);
        }

        await updateProfileMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      formik.resetForm();
      setUploadedFile(null);
      setPreviewUrl(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (userLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading profile: {userError.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No user data available
        </div>
      </div>
    );
  }

  const currentProfileImage = previewUrl || user.profile_image || undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1">
              My Profile
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleEditToggle}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              <div className="relative mb-4">
                <Avatar
                  alt={user.name}
                  src={currentProfileImage}
                  className="!w-32 !h-32 !rounded-xl !text-4xl !font-bold !bg-blue-500"
                >
                  {user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </Avatar>

                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('profile-image-upload')?.click()
                      }
                      className="absolute size-10 flex cursor-pointer items-center justify-center -bottom-2 -right-2 bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-xl shadow-lg transition-colors"
                    >
                      <PhotoCamera fontSize="small" />
                    </button>
                  </>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>

              <span
                className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                  user.is_active === 'Y'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.is_active === 'Y' ? 'Active' : 'Inactive'}
              </span>

              {uploadedFile && (
                <div className="mt-4 w-full text-center">
                  <p className="text-xs text-gray-600">
                    New image: {uploadedFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    className="text-red-600 text-sm hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <Input
                  name="name"
                  label="Full Name"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/* Email */}
                {/* <Input
                  name="email"
                  label="Email Address"
                  type="email"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                /> */}

                {/* Phone Number */}
                <Input
                  name="phone_number"
                  label="Phone Number"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/* Role (Read-only) */}
                <Input
                  name="role"
                  label="Role"
                  value={user.role?.name || 'No Role Assigned'}
                  disabled
                  fullWidth
                />

                {/* Joining Date */}
                <Input
                  name="joining_date"
                  label="Joining Date"
                  type="date"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/* Password (only when editing) */}
                {isEditing && (
                  <Input
                    name="password"
                    label="New Password (Optional)"
                    type="password"
                    formik={formik}
                    fullWidth
                    helperText="Leave blank to keep current password"
                  />
                )}
              </div>

              {/* Address - Full width */}
              <div className="mt-4">
                <Input
                  name="address"
                  label="Address"
                  formik={formik}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                  fullWidth
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
