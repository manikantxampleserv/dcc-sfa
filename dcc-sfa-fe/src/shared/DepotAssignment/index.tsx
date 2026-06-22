import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Avatar, Box, Typography } from '@mui/material';
import { Warehouse } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import SearchInput from 'shared/SearchInput';

interface Depot {
  id: number;
  name: string;
  code?: string;
}

interface DepotAssignmentProps {
  depots: Depot[];
  selectedDepotIds: string[];
  setSelectedDepotIds: (ids: string[]) => void;
}

const DepotAssignment: React.FC<DepotAssignmentProps> = ({
  depots,
  selectedDepotIds,
  setSelectedDepotIds,
}) => {
  const [availableSearch, setAvailableSearch] = useState('');

  const depotMap = useMemo(
    () => new Map(depots.map(depot => [depot.id.toString(), depot])),
    [depots]
  );

  const assignedDepots = useMemo(
    () =>
      selectedDepotIds.map(id => depotMap.get(id)).filter(Boolean) as Depot[],
    [depotMap, selectedDepotIds]
  );

  const availableDepots = useMemo(() => {
    const assignedIds = new Set(selectedDepotIds);
    const searchLower = availableSearch.trim().toLowerCase();
    return depots.filter(depot => {
      if (assignedIds.has(depot.id.toString())) return false;
      if (!searchLower) return true;
      const name = depot.name?.toLowerCase() || '';
      const code = depot.code?.toLowerCase() || '';
      return name.includes(searchLower) || code.includes(searchLower);
    });
  }, [availableSearch, depots, selectedDepotIds]);

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

      const depotId = draggableId;

      if (
        source.droppableId === 'available-depots' &&
        destination.droppableId === 'assigned-depots'
      ) {
        if (selectedDepotIds.includes(depotId)) return;
        const updated = Array.from(selectedDepotIds);
        updated.splice(destination.index, 0, depotId);
        setSelectedDepotIds(updated);
        return;
      }

      if (
        source.droppableId === 'assigned-depots' &&
        destination.droppableId === 'available-depots'
      ) {
        setSelectedDepotIds(selectedDepotIds.filter(id => id !== depotId));
        return;
      }

      if (
        source.droppableId === 'assigned-depots' &&
        destination.droppableId === 'assigned-depots'
      ) {
        const updated = Array.from(selectedDepotIds);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        setSelectedDepotIds(updated);
      }
    },
    [selectedDepotIds, setSelectedDepotIds]
  );

  const DepotCard = ({ depot }: { depot: Depot }) => (
    <div className="!flex !items-center !gap-3 !p-2 !pr-3 !bg-white !border !border-gray-200 !rounded-lg hover:!border-primary-300 hover:!shadow-md">
      <Avatar className="!w-9 !h-9 !bg-primary-100 !text-primary-600">
        <Warehouse className="w-4 h-4" />
      </Avatar>
      <Box className="!flex-1 !min-w-0">
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {depot.name || `Depot ${depot.id}`}
        </Typography>
        {depot.code && (
          <Typography
            variant="caption"
            className="!text-gray-500 !text-xs !block !mt-0.5"
          >
            {depot.code}
          </Typography>
        )}
      </Box>
    </div>
  );

  return (
    <Box className="select-none">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="!grid !grid-cols-2 !gap-4 !h-[320px]">
          <Box className="!border !border-gray-200 !rounded-t-lg !flex !flex-col !overflow-hidden">
            <Box className="!p-2 !border-b !border-gray-200 !bg-gray-50">
              <Typography
                variant="subtitle1"
                className="!font-semibold !text-primary-600"
              >
                Available Depots ({availableDepots.length})
              </Typography>
              <p className="!text-gray-500 !text-xs !block">
                Drag depots from here to assign
              </p>
              <Box className="!mt-2">
                <SearchInput
                  placeholder="Search Depots..."
                  value={availableSearch}
                  onChange={setAvailableSearch}
                  className="!w-full"
                />
              </Box>
            </Box>
            <Box className="!flex-1 !overflow-hidden">
              <Droppable droppableId="available-depots">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`!h-full !p-2 !overflow-y-auto ${
                      snapshot.isDraggingOver ? '!bg-primary-50' : ''
                    }`}
                    style={{
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {availableDepots.length > 0 ? (
                      availableDepots.map((depot, index) => (
                        <Draggable
                          key={depot.id}
                          draggableId={depot.id.toString()}
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
                              className="!mb-2"
                            >
                              <DepotCard depot={depot} />
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                        <Warehouse className="!w-12 !h-12 !text-gray-300 !mb-2" />
                        <Typography variant="body2" className="!text-gray-500">
                          {availableSearch
                            ? 'No depots found'
                            : 'All depots are assigned'}
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
                Assigned Depots ({assignedDepots.length})
              </Typography>
              <p className="!text-gray-500 !text-xs !block">
                Drag depots here to assign
              </p>
            </Box>
            <Box className="!flex-1 !overflow-hidden">
              <Droppable droppableId="assigned-depots">
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
                    {assignedDepots.length > 0 ? (
                      assignedDepots.map((depot, index) => (
                        <Draggable
                          key={`${depot.id}-${index}`}
                          draggableId={depot.id.toString()}
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
                              className="!mb-2"
                            >
                              <DepotCard depot={depot} />
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <Box className="!p-8 !text-center !h-full !flex !flex-col !justify-center !items-center">
                        <Warehouse className="!w-12 !h-12 !text-gray-300 !mb-2" />
                        <Typography variant="body2" className="!text-gray-500">
                          No assigned depots
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-400 !block !mt-1"
                        >
                          Drag depots from the left panel
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
  );
};

export default DepotAssignment;
