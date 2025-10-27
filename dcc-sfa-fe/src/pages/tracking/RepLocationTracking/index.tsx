import { Chip, MenuItem, Skeleton } from '@mui/material';
import {
  useGPSTrackingData,
  useRealTimeGPSTracking,
} from 'hooks/useGPSTracking';
import { useUsers } from 'hooks/useUsers';
import {
  MapPin,
  Users,
  Clock,
  Navigation,
  Battery,
  Signal,
  Activity,
} from 'lucide-react';
import React, { useState } from 'react';
import Select from 'shared/Select';
import { formatDate } from 'utils/dateUtils';

const RepLocationTracking: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );

  const { data: realTimeData, isLoading: isLoadingRealTime } =
    useRealTimeGPSTracking();
  const { data: trackingData, isLoading: isLoadingTracking } =
    useGPSTrackingData({
      user_id: selectedUserId,
    });

  const { data: usersData } = useUsers();
  const users = usersData?.data || [];

  const realTimeGPS = realTimeData?.gps_data || [];
  const historicalLogs = trackingData?.data?.gps_logs || [];

  const activeReps = realTimeGPS.filter(rep => rep.latitude && rep.longitude);
  const summary = realTimeData?.summary || {
    total_users: 0,
    users_with_location: 0,
    timestamp: new Date().toISOString(),
  };

  const isLoading = isLoadingRealTime || isLoadingTracking;

  const SummaryStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map(item => (
        <div
          key={item}
          className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                className="!mb-2"
              />
              <Skeleton variant="text" width="40%" height={32} />
            </div>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="!bg-gray-100"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const RepCardsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(item => (
        <div
          key={item}
          className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="!bg-gray-100"
            />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="20%" height={16} />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="75%" height={20} />
                <Skeleton variant="text" width="50%" height={16} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">
            Representatives Location Tracking
          </h2>
          <p className="!text-gray-500 text-sm">
            Real-time GPS tracking and location history for sales
            representatives
          </p>
        </div>
        <Chip
          icon={<Clock className="w-4 h-4" />}
          label={`Last Update: ${formatDate(summary.timestamp)}`}
          color="primary"
          variant="outlined"
          className="hidden md:flex"
        />
      </div>

      {/* Filter */}
      <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <Select
            label="Representative"
            value={selectedUserId?.toString() || 'all'}
            onChange={e =>
              setSelectedUserId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
            className="!min-w-[250px]"
          >
            <MenuItem value="all">All Representatives</MenuItem>
            {users.map((user: any) => (
              <MenuItem key={user.id} value={user.id.toString()}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Live Tracking
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {isLoading ? (
        <SummaryStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Reps</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.total_users}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Now</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.users_with_location}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeReps.length > 0
                    ? `${Math.round(activeReps.reduce((sum, r) => sum + (r.speed_kph || 0), 0) / activeReps.length)} km/h`
                    : '0 km/h'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Tracking Points
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {historicalLogs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Rep Locations Grid */}
      {isLoading ? (
        <RepCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {realTimeGPS.map((rep: any) => (
            <div
              key={rep.user_id}
              className={`bg-white shadow-sm p-6 rounded-lg border border-gray-100 transition-shadow cursor-pointer hover:shadow-md ${
                rep.latitude && rep.longitude ? 'border-green-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    rep.latitude && rep.longitude
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {rep.latitude && rep.longitude ? (
                    <MapPin className="w-6 h-6 text-green-600" />
                  ) : (
                    <MapPin className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {rep.user_name}
                    </h3>
                    {rep.employee_id && (
                      <span className="text-xs text-gray-500">
                        #{rep.employee_id}
                      </span>
                    )}
                  </div>

                  {rep.latitude && rep.longitude ? (
                    <>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {Number(rep.latitude).toFixed(4)},{' '}
                            {Number(rep.longitude).toFixed(4)}
                          </span>
                        </div>

                        {rep.speed_kph !== null && (
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {rep.speed_kph.toFixed(1)} km/h
                            </span>
                          </div>
                        )}

                        {rep.accuracy_meters && (
                          <div className="flex items-center gap-2">
                            <Signal className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              ±{rep.accuracy_meters}m accuracy
                            </span>
                          </div>
                        )}

                        {rep.battery_level !== null && (
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-gray-400" />
                            <Chip
                              label={`${rep.battery_level}%`}
                              size="small"
                              color={
                                rep.battery_level > 50
                                  ? 'success'
                                  : rep.battery_level > 20
                                    ? 'warning'
                                    : 'error'
                              }
                            />
                          </div>
                        )}

                        {rep.last_update && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(rep.last_update)}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No location data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {realTimeGPS.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No GPS data available</p>
              <p className="text-gray-400 text-sm mt-2">
                No sales representatives are currently being tracked
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepLocationTracking;
