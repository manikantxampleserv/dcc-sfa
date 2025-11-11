import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { TeamAttendanceStatus } from '../../types/attendance.types';

const prisma = new PrismaClient();
const attendanceService = new AttendanceService();

interface AttendanceSerialized {
  id: number;
  user_id: number;
  attendance_date: Date;
  punch_in_time: Date;
  punch_in_latitude?: number | null;
  punch_in_longitude?: number | null;
  punch_in_address?: string | null;
  punch_in_device_info?: any;
  punch_out_time?: Date | null;
  punch_out_latitude?: number | null;
  punch_out_longitude?: number | null;
  punch_out_address?: string | null;
  punch_out_device_info?: any;
  total_hours?: number | null;
  work_type?: string | null;
  status: string;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
    profile_image?: string | null;
  };
  attendance_history?: any[];
}

const serializeAttendance = (attendance: any): AttendanceSerialized => ({
  id: attendance.id,
  user_id: attendance.user_id,
  attendance_date: attendance.attendance_date,
  punch_in_time: attendance.punch_in_time,
  punch_in_latitude: attendance.punch_in_latitude
    ? Number(attendance.punch_in_latitude)
    : null,
  punch_in_longitude: attendance.punch_in_longitude
    ? Number(attendance.punch_in_longitude)
    : null,
  punch_in_address: attendance.punch_in_address,
  punch_in_device_info: attendance.punch_in_device_info
    ? JSON.parse(attendance.punch_in_device_info)
    : null,
  punch_out_time: attendance.punch_out_time,
  punch_out_latitude: attendance.punch_out_latitude
    ? Number(attendance.punch_out_latitude)
    : null,
  punch_out_longitude: attendance.punch_out_longitude
    ? Number(attendance.punch_out_longitude)
    : null,
  punch_out_address: attendance.punch_out_address,
  punch_out_device_info: attendance.punch_out_device_info
    ? JSON.parse(attendance.punch_out_device_info)
    : null,
  total_hours: attendance.total_hours ? Number(attendance.total_hours) : null,
  work_type: attendance.work_type,
  status: attendance.status,
  remarks: attendance.remarks,
  is_active: attendance.is_active,
  createdate: attendance.createdate,
  createdby: attendance.createdby,
  updatedate: attendance.updatedate,
  updatedby: attendance.updatedby,
  user: attendance.user
    ? {
        id: attendance.user.id,
        name: attendance.user.name,
        email: attendance.user.email,
        employee_id: attendance.user.employee_id,
        profile_image: attendance.user.profile_image,
      }
    : undefined,
  attendance_history: attendance.attendance_history
    ? attendance.attendance_history.map((h: any) => ({
        ...h,
        latitude: h.latitude ? Number(h.latitude) : null,
        longitude: h.longitude ? Number(h.longitude) : null,
        battery_level: h.battery_level ? Number(h.battery_level) : null,
        device_info: h.device_info ? JSON.parse(h.device_info) : null,
        old_data: h.old_data ? JSON.parse(h.old_data) : null,
        new_data: h.new_data ? JSON.parse(h.new_data) : null,
      }))
    : undefined,
});

