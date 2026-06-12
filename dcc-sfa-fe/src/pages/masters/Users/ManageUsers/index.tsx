import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Typography,
  Avatar,
} from '@mui/material';
import { Route as RouteIcon } from 'lucide-react';
import { useFormik } from 'formik';
import { useDepots } from 'hooks/useDepots';
import { useRolesDropdown } from 'hooks/useRoles';
import { useRouteAssignment, useRoutes } from 'hooks/useRoutes';
import { useCreateUser, useUpdateUser, type User } from 'hooks/useUsers';
import React, { useState } from 'react';
import validationSchema from 'schemas/masters/Users';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import DepotAssignment from 'shared/DepotAssignment';
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

  // Confirmation dialog and route management states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [routesToRemove, setRoutesToRemove] = useState<
    Array<{ id: number; name: string; code: string }>
  >([]);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const { data: rolesResponse, isLoading: rolesLoading } = useRolesDropdown({
    enabled: drawerOpen,
  });
  const { data: depotsResponse } = useDepots({
    limit: 1000,
    isActive: 'Y',
  });
  const roles = rolesResponse?.data || [];
  const depots = depotsResponse?.data || [];

  // Fetch routes and user assignments to detect affected routes upon depot removal
  const { data: routeAssignmentsResponse } = useRouteAssignment(
    selectedUser?.id || 0
  );
  const { data: routesResponse } = useRoutes(
    { limit: 1000 },
    { enabled: isEdit && drawerOpen }
  );

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
    depot_ids:
      selectedUser?.depots && Array.isArray(selectedUser.depots)
        ? selectedUser.depots.map((d: any) => d?.id?.toString()).filter(Boolean)
        : [],
    sap_code: selectedUser?.sap_code || '',
    phone_number: selectedUser?.phone_number || '',
    employee_id: selectedUser?.employee_id || '',
    address: selectedUser?.address || '',
    joining_date: formatForDateInput(selectedUser?.joining_date),
    reporting_to: selectedUser?.reporting_to || '',
    platform: selectedUser?.platform || 'both',
    password: '',
    is_active: selectedUser?.is_active || 'Y',
    isEdit: !!selectedUser,
  };

  const saveUserData = async (values: typeof initialValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('role_id', values.role_id.toString());
      formData.append(
        'depot_ids',
        JSON.stringify(values.depot_ids.map(Number))
      );
      formData.append('sap_code', values.sap_code);
      formData.append('phone_number', values.phone_number);
      formData.append('employee_id', values.employee_id);
      formData.append('address', values.address);
      formData.append('joining_date', values.joining_date);
      formData.append('reporting_to', values.reporting_to.toString());
      formData.append(
        'platform',
        values.platform !== 'both' ? values.platform : ''
      );
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
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      if (isEdit && selectedUser) {
        const initialDepotIds =
          selectedUser.depots?.map((d: any) => d.id) || [];
        const currentDepotIds = values.depot_ids.map(Number);
        const removedDepotIds = initialDepotIds.filter(
          id => !currentDepotIds.includes(id)
        );

        if (removedDepotIds.length > 0) {
          const allRoutes = routesResponse?.data || [];
          const userAssignedRoutes =
            routeAssignmentsResponse?.data?.assigned_routes || [];

          const affected = userAssignedRoutes.filter(assignedRoute => {
            const fullRoute = allRoutes.find(r => r.id === assignedRoute.id);
            return fullRoute && removedDepotIds.includes(fullRoute.depot_id);
          });

          if (affected.length > 0) {
            setRoutesToRemove(
              affected.map((r: any) => {
                const fullRoute = allRoutes.find(ar => ar.id === r.id);
                return {
                  id: r.id,
                  name: r.name || fullRoute?.name || `Route ${r.id}`,
                  code: r.code || fullRoute?.code || 'No Code',
                };
              })
            );
            setPendingValues(values);
            setConfirmDialogOpen(true);
            return;
          }
        }
      }

      await saveUserData(values);
    },
  });

  const handleConfirmSubmit = async () => {
    if (pendingValues) {
      await saveUserData(pendingValues);
    }
    setConfirmDialogOpen(false);
    setPendingValues(null);
    setRoutesToRemove([]);
  };

  const handleCancelSubmit = () => {
    setConfirmDialogOpen(false);
    setPendingValues(null);
    setRoutesToRemove([]);
  };

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
    setConfirmDialogOpen(false);
    setRoutesToRemove([]);
    setPendingValues(null);
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
                JPG, GIF or PNG. Max size of 10MB
              </Typography>
            </>
          )}
        </div>

        {/* User Basic Information */}
        <Box className="mb-6 flex flex-col gap-2">
          <p className="!font-semibold !text-gray-900">User Information</p>

          <Box className="grid grid-cols-2 gap-5">
            <Input
              name="name"
              formik={formik}
              label="Full Name"
              placeholder="Enter full name"
              required
            />
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
            <Input
              name="employee_id"
              formik={formik}
              label="User Code"
              placeholder="Enter user code"
              required
            />

            <Input
              name="sap_code"
              formik={formik}
              label="SAP Code"
              placeholder="Enter SAP code"
            />

            <Input
              name="phone_number"
              formik={formik}
              label="Phone Number"
              placeholder="Enter Phone Number"
            />
            <Input
              name="email"
              formik={formik}
              label="Email"
              placeholder="Enter email address"
              type="email"
            />

            {!isEdit && (
              <Input
                name="password"
                formik={formik}
                label="Password"
                placeholder="Enter password"
                type="password"
                required
              />
            )}

            {isEdit && (
              <Input
                name="password"
                formik={formik}
                label="New Password (Optional)"
                placeholder="Enter new password to change"
                type="password"
              />
            )}
            <UserSelect
              name="reporting_to"
              label="Reporting Manager"
              formik={formik}
              required
            />
            <Input
              name="joining_date"
              formik={formik}
              label="Joining Date"
              type="date"
              required
            />
            <Select name="platform" formik={formik} label="Platform" fullWidth>
              <MenuItem value="both">Both</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="web">Web</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Typography
                variant="subtitle2"
                className="!font-semibold !text-gray-700 !mb-2"
              >
                Depot Assignment *
              </Typography>
              <DepotAssignment
                depots={depots}
                selectedDepotIds={formik.values.depot_ids}
                setSelectedDepotIds={ids =>
                  formik.setFieldValue('depot_ids', ids)
                }
              />
              {formik.errors.depot_ids && (
                <Typography
                  variant="caption"
                  color="error"
                  className="!mt-1 !block"
                >
                  {formik.errors.depot_ids as string}
                </Typography>
              )}
            </Box>
          </Box>
          <Box className="md:!col-span-2">
            <ActiveInactiveField name="is_active" formik={formik} required />
          </Box>
          <Input
            name="address"
            formik={formik}
            label="Address"
            placeholder="Enter address"
            multiline
            rows={3}
          />
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
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelSubmit}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'rounded-xl p-4',
        }}
      >
        <DialogTitle className="!p-0 !mb-4 !text-xl !font-semibold !text-gray-900">
          Confirm Route Unassignment
        </DialogTitle>
        <DialogContent className="!p-0 !mb-6">
          <DialogContentText className="!text-gray-600 !text-sm !mb-4 !leading-relaxed">
            Unassigning the selected depot(s) will automatically remove the
            following route assignments from this user:
          </DialogContentText>
          <Box className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-1">
            {routesToRemove.map(route => (
              <Box
                key={route.id}
                className="!p-2 !bg-white !rounded-lg !border !border-gray-200 !flex !items-center !gap-3"
              >
                <Avatar className="!bg-primary-100 !text-primary-600 !rounded !w-10 !h-10">
                  <RouteIcon className="w-5 h-5" />
                </Avatar>
                <Box className="!min-w-0">
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900 !truncate"
                  >
                    {route.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !truncate !block"
                  >
                    {route.code}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions className="!p-0 flex gap-2">
          <Button color="error" variant="outlined" onClick={handleCancelSubmit}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmSubmit}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </CustomDrawer>
  );
};

export default ManageUsers;
