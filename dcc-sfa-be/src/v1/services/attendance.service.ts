// services/attendance.service.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

import {
  DeviceInfo,
  PunchInRequest,
  PunchOutRequest,
  AttendanceWithHistory,
  AttendanceSummary,
  TeamAttendanceStatus,
  AttendanceFilter,
} from '../../types/attendance.types';

export class AttendanceService {
  /**
   * Extract device information from request and client data
   */
  private extractDeviceInfo(
    req: Request,
    clientData: Partial<DeviceInfo> = {}
  ): DeviceInfo {
    const userAgent = req.headers['user-agent'] || '';

    return {
      deviceId:
        clientData.deviceId ||
        (req.headers['device-id'] as string) ||
        'unknown',
      deviceName: clientData.deviceName || 'Unknown Device',
      deviceModel: clientData.deviceModel || 'Unknown Model',
      osName: clientData.osName || this.getOSFromUserAgent(userAgent),
      osVersion: clientData.osVersion || 'Unknown',
      appVersion:
        (req.headers['app-version'] as string) ||
        clientData.appVersion ||
        '1.0.0',
      manufacturer: clientData.manufacturer || 'Unknown',
      brand: clientData.brand || 'Unknown',
      isPhysicalDevice: clientData.isPhysicalDevice !== false,

      locationAccuracy: clientData.locationAccuracy,
      altitude: clientData.altitude,
      speed: clientData.speed,
      heading: clientData.heading,

      networkType: clientData.networkType || 'unknown',
      carrier: clientData.carrier || 'Unknown',
      isConnected: clientData.isConnected !== false,

      batteryLevel: clientData.batteryLevel,
      isCharging: clientData.isCharging || false,

      timestamp: new Date().toISOString(),
      timezone: clientData.timezone || 'Asia/Kolkata',

      screenResolution: clientData.screenResolution,
      locale:
        clientData.locale ||
        (req.headers['accept-language'] as string) ||
        'en-IN',
    };
  }

