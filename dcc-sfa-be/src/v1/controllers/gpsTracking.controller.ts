import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

/**
 * GPS Tracking Controller
 * Handles real-time and historical GPS tracking data for sales representatives
 */
export const gpsTrackingController = {
  /**
   * Create GPS Log
   * POST /api/v1/tracking/gps
   * Creates a new GPS log entry (typically from mobile app)
   */
  async createGPSLog(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in authentication token',
        });
      }

      const {
        latitude,
        longitude,
        accuracy_meters,
        speed_kph,
        battery_level,
        network_type,
        log_time,
      } = req.body;

      const gpsLog = await prisma.gps_logs.create({
        data: {
          user_id: userId,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy_meters: accuracy_meters || null,
          speed_kph: speed_kph ? speed_kph.toString() : null,
          battery_level: battery_level ? battery_level.toString() : null,
          network_type: network_type || null,
          log_time: log_time ? new Date(log_time) : new Date(),
          is_active: 'Y',
          createdby: userId,
          updatedby: userId,
        },
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
      });

      res.status(201).json({
        success: true,
        message: 'GPS log created successfully',
        data: {
          id: gpsLog.id,
          user_id: gpsLog.user_id,
          user_name: gpsLog.users_gps_logs_user_idTousers?.name || 'N/A',
          latitude: Number(gpsLog.latitude),
          longitude: Number(gpsLog.longitude),
          log_time: gpsLog.log_time,
          accuracy_meters: gpsLog.accuracy_meters,
          speed_kph: gpsLog.speed_kph ? Number(gpsLog.speed_kph) : null,
          battery_level: gpsLog.battery_level
            ? Number(gpsLog.battery_level)
            : null,
          network_type: gpsLog.network_type,
        },
      });
    } catch (error: any) {
      console.error('Create GPS Log Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create GPS log',
      });
    }
  },

  /**
   * Get GPS Tracking Data
   * GET /api/v1/tracking/gps
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

  /**
   * Get Route Effectiveness
   * GET /api/v1/tracking/route-effectiveness
   * Returns route performance metrics comparing planned vs actual routes
   */
  async getRouteEffectiveness(req: Request, res: Response) {
    try {
      const { start_date, end_date, salesperson_id, route_id, depot_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Routes
      const whereRoutes: any = {
        is_active: 'Y',
        ...(depot_id && { depot_id: parseInt(depot_id as string) }),
        ...(salesperson_id && {
          salesperson_id: parseInt(salesperson_id as string),
        }),
        ...(route_id && { id: parseInt(route_id as string) }),
      };

      const routes = await prisma.routes.findMany({
        where: whereRoutes,
        include: {
          customer_routes: {
            where: { is_active: 'Y' },
            select: {
              id: true,
              name: true,
              code: true,
              latitude: true,
              longitude: true,
            },
          },
          routes_salesperson: {
            select: { id: true, name: true, email: true },
          },
          routes_depots: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Fetch Visits for these routes
      const whereVisits: any = {
        is_active: 'Y',
        route_id: { in: routes.map(r => r.id) },
        ...(Object.keys(dateFilter).length > 0 && { visit_date: dateFilter }),
        ...(salesperson_id && {
          sales_person_id: parseInt(salesperson_id as string),
        }),
      };

      const visits = await prisma.visits.findMany({
        where: whereVisits,
        include: {
          visit_customers: {
            select: { id: true, name: true, code: true },
          },
          visit_routes: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { visit_date: 'desc' },
      });

      // Fetch GPS Logs for comparison
      const whereGpsLogs: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { log_time: dateFilter }),
      };

      if (salesperson_id) {
        whereGpsLogs.user_id = parseInt(salesperson_id as string);
      }

      const gpsLogs = await prisma.gps_logs.findMany({
        where: whereGpsLogs,
        include: {
          users_gps_logs_user_idTousers: {
            select: { id: true, name: true },
          },
        },
        orderBy: { log_time: 'asc' },
        take: 50000, // Limit for performance
      });

      // Analyze each route
      const routeAnalysis = routes.map(route => {
        const routeVisits = visits.filter(v => v.route_id === route.id);
        const routeCustomers = route.customer_routes;

        // Calculate visit completion rate
        const completedVisits = routeVisits.filter(
          v => v.status === 'completed'
        ).length;
        const completionRate =
          routeCustomers.length > 0
            ? (completedVisits / routeCustomers.length) * 100
            : 0;

        // Calculate average visit duration
        const visitsWithDuration = routeVisits.filter(
          v => v.start_time && v.end_time
        );
        const avgDuration =
          visitsWithDuration.length > 0
            ? visitsWithDuration.reduce((sum, v) => {
                const duration =
                  (new Date(v.end_time!).getTime() -
                    new Date(v.start_time!).getTime()) /
                  1000 /
                  60;
                return sum + duration;
              }, 0) / visitsWithDuration.length
            : 0;

        // Calculate time adherence (planned vs actual)
        const plannedVisits = visitsWithDuration.length;
        const totalPlannedTime = route.estimated_time || 0;

        // Calculate efficiency metrics
        const totalOrders = routeVisits.reduce((sum, v) => {
          // You might want to fetch actual orders here
          return sum;
        }, 0);

        const routeGPSLogs = gpsLogs.filter(log => {
          if (route.routes_salesperson) {
            return log.user_id === route.routes_salesperson.id;
          }
          return false;
        });

        // Calculate actual distance traveled (approx from GPS logs)
        let actualDistance = 0;
        for (let i = 1; i < routeGPSLogs.length; i++) {
          const lat1 = Number(routeGPSLogs[i - 1].latitude);
          const lon1 = Number(routeGPSLogs[i - 1].longitude);
          const lat2 = Number(routeGPSLogs[i].latitude);
          const lon2 = Number(routeGPSLogs[i].longitude);

          // Haversine formula (simplified)
          const R = 6371; // Earth's radius in km
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          actualDistance += R * c;
        }

        const plannedDistance = Number(route.estimated_distance || 0);
        const distanceEfficiency =
          plannedDistance > 0
            ? ((plannedDistance / (actualDistance || 1)) * 100).toFixed(2)
            : '0';

        return {
          route_id: route.id,
          route_name: route.name,
          route_code: route.code,
          depot_name: route.routes_depots?.name || 'N/A',
          salesperson_name: route.routes_salesperson?.name || 'N/A',
          total_customers: routeCustomers.length,
          planned_visits: routeCustomers.length,
          actual_visits: routeVisits.length,
          completed_visits: completedVisits,
          in_progress_visits: routeVisits.filter(
            v => v.status === 'in_progress'
          ).length,
          missed_visits: routeCustomers.length - completedVisits,
          completion_rate: completionRate.toFixed(2),
          avg_visit_duration: avgDuration.toFixed(0),
          planned_distance_km: plannedDistance,
          actual_distance_km: actualDistance.toFixed(2),
          distance_efficiency: distanceEfficiency,
          planned_time_minutes: totalPlannedTime,
          actual_time_minutes: avgDuration * completedVisits,
          efficiency_score: (
            (completionRate + Number(distanceEfficiency)) /
            2
          ).toFixed(2),
          visit_details: routeVisits.map(v => ({
            id: v.id,
            customer_name: v.visit_customers?.name || 'N/A',
            visit_date: v.visit_date,
            status: v.status,
            check_in_time: v.check_in_time,
            check_out_time: v.check_out_time,
          })),
        };
      });

      // Calculate summary
      const totalRoutes = routeAnalysis.length;
      const totalCustomers = routeAnalysis.reduce(
        (sum, r) => sum + r.total_customers,
        0
      );
      const totalPlannedVisits = routeAnalysis.reduce(
        (sum, r) => sum + r.planned_visits,
        0
      );
      const totalActualVisits = routeAnalysis.reduce(
        (sum, r) => sum + r.actual_visits,
        0
      );
      const totalCompletedVisits = routeAnalysis.reduce(
        (sum, r) => sum + r.completed_visits,
        0
      );
      const avgCompletionRate =
        routeAnalysis.length > 0
          ? routeAnalysis.reduce(
              (sum, r) => sum + Number(r.completion_rate),
              0
            ) / routeAnalysis.length
          : 0;
      const avgEfficiencyScore =
        routeAnalysis.length > 0
          ? routeAnalysis.reduce(
              (sum, r) => sum + Number(r.efficiency_score),
              0
            ) / routeAnalysis.length
          : 0;

      const summary = {
        total_routes: totalRoutes,
        total_customers: totalCustomers,
        total_planned_visits: totalPlannedVisits,
        total_actual_visits: totalActualVisits,
        total_completed_visits: totalCompletedVisits,
        missed_visits: totalPlannedVisits - totalCompletedVisits,
        avg_completion_rate: avgCompletionRate.toFixed(2),
        avg_efficiency_score: avgEfficiencyScore.toFixed(2),
        date_range: {
          start: start_date || 'N/A',
          end: end_date || 'N/A',
        },
      };

      res.json({
        success: true,
        message: 'Route effectiveness data retrieved successfully',
        data: {
          summary,
          routes: routeAnalysis,
        },
      });
    } catch (error: any) {
      console.error('Get Route Effectiveness Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve route effectiveness data',
      });
    }
  },
};
