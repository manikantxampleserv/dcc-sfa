import { Add } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useFormik } from 'formik';
import { usePermissionsByModule } from 'hooks/usePermissions';
import { useCreateRole, useUpdateRole, type Role } from 'hooks/useRoles';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import validationSchema from 'schemas/masters/RolePersmissions';

interface ManageRolePermissionsProps {
  selectedRole?: Role | null;
  setSelectedRole: (role: Role | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageRolePermissions: React.FC<ManageRolePermissionsProps> = ({
  selectedRole,
  setSelectedRole,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedRole;

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
    name: selectedRole?.name || '',
    description: selectedRole?.description || '',
    is_active: selectedRole?.is_active || 'Y',
    permissions:
      selectedRole?.permissions
        ?.filter(p => p.is_active === 'Y')
        .map(p => p.permission_id) || [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (isEdit && selectedRole) {
          await updateRoleMutation.mutateAsync({
            id: selectedRole.id,
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    formik.resetForm();
    setSelectedRole(null);
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

  const getUniqueActions = () => {
    const actions = new Set<string>();
    permissionsData.forEach(module => {
      module.permissions.forEach(permission => {
        actions.add(permission.action);
      });
    });
    return Array.from(actions).sort();
  };

  const isAllPermissionsSelected = () => {
    const allPermissionIds = permissionsData.flatMap(module =>
      module.permissions.map(p => p.id)
    );
    return (
      allPermissionIds.length > 0 &&
      allPermissionIds.every(id => formik.values.permissions.includes(id))
    );
  };

  const isSomePermissionsSelected = () => {
    const allPermissionIds = permissionsData.flatMap(module =>
      module.permissions.map(p => p.id)
    );
    const selectedCount = allPermissionIds.filter(id =>
      formik.values.permissions.includes(id)
    ).length;
    return selectedCount > 0 && selectedCount < allPermissionIds.length;
  };

  const handleSelectAllPermissions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      const allPermissionIds = permissionsData.flatMap(module =>
        module.permissions.map(p => p.id)
      );
      formik.setFieldValue('permissions', allPermissionIds);
    } else {
      formik.setFieldValue('permissions', []);
    }
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
        setOpen={handleCancel}
        title={isEdit ? `Edit Role: ${selectedRole?.name}` : 'Create New Role'}
        size="larger"
      >
        <Box component="form" onSubmit={handleSubmit} className="p-4">
          {/* Role Basic Information */}
          <Box className="mb-3">
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
              <Select
                name="is_active"
                formik={formik}
                label="Status"
                fullWidth
                required
              >
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

            {/* Compact Permissions Table */}
            <TableContainer
              component={Paper}
              className="!shadow-none !border !border-gray-200"
            >
              <Table size="small" className="!min-w-full">
                <TableHead>
                  <TableRow className="!bg-gray-50">
                    <TableCell className="!font-semibold !text-gray-700 !py-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          size="small"
                          checked={isAllPermissionsSelected()}
                          indeterminate={isSomePermissionsSelected()}
                          onChange={handleSelectAllPermissions}
                          className="!text-primary-600"
                        />
                        Module
                      </div>
                    </TableCell>
                    {getUniqueActions().map(action => (
                      <TableCell
                        key={action}
                        align="center"
                        className="!font-semibold !capitalize !text-gray-700 !py-3 !min-w-[100px]"
                      >
                        {action}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissionsData.map(module => (
                    <TableRow key={module.module} className="hover:!bg-gray-50">
                      <TableCell className="!py-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            size="small"
                            checked={isModuleFullySelected(module.permissions)}
                            indeterminate={isModulePartiallySelected(
                              module.permissions
                            )}
                            onChange={e =>
                              handleModuleSelectAll(
                                module.permissions,
                                e.target.checked
                              )
                            }
                            className="!text-primary-600"
                          />
                          <span className="!font-medium !text-gray-900 !capitalize">
                            {module.module}
                          </span>
                        </div>
                      </TableCell>
                      {getUniqueActions().map(action => {
                        const permission = module.permissions.find(
                          p => p.action === action
                        );
                        return (
                          <TableCell
                            key={action}
                            align="center"
                            className="!py-2"
                          >
                            {permission ? (
                              <Switch
                                size="small"
                                checked={formik.values.permissions.includes(
                                  permission.id
                                )}
                                onChange={e =>
                                  handlePermissionChange(
                                    permission.id,
                                    e.target.checked
                                  )
                                }
                                className="!text-primary-600"
                              />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
