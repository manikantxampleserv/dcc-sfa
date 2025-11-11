import { attendance } from './../../../../node_modules/.prisma/client/index.d';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import {
  PunchInRequest,
  PunchOutRequest,
  AttendanceRecord,
  AttendanceWithHistory,
  AttendanceFilter,
  AttendanceSummary,
  TeamAttendanceStatus,
} from '../../types/attendance.types';

const prisma = new PrismaClient();

export class AttendanceService {
  async punchIn(
    userId: number,
    data: PunchInRequest,
    req: Request
  ): Promise<AttendanceWithHistory> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.create({
      data: {
        user_id: userId,
        attendance_date: new Date(),
        punch_in_time: new Date(),
        punch_in_latitude: data.latitude,
        punch_in_longitude: data.longitude,
        punch_in_address: data.address,
        punch_in_device_info: data.deviceInfo
          ? JSON.stringify(data.deviceInfo)
          : null,
        work_type: data.workType || 'office',
        status: 'punch_in',
        is_active: 'Y',
        createdby: userId,
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

    await prisma.attendance_history.create({
      data: {
        attendance_id: attendance.id,
        action_type: 'punch_in',
        action_time: new Date(),
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        device_info: data.deviceInfo ? JSON.stringify(data.deviceInfo) : null,
        photo_url: null,
        old_data: null,
        new_data: JSON.stringify({
          punch_in_time: attendance.punch_in_time,
          work_type: attendance.work_type,
          status: attendance.status,
        }),
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
        app_version: data.deviceInfo?.appVersion || null,
        battery_level: data.deviceInfo?.batteryLevel || null,
        network_type: data.deviceInfo?.networkType || null,
        remarks: `Punched in at ${data.address || 'unknown location'}`,
        is_active: 'Y',
        createdate: new Date(),
        createdby: userId,
      },
    });

    return attendance as AttendanceWithHistory;
  }

  async punchOut(
    userId: number,
    data: PunchOutRequest,
    req: Request
  ): Promise<AttendanceWithHistory> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        user_id: userId,
        attendance_date: { gte: today },
        is_active: 'Y',
      },
    });

    if (!attendance) {
      throw new Error('No active punch-in found');
    }

    const punchInTime = new Date(attendance.punch_in_time);
    const punchOutTime = new Date();
    const totalHours =
      (punchOutTime.getTime() - punchInTime.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        punch_out_time: punchOutTime,
        punch_out_latitude: data.latitude,
        punch_out_longitude: data.longitude,
        punch_out_address: data.address,
        punch_out_device_info: data.deviceInfo
          ? JSON.stringify(data.deviceInfo)
          : null,
        total_hours: totalHours,
        status: 'punch_out',
        remarks: data.remarks,
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

    await prisma.attendance_history.create({
      data: {
        attendance_id: attendance.id,
        action_type: 'punch_out',
        action_time: new Date(),
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        device_info: data.deviceInfo ? JSON.stringify(data.deviceInfo) : null,
        photo_url: null,
        old_data: JSON.stringify({
          punch_out_time: null,
          total_hours: null,
          status: 'punch_in',
        }),
        new_data: JSON.stringify({
          punch_out_time: punchOutTime,
          total_hours: totalHours,
          status: 'punch_out',
          remarks: data.remarks,
        }),
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
        app_version: data.deviceInfo?.appVersion || null,
        battery_level: data.deviceInfo?.batteryLevel || null,
        network_type: data.deviceInfo?.networkType || null,
        remarks: `Punched out. Total hours: ${totalHours.toFixed(2)}`,
        is_active: 'Y',
        createdate: new Date(),
        createdby: userId,
      },
    });

    return updated as AttendanceWithHistory;
  }

  async getTodayAttendance(
    userId: number
  ): Promise<AttendanceWithHistory | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        user_id: userId,
        attendance_date: {
          gte: today,
        },
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

  async getPunchStatus(userId: number): Promise<{
    status: 'punch_in' | 'punch_out' | 'not_punch';
    message: string;
    attendance: AttendanceWithHistory | null;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        user_id: userId,
        attendance_date: {
          gte: today,
        },
        is_active: 'Y',
      },
      orderBy: {
        id: 'desc',
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
    const attendance = attendances[0];

    if (!attendance) {
      return {
        status: 'not_punch',
        message: 'You have not punched in today',
        attendance: null,
      };
    }

    return {
      status: (attendance.status || 'punch_in') as
        | 'punch_in'
        | 'punch_out'
        | 'not_punch',
      message: 'You have punched in today',
      attendance: attendance as AttendanceWithHistory,
    };
  }

  async getAttendanceById(
    id: number,
    userId: number
  ): Promise<AttendanceWithHistory | null> {
    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
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
      },
    });

    return attendance as AttendanceWithHistory | null;
  }

  async getAttendanceWithHistory(
    id: number,
    userId: number
  ): Promise<AttendanceWithHistory | null> {
    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
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
            createdate: 'desc',
          },
        },
      },
    });

    return attendance as AttendanceWithHistory | null;
  }

  async getAttendanceHistoryPaginated(filter: AttendanceFilter) {
    const {
      userId,
      startDate,
      endDate,
      status,
      workType,
      page = 1,
      limit = 10,
    } = filter;

    const skip = (page - 1) * limit;

    const where: any = {
      is_active: 'Y',
    };

    if (userId) where.user_id = userId;
    if (status) where.status = status;
    if (workType) where.work_type = workType;
    if (startDate || endDate) {
      where.attendance_date = {};
      if (startDate) where.attendance_date.gte = startDate;
      if (endDate) where.attendance_date.lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
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
      prisma.attendance.count({ where }),
    ]);

    const stats = {
      totalAttendance: total,
      activeAttendance: await prisma.attendance.count({
        where: { ...where, status: 'active' },
      }),
      attendanceThisMonth: await prisma.attendance.count({
        where: {
          ...where,
          attendance_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      totalHours: 0,
      averageHours: 0,
    };

    return { data, total, stats };
  }

  async getTeamAttendance(managerId: number, date: Date) {
    const teamMembers = await prisma.users.findMany({
      where: {
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

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        user_id: {
          in: teamMembers.map(m => m.id),
        },
        attendance_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        is_active: 'Y',
      },
    });

    const data: TeamAttendanceStatus[] = teamMembers.map(member => {
      const attendance = attendanceRecords.find(a => a.user_id === member.id);
      return {
        ...member,
        attendance: attendance as AttendanceRecord | null,
        status: attendance
          ? attendance.punch_out_time
            ? 'completed'
            : 'active'
          : 'absent',
      };
    });

    const summary = {
      total: data.length,
      present: data.filter(d => d.attendance).length,
      absent: data.filter(d => !d.attendance).length,
      active: data.filter(d => d.status === 'active').length,
      completed: data.filter(d => d.status === 'completed').length,
    };

    return { data, summary };
  }

  async getMonthlyAttendanceSummary(
    userId: number,
    month: number,
    year: number
  ): Promise<AttendanceSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendances = await prisma.attendance.findMany({
      where: {
        user_id: userId,
        attendance_date: {
          gte: startDate,
          lte: endDate,
        },
        is_active: 'Y',
      },
    });

    const totalDays = attendances.length;
    const totalHours = attendances.reduce(
      (sum, att) => sum + (att.total_hours ? Number(att.total_hours) : 0),
      0
    );

    return {
      totalDays,
      totalHours,
      avgHoursPerDay: totalDays > 0 ? totalHours / totalDays : 0,
      presentDays: attendances.filter(a => a.status === 'completed').length,
      absentDays: 0,
      workingDays: totalDays,
    };
  }

  async updateAttendance(id: number, data: any, updatedBy: number) {
    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...data,
        updatedby: updatedBy,
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

    return updated;
  }

  async deleteAttendance(id: number) {
    await prisma.attendance.update({
      where: { id },
      data: {
        is_active: 'N',
        updatedate: new Date(),
      },
    });
  }
}
