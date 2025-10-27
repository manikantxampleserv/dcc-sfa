import { Activity, Battery, Clock, MapPin, Users } from 'lucide-react';
import React from 'react';
import Drawer from 'shared/Drawer';
import { formatDate } from 'utils/dateUtils';

interface LocationDetailProps {
  open: boolean;
  onClose: () => void;
  rep: any;
  onOpenMaps: (latitude: number, longitude: number) => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({
  open,
  onClose,
  rep,
  onOpenMaps,
}) => {
  if (!rep) return null;

  return (
    <Drawer
      open={open}
      setOpen={onClose}
      title="GPS Tracking Details"
      size="large"
      anchor="right"
    >
      <div className="p-4 flex flex-col gap-4">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {rep.user_name}
              </h3>
              <div className="space-y-1 mt-2">
                {rep.user_email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{rep.user_email}</span>
                  </p>
                )}
                {rep.employee_id && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-gray-500">Employee ID:</span>
                    <span className="font-medium">#{rep.employee_id}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
              Active
            </div>
          </div>
        </div>

        {/* Location Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-700">Location</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Latitude:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {Number(rep.latitude).toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Longitude:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {Number(rep.longitude).toFixed(6)}
                </span>
              </div>
              {rep.accuracy_meters && (
                <div>
                  <span className="text-gray-500">Accuracy:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ±{rep.accuracy_meters}m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Speed & Movement */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-700">Speed & Movement</h4>
            </div>
            <div className="space-y-2 text-sm">
              {rep.speed_kph !== null ? (
                <div>
                  <span className="text-gray-500">Current Speed:</span>
                  <span className="ml-2 font-medium text-gray-900 text-lg">
                    {rep.speed_kph.toFixed(1)} km/h
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 italic">No speed data</span>
              )}
            </div>
          </div>

          {/* Device Info */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Battery className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-700">
                Device Information
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              {rep.battery_level !== null ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Battery:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          rep.battery_level > 50
                            ? 'bg-green-600'
                            : rep.battery_level > 20
                              ? 'bg-orange-600'
                              : 'bg-red-600'
                        }`}
                        style={{
                          width: `${rep.battery_level}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">
                      {rep.battery_level}%
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 italic">No battery data</span>
              )}
              {rep.network_type && (
                <div>
                  <span className="text-gray-500">Network:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {rep.network_type}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Last Update */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-700">Last Update</h4>
            </div>
            <div className="text-sm">
              {rep.last_update ? (
                <div>
                  <p className="font-medium text-gray-900">
                    {formatDate(rep.last_update)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time tracking active
                  </p>
                </div>
              ) : (
                <span className="text-gray-400 italic">
                  No timestamp available
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Map Link Note */}
        <div
          className="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() =>
            onOpenMaps(Number(rep.latitude), Number(rep.longitude))
          }
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-800">
              <p className="font-medium mb-1">Click to Open Google Maps</p>
              <p className="text-blue-600">
                Coordinates: {Number(rep.latitude).toFixed(6)},{' '}
                {Number(rep.longitude).toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default LocationDetail;
