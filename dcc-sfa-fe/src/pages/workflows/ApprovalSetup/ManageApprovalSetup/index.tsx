import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Avatar, Box, MenuItem, Typography } from '@mui/material';
import classNames from 'classnames';
import { useFormik } from 'formik';
import {
  useApprovalWorkflowSetupsByRequest,
  useCreateApprovalWorkflowSetup,
} from 'hooks/useApprovalWorkflowSetup';
import { useDepots } from 'hooks/useDepots';
import { useRequestTypes, type RequestType } from 'hooks/useRequests';
import { useUsers, type User } from 'hooks/useUsers';
import { useZones } from 'hooks/useZones';
import { GripVertical, UserPlus, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  ApprovalWorkflowSetup,
  CreateApprovalWorkflowSetupPayload,
} from 'services/approvalWorkflowSetup';
import Button from 'shared/Button';
import Drawer from 'shared/Drawer';
import Select from 'shared/Select';
import * as Yup from 'yup';

interface ManageApprovalSetupProps {
  requestType: string | null;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface ApproverItem extends ApprovalWorkflowSetup {
  isNew?: boolean;
  tempId?: string;
  user?: User;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string): string => {
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

const formatEmployeeId = (employeeId: string | null | undefined): string => {
  if (!employeeId) return '';
  if (employeeId.startsWith('EMP-')) {
    return employeeId;
  }
  return `EMP-${employeeId.padStart(3, '0')}`;
};

const ManageApprovalSetup: React.FC<ManageApprovalSetupProps> = ({
  requestType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [approvers, setApprovers] = useState<ApproverItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedDepotId, setSelectedDepotId] = useState<number | null>(null);
  const [availableUsersSearch, setAvailableUsersSearch] = useState('');

  const { data: existingApprovers } = useApprovalWorkflowSetupsByRequest(
    requestType || '',
    selectedZoneId || undefined,
    selectedDepotId || undefined
  );

  console.log('existingApprovers', existingApprovers);
  const { data: zonesResponse } = useZones({ isActive: 'Y' });
  const { data: depotsResponse } = useDepots({ isActive: 'Y' });
  const { data: requestTypesResponse } = useRequestTypes();
  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
    search: availableUsersSearch || undefined,
    isActive: 'Y',
  });

  const createMutation = useCreateApprovalWorkflowSetup();

  const zones = zonesResponse?.data || [];
  const depots = depotsResponse?.data || [];
  const requestTypes = requestTypesResponse?.data || [];
  const allUsers = usersResponse?.data || [];

