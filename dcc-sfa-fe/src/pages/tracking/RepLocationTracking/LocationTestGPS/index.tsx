import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import Button from 'shared/Button';

interface LocationTestGPSProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
    speed_kph?: number;
    battery_level?: number;
    network_type?: string;
  }) => void;
  isLoading: boolean;
}

const LocationTestGPS: React.FC<LocationTestGPSProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [testGPSData, setTestGPSData] = useState({
    latitude: '24.7136',
    longitude: '46.6753',
    accuracy_meters: '10',
    speed_kph: '45.5',
    battery_level: '85',
    network_type: '4G',
  });

  const handleSubmit = () => {
    onSubmit({
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
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
              onChange={e =>
                setTestGPSData({ ...testGPSData, latitude: e.target.value })
              }
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
                setTestGPSData({ ...testGPSData, longitude: e.target.value })
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
                setTestGPSData({ ...testGPSData, speed_kph: e.target.value })
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
                setTestGPSData({ ...testGPSData, network_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions className="!px-6 !py-4">
        <Button onClick={onClose} variant="text" color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          loading={isLoading}
          loadingText="Creating..."
          disabled={isLoading}
        >
          Create GPS Log
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationTestGPS;
