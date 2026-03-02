import { Person } from '@mui/icons-material';
import {
  Avatar,
  AvatarGroup,
  Box,
  Pagination,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  useRouteAssignments,
  useRoutes,
  useSetRouteAssignments,
  type RouteAssignment,
} from 'hooks/useRoutes';
import { RouteIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import ManageAssignRoute from './ManageAssignRoute';

const RouteAssignmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isRead, isUpdate } = usePermission('route');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RouteAssignment | null>(
    null
  );
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);

  const { data: assignmentsResponse, isFetching } = useRouteAssignments(
    { page, limit, search },
    { enabled: isRead }
  );

  const { data: routesResponse } = useRoutes(
    { page: 1, limit: 500, status: 'active' },
    { enabled: isRead }
  );

  const assignments = assignmentsResponse?.data || [];
  const routes = routesResponse?.data || [];

  const totalSalespersons = assignmentsResponse?.stats?.total_salespersons || 0;
  const totalAssignedRoutes =
    assignmentsResponse?.stats?.total_assigned_routes || 0;
  const totalRoutes = assignmentsResponse?.stats?.total_routes || 0;
  const totalUnassignedRoutes =
    assignmentsResponse?.stats?.total_unassigned_routes || 0;
  const totalPages =
    assignmentsResponse?.meta?.total_pages ||
    assignmentsResponse?.meta?.totalPages ||
    (assignmentsResponse?.meta?.total
      ? Math.ceil(assignmentsResponse.meta.total / limit)
      : 1);

  const setAssignmentsMutation = useSetRouteAssignments(selectedUser?.id || 0);

  const handleOpenAssign = useCallback((user: RouteAssignment) => {
    setSelectedUser(user);
    const routeIds = (user.assigned_routes || [])
      .map(route => route.id)
      .filter(Boolean);
    setSelectedRouteIds(routeIds);
    setDrawerOpen(true);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setDrawerOpen(false);
    setSelectedUser(null);
    setSelectedRouteIds([]);
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedUser) return;
    await setAssignmentsMutation.mutateAsync(selectedRouteIds);
    handleCloseAssign();
  }, [
    handleCloseAssign,
    selectedRouteIds,
    selectedUser,
    setAssignmentsMutation,
  ]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-white shadow-sm p-4 rounded-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                className="!bg-gray-200"
              />
              <div className="flex-1">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={16}
                  className="!bg-gray-200"
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  className="!bg-gray-300 !mt-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100 mb-4">
        <div className="flex items-center flex-wrap gap-4">
          <Skeleton
            variant="rectangular"
            width={320}
            height={40}
            className="!bg-gray-200 !rounded-lg"
          />
        </div>
      </div>

      {/* Salesperson Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-white shadow-sm rounded-lg border border-gray-100"
          >
            <div className="flex justify-between items-start p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  className="!bg-gray-200"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <Skeleton
                    variant="text"
                    width={70}
                    height={20}
                    className="!bg-gray-300"
                  />
                  <Skeleton
                    variant="text"
                    width={85}
                    height={14}
                    className="!bg-gray-200 !mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  className="!bg-gray-200 !rounded"
                />
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  className="!bg-gray-200 !rounded"
                />
              </div>
            </div>
            <div className="px-4 flex justify-between items-center pb-4">
              <Skeleton
                variant="text"
                width="45%"
                height={14}
                className="!bg-gray-200"
              />
              <div className="!mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Skeleton
                      key={j}
                      variant="circular"
                      width={24}
                      height={24}
                      className="!bg-gray-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-6">
        <Skeleton
          variant="rectangular"
          width={300}
          height={40}
          className="!bg-gray-200 !rounded"
        />
      </div>
    </>
  );

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Route Assignment Management
          </p>
          <p className="!text-gray-500 text-sm">
            Assign routes to salespersons and manage coverage
          </p>
        </Box>
      </Box>

      {isRead && isFetching && <SkeletonLoader />}

      {isRead && !isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatsCard
            icon={<RouteIcon />}
            title="All Routes"
            value={totalRoutes}
            color="purple"
            isLoading={isFetching}
          />
          <StatsCard
            icon={<RouteIcon />}
            title="Assigned Routes"
            value={totalAssignedRoutes}
            color="green"
            isLoading={isFetching}
          />

          <StatsCard
            icon={<RouteIcon />}
            title="Unassigned Routes"
            value={totalUnassignedRoutes}
            color="red"
            isLoading={isFetching}
          />
          <StatsCard
            icon={<Person />}
            title="Total Salespersons"
            value={totalSalespersons}
            color="blue"
            isLoading={isFetching}
          />
        </div>
      )}

      {!isRead && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">
            You do not have permission to view route assignments
          </p>
        </div>
      )}

      {isRead && !isFetching && (
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100 mb-4">
          <div className="flex items-center flex-wrap gap-4">
            <SearchInput
              placeholder="Search Salesperson..."
              value={search}
              onChange={handleSearchChange}
              className="!w-80"
            />
          </div>
        </div>
      )}

      {isRead && !isFetching && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {assignments.map(user => (
            <div
              key={user.id}
              className="bg-white shadow-sm rounded-lg border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={user.profile_image || 'mkx'}
                    alt={user.name}
                    className="!bg-blue-100 !text-blue-600"
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <Typography
                      variant="body1"
                      className="!font-semibold !text-gray-800 !truncate"
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !truncate"
                    >
                      {user.email}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      navigate(`/masters/route-assignments/${user.id}`)
                    }
                  >
                    Details
                  </Button>
                  {isUpdate && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenAssign(user)}
                    >
                      Assign
                    </Button>
                  )}
                </div>
              </div>
              <div className="px-4 flex justify-between items-center pb-4">
                <Typography variant="body2" className="!text-gray-500">
                  Assigned Routes: {user.assigned_routes_count || 0}
                </Typography>
                <Box className="!mt-2">
                  <AvatarGroup max={10} spacing="small" className="!text-xs">
                    {user.assigned_routes.map(route => (
                      <Tooltip
                        key={`${user.id}-${route.id}`}
                        title={route.name || route.code || `Route ${route.id}`}
                        arrow
                        placement="top"
                      >
                        <Avatar className="!bg-primary-100 !text-primary-600 !w-6 !h-6 !text-[10px]">
                          {(route.name || route.code || 'R')
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>
              </div>
            </div>
          ))}
        </div>
      )}

      {isRead && !isFetching && assignments.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No salespersons found</p>
        </div>
      )}

      {isRead && !isFetching && assignments.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </div>
      )}

      <ManageAssignRoute
        open={drawerOpen}
        user={selectedUser}
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        setSelectedRouteIds={setSelectedRouteIds}
        onClose={handleCloseAssign}
        onSave={handleAssign}
        loading={setAssignmentsMutation.isPending}
      />
    </>
  );
};

export default RouteAssignmentManagement;
