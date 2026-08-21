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
  Skeleton,
} from '@mui/material';
import {
  Route as RouteIcon,
  GripVertical,
  UserPlus,
  Users as UsersIcon,
  Search,
} from 'lucide-react';
import classNames from 'classnames';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useDepots } from 'hooks/useDepots';
import { useRolesDropdown } from 'hooks/useRoles';
import { useRouteAssignment, useRoutes } from 'hooks/useRoutes';
import {
  useCreateUser,
  useUpdateUser,
  useUsers,
  type User,
} from 'hooks/useUsers';
import React, { useState, useMemo } from 'react';
import validationSchema from 'schemas/masters/Users';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import DepotAssignment from 'shared/DepotAssignment';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';
import { formatForDateInput } from 'utils/dateUtils';

const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string): string => {
  if (!name) return '!bg-gray-500';
  const colors = [
    '!bg-blue-500',
    '!bg-green-500',
    '!bg-orange-500',
    '!bg-teal-500',
    '!bg-red-500',
    '!bg-purple-500',
    '!bg-pink-500',
    '!bg-indigo-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

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

  const [availableUsersSearch, setAvailableUsersSearch] = useState('');

  const { data: usersResponse, isFetching: isFetchingUsers } = useUsers(
    {
      page: 1,
      limit: 10000,
      isActive: 'Y',
    },
    { enabled: drawerOpen }
  );
  const allUsers = usersResponse?.data || [];

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

  const initialValues = useMemo(
    () => ({
      name: selectedUser?.name || '',
      email: selectedUser?.email || '',
      role_id: selectedUser?.role_id || '',
      depot_ids:
        selectedUser?.depots && Array.isArray(selectedUser.depots)
          ? selectedUser.depots
              .map((d: any) => d?.id?.toString())
              .filter(Boolean)
          : [],
      sub_inventory_user_ids:
        (selectedUser as any)?.sub_inventory_users &&
        Array.isArray((selectedUser as any).sub_inventory_users)
          ? (selectedUser as any).sub_inventory_users.map((u: any) =>
              u.id.toString()
            )
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
    }),
    [selectedUser]
  );

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
      formData.append(
        'sub_inventory_user_ids',
        JSON.stringify(values.sub_inventory_user_ids.map(Number))
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
    validate: values => {
      const errors: any = {};
      const selectedRoleObj = roles.find(r => r.id === values.role_id);
      const isGroupRoleSubmit =
        selectedRoleObj?.name?.toLowerCase().includes('group') || false;

      if (isGroupRoleSubmit && values.sub_inventory_user_ids.length === 0) {
        errors.sub_inventory_user_ids =
          'Please assign at least one container member';
      }
      return errors;
    },
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
    setAvailableUsersSearch('');
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const isGroupRole = useMemo(() => {
    const selectedRoleObj = roles.find(r => r.id === formik.values.role_id);
    return selectedRoleObj?.name?.toLowerCase().includes('group') || false;
  }, [roles, formik.values.role_id]);

  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    const assignedIds = formik.values.sub_inventory_user_ids;
    return allUsers
      .filter(user => {
        const roleName =
          typeof user.role === 'object' ? user.role?.name : user.role;
        return (
          typeof roleName === 'string' &&
          roleName.toLowerCase().includes('salesman')
        );
      })
      .filter(
        user =>
          !assignedIds.includes(user.id.toString()) &&
          user.id !== selectedUser?.id
      )
      .map(user => {
        let disabledReason = '';
        if (user.has_active_van_inventory) {
          disabledReason = 'Has loaded items in inventory';
        } else if (
          user.sub_inventory_parent_id &&
          user.sub_inventory_parent_id !== selectedUser?.id
        ) {
          const groupName = user.sub_inventory_parent_name
            ? ` ${user.sub_inventory_parent_name}`
            : '';
          disabledReason = `Already assigned to${groupName}`;
        }
        return { ...user, disabledReason };
      })
      .filter(user => {
        if (!availableUsersSearch) return true;
        const searchLower = availableUsersSearch.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.employee_id?.toLowerCase().includes(searchLower)
        );
      });
  }, [
    allUsers,
    formik.values.sub_inventory_user_ids,
    availableUsersSearch,
    selectedUser?.id,
  ]);

  const assignedUsers = useMemo(() => {
    return formik.values.sub_inventory_user_ids
      .map((id: string) => allUsers.find(u => u.id.toString() === id))
      .filter(Boolean);
  }, [formik.values.sub_inventory_user_ids, allUsers]);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newAssignedIds = Array.from(formik.values.sub_inventory_user_ids);

    if (
      source.droppableId === 'available-users' &&
      destination.droppableId === 'assigned-users'
    ) {
      const draggedUser = availableUsers.find(
        u => u.id.toString() === draggableId
      );
      if (draggedUser?.disabledReason) {
        toast.error(draggedUser.disabledReason);
        return;
      }
      newAssignedIds.splice(destination.index, 0, draggableId as string);
      formik.setFieldValue('sub_inventory_user_ids', newAssignedIds);
    } else if (
      source.droppableId === 'assigned-users' &&
      destination.droppableId === 'available-users'
    ) {
      formik.setFieldValue(
        'sub_inventory_user_ids',
        newAssignedIds.filter(id => id !== draggableId)
      );
    } else if (
      source.droppableId === 'assigned-users' &&
      destination.droppableId === 'assigned-users'
    ) {
      const [removed] = newAssignedIds.splice(source.index, 1);
      newAssignedIds.splice(destination.index, 0, removed as string);
      formik.setFieldValue('sub_inventory_user_ids', newAssignedIds);
    }
  };

  const SkeletonCard = () => (
    <div className="!flex !items-center !gap-3 !p-2 !bg-white !border !border-gray-200 !rounded-lg !mb-2">
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        className="!flex-shrink-0"
      />
      <Box className="!flex-1">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} className="!mt-1" />
      </Box>
    </div>
  );

  const UserCard = ({
    user,
    showSequence,
    disabledReason,
  }: {
    user: any;
    showSequence?: number;
    disabledReason?: string;
  }) => (
    <div
      title={disabledReason || ''}
      className={classNames(
        '!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2',
        'hover:!border-blue-300 hover:!shadow-md'
      )}
    >
      <GripVertical className="!w-5 !h-5 !flex-shrink-0 !text-gray-400 !cursor-grab" />
      <Avatar
        alt={user.name}
        src={user.profile_pic || user.profile_image || undefined}
        className={classNames(
          '!w-10 !h-10 !flex-shrink-0 !text-white !font-medium',
          getAvatarColor(user.name)
        )}
      >
        {getInitials(user.name)}
      </Avatar>
      <Box className="!flex-1 !min-w-0">
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {user.name}
        </Typography>
        <Typography
          variant="caption"
          className="!text-gray-500 !text-xs !block !mt-0.5"
        >
          {user.sap_code || 'No SAP Code'}
        </Typography>
      </Box>
      {showSequence !== undefined && (
        <Box className="!flex-shrink-0 !flex !items-center !justify-center !w-6 !h-6 !rounded-full !bg-primary-500 !text-white !text-xs !font-semibold">
          {showSequence}
        </Box>
      )}
    </div>
  );

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
          {isGroupRole && (
            <Box className="mb-6 flex flex-col gap-2 select-none">
              <p className="!font-semibold !text-gray-900 !my-1">
                Setup Container Group
              </p>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="!grid !grid-cols-2 !gap-4 !h-[400px]">
                  {/* Available Users Panel */}
                  <Box className="!border !border-gray-200 !rounded-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-blue-600"
                      >
                        Available Salesmen ({availableUsers.length})
                      </Typography>
                      <p className="!text-gray-500 !text-xs !block !mt-1">
                        Drag salesmen from the left panel to assign
                      </p>
                    </Box>
                    <Box className="!p-2 !border-b !border-gray-200 !bg-white !flex !gap-2 !items-center">
                      <div className="!relative !w-full">
                        <Search className="!absolute !left-2 !top-[7px] !w-3.5 !h-3.5 !text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={availableUsersSearch}
                          onChange={e =>
                            setAvailableUsersSearch(e.target.value)
                          }
                          className="!w-full !pl-8 !pr-2 !h-[28px] !text-xs !border !border-gray-300 !rounded focus:!outline-none focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500"
                        />
                      </div>
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="available-users">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={classNames(
                              '!h-full !p-2 !overflow-y-auto',
                              {
                                '!bg-blue-50': snapshot.isDraggingOver,
                              }
                            )}
                            style={{ transition: 'background-color 0.2s ease' }}
                          >
                            {isFetchingUsers ? (
                              Array.from({ length: 4 }).map((_, idx) => (
                                <SkeletonCard key={idx} />
                              ))
                            ) : availableUsers.length > 0 ? (
                              availableUsers.map((user: any, index: number) => (
                                <Draggable
                                  key={user.id.toString()}
                                  draggableId={user.id.toString()}
                                  index={index}
                                >
                                  {provided => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <UserCard
                                        user={user}
                                        disabledReason={user.disabledReason}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <UsersIcon className="!w-12 !h-12 !text-gray-300 !mb-2" />
                                <Typography
                                  variant="body2"
                                  className="!text-gray-500"
                                >
                                  {availableUsersSearch
                                    ? 'No users found'
                                    : 'All users are assigned'}
                                </Typography>
                              </Box>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Box>
                  </Box>

                  {/* Assigned Users Panel */}
                  <Box className="!border !border-gray-200 !rounded-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-green-600"
                      >
                        Assigned Container Members ({assignedUsers.length})
                      </Typography>
                      <p className="!text-gray-500 !text-xs !block !mt-1">
                        At least one member must be assigned
                      </p>
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="assigned-users">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={classNames(
                              '!h-full !p-2 !overflow-y-auto',
                              {
                                '!bg-green-50': snapshot.isDraggingOver,
                              }
                            )}
                            style={{ transition: 'background-color 0.2s ease' }}
                          >
                            {assignedUsers.length > 0 ? (
                              assignedUsers.map((user: any, index: number) => (
                                <Draggable
                                  key={user.id.toString()}
                                  draggableId={user.id.toString()}
                                  index={index}
                                >
                                  {provided => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <UserCard
                                        user={user}
                                        showSequence={index + 1}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <UserPlus className="!w-12 !h-12 !text-gray-300 !mb-2" />
                                <Typography
                                  variant="body2"
                                  className="!text-gray-500"
                                >
                                  No assigned users
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="!text-gray-400 !block !mt-1"
                                >
                                  Drag users from the left panel to assign
                                </Typography>
                              </Box>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Box>
                  </Box>
                </div>
              </DragDropContext>
              {formik.errors.sub_inventory_user_ids && (
                <Typography
                  variant="caption"
                  color="error"
                  className="!mt-1 !block"
                >
                  {formik.errors.sub_inventory_user_ids as string}
                </Typography>
              )}
            </Box>
          )}
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
