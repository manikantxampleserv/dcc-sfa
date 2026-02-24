import { Person } from '@mui/icons-material';
import {
  Avatar,
  AvatarGroup,
  Box,
  Pagination,
  Stack,
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
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import ManageAssignRoute from './ManageAssignRoute';

const RouteAssignmentManagement: React.FC = () => {
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

      {isRead && (
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

      {isRead && (
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

      {isRead && (
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

      {isRead && assignments.length === 0 && !isFetching && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No salespersons found</p>
        </div>
      )}

      {isRead && totalPages > 1 && (
        <Stack spacing={2} className="!mt-6 !items-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, value) => setPage(value)}
            variant="outlined"
            shape="rounded"
          />
        </Stack>
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
