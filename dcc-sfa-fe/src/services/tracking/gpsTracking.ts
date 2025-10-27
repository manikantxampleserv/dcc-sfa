import axiosInstance from 'configs/axio.config';

export interface GPSTrackingFilters {
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface GPSData {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  latitude: number;
  longitude: number;
  log_time: string;
  accuracy_meters: number;
  speed_kph: number | null;
  battery_level: number | null;
  network_type: string;
}

export interface GPSTrackingData {
  summary: {
    total_logs: number;
    unique_users: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  data: {
    gps_logs: GPSData[];
    user_summary: Array<{
      user_id: number;
      user_name: string;
      total_logs: number;
      avg_speed_kph: string;
      last_log_time: string | null;
    }>;
  };
}

export interface RealTimeGPSData {
  summary: {
    total_users: number;
    users_with_location: number;
    timestamp: string;
  };
  gps_data: Array<{
    user_id: number;
    user_name: string;
    user_email: string;
    employee_id: string | null;
    latitude?: number;
    longitude?: number;
    last_update?: string;
    accuracy_meters?: number;
    speed_kph?: number | null;
    battery_level?: number | null;
    network_type?: string;
  }>;
}

export interface UserGPSPathData {
  user: {
    id: number;
    name: string;
    email: string;
  };
  path: Array<{
    id: number;
    latitude: number;
    longitude: number;
    log_time: string;
    speed_kph: number | null;
    accuracy_meters: number;
  }>;
  total_points: number;
  date_range: {
    start: string;
    end: string;
  };
}

export const fetchGPSTrackingData = async (
  filters?: GPSTrackingFilters
): Promise<GPSTrackingData> => {
  const params = new URLSearchParams();

  if (filters?.user_id) {
    params.append('user_id', filters.user_id.toString());
  }
  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }

  const response = await axiosInstance.get(
    `/tracking/gps?${params.toString()}`
  );

  return response.data.data;
};

export const fetchRealTimeGPSTracking = async (): Promise<RealTimeGPSData> => {
  const response = await axiosInstance.get('/tracking/gps/realtime');
  return response.data.data;
};

export const fetchUserGPSPath = async (
  userId: number,
  filters?: { start_date?: string; end_date?: string }
): Promise<UserGPSPathData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }

  const response = await axiosInstance.get(
    `/tracking/gps/path/${userId}?${params.toString()}`
  );

  return response.data.data;
};

export interface CreateGPSLogPayload {
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  speed_kph?: number;
  battery_level?: number;
  network_type?: string;
  log_time?: string;
}

export const createGPSLog = async (data: CreateGPSLogPayload): Promise<any> => {
  const response = await axiosInstance.post('/tracking/gps', data);
  return response.data.data;
};
