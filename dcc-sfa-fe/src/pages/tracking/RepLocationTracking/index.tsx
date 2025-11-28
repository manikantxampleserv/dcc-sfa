import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Skeleton,
} from '@mui/material';
import {
  useCreateGPSLog,
  useGPSTrackingData,
  useRealTimeGPSTracking,
} from 'hooks/useGPSTracking';
import { usePermission } from 'hooks/usePermission';
import { useUsers } from 'hooks/useUsers';
import {
  Activity,
  Battery,
  Clock,
  MapPin,
  Navigation,
  Plus,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import { formatDate } from 'utils/dateUtils';
import toastService from 'utils/toast';
import LocationDetail from './LocationDetail';
import LocationTestGPS from './LocationTestGPS';

const RepLocationTracking: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState<any>(null);
  const [testGPSData, setTestGPSData] = useState({
    latitude: '24.7136',
    longitude: '46.6753',
    accuracy_meters: '10',
    speed_kph: '45.5',
    battery_level: '85',
    network_type: '4G',
  });

  const { isRead } = usePermission('rep-location-tracking');

  const { data: realTimeData, isLoading: isLoadingRealTime } =
    useRealTimeGPSTracking({
      enabled: isRead,
    });
  const { data: trackingData, isLoading: isLoadingTracking } =
    useGPSTrackingData(
      {
        user_id: selectedUserId,
      },
      {
        enabled: isRead,
      }
    );

  const createGPSLog = useCreateGPSLog();

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

  const handleRepCardClick = (rep: any) => {
    if (rep.latitude && rep.longitude) {
      setSelectedRep(rep);
      setDetailDrawerOpen(true);
    } else {
      toastService.warning('GPS is not active for this representative');
    }
  };

  const handleOpenGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const handleTestGPSSubmit = () => {
    createGPSLog.mutate({
      latitude: parseFloat(testGPSData.latitude),
      longitude: parseFloat(testGPSData.longitude),
      accuracy_meters: testGPSData.accuracy_meters
        ? parseInt(testGPSData.accuracy_meters)
        : undefined,
      speed_kph: testGPSData.speed_kph
        ? parseFloat(testGPSData.speed_kph)
        : undefined,
      battery_level: testGPSData.battery_level
        ? parseFloat(testGPSData.battery_level)
        : undefined,
      network_type: testGPSData.network_type || undefined,
    });
    setTestDialogOpen(false);
  };

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">
            Representatives Location Tracking
          </h2>
          <p className="!text-gray-500 text-sm">
            Real-time GPS tracking and location history for sales
            representatives
          </p>
        </div>
        {isRead && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-700 rounded-full bg-blue-50">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Last Update: {formatDate(summary.timestamp)}
              </span>
            </div>
          </div>
        )}
      </div>

      {isRead && (
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <div className="flex items-center flex-wrap gap-4">
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
      )}

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Reps"
            value={summary.total_users}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Now"
            value={summary.users_with_location}
            icon={<Navigation className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Avg Speed"
            value={
              activeReps.length > 0
                ? `${Math.round(activeReps.reduce((sum, r) => sum + (r.speed_kph || 0), 0) / activeReps.length)} km/h`
                : '0 km/h'
            }
            icon={<Activity className="w-6 h-6" />}
            color="orange"
            isLoading={isLoading}
          />
          <StatsCard
            title="Tracking Points"
            value={historicalLogs.length}
            icon={<MapPin className="w-6 h-6" />}
            color="purple"
            isLoading={isLoading}
          />
        </div>
      )}

      {!isRead && (
        <div className="col-span-full text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            You do not have permission to view location tracking data
          </p>
        </div>
      )}

      {isRead && (
        <>
          {isLoading ? (
            <RepCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {realTimeGPS.map((rep: any) => (
                <div
                  key={rep.user_id}
                  className="bg-white shadow-sm p-6 rounded-lg border border-gray-100 transition-shadow cursor-pointer hover:shadow-md"
                  onClick={() => handleRepCardClick(rep)}
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
                        <div className="flex items-center gap-4 pt-1">
                          {rep.speed_kph !== null && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Activity className="w-4 h-4 text-orange-500" />
                              <span className="text-gray-700 font-medium">
                                {rep.speed_kph.toFixed(0)} km/h
                              </span>
                            </div>
                          )}
                          {rep.battery_level !== null && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Battery className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-700 font-medium">
                                {rep.battery_level}%
                              </span>
                            </div>
                          )}
                          {rep.last_update && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                              <Clock className="w-3 h-3" />
                              {formatDate(rep.last_update)}
                            </div>
                          )}
                        </div>
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
        </>
      )}

      {/* Test GPS Log Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="!font-bold !text-xl">
          Create Test GPS Log
        </DialogTitle>
        <Divider />
        <DialogContent className="!pt-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={testGPSData.latitude}
                onChange={e => {
                  setTestGPSData({
                    ...testGPSData,
                    latitude: e.target.value,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={testGPSData.longitude}
                onChange={e =>
                  setTestGPSData({
                    ...testGPSData,
                    longitude: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accuracy (meters)
              </label>
              <input
                type="number"
                value={testGPSData.accuracy_meters}
                onChange={e =>
                  setTestGPSData({
                    ...testGPSData,
                    accuracy_meters: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed (km/h)
              </label>
              <input
                type="number"
                value={testGPSData.speed_kph}
                onChange={e =>
                  setTestGPSData({
                    ...testGPSData,
                    speed_kph: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery Level (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={testGPSData.battery_level}
                onChange={e =>
                  setTestGPSData({
                    ...testGPSData,
                    battery_level: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Type
              </label>
              <input
                type="text"
                value={testGPSData.network_type}
                onChange={e =>
                  setTestGPSData({
                    ...testGPSData,
                    network_type: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
          </div>
        </DialogContent>
        <Divider />
        <DialogActions className="!px-6 !py-4">
          <Button
            onClick={() => setTestDialogOpen(false)}
            variant="text"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTestGPSSubmit}
            variant="contained"
            color="primary"
            loading={createGPSLog.isPending}
            loadingText="Creating..."
            disabled={createGPSLog.isPending}
          >
            Create GPS Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test GPS Log Dialog */}
      <LocationTestGPS
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        onSubmit={handleTestGPSSubmit}
        isLoading={createGPSLog.isPending}
      />

      {/* GPS Detail Drawer */}
      <LocationDetail
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        rep={selectedRep}
        onOpenMaps={handleOpenGoogleMaps}
      />
    </div>
  );
};

export default RepLocationTracking;