  // Filter available users (exclude already assigned)
  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    const selectedUserIds = approvers.map(item => item.approver_id) || [];
    return allUsers
      .filter(user => !selectedUserIds.includes(user.id))
      .filter(user =>
        user.name
          ?.toLowerCase()
          .includes(availableUsersSearch?.toLowerCase() || '')
      )
      .map(user => ({
        id: user.id,
        name: user.name,
        role: user.role?.name || 'General',
        profile_pic: user.profile_image || '',
        employee_code: user.employee_id || '',
        department: user.role?.name || '',
      }));
  }, [allUsers, approvers, availableUsersSearch]);

  // Map approvers with user data
  const approversWithUsers = useMemo(() => {
    return approvers.map(approver => {
      const user = allUsers.find(u => u.id === approver.approver_id);
      return { ...approver, user };
    });
  }, [approvers, allUsers]);

  const formik = useFormik({
    initialValues: {
      request_type: requestType || '',
      zone_id: '',
      depot_id: '',
    },
    validationSchema: Yup.object({
      request_type: Yup.string().required('Request type is required'),
    }),
    enableReinitialize: true,
    onSubmit: async values => {
      if (!values.request_type) return;

      const payloads: CreateApprovalWorkflowSetupPayload[] = approvers.map(
        (approver, index) => ({
          request_type: values.request_type,
          sequence: index + 1,
          approver_id: approver.approver_id,
          zone_id: values.zone_id ? Number(values.zone_id) : null,
          depot_id: values.depot_id ? Number(values.depot_id) : null,
          is_active: approver.is_active || 'Y',
        })
      );

      if (payloads.length === 0) {
        alert('Please assign at least one approver');
        return;
      }

      try {
        await createMutation.mutateAsync(payloads);
        handleCancel();
      } catch (error) {
        console.error('Error creating approval setup:', error);
      }
    },
  });

  console.log('requestType', approvers);

  const handleCancel = () => {
    setDrawerOpen(false);
    formik.resetForm();
    setApprovers([]);
    setSelectedZoneId(null);
    setSelectedDepotId(null);
    setAvailableUsersSearch('');
  };

  useEffect(() => {
    if (existingApprovers && existingApprovers.length > 0) {
      setApprovers(
        existingApprovers.map(approver => ({
          ...approver,
          isNew: false,
        }))
      );
    } else {
      setApprovers([]);
    }
  }, [existingApprovers]);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (
      source.droppableId === 'available-users' &&
      destination.droppableId === 'assigned-users'
    ) {
      const user = availableUsers.find(u => u.id.toString() === draggableId);
      if (user) {
        const foundUser = allUsers.find(u => u.id === user.id);
        if (foundUser) {
          const newApprover: ApproverItem = {
            id: 0,
            request_type: formik.values.request_type,
            sequence: destination.index + 1,
            approver_id: foundUser.id,
            zone_id: formik.values.zone_id
              ? Number(formik.values.zone_id)
              : null,
            depot_id: formik.values.depot_id
              ? Number(formik.values.depot_id)
              : null,
            is_active: 'Y',
            createdate: null,
            createdby: null,
            updatedate: null,
            updatedby: null,
            log_inst: null,
            isNew: true,
            tempId: `temp-${Date.now()}-${Math.random()}`,
            user: foundUser,
          };
          const newApprovers = Array.from(approvers);
          newApprovers.splice(destination.index, 0, newApprover);
          setApprovers(newApprovers.map((a, i) => ({ ...a, sequence: i + 1 })));
        }
      }
    } else if (
      source.droppableId === 'assigned-users' &&
      destination.droppableId === 'available-users'
    ) {
      const userId = parseInt(draggableId);
      setApprovers(prev => prev.filter(u => u.approver_id !== userId));
    } else if (
      source.droppableId === 'assigned-users' &&
      destination.droppableId === 'assigned-users'
    ) {
      const newAssignedUsers = Array.from(approvers);
      const [reorderedItem] = newAssignedUsers.splice(source.index, 1);
      newAssignedUsers.splice(destination.index, 0, reorderedItem);
      setApprovers(
        newAssignedUsers.map((approver, index) => ({
          ...approver,
          sequence: index + 1,
        }))
      );
    }
  };

  const UserCard = ({
    user,
    showSequence,
  }: {
    user: any;
    showSequence?: number;
  }) => (
    <div
      className={classNames(
        '!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2',
        {
          'hover:!border-blue-300 hover:!shadow-md': true,
        }
      )}
    >
      <GripVertical className="!w-5 !h-5 !text-gray-400 !cursor-grab !flex-shrink-0" />
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
          {user.name}{' '}
          {user.employee_code && `(${formatEmployeeId(user.employee_code)})`}
        </Typography>
        <Typography
          variant="caption"
          className="!text-gray-500 !text-xs !block !mt-0.5"
        >
          {user.department ||
            (typeof user.role === 'string' ? user.role : user.role?.name) ||
            'No Role'}
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
    <Drawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        requestType
          ? `Manage Approval Setup - ${requestType.replace(/_/g, ' ')}`
          : 'Create Approval Setup'
      }
      size="extra-large"
    >
      <Box className="!p-4 select-none">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-6">
            <Select
              name="request_type"
              label="Request Type"
              formik={formik}
              required
              disabled={!!requestType}
            >
              <MenuItem value="">Select Request Type</MenuItem>
              {requestTypes.map((type: RequestType) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="zone_id"
              label="Zone (Optional)"
              formik={formik}
              onChange={e => {
                formik.setFieldValue('zone_id', e.target.value);
                setSelectedZoneId(
                  e.target.value ? Number(e.target.value) : null
                );
              }}
            >
              <MenuItem value="">All Zones (Global)</MenuItem>
              {zones.map((zone: any) => (
                <MenuItem key={zone.id || 'global'} value={zone.id || ''}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="depot_id"
              label="Depot (Optional)"
              formik={formik}
              onChange={e => {
                formik.setFieldValue('depot_id', e.target.value);
                setSelectedDepotId(
                  e.target.value ? Number(e.target.value) : null
                );
              }}
            >
              <MenuItem value="">All Depots (Global)</MenuItem>
              {depots.map((depot: any) => (
                <MenuItem key={depot.id || 'global'} value={depot.id || ''}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <p className="!font-semibold !my-3">Assign Approvers</p>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="!grid !grid-cols-2 !gap-4 !h-[500px]">
                {/* Available Users Panel */}
                <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                  <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                    <Typography
                      variant="subtitle1"
                      className="!font-semibold !text-blue-600"
                    >
                      Available Users ({availableUsers.length})
                    </Typography>
                    <p className="!text-gray-500 !text-xs !block !mt-1">
                      Drag users from the left panel to assign
                    </p>
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
                          style={{
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          {availableUsers.length > 0 ? (
                            availableUsers.map((user, index) => (
                              <Draggable
                                key={user.id}
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
                                    <UserCard user={user} />
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                              <Users className="!w-12 !h-12 !text-gray-300 !mb-2" />
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
                <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                  <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                    <Typography
                      variant="subtitle1"
                      className="!font-semibold !text-green-600"
                    >
                      Assigned Users ({approvers.length})
                    </Typography>
                    <p className="!text-gray-500 !text-xs !block !mt-1">
                      Drag users from the right panel to reorder
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
                          style={{
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          {approvers.length > 0 ? (
                            approversWithUsers
                              .filter(
                                (
                                  approver
                                ): approver is ApproverItem & { user: User } =>
                                  approver.user !== undefined
                              )
                              .map((approver, index) => (
                                <Draggable
                                  key={approver.tempId || approver.id || index}
                                  draggableId={approver.approver_id.toString()}
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
                                        user={{
                                          ...approver.user,
                                          employee_code:
                                            approver.user.employee_id,
                                          department:
                                            approver.user.role?.name ||
                                            approver.user.role ||
                                            'No Role',
                                          role:
                                            typeof approver.user.role ===
                                            'string'
                                              ? approver.user.role
                                              : approver.user.role?.name ||
                                                'No Role',
                                        }}
                                        showSequence={approver.sequence}
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
          </Box>

          <Box className="!flex !justify-end !gap-3 !pt-4">
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={createMutation.isPending}
              loadingText="Saving..."
            >
              Create
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default ManageApprovalSetup;
