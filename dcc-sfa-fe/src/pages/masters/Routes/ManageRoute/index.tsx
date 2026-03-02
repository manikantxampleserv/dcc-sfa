import { Avatar, Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useCreateRoute, useUpdateRoute, type Route } from 'hooks/useRoutes';
import { useRouteTypes, type RouteType } from 'hooks/useRouteTypes';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, User } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { routeValidationSchema } from 'schemas/route.schema';
import type { Depot } from 'services/masters/Depots';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import SearchInput from 'shared/SearchInput';
import { useUsersDropdown } from 'hooks/useUsers';

interface Zone {
  id: number;
  name: string;
}

interface SalespersonOption {
  profile_image?: string | null;
  id: number;
  name: string;
  email: string;
}

interface ManageRouteProps {
  selectedRoute?: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  depots: Depot[];
  zones: Zone[];
}

const ManageRoute: React.FC<ManageRouteProps> = ({
  selectedRoute,
  setSelectedRoute,
  drawerOpen,
  setDrawerOpen,
  depots,
  zones,
}) => {
  const isEdit = !!selectedRoute;
  const [availableSearch, setAvailableSearch] = useState('');

  const handleCancel = () => {
    setSelectedRoute(null);
    setDrawerOpen(false);
    formik.resetForm();
  };

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const { data: routeTypesResponse } = useRouteTypes({ status: 'active' });
  const routeTypes = routeTypesResponse?.data || [];

  const { data: usersResponse, isFetching: isFetchingUsers } = useUsersDropdown(
    {
      search: availableSearch,
    }
  );
  const users = (usersResponse?.data || []) as SalespersonOption[];

  const formik = useFormik({
    initialValues: {
      parent_id: selectedRoute?.parent_id?.toString() || '',
      depot_id: selectedRoute?.depot_id?.toString() || '',
      route_type_id: selectedRoute?.route_type_id?.toString() || '',
      name: selectedRoute?.name || '',
      description: selectedRoute?.description || '',
      sales_persons: selectedRoute?.salespersons?.map(sp => sp.user.id) || [],
      start_location: selectedRoute?.start_location || '',
      end_location: selectedRoute?.end_location || '',
      starting_latitude: selectedRoute?.starting_latitude?.toString() || '',
      starting_longitude: selectedRoute?.starting_longitude?.toString() || '',
      ending_latitude: selectedRoute?.ending_latitude?.toString() || '',
      ending_longitude: selectedRoute?.ending_longitude?.toString() || '',
      estimated_distance: selectedRoute?.estimated_distance?.toString() || '',
      estimated_time: selectedRoute?.estimated_time?.toString() || '',
      is_active: selectedRoute?.is_active || 'Y',
    },
    validationSchema: routeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const routeData = {
          parent_id: Number(values.parent_id),
          depot_id: Number(values.depot_id),
          route_type_id: Number(values.route_type_id),
          name: values.name,
          description: values.description,
          salespersons:
            values.sales_persons?.map(userId => ({
              user_id: userId,
            })) || [],
          start_location: values.start_location,
          end_location: values.end_location,
          starting_latitude: values.starting_latitude || undefined,
          starting_longitude: values.starting_longitude || undefined,
          ending_latitude: values.ending_latitude || undefined,
          ending_longitude: values.ending_longitude || undefined,
          estimated_distance: values.estimated_distance
            ? Number(values.estimated_distance)
            : undefined,
          estimated_time: values.estimated_time
            ? Number(values.estimated_time)
            : undefined,
          is_active: values.is_active,
        };

        if (isEdit && selectedRoute) {
          await updateRouteMutation.mutateAsync({
            id: selectedRoute.id,
            ...routeData,
          });
        } else {
          await createRouteMutation.mutateAsync(routeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving route:', error);
      }
    },
  });

  const initialSelectedUsers = useMemo(() => {
    const sps = selectedRoute?.salespersons || [];
    return sps
      .map(sp => ({
        id: sp.user.id,
        name: sp.user.name,
        email: sp.user.email,
        profile_image: (sp.user as any).profile_image || null,
      }))
      .filter(u => !!u.id);
  }, [selectedRoute?.salespersons]);

  const userMap = useMemo(() => {
    const map = new Map<number, SalespersonOption>();
    users.forEach(u => map.set(u.id, u));
    initialSelectedUsers.forEach(u => {
      if (!map.has(u.id)) map.set(u.id, u);
    });
    return map;
  }, [initialSelectedUsers, users]);

  const assignedUserIds = (formik.values.sales_persons || []) as number[];

  const assignedUsers = useMemo(() => {
    return assignedUserIds
      .map(id => userMap.get(id))
      .filter(Boolean) as SalespersonOption[];
  }, [assignedUserIds, userMap]);

  const availableUsers = useMemo(() => {
    const assignedIds = new Set(assignedUserIds);
    return users.filter(u => !assignedIds.has(u.id));
  }, [assignedUserIds, users]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const userId = parseInt(draggableId, 10);
      if (Number.isNaN(userId)) return;

      if (
        source.droppableId === 'available-users' &&
        destination.droppableId === 'assigned-users'
      ) {
        if (assignedUserIds.includes(userId)) return;
        const updated = Array.from(assignedUserIds);
        updated.splice(destination.index, 0, userId);
        formik.setFieldValue('sales_persons', updated);
        return;
      }

      if (
        source.droppableId === 'assigned-users' &&
        destination.droppableId === 'available-users'
      ) {
        formik.setFieldValue(
          'sales_persons',
          assignedUserIds.filter(id => id !== userId)
        );
        return;
      }

      if (
        source.droppableId === 'assigned-users' &&
        destination.droppableId === 'assigned-users'
      ) {
        const updated = Array.from(assignedUserIds);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        formik.setFieldValue('sales_persons', updated);
      }
    },
    [assignedUserIds, formik]
  );

  const UserCard = useCallback(
    ({ user }: { user: SalespersonOption }) => (
      <div className="!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2 hover:!border-blue-300 hover:!shadow-md">
        <GripVertical className="!w-5 !h-5 !text-gray-400 !cursor-grab !flex-shrink-0" />
        <Avatar className="!w-9 !h-9 !bg-blue-100 !text-blue-600">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
        </Avatar>
        <Box className="!flex-1 !min-w-0">
          <Typography variant="body2" className="!font-medium !text-gray-900">
            {user.name || `User ${user.id}`}
          </Typography>
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            {user.email || 'No Email'}
          </Typography>
        </Box>
      </div>
    ),
    []
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Route' : 'Create Route'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {/* Depot Selection */}
            <Select name="depot_id" label="Depot" formik={formik} required>
              {depots.map(depot => (
                <MenuItem key={depot.id} value={depot.id.toString()}>
                  {depot.name} ({depot.code})
                </MenuItem>
              ))}
            </Select>

            {/* Zone Selection */}
            <Select name="parent_id" label="Zone" formik={formik} required>
              {zones.map(zone => (
                <MenuItem key={zone.id} value={zone.id.toString()}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>

            {/* Route Type Selection */}
            <Select
              name="route_type_id"
              label="Route Type"
              formik={formik}
              required
            >
              {routeTypes.map((routeType: RouteType) => (
                <MenuItem key={routeType.id} value={routeType.id.toString()}>
                  {routeType.name}
                </MenuItem>
              ))}
            </Select>

            {/* Route Name */}
            <Input
              name="name"
              label="Route Name"
              placeholder="Enter route name"
              formik={formik}
              required
            />

            {/* Start Location */}
            <Input
              name="start_location"
              label="Start Location"
              placeholder="Enter starting point"
              formik={formik}
            />

            {/* End Location */}
            <Input
              name="end_location"
              label="End Location"
              placeholder="Enter ending point"
              formik={formik}
            />

            <Input
              name="starting_latitude"
              label="Start Latitude"
              type="number"
              placeholder="e.g., 6.927079"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-90', max: '90' },
              }}
            />

            <Input
              name="starting_longitude"
              label="Start Longitude"
              type="number"
              placeholder="e.g., 79.861244"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-180', max: '180' },
              }}
            />

            <Input
              name="ending_latitude"
              label="End Latitude"
              type="number"
              placeholder="e.g., 6.900000"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-90', max: '90' },
              }}
            />

            <Input
              name="ending_longitude"
              label="End Longitude"
              type="number"
              placeholder="e.g., 79.850000"
              formik={formik}
              slotProps={{
                htmlInput: { step: '0.000001', min: '-180', max: '180' },
              }}
            />

            {/* Estimated Distance */}
            <Input
              name="estimated_distance"
              label="Estimated Distance (km)"
              type="number"
              placeholder="Enter distance in kilometers"
              formik={formik}
              slotProps={{ htmlInput: { step: '0.1', min: '0' } }}
            />

            {/* Estimated Time */}
            <Input
              name="estimated_time"
              label="Estimated Time (minutes)"
              type="number"
              placeholder="Enter time in minutes"
              formik={formik}
              slotProps={{ htmlInput: { min: '0' } }}
            />

            <Box className="md:!col-span-2">
              <Typography variant="subtitle2" className="!font-semibold !mb-2">
                Salespersons
              </Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="!grid !grid-cols-2 !gap-4 !h-[420px]">
                  <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-blue-600"
                      >
                        Available ({availableUsers.length})
                      </Typography>
                      <Box className="!mt-2">
                        <SearchInput
                          placeholder="Search Users..."
                          value={availableSearch}
                          onChange={setAvailableSearch}
                          className="!w-full"
                        />
                      </Box>
                      {isFetchingUsers && (
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          Loading...
                        </Typography>
                      )}
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="available-users">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`!h-full !p-2 !overflow-y-auto ${
                              snapshot.isDraggingOver ? '!bg-blue-50' : ''
                            }`}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {availableUsers.length > 0 ? (
                              availableUsers.map((u, index) => (
                                <Draggable
                                  key={u.id}
                                  draggableId={u.id.toString()}
                                  index={index}
                                >
                                  {providedDrag => (
                                    <div
                                      ref={providedDrag.innerRef}
                                      {...providedDrag.draggableProps}
                                      {...providedDrag.dragHandleProps}
                                      style={{
                                        ...providedDrag.draggableProps.style,
                                      }}
                                    >
                                      <UserCard user={u} />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <User className="!w-12 !h-12 !text-gray-300 !mb-2" />
                                <Typography
                                  variant="body2"
                                  className="!text-gray-500"
                                >
                                  {availableSearch
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

                  <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
                    <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                      <Typography
                        variant="subtitle1"
                        className="!font-semibold !text-green-600"
                      >
                        Assigned ({assignedUsers.length})
                      </Typography>
                      <p className="!text-gray-500 !text-xs !block !mt-1">
                        Drag to reorder
                      </p>
                    </Box>
                    <Box className="!flex-1 !overflow-hidden">
                      <Droppable droppableId="assigned-users">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`!h-full !p-2 !overflow-y-auto ${
                              snapshot.isDraggingOver ? '!bg-green-50' : ''
                            }`}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {assignedUsers.length > 0 ? (
                              assignedUsers.map((u, index) => (
                                <Draggable
                                  key={`${u.id}-${index}`}
                                  draggableId={u.id.toString()}
                                  index={index}
                                >
                                  {providedDrag => (
                                    <div
                                      ref={providedDrag.innerRef}
                                      {...providedDrag.draggableProps}
                                      {...providedDrag.dragHandleProps}
                                      style={{
                                        ...providedDrag.draggableProps.style,
                                      }}
                                    >
                                      <UserCard user={u} />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                                <User className="!w-12 !h-12 !text-gray-300 !mb-2" />
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

            <Box>
              <ActiveInactiveField name="is_active" formik={formik} required />
            </Box>

            {/* Description - Full width */}
            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter route description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box className="!flex !justify-end !gap-3 !pt-4">
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={
                createRouteMutation.isPending || updateRouteMutation.isPending
              }
            >
              {isEdit ? 'Update Route' : 'Create Route'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageRoute;