  /**
   * Detect OS from user agent string
   */
  private getOSFromUserAgent(userAgent: string): string {
    if (/android/i.test(userAgent)) return 'Android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac/.test(userAgent)) return 'MacOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  /**
   * Create attendance history record
   */
  private async createAttendanceHistory(
    attendanceId: number,
    actionType: 'punch_in' | 'punch_out' | 'update' | 'auto_close',
    data: {
      latitude?: number;
      longitude?: number;
      address?: string;
      photo?: string;
      remarks?: string;
      oldData?: any;
      newData?: any;
      deviceInfo?: Partial<DeviceInfo>;
    },
    userId: number,
    req: Request
  ): Promise<void> {
    try {
      const deviceInfo = this.extractDeviceInfo(req, data.deviceInfo || {});

      await prisma.attendance_history.create({
        data: {
          attendance_id: attendanceId,
          action_type: actionType,
          latitude: data.latitude ? new Prisma.Decimal(data.latitude) : null,
          longitude: data.longitude ? new Prisma.Decimal(data.longitude) : null,
          address: data.address || null,
          device_info: JSON.stringify(deviceInfo),
          photo_url: data.photo || null,
          old_data: data.oldData ? JSON.stringify(data.oldData) : null,
          new_data: data.newData ? JSON.stringify(data.newData) : null,
          ip_address:
            req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            'unknown',
          user_agent: req.headers['user-agent'] || 'unknown',
          app_version: (req.headers['app-version'] as string) || null,
          battery_level: deviceInfo.batteryLevel
            ? new Prisma.Decimal(deviceInfo.batteryLevel)
            : null,
          network_type: deviceInfo.networkType,
          remarks: data.remarks || null,
          createdby: userId,
          is_active: 'Y',
        },
      });
    } catch (error) {
      console.error('Error creating attendance history:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get start of day
   */
  private getStartOfDay(date: Date = new Date()): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Get end of day
   */
  private getEndOfDay(date: Date = new Date()): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Calculate working days (excluding Sundays)
   */
  private getWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0) {
        // 0 = Sunday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Punch In
   */
  async punchIn(
    userId: number,
    data: PunchInRequest,
    req: Request
  ): Promise<AttendanceWithHistory> {
    const today = this.getStartOfDay();

    // Check if already punched in today
    const existingPunchIn = await prisma.attendance.findFirst({
      where: {
        user_id: userId,
        attendance_date: today,
        is_active: 'Y',
      },
    });

    if (existingPunchIn && existingPunchIn.status === 'active') {
      throw new Error('Already punched in today');
    }

    // Get user profile photo if not provided
    let photoUrl = data.photo;
    if (!photoUrl) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { profile_image: true },
      });
      photoUrl = user?.profile_image || undefined;
    }

    // Prepare device info
    const deviceInfo = this.extractDeviceInfo(req, data.deviceInfo || {});

    // Create punch in record
    const attendance = await prisma.attendance.create({
      data: {
        user_id: userId,
        attendance_date: today,
        punch_in_time: new Date(),
        punch_in_latitude: data.latitude
          ? new Prisma.Decimal(data.latitude)
          : null,
        punch_in_longitude: data.longitude
          ? new Prisma.Decimal(data.longitude)
          : null,
        punch_in_address: data.address || null,
        punch_in_device_info: JSON.stringify(deviceInfo),
        work_type: data.workType || 'field',
        status: 'active',
        createdby: userId,
        is_active: 'Y',
      },
      include: {
        attendance_user: {
          select: {
            id: true,
            name: true,
            email: true,
            employee_id: true,
            profile_image: true,
          },
        },
      },
    });

    // Create history record
    await this.createAttendanceHistory(
      attendance.id,
      'punch_in',
      {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: photoUrl,
        deviceInfo: data.deviceInfo,
        newData: {
          punch_in_time: attendance.punch_in_time,
          status: 'active',
        },
      },
      userId,
      req
    );

    return attendance as AttendanceWithHistory;
  }

  /**
   * Punch Out
   */
  async punchOut(
    userId: number,
    data: PunchOutRequest,
    req: Request
  ): Promise<AttendanceWithHistory> {
    const today = this.getStartOfDay();

    // Find active punch in
    const activePunchIn = await prisma.attendance.findFirst({
      where: {
        user_id: userId,
        attendance_date: today,
        status: 'active',
        is_active: 'Y',
      },
    });

    if (!activePunchIn) {
      throw new Error('No active punch in found for today');
    }

    // Get user profile photo if not provided
    let photoUrl = data.photo;
    if (!photoUrl) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { profile_image: true },
      });
      photoUrl = user?.profile_image || undefined;
    }

    // Calculate total hours
    const punchOutTime = new Date();
    const timeDiff =
      punchOutTime.getTime() - new Date(activePunchIn.punch_in_time).getTime();
    const totalHours = parseFloat((timeDiff / (1000 * 60 * 60)).toFixed(2));

    // Prepare device info
    const deviceInfo = this.extractDeviceInfo(req, data.deviceInfo || {});

    // Update attendance
    const attendance = await prisma.attendance.update({
      where: { id: activePunchIn.id },
      data: {
        punch_out_time: punchOutTime,
        punch_out_latitude: data.latitude
          ? new Prisma.Decimal(data.latitude)
          : null,
        punch_out_longitude: data.longitude
          ? new Prisma.Decimal(data.longitude)
          : null,
        punch_out_address: data.address || null,
        punch_out_device_info: JSON.stringify(deviceInfo),
        total_hours: new Prisma.Decimal(totalHours),
        status: 'completed',
        remarks: data.remarks || null,
        updatedby: userId,
        updatedate: new Date(),
      },
      include: {
        attendance_user: {
          select: {
            id: true,
            name: true,
            email: true,
            employee_id: true,
            profile_image: true,
          },
        },
      },
    });

    // Create history record
    await this.createAttendanceHistory(
      attendance.id,
      'punch_out',
      {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: photoUrl,
        remarks: data.remarks,
        deviceInfo: data.deviceInfo,
        oldData: {
          status: 'active',
          punch_out_time: null,
        },
        newData: {
          punch_out_time: punchOutTime,
          total_hours: totalHours,
          status: 'completed',
        },
      },
      userId,
      req
    );

    return attendance as AttendanceWithHistory;
  }

  async getTodayAttendance(
    userId: number
  ): Promise<AttendanceWithHistory | null> {
    const today = this.getStartOfDay();

    const attendance = await prisma.attendance.findFirst({
      where: {
        user_id: userId,
        attendance_date: today,
        is_active: 'Y',
      },
      include: {
        attendance_user: {
          select: {
            id: true,
            name: true,
            email: true,
            employee_id: true,
            profile_image: true,
          },
        },
      },
    });

    return attendance as AttendanceWithHistory | null;
  }

  async getAttendanceWithHistory(
    attendanceId: number,
    userId: number
  ): Promise<AttendanceWithHistory | null> {
    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        user_id: userId,
        is_active: 'Y',
      },
      include: {
        attendance_user: {
          select: {
            id: true,
            name: true,
            email: true,
            employee_id: true,
            profile_image: true,
          },
        },
        attendance_historys: {
          orderBy: {
            action_time: 'asc',
          },
        },
      },
    });

    return attendance as AttendanceWithHistory | null;
  }

  async getAttendanceHistory(filter: AttendanceFilter): Promise<{
    data: AttendanceWithHistory[];
    total: number;
  }> {
    const {
      userId,
      startDate,
      endDate,
      status,
      workType,
      page = 1,
      limit = 30,
    } = filter;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.attendanceWhereInput = {
      is_active: 'Y',
    };

    if (userId) {
      whereClause.user_id = userId;
    }

    if (startDate && endDate) {
      whereClause.attendance_date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (workType) {
      whereClause.work_type = workType;
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        include: {
          attendance_user: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              profile_image: true,
            },
          },
        },
        orderBy: {
          attendance_date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where: whereClause }),
    ]);

    return {
      data: attendance as AttendanceWithHistory[],
      total,
    };
  }

  /**
   * Get team attendance
   */
  async getTeamAttendance(
    managerId: number,
    date: Date = new Date()
  ): Promise<{
    data: TeamAttendanceStatus[];
    summary: {
      total: number;
      present: number;
      absent: number;
    };
  }> {
    const targetDate = this.getStartOfDay(date);

    // Get team members
    const teamMembers = await prisma.users.findMany({
      where: {
        reporting_to: managerId,
        is_active: 'Y',
      },
      select: {
        id: true,
        name: true,
        employee_id: true,
        email: true,
        profile_image: true,
      },
    });

    const teamIds = teamMembers.map(member => member.id);

    // Get attendance for team
    const attendance = await prisma.attendance.findMany({
      where: {
        user_id: {
          in: teamIds,
        },
        attendance_date: targetDate,
        is_active: 'Y',
      },
    });

    // Map attendance to users
    const attendanceMap = new Map<number, any>();
    attendance.forEach(att => {
      attendanceMap.set(att.user_id, att);
    });

    const teamAttendance: TeamAttendanceStatus[] = teamMembers.map(member => ({
      ...member,
      attendance: attendanceMap.get(member.id) || null,
      status: attendanceMap.get(member.id)
        ? (attendanceMap.get(member.id).status as 'active' | 'completed')
        : 'absent',
    }));

    return {
      data: teamAttendance,
      summary: {
        total: teamMembers.length,
        present: attendance.length,
        absent: teamMembers.length - attendance.length,
      },
    };
  }

  /**
   * Get monthly attendance summary
   */
  async getMonthlyAttendanceSummary(
    userId: number,
    month: number,
    year: number
  ): Promise<AttendanceSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        user_id: userId,
        attendance_date: {
          gte: startDate,
          lte: endDate,
        },
        is_active: 'Y',
      },
    });

    const totalHours = attendance.reduce(
      (sum, att) =>
        sum + (att.total_hours ? parseFloat(att.total_hours.toString()) : 0),
      0
    );

    const totalDays = attendance.length;
    const avgHoursPerDay =
      totalDays > 0 ? parseFloat((totalHours / totalDays).toFixed(2)) : 0;

    // Calculate working days (excluding Sundays)
    const workingDays = this.getWorkingDays(startDate, endDate);

    return {
      totalDays,
      totalHours: parseFloat(totalHours.toFixed(2)),
      avgHoursPerDay,
      presentDays: totalDays,
      absentDays: workingDays - totalDays,
      workingDays,
    };
  }

  /**
   * Auto punch out old active records
   */
  async autoPunchOut(): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 12); // 12 hours ago

    const activeAttendance = await prisma.attendance.findMany({
      where: {
        status: 'active',
        punch_in_time: {
          lt: cutoffTime,
        },
        is_active: 'Y',
      },
    });

    let count = 0;

    for (const att of activeAttendance) {
      const punchOutTime = new Date(att.punch_in_time);
      punchOutTime.setHours(punchOutTime.getHours() + 9); // Assume 9 hour shift

      const timeDiff =
        punchOutTime.getTime() - new Date(att.punch_in_time).getTime();
      const totalHours = parseFloat((timeDiff / (1000 * 60 * 60)).toFixed(2));

      await prisma.attendance.update({
        where: { id: att.id },
        data: {
          punch_out_time: punchOutTime,
          total_hours: new Prisma.Decimal(totalHours),
          status: 'auto_closed',
          remarks: 'Auto punched out by system',
          updatedby: 0,
          updatedate: new Date(),
        },
      });

      // Create history record for auto close
      await prisma.attendance_history.create({
        data: {
          attendance_id: att.id,
          action_type: 'auto_close',
          device_info: JSON.stringify({ system: 'cron_job' }),
          new_data: JSON.stringify({
            punch_out_time: punchOutTime,
            total_hours: totalHours,
            status: 'auto_closed',
          }),
          remarks: 'Auto punched out by system after 12 hours',
          createdby: 0,
          is_active: 'Y',
        },
      });

      count++;
    }

    return count;
  }
}
