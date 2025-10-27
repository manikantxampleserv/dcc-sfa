import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * GPS Tracking Controller
 * Handles real-time and historical GPS tracking data for sales representatives
 */
export const gpsTrackingController = {
  /**
   * Get GPS Tracking Data
   * GET /api/v1/tracking/gps
   * Returns GPS logs with filters for user, date range
   */
  async getGPSTrackingData(req: Request, res: Response) {
    try {
      const { user_id, start_date, end_date } = req.query;

      const where: any = {
        is_active: 'Y',
      };

      if (user_id) {
        where.user_id = parseInt(user_id as string);
      }

      if (start_date || end_date) {
        where.log_time = {};
        if (start_date) {
          where.log_time.gte = new Date(start_date as string);
        }
        if (end_date) {
          where.log_time.lte = new Date(end_date as string);
        }
      }

      const gpsLogs = await prisma.gps_logs.findMany({
        where,
        include: {
          users_gps_logs_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
        },
        orderBy: {
          log_time: 'desc',
        },
      });

      // Serialize GPS data
      const serializedGPSData = gpsLogs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        user_name: log.users_gps_logs_user_idTousers?.name || 'N/A',
        user_email: log.users_gps_logs_user_idTousers?.email || 'N/A',
        latitude: Number(log.latitude),
        longitude: Number(log.longitude),
        log_time: log.log_time,
        accuracy_meters: log.accuracy_meters,
        speed_kph: log.speed_kph ? Number(log.speed_kph) : null,
        battery_level: log.battery_level ? Number(log.battery_level) : null,
        network_type: log.network_type,
      }));

      // Group by user for summary
      const userSummary = Array.from(
        new Set(gpsLogs.map(log => log.user_id))
      ).map(userId => {
        const userLogs = gpsLogs.filter(log => log.user_id === userId);
        const avgSpeed =
          userLogs.reduce((sum, log) => sum + Number(log.speed_kph || 0), 0) /
          userLogs.length;

        return {
          user_id: userId,
          user_name: userLogs[0]?.users_gps_logs_user_idTousers?.name || 'N/A',
          total_logs: userLogs.length,
          avg_speed_kph: avgSpeed.toFixed(2),
          last_log_time: userLogs[0]?.log_time,
        };
      });

      const summary = {
        total_logs: gpsLogs.length,
        unique_users: userSummary.length,
        date_range: {
          start: start_date || 'N/A',
          end: end_date || 'N/A',
        },
      };

      const response = {
        summary,
        data: {
          gps_logs: serializedGPSData,
          user_summary: userSummary,
        },
      };

      res.json({
        success: true,
        message: 'GPS tracking data retrieved successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get GPS Tracking Data Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve GPS tracking data',
      });
    }
  },

  /**
   * Get Real-Time GPS Tracking
   * GET /api/v1/tracking/gps/realtime
   * Returns the latest GPS log for each active user
   */
  async getRealTimeGPSTracking(req: Request, res: Response) {
    try {
      // Get the latest GPS log for each user
      const users = await prisma.users.findMany({
        where: {
          is_active: 'Y',
        },
        select: {
          id: true,
          name: true,
          email: true,
          employee_id: true,
        },
      });

      const realTimeData = await Promise.all(
        users.map(async user => {
          const latestLog = await prisma.gps_logs.findFirst({
            where: {
              user_id: user.id,
              is_active: 'Y',
            },
            orderBy: {
              log_time: 'desc',
            },
          });

          return {
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            employee_id: user.employee_id,
            ...(latestLog && {
              latitude: Number(latestLog.latitude),
              longitude: Number(latestLog.longitude),
              last_update: latestLog.log_time,
              accuracy_meters: latestLog.accuracy_meters,
              speed_kph: latestLog.speed_kph
                ? Number(latestLog.speed_kph)
                : null,
              battery_level: latestLog.battery_level
                ? Number(latestLog.battery_level)
                : null,
              network_type: latestLog.network_type,
            }),
          };
        })
      );

      const summary = {
        total_users: realTimeData.length,
        users_with_location: realTimeData.filter(u => u.latitude).length,
        timestamp: new Date(),
      };

      res.json({
        success: true,
        message: 'Real-time GPS tracking data retrieved successfully',
        data: {
          summary,
          gps_data: realTimeData,
        },
      });
    } catch (error: any) {
      console.error('Get Real-Time GPS Tracking Error:', error);
      res.status(500).json({
        success: false,
        message:
          error.message || 'Failed to retrieve real-time GPS tracking data',
      });
    }
  },

  /**
   * Get User GPS Path
   * GET /api/v1/tracking/gps/path/:user_id
   * Returns the GPS path for a specific user within a date range
   */
  async getUserGPSPath(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const { start_date, end_date } = req.query;

      const where: any = {
        user_id: parseInt(user_id),
        is_active: 'Y',
      };

      if (start_date || end_date) {
        where.log_time = {};
        if (start_date) {
          where.log_time.gte = new Date(start_date as string);
        }
        if (end_date) {
          where.log_time.lte = new Date(end_date as string);
        }
      }

      const gpsPath = await prisma.gps_logs.findMany({
        where,
        include: {
          users_gps_logs_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          log_time: 'asc',
        },
      });

      const pathData = gpsPath.map(log => ({
        id: log.id,
        latitude: Number(log.latitude),
        longitude: Number(log.longitude),
        log_time: log.log_time,
        speed_kph: log.speed_kph ? Number(log.speed_kph) : null,
        accuracy_meters: log.accuracy_meters,
      }));

      const user = gpsPath[0]?.users_gps_logs_user_idTousers;

      res.json({
        success: true,
        message: 'User GPS path retrieved successfully',
        data: {
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
          },
          path: pathData,
          total_points: pathData.length,
          date_range: {
            start: start_date || 'N/A',
            end: end_date || 'N/A',
          },
        },
      });
    } catch (error: any) {
      console.error('Get User GPS Path Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve user GPS path',
      });
    }
  },
};
