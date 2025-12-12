// types/attendance.types.ts

import { Prisma } from '@prisma/client';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  manufacturer: string;
  brand: string;
  isPhysicalDevice: boolean;
  locationAccuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  networkType: string;
  carrier?: string;
  isConnected: boolean;
  batteryLevel?: number;
  isCharging: boolean;
  timestamp: string;
  timezone: string;
  screenResolution?: string;
  locale: string;
}

export interface PunchInRequest {
  latitude?: number;
  longitude?: number;
  address?: string;
  photo?: string;
  workType?: 'field' | 'office' | 'remote';
  deviceInfo?: Partial<DeviceInfo>;
}

export interface PunchOutRequest {
  latitude?: number;
  longitude?: number;
  address?: string;
  photo?: string;
  remarks?: string;
  deviceInfo?: Partial<DeviceInfo>;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  attendance_date: Date;
  punch_in_time: Date;
  punch_in_latitude?: Prisma.Decimal | null;
  punch_in_longitude?: Prisma.Decimal | null;
  punch_in_address?: string | null;
  punch_in_device_info?: string | null;
  punch_out_time?: Date | null;
  punch_out_latitude?: Prisma.Decimal | null;
  punch_out_longitude?: Prisma.Decimal | null;
  punch_out_address?: string | null;
  punch_out_device_info?: string | null;
  total_hours?: Prisma.Decimal | null;
  work_type?: string | null;
  status: string;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface AttendanceWithHistory extends AttendanceRecord {
  user?: {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
    profile_image?: string | null;
  };
  attendance_history?: any[];
}

export interface AttendanceSummary {
  totalDays: number;
  totalHours: number;
  avgHoursPerDay: number;
  presentDays: number;
  absentDays: number;
  workingDays: number;
}

export interface TeamAttendanceStatus {
  id: number;
  name: string;
  employee_id?: string | null;
  email: string;
  profile_image?: string | null;
  attendance: AttendanceRecord | null;
  status: 'present' | 'absent' | 'active' | 'completed';
}

export interface AttendanceFilter {
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  workType?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// REMOVED: Don't redeclare Express.Request.user here
// The Express.Request.user is already defined in types/express.d.ts
