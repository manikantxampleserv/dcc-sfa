import { Avatar, Box, Skeleton, Typography } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  useRouteAssignment,
  useRoutes,
  useSetRouteAssignments,
} from 'hooks/useRoutes';
import { Route as RouteIcon, User } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManageAssignRoute from '../ManageAssignRoute';

const RouteAssignmentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id) || 0;

  const { isRead } = usePermission('route');

  const {
    data: assignmentResponse,
    isFetching: isFetchingAssignment,
    isLoading: isLoadingAssignment,
  } = useRouteAssignment(userId);
  const assignment = assignmentResponse?.data || null;

  const { data: routesResponse } = useRoutes(
    { page: 1, limit: 500, status: 'active' },
    { enabled: isRead }
  );
  const routes = routesResponse?.data || [];

  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);

  useEffect(() => {
    if (!assignment) return;
    const ids = (assignment.assigned_routes || [])
      .map(route => route.id)
      .filter(Boolean);
    setSelectedRouteIds(ids);
  }, [assignment]);

  const setAssignmentsMutation = useSetRouteAssignments(userId);

  const handleCloseAssign = useCallback(() => {
    setAssignDrawerOpen(false);
  }, []);

  const handleSaveAssign = useCallback(async () => {
    await setAssignmentsMutation.mutateAsync(selectedRouteIds);
    handleCloseAssign();
  }, [handleCloseAssign, selectedRouteIds, setAssignmentsMutation]);

  if (!isRead) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500 text-lg">
          You do not have permission to view route assignments
        </p>
      </div>
    );
  }

  const loading = isLoadingAssignment || isFetchingAssignment;

  const UserSkeleton = () => (
    <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
      <Box className="!flex !items-center !justify-between !gap-3 !flex-wrap">
        <Box className="!flex !items-center !gap-3 !min-w-0">
          <Skeleton
            variant="circular"
            width={48}
            height={48}
            className="!bg-gray-300"
          />
          <Box className="!min-w-0">
            <Skeleton
              variant="text"
              width={200}
              height={24}
              className="!bg-gray-300 !mb-2"
            />
            <Skeleton
              variant="text"
              width={150}
              height={16}
              className="!bg-gray-200"
            />
          </Box>
        </Box>
        <Box className="!text-right">
          <Skeleton
            variant="text"
            width={80}
            height={16}
            className="!bg-gray-300 !mb-1"
          />
          <Skeleton
            variant="text"
            width={60}
            height={20}
            className="!bg-gray-300"
          />
        </Box>
      </Box>
    </div>
  );

  const RoutesSkeleton = () => (
    <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
      <Box className="!flex !items-center !justify-between !gap-3 !flex-wrap !mb-3">
        <Box>
          <Skeleton
            variant="text"
            width={100}
            height={24}
            className="!bg-gray-300 !mb-1"
          />
          <Skeleton
            variant="text"
            width={140}
            height={14}
            className="!bg-gray-200"
          />
        </Box>
      </Box>
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(item => (
          <Box
            key={item}
            className="!p-3 !bg-white !rounded-lg !border !border-gray-200"
          >
            <Box className="!flex !items-center !gap-3">
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                className="!bg-gray-300"
              />
              <Box className="!min-w-0">
                <Skeleton
                  variant="text"
                  width={120}
                  height={16}
                  className="!bg-gray-300 !mb-1"
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={12}
                  className="!bg-gray-200"
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <>
          <UserSkeleton />
          <RoutesSkeleton />
        </>
      ) : (
        <>
          <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
            <Box className="!flex !items-center !justify-between !gap-3 !flex-wrap">
              <Box className="!flex !items-center !gap-3 !min-w-0">
                <Avatar
                  src={assignment?.profile_image || 'mkx'}
                  alt={assignment?.name || 'Salesperson'}
                  className="!bg-blue-100 !text-blue-600 !w-12 !h-12"
                >
                  <User className="w-5 h-5" />
                </Avatar>
                <Box className="!min-w-0">
                  <Typography
                    variant="h6"
                    className="!font-semibold !text-gray-900 !truncate"
                  >
                    {assignment?.name || '—'}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !truncate !block"
                  >
                    {assignment?.email || '—'}
                  </Typography>
                </Box>
              </Box>

              <Box className="!text-right">
                <Typography variant="caption" className="!text-gray-500">
                  Assigned Routes
                </Typography>
                <Typography variant="body2" className="!font-semibold">
                  {assignment?.assigned_routes_count ||
                    assignment?.assigned_routes?.length ||
                    0}
                </Typography>
              </Box>
            </Box>
          </div>

          <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
            <Box className="!flex !items-center !justify-between !gap-3 !flex-wrap !mb-3">
              <Box>
                <Typography variant="subtitle1" className="!font-semibold">
                  Routes
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  Click a route to view details
                </Typography>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(assignment?.assigned_routes || []).length > 0 ? (
                (assignment?.assigned_routes || []).map(route => (
                  <Box
                    key={route.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/masters/routes/${route.id}`)}
                    className="!p-3 !bg-white !rounded-lg !border !border-gray-200 hover:!shadow-sm transition-shadow cursor-pointer"
                  >
                    <Box className="!flex !items-center !gap-3">
                      <Avatar className="!bg-primary-100 !text-primary-600 !w-10 !h-10">
                        <RouteIcon className="w-4 h-4" />
                      </Avatar>
                      <Box className="!min-w-0">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900 !truncate"
                        >
                          {route.name || `Route ${route.id}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !truncate !block"
                        >
                          {route.code || 'No Code'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className="col-span-full !p-10 !text-center !border !border-dashed !border-gray-200 !rounded-lg">
                  <Typography variant="body2" className="!text-gray-500">
                    No routes assigned
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        </>
      )}

      <ManageAssignRoute
        open={assignDrawerOpen}
        user={assignment}
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        setSelectedRouteIds={setSelectedRouteIds}
        onClose={handleCloseAssign}
        onSave={handleSaveAssign}
        loading={setAssignmentsMutation.isPending}
      />
    </div>
  );
};

export default RouteAssignmentDetail;
