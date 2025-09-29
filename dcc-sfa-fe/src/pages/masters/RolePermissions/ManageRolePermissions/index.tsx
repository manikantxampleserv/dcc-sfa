import { Add, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import { usePermissionsByModule } from 'hooks/usePermissions';
import { useCreateRole, useUpdateRole, type Role } from 'hooks/useRoles';
import React, { useEffect, useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import * as Yup from 'yup';

interface ManageRolePermissionsProps {
  role?: Role | null;
  onClose: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must not exceed 50 characters'),
  description: Yup.string().max(
    200,
    'Description must not exceed 200 characters'
  ),
  is_active: Yup.string().required('Status is required'),
  permissions: Yup.array().min(1, 'At least one permission must be selected'),
});

const ManageRolePermissions: React.FC<ManageRolePermissionsProps> = ({
  role,
  onClose,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isEdit = !!role;

  const {
    data: permissionsResponse,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = usePermissionsByModule();

  const permissionsData = permissionsResponse?.data || [];

  const createRoleMutation = useCreateRole({
    onSuccess: () => {
      handleCancel();
    },
  });

  const updateRoleMutation = useUpdateRole({
    onSuccess: () => {
      handleCancel();
    },
  });

  const initialValues = {
    name: role?.name || '',
    description: role?.description || '',
    is_active: role?.is_active || 'Y',
    permissions:
      role?.permissions
        ?.filter(p => p.is_active === 'Y')
        .map(p => p.permission_id) || [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async values => {
      try {
        if (isEdit && role) {
          await updateRoleMutation.mutateAsync({
            id: role.id,
            roleData: {
              name: values.name,
              description: values.description,
              is_active: values.is_active,
              permissions: values.permissions,
            },
          });
        } else {
          await createRoleMutation.mutateAsync({
            name: values.name,
            description: values.description,
            is_active: values.is_active,
            permissions: values.permissions,
          });
        }
      } catch (error) {
        console.error('Error saving role:', error);
      }
    },
  });

  useEffect(() => {
    setDrawerOpen(true);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      formik.resetForm();
      onClose();
    }, 300);
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const currentPermissions = formik.values.permissions;
    if (checked) {
      formik.setFieldValue('permissions', [
        ...currentPermissions,
        permissionId,
      ]);
    } else {
      formik.setFieldValue(
        'permissions',
        currentPermissions.filter(id => id !== permissionId)
      );
    }
  };

  const handleModuleSelectAll = (
    modulePermissions: any[],
    checked: boolean
  ) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const currentPermissions = formik.values.permissions;

    if (checked) {
      const newPermissions = [...currentPermissions];
      modulePermissionIds.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      formik.setFieldValue('permissions', newPermissions);
    } else {
      formik.setFieldValue(
        'permissions',
        currentPermissions.filter(id => !modulePermissionIds.includes(id))
      );
    }
  };

  const isModuleFullySelected = (modulePermissions: any[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    return modulePermissionIds.every(id =>
      formik.values.permissions.includes(id)
    );
  };

  const isModulePartiallySelected = (modulePermissions: any[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const selectedCount = modulePermissionIds.filter(id =>
      formik.values.permissions.includes(id)
    ).length;
    return selectedCount > 0 && selectedCount < modulePermissionIds.length;
  };

  return (
    <div>
      <Button
        variant="contained"
        className="!capitalize"
        disableElevation
        startIcon={<Add />}
        onClick={() => setDrawerOpen(true)}
      >
        Create
      </Button>

      <CustomDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        title={isEdit ? `Edit Role: ${role?.name}` : 'Create New Role'}
        size="larger"
      >
        <Box component="form" onSubmit={handleSubmit} className="p-4">
          {/* Role Basic Information */}
          <Box className="mb-6">
            <p className="!font-semibold !mb-4 !text-gray-900">
              Role Information
            </p>

            <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
              <Input
                name="name"
                formik={formik}
                label="Role Name"
                placeholder="Enter role name"
                required
              />
              <Select name="is_active" formik={formik} label="Status" required>
                <MenuItem value="Y">Active</MenuItem>
                <MenuItem value="N">Inactive</MenuItem>
              </Select>
            </div>

            <Input
              name="description"
              formik={formik}
              label="Description"
              placeholder="Enter role description"
              multiline
              rows={3}
            />
          </Box>

          {/* Permissions Section */}
          <Box className="mb-6">
            <p className="!font-semibold !mb-4 !text-gray-900">Permissions</p>

            {formik.errors.permissions && formik.touched.permissions && (
              <Alert severity="error" className="!mb-4">
                {formik.errors.permissions}
              </Alert>
            )}

            {permissionsError && (
              <Alert severity="warning" className="!mb-4">
                Failed to load permissions from server. Using default
                permissions.
              </Alert>
            )}

            {permissionsLoading && (
              <div className="!flex !justify-center !py-4">
                <p className="!text-gray-500">Loading permissions...</p>
              </div>
            )}

            {permissionsData.map(module => {
              const isFullySelected = isModuleFullySelected(module.permissions);
              const isPartiallySelected = isModulePartiallySelected(
                module.permissions
              );

              return (
                <div
                  key={module.module}
                  className="border px-2 border-gray-200 rounded-lg"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={isFullySelected}
                        indeterminate={isPartiallySelected}
                        onChange={e =>
                          handleModuleSelectAll(
                            module.permissions,
                            e.target.checked
                          )
                        }
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                        className="!text-primary-600"
                      />
                    }
                    label={
                      <p className="!font-semibold !capitalize !text-gray-900">
                        {module.module}
                      </p>
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {module.permissions.map(permission => (
                      <FormControlLabel
                        key={permission.id}
                        className="!items-start fle !m-0 !p-1 !rounded !border !border-gray-100 hover:!bg-gray-50"
                        control={
                          <Checkbox
                            checked={formik.values.permissions.includes(
                              permission.id
                            )}
                            onChange={e =>
                              handlePermissionChange(
                                permission.id,
                                e.target.checked
                              )
                            }
                            size="small"
                            className="!text-primary-600 !mt-0.5"
                          />
                        }
                        label={
                          <div className="!text-gray-700">
                            <span className="!font-semibold !text-xs uppercase !text-blue-600">
                              {permission.action}
                            </span>
                            <p className="!text-xs !text-gray-500 !mt-0.5 !leading-tight">
                              {permission.description || permission.name}
                            </p>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </Box>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createRoleMutation.isPending || updateRoleMutation.isPending
              }
            >
              {isEdit ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </Box>
      </CustomDrawer>
    </div>
  );
};

export default ManageRolePermissions;
