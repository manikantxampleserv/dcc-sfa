import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Avatar, Box, Typography } from '@mui/material';
import type { Route, RouteAssignment } from 'hooks/useRoutes';
import { GripVertical, Route as RouteIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'shared/Button';
import Drawer from 'shared/Drawer';
import SearchInput from 'shared/SearchInput';

interface ManageAssignRouteProps {
  open: boolean;
  user: RouteAssignment | null;
  routes: Route[];
  selectedRouteIds: number[];
  setSelectedRouteIds: (ids: number[]) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

const ManageAssignRoute: React.FC<ManageAssignRouteProps> = ({
  open,
  user,
  routes,
  selectedRouteIds,
  setSelectedRouteIds,
  onClose,
  onSave,
  loading,
}) => {
  const [availableSearch, setAvailableSearch] = useState('');

  const routeMap = useMemo(
    () => new Map(routes.map(route => [route.id, route])),
    [routes]
  );

  const assignedRoutes = useMemo(
    () =>
      selectedRouteIds.map(id => routeMap.get(id)).filter(Boolean) as Route[],
    [routeMap, selectedRouteIds]
  );

  const availableRoutes = useMemo(() => {
    const assignedIds = new Set(selectedRouteIds);
    const searchLower = availableSearch.trim().toLowerCase();
    return routes.filter(route => {
      if (assignedIds.has(route.id)) return false;
      if (!searchLower) return true;
      const name = route.name?.toLowerCase() || '';
      const code = route.code?.toLowerCase() || '';
      return name.includes(searchLower) || code.includes(searchLower);
    });
  }, [availableSearch, routes, selectedRouteIds]);

  const handleDragEnd = useCallback(
    (result: any) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const routeId = parseInt(draggableId, 10);
      if (Number.isNaN(routeId)) return;

      if (
        source.droppableId === 'available-routes' &&
        destination.droppableId === 'assigned-routes'
      ) {
        if (selectedRouteIds.includes(routeId)) return;
        const updated = Array.from(selectedRouteIds);
        updated.splice(destination.index, 0, routeId);
        setSelectedRouteIds(updated);
        return;
      }

      if (
        source.droppableId === 'assigned-routes' &&
        destination.droppableId === 'available-routes'
      ) {
        setSelectedRouteIds(selectedRouteIds.filter(id => id !== routeId));
        return;
      }

      if (
        source.droppableId === 'assigned-routes' &&
        destination.droppableId === 'assigned-routes'
      ) {
        const updated = Array.from(selectedRouteIds);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        setSelectedRouteIds(updated);
      }
    },
    [selectedRouteIds, setSelectedRouteIds]
  );

  const RouteCard = ({
    route,
    showIndex,
  }: {
    route: Route;
    showIndex?: number;
  }) => (
    <div className="!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg !mb-2 hover:!border-blue-300 hover:!shadow-md">
      <GripVertical className="!w-5 !h-5 !text-gray-400 !cursor-grab !flex-shrink-0" />
      <Avatar className="!w-9 !h-9 !bg-blue-100 !text-blue-600">
        <RouteIcon className="w-4 h-4" />
      </Avatar>
      <Box className="!flex-1 !min-w-0">
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {route.name || `Route ${route.id}`}
        </Typography>
        <Typography
          variant="caption"
          className="!text-gray-500 !text-xs !block !mt-0.5"
        >
          {route.code || 'No Code'}
        </Typography>
      </Box>
      {showIndex !== undefined && (
        <Box className="!flex-shrink-0 !flex !items-center !justify-center !w-6 !h-6 !rounded-full !bg-primary-500 !text-white !text-xs !font-semibold">
          {showIndex}
        </Box>
      )}
    </div>
  );

  return (
    <Drawer
      open={open}
      setOpen={value => {
        if (!value) onClose();
      }}
      title={`Assign Routes${user ? ` - ${user.name}` : ''}`}
      size="large"
    >
      <Box className="!p-4 select-none">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="!grid !grid-cols-2 !gap-4 !h-[520px]">
            <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
              <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
                <Typography
                  variant="subtitle1"
                  className="!font-semibold !text-blue-600"
                >
                  Available Routes ({availableRoutes.length})
                </Typography>
                <p className="!text-gray-500 !text-xs !block !mt-1">
                  Drag routes from the left panel to assign
                </p>
                <Box className="!mt-2">
                  <SearchInput
                    placeholder="Search Routes..."
                    value={availableSearch}
                    onChange={setAvailableSearch}
                    className="!w-full"
                  />
                </Box>
              </Box>
              <Box className="!flex-1 !overflow-hidden">
                <Droppable droppableId="available-routes">
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
                      {availableRoutes.length > 0 ? (
                        availableRoutes.map((route, index) => (
                          <Draggable
                            key={route.id}
                            draggableId={route.id.toString()}
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
                                <RouteCard route={route} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                          <RouteIcon className="!w-12 !h-12 !text-gray-300 !mb-2" />
                          <Typography
                            variant="body2"
                            className="!text-gray-500"
                          >
                            {availableSearch
                              ? 'No routes found'
                              : 'All routes are assigned'}
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
                  Assigned Routes ({assignedRoutes.length})
                </Typography>
                <p className="!text-gray-500 !text-xs !block !mt-1">
                  Drag routes from the right panel to reorder
                </p>
              </Box>
              <Box className="!flex-1 !overflow-hidden">
                <Droppable droppableId="assigned-routes">
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
                      {assignedRoutes.length > 0 ? (
                        assignedRoutes.map((route, index) => (
                          <Draggable
                            key={`${route.id}-${index}`}
                            draggableId={route.id.toString()}
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
                                <RouteCard
                                  route={route}
                                  showIndex={index + 1}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                          <RouteIcon className="!w-12 !h-12 !text-gray-300 !mb-2" />
                          <Typography
                            variant="body2"
                            className="!text-gray-500"
                          >
                            No assigned routes
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-400 !block !mt-1"
                          >
                            Drag routes from the left panel to assign
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
        <Box className="!flex !justify-end !gap-3 !mt-3">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={onSave} loading={loading}>
            Save
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ManageAssignRoute;