export const attendanceController = {
  async punch(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const userId = req.user.id;
      const { action_type, ...data } = req.body;

      if (!action_type) {
        return res.status(400).json({
          message: 'action_type is required. Valid values: punch_in, punch_out',
        });
      }

      if (action_type !== 'punch_in' && action_type !== 'punch_out') {
        return res.status(400).json({
          message: 'Invalid action_type. Valid values: punch_in, punch_out',
        });
      }

      let attendance;
      let message;
      let statusCode;

      if (action_type === 'punch_in') {
        attendance = await attendanceService.punchIn(userId, data, req);
        message = 'Punched in successfully';
        statusCode = 201;
      } else {
        attendance = await attendanceService.punchOut(userId, data, req);
        message = 'Punched out successfully';
        statusCode = 200;
      }

      res.status(statusCode).json({
        message,
        data: serializeAttendance(attendance),
      });
    } catch (error: any) {
      console.error('Punch Error:', error);
      res.status(400).json({
        message: error.message || 'Failed to process punch',
        error: error.message,
      });
    }
  },

  async getPunchStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const userId = req.user.id;

      const punchStatus = await attendanceService.getPunchStatus(userId);

      res.status(200).json({
        message: 'Punch status retrieved successfully',
        data: {
          status: punchStatus.status,
          attendance: punchStatus.attendance
            ? serializeAttendance(punchStatus.attendance)
            : null,
        },
      });
    } catch (error: any) {
      console.error('Get Punch Status Error:', error);
      res.status(500).json({
        message: 'Failed to fetch punch status',
        error: error.message,
      });
    }
  },

  async getTodayAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const userId = req.user.id;

      const attendance = await attendanceService.getTodayAttendance(userId);

      res.status(200).json({
        message: 'Today attendance retrieved successfully',
        data: attendance ? serializeAttendance(attendance) : null,
      });
    } catch (error: any) {
      console.error('Get Today Attendance Error:', error);
      res.status(500).json({
        message: 'Failed to fetch attendance',
        error: error.message,
      });
    }
  },

  async getAttendanceById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const attendance = await attendanceService.getAttendanceById(
        parseInt(id),
        userId
      );

      if (!attendance) {
        return res.status(404).json({
          message: 'Attendance record not found',
        });
      }

      res.status(200).json({
        message: 'Attendance fetched successfully',
        data: serializeAttendance(attendance),
      });
    } catch (error: any) {
      console.error('Get Attendance By ID Error:', error);
      res.status(500).json({
        message: 'Failed to fetch attendance',
        error: error.message,
      });
    }
  },

  async getAttendanceWithHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req?.user?.id || 0;

      const attendance = await attendanceService.getAttendanceWithHistory(
        parseInt(id),
        userId
      );

      res.status(200).json({
        message: 'Attendance history fetched successfully',
        data: serializeAttendance(attendance),
      });
    } catch (error: any) {
      console.error('Get Attendance History Error:', error);
      res.status(500).json({
        message: 'Failed to fetch attendance history',
        error: error.message,
      });
    }
  },

  async getAttendanceHistory(req: any, res: any) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const {
        page,
        limit,
        startDate,
        endDate,
        status,
        workType,
        user_id,
        isActive,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filter = {
        userId: user_id ? parseInt(user_id as string, 10) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as string,
        workType: workType as string,
        page: pageNum,
        limit: limitNum,
        currentUserId: req.user.id,
        isAdmin: req.user.role === 'Admin',
      };

      const result =
        await attendanceService.getAttendanceHistoryPaginated(filter);

      const pagination = {
        current_page: pageNum,
        total_pages: Math.ceil(result.total / limitNum),
        total_count: result.total,
        has_next: pageNum < Math.ceil(result.total / limitNum),
        has_previous: pageNum > 1,
      };

      res.success(
        'Attendance history retrieved successfully',
        result.data.map((att: any) => serializeAttendance(att)),
        200,
        pagination,
        {
          total_attendance: result.stats.totalAttendance,
          active_attendance: result.stats.activeAttendance,
          attendance_this_month: result.stats.attendanceThisMonth,
          total_hours: result.stats.totalHours,
          average_hours: result.stats.averageHours,
          filters_applied: {
            user_id: user_id || req.user.id,
            start_date: startDate || null,
            end_date: endDate || null,
            status: status || null,
            work_type: workType || null,
            is_active: isActive || null,
          },
        }
      );
    } catch (error: any) {
      console.error('Get Attendance History Error:', error);
      res.status(500).json({
        message: 'Failed to fetch attendance history',
        error: error.message,
      });
    }
  },

  async getTeamAttendance(req: any, res: any) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const managerId = req.user.id;
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();

      const result = await attendanceService.getTeamAttendance(
        managerId,
        targetDate
      );

      const serializedData = result.data.map(
        (member: TeamAttendanceStatus) => ({
          ...member,
          attendance: member.attendance
            ? {
                ...member.attendance,
                punch_in_latitude: member.attendance.punch_in_latitude
                  ? Number(member.attendance.punch_in_latitude)
                  : null,
                punch_in_longitude: member.attendance.punch_in_longitude
                  ? Number(member.attendance.punch_in_longitude)
                  : null,
                punch_out_latitude: member.attendance.punch_out_latitude
                  ? Number(member.attendance.punch_out_latitude)
                  : null,
                punch_out_longitude: member.attendance.punch_out_longitude
                  ? Number(member.attendance.punch_out_longitude)
                  : null,
                total_hours: member.attendance.total_hours
                  ? Number(member.attendance.total_hours)
                  : null,
              }
            : null,
        })
      );

      res.success(
        'Team attendance retrieved successfully',
        serializedData,
        200,
        undefined,
        {
          summary: result.summary,
          date: targetDate.toISOString().split('T')[0],
        }
      );
    } catch (error: any) {
      console.error(' Get Team Attendance Error:', error);
      res.status(500).json({
        message: 'Failed to fetch team attendance',
        error: error.message,
      });
    }
  },
  /**
   * Get Monthly Summary
   */
  async getMonthlySummary(req: Request, res: any) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const userId = req.user.id;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: 'Month and year are required',
        });
      }

      const summary = await attendanceService.getMonthlyAttendanceSummary(
        userId,
        parseInt(month as string),
        parseInt(year as string)
      );

      res.success('Monthly summary retrieved successfully', summary, 200);
    } catch (error: any) {
      console.error(' Get Monthly Summary Error:', error);
      res.status(500).json({
        message: 'Failed to fetch monthly summary',
        error: error.message,
      });
    }
  },

  async updateAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;

      const updated = await attendanceService.updateAttendance(
        parseInt(id),
        data,
        userId
      );

      res.status(200).json({
        message: 'Attendance updated successfully',
        data: serializeAttendance(updated),
      });
    } catch (error: any) {
      console.error(' Update Attendance Error:', error);
      res.status(500).json({
        message: error.message || 'Failed to update attendance',
        error: error.message,
      });
    }
  },

  async deleteAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await attendanceService.deleteAttendance(parseInt(id));

      res.status(200).json({
        message: 'Attendance deleted successfully',
      });
    } catch (error: any) {
      console.error(' Delete Attendance Error:', error);
      res.status(500).json({
        message: error.message || 'Failed to delete attendance',
        error: error.message,
      });
    }
  },
};
