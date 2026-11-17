/**
 * @fileoverview User Profile Page Component
 * @description Comprehensive profile view and editor displaying personal info, organizational assignments,
 * assigned depots, field routes, security details, and role permissions.
 * @author DCC-SFA Team
 * @version 2.0.0
 */

import {
  AccessTime,
  AltRoute,
  Badge as BadgeIcon,
  Business,
  CalendarToday,
  ExpandLess,
  ExpandMore,
  LocationOn,
  Lock,
  Person,
  PhotoCamera,
  Security,
  SupervisorAccount,
  WorkOutline,
} from '@mui/icons-material';
import { Avatar, Chip, Tooltip } from '@mui/material';
import { useFormik } from 'formik';
import { useCurrentUser, useUpdateUserProfile } from 'hooks/useUsers';
import React, { useMemo, useState } from 'react';
import profileValidationSchema from 'schemas/Profile';
import Button from 'shared/Button';
import Input from 'shared/Input';
import {
  formatDate,
  formatDateTime,
  formatForDateInput,
} from 'utils/dateUtils';

/**
 * Main Profile component providing user details and edit capabilities
 */
const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionFilter, setPermissionFilter] = useState('');

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useCurrentUser();

  const updateProfileMutation = useUpdateUserProfile({
    onSuccess: () => {
      setIsEditing(false);
      setUploadedFile(null);
      setPreviewUrl(null);
      refetch();
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
        if (values.joining_date) {
          formData.append('joining_date', values.joining_date);
        }
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
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
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

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const filteredPermissions = useMemo(() => {
    if (!user?.permissions || !Array.isArray(user.permissions)) return [];
    if (!permissionFilter.trim()) return user.permissions;
    const search = permissionFilter.toLowerCase();
    return user.permissions.filter(p => p.toLowerCase().includes(search));
  }, [user?.permissions, permissionFilter]);

  if (userLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-base mb-1">
            Failed to Load Profile
          </h4>
          <p className="text-sm">
            {userError.message ||
              'An error occurred while fetching your profile.'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-base mb-1">No Profile Found</h4>
          <p className="text-sm">
            We could not retrieve account data for the current session.
          </p>
        </div>
      </div>
    );
  }

  const currentProfileImage = previewUrl || user.profile_image || undefined;
  const isUserActive = user.is_active === 'Y';
  const roleName = user.role?.name || 'No Role Assigned';
  const primaryDepot =
    user.depot?.name ||
    (user.depots && user.depots.length > 0
      ? user.depots[0].name
      : 'Not Assigned');

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/** Top Header Card */}
      <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                My Profile
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isUserActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
                {isUserActive ? 'Active Account' : 'Inactive Account'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              View and manage your personal credentials, organizational
              assignments, and system permissions.
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {!isEditing ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
                className="!px-5 !py-2 !rounded-lg !font-medium !shadow-sm hover:!shadow"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleEditToggle}
                  className="!px-4 !py-2 !rounded-lg !font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="!px-5 !py-2 !rounded-lg !font-medium !shadow-sm"
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

      {/** Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/** Left Column: Profile Card & Quick Overview */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/** Avatar Card */}
          <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 opacity-90" />

            <div className="relative mt-4 mb-3">
              <Avatar
                alt={user.name}
                src={currentProfileImage}
                className="!w-28 !h-28 !rounded-2xl !text-3xl !font-bold !bg-gradient-to-br !from-blue-600 !to-indigo-700 !border-4 !border-white !shadow-md"
              >
                {initials}
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
                  <Tooltip title="Upload profile photo">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('profile-image-upload')?.click()
                      }
                      className="absolute size-9 flex cursor-pointer items-center justify-center -bottom-1 -right-1 bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                      aria-label="Upload photo"
                    >
                      <PhotoCamera fontSize="small" />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-1">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 font-medium break-all">
              {user.email}
            </p>

            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Security className="!w-3.5 !h-3.5 text-blue-600" />
                {roleName}
              </span>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg w-full text-center">
                <p className="text-xs text-blue-800 font-medium truncate">
                  Selected: {uploadedFile.name}
                </p>
                <button
                  type="button"
                  onClick={removeUploadedFile}
                  className="text-red-600 text-xs font-semibold hover:underline mt-1 inline-block"
                >
                  Remove Photo
                </button>
              </div>
            )}

            {/** Summary Attributes Grid */}
            <div className="w-full mt-6 space-y-2.5 text-left border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <BadgeIcon className="!w-4 !h-4 text-gray-400" />
                  Employee ID
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {user.employee_id || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <LocationOn className="!w-4 !h-4 text-gray-400" />
                  Primary Depot
                </span>
                <span
                  className="text-xs font-bold text-gray-800 truncate max-w-[150px]"
                  title={primaryDepot}
                >
                  {primaryDepot}
                </span>
              </div>

              {user.company && (
                <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Business className="!w-4 !h-4 text-gray-400" />
                    Company
                  </span>
                  <span
                    className="text-xs font-bold text-gray-800 truncate max-w-[150px]"
                    title={user.company.name}
                  >
                    {user.company.name}
                  </span>
                </div>
              )}

              {user.reporting_manager && (
                <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <SupervisorAccount className="!w-4 !h-4 text-gray-400" />
                    Manager
                  </span>
                  <span
                    className="text-xs font-bold text-gray-800 truncate max-w-[150px]"
                    title={user.reporting_manager.name}
                  >
                    {user.reporting_manager.name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <AccessTime className="!w-4 !h-4 text-gray-400" />
                  Last Login
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {user.last_login
                    ? formatDateTime(user.last_login)
                    : 'Not recorded'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <CalendarToday className="!w-4 !h-4 text-gray-400" />
                  Member Since
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {user.created_at
                    ? formatDate(user.created_at)
                    : user.joining_date
                      ? formatDate(user.joining_date)
                      : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/** Right Column: Form & Detailed Information Cards */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/** Card 1: Personal & Contact Details (Form) */}
          <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Person fontSize="small" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Personal Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isEditing
                      ? 'Update your personal profile details below.'
                      : 'Your personal contact details and basic credentials.'}
                  </p>
                </div>
              </div>
              {isEditing && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/** Full Name */}
                <Input
                  name="name"
                  label="Full Name"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/** Official Email (Corporate Managed) */}
                <Input
                  name="email"
                  label="Official Email Address"
                  value={user.email}
                  disabled
                  fullWidth
                  helperText={
                    isEditing
                      ? 'Corporate email is managed by your administrator'
                      : undefined
                  }
                />

                {/** Phone Number */}
                <Input
                  name="phone_number"
                  label="Phone Number"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/** Joining Date */}
                <Input
                  name="joining_date"
                  label="Joining Date"
                  type="date"
                  formik={formik}
                  disabled={!isEditing}
                  fullWidth
                />

                {/** Password (Only active during Edit) */}
                {isEditing && (
                  <div className="md:col-span-2">
                    <Input
                      name="password"
                      label="New Password (Optional)"
                      type="password"
                      formik={formik}
                      fullWidth
                      helperText="Leave empty to maintain your existing password. Must be at least 6 characters."
                    />
                  </div>
                )}

                {/** Residential / Work Address */}
                <div className="md:col-span-2">
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
              </div>
            </form>
          </div>

          {/** Card 2: Organization & Work Assignment (Read-Only) */}
          <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <WorkOutline fontSize="small" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Organization & Work Assignment
                </h3>
                <p className="text-xs text-gray-500">
                  Corporate hierarchy, depots, and ERP system references.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Employee ID
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {user.employee_id || 'Not Assigned'}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  SAP / ERP Code
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {user.sap_code || 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assigned Role
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {roleName}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Company
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {user.company
                    ? `${user.company.name} (${user.company.code})`
                    : 'Not Assigned'}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Reporting Manager
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {user.reporting_manager
                    ? user.reporting_manager.name
                    : 'None'}
                </span>
                {user.reporting_manager?.email && (
                  <span className="block text-xs text-gray-500 mt-0.5 truncate">
                    {user.reporting_manager.email}
                  </span>
                )}
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Sub-Inventory Parent
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {user.sub_inventory_parent_name || 'None'}
                </span>
              </div>
            </div>

            {/** Assigned Depots Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Assigned Depots{' '}
                {user.depots && user.depots.length > 0
                  ? `(${user.depots.length})`
                  : ''}
              </span>
              {user.depots && user.depots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.depots.map(depot => (
                    <Chip
                      key={depot.id}
                      icon={<LocationOn className="!w-4 !h-4 text-blue-600" />}
                      label={`${depot.name} (${depot.code})`}
                      size="small"
                      className="!bg-blue-50/70 !text-blue-900 !border !border-blue-200 !font-semibold"
                    />
                  ))}
                </div>
              ) : user.depot ? (
                <Chip
                  icon={<LocationOn className="!w-4 !h-4 text-blue-600" />}
                  label={`${user.depot.name} (${user.depot.code})`}
                  size="small"
                  className="!bg-blue-50/70 !text-blue-900 !border !border-blue-200 !font-semibold"
                />
              ) : (
                <span className="text-xs text-gray-500 italic">
                  No specific depots assigned.
                </span>
              )}
            </div>
          </div>

          {/** Card 3: Assigned Routes (If salesperson or has routes) */}
          {user.routes && user.routes.length > 0 && (
            <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AltRoute fontSize="small" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Assigned Sales Routes ({user.routes.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Your currently active territories and sales routes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.routes.map(r => (
                  <div
                    key={r.id}
                    className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          {r.name}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500">
                          {r.code}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Route
                      </span>
                    </div>

                    {(r.start_location || r.end_location) && (
                      <div className="text-[11px] text-gray-600 mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="truncate">
                          {r.start_location || 'Depot'} &rarr;{' '}
                          {r.end_location || 'Market'}
                        </span>
                        {r.estimated_distance && (
                          <span className="font-medium text-gray-500 ml-2 whitespace-nowrap">
                            {r.estimated_distance} km
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/** Card 4: System Access & Security Info */}
          <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock fontSize="small" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  System & Session Activity
                </h3>
                <p className="text-xs text-gray-500">
                  Security timestamps and device platform details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Last Login Recorded
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {user.last_login
                    ? formatDateTime(user.last_login)
                    : 'No recent login recorded'}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Platform / Client
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {user.platform || 'DCC-SFA Web Portal'}
                </span>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  App Version
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {user.version || 'v1.0.0 (Production)'}
                </span>
              </div>
            </div>
          </div>

          {/** Card 5: Role Permissions & Privileges (Collapsible) */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowPermissions(!showPermissions)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Security fontSize="small" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        Role Permissions
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {user.permissions.length} Granted
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Privileges granted to your account via the &quot;
                      {roleName}&quot; role.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  aria-label={
                    showPermissions ? 'Hide permissions' : 'Show permissions'
                  }
                >
                  {showPermissions ? <ExpandLess /> : <ExpandMore />}
                </button>
              </div>

              {showPermissions && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={permissionFilter}
                      onChange={e => setPermissionFilter(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-1 flex flex-wrap gap-1.5">
                    {filteredPermissions.length > 0 ? (
                      filteredPermissions.map(perm => (
                        <span
                          key={perm}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                        >
                          {perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No permissions match the search.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
