import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { getLocationFromIPs } from '../../utils/ipLocation.util';

/**
 * Error Logs Controller
 * Handles error log queries and triggers a reload
 */
export const errorLogsController = {
  /**
   * Get Error Logs
   * GET /api/v1/error-logs
   * Returns error logs with filtering and pagination
   */
  async getErrorLogs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        path,
        method,
        start_date,
        end_date,
      } = req.query;

      const where: any = {};

      if (path) {
        where.path = { contains: path as string };
      }

      if (method) {
        where.method = method as string;
      }

      if (start_date || end_date) {
        where.createdate = {};
        if (start_date) {
          where.createdate.gte = new Date(start_date as string);
        }
        if (end_date) {
          where.createdate.lte = new Date(end_date as string);
        }
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const { data, pagination } = await paginate({
        model: prisma.error_logs,
        filters: where,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      const ipsToLookup = data
        .map((log: any) => log.ip_address)
        .filter(Boolean);
      const locationMap = await getLocationFromIPs(ipsToLookup);

      const userIds = Array.from(
        new Set(data.map((log: any) => log.user_id).filter(Boolean))
      ) as number[];
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, employee_id: true },
      });
      const userMap = new Map(users.map(u => [u.id, u]));

      const serializedLogs = data.map((log: any) => {
        let parsedBody = null;
        let parsedQuery = null;
        try {
          parsedBody = log.body ? JSON.parse(log.body) : null;
        } catch {
          parsedBody = log.body;
        }
        try {
          parsedQuery = log.query ? JSON.parse(log.query) : null;
        } catch {
          parsedQuery = log.query;
        }

        const user = log.user_id ? userMap.get(log.user_id) : null;

        return {
          id: log.id,
          message: log.message,
          stack: log.stack,
          path: log.path,
          method: log.method,
          body: parsedBody,
          query: parsedQuery,
          user_id: log.user_id,
          user_name: user?.name || 'N/A',
          user_email: user?.email || 'N/A',
          employee_code: user?.employee_id || 'N/A',
          ip_address: log.ip_address,
          device_info: log.device_info,
          location: locationMap[log.ip_address || ''] || 'Unknown',
          createdate: log.createdate,
        };
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const startOfMonth = new Date(today);
      startOfMonth.setDate(1);

      const [total_errors, today_errors, this_week_errors, this_month_errors] =
        await Promise.all([
          prisma.error_logs.count(),
          prisma.error_logs.count({ where: { createdate: { gte: today } } }),
          prisma.error_logs.count({
            where: { createdate: { gte: startOfWeek } },
          }),
          prisma.error_logs.count({
            where: { createdate: { gte: startOfMonth } },
          }),
        ]);

      return res.status(200).json({
        success: true,
        data: serializedLogs,
        stats: {
          total_errors,
          today_errors,
          this_week_errors,
          this_month_errors,
        },
        pagination: {
          totalRecords: pagination.total_count,
          totalPages: pagination.total_pages,
          currentPage: pagination.current_page,
          limit: limitNum,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve error logs',
        error: error.message,
      });
    }
  },
};
