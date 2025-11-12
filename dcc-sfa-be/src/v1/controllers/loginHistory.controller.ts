import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface LoginHistorySerialized {
  id: number;
  user_id: number;
  login_time?: Date | null;
  logout_time?: Date | null;
  ip_address?: string | null;
  device_info?: string | null;
  os_info?: string | null;
  app_version?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  login_status?: string | null;
  failure_reason?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const serializeLoginHistory = (loginHistory: any): LoginHistorySerialized => ({
  id: loginHistory.id,
  user_id: loginHistory.user_id,
  login_time: loginHistory.login_time,
  logout_time: loginHistory.logout_time,
  ip_address: loginHistory.ip_address,
  device_info: loginHistory.device_info,
  os_info: loginHistory.os_info,
  app_version: loginHistory.app_version,
  location_latitude: loginHistory.location_latitude
    ? Number(loginHistory.location_latitude)
    : null,
  location_longitude: loginHistory.location_longitude
    ? Number(loginHistory.location_longitude)
    : null,
  login_status: loginHistory.login_status,
  failure_reason: loginHistory.failure_reason,
  is_active: loginHistory.is_active,
  created_by: loginHistory.createdby,
  createdate: loginHistory.createdate,
  updatedate: loginHistory.updatedate,
  updatedby: loginHistory.updatedby,
  user: loginHistory.users_login_history_user_idTousers
    ? {
        id: loginHistory.users_login_history_user_idTousers.id,
        name: loginHistory.users_login_history_user_idTousers.name,
        email: loginHistory.users_login_history_user_idTousers.email,
      }
    : null,
});

export const loginHistoryController = {
  async createLoginHistory(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const loginHistory = await prisma.login_history.create({
        data: {
          ...data,
          createdby: data.createdby ? Number(data.createdby) : 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          users_login_history_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: serializeLoginHistory(loginHistory),
        message: 'Login history created successfully',
      });
    } catch (error) {
      console.error('Error creating login history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create login history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getLoginHistory(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        login_status,
        user_id,
        start_date,
        end_date,
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { ip_address: { contains: search as string } },
          { device_info: { contains: search as string } },
          { os_info: { contains: search as string } },
          { app_version: { contains: search as string } },
          {
            failure_reason: { contains: search as string },
          },
          {
            users_login_history_user_idTousers: {
              OR: [
                { name: { contains: search as string } },
                { email: { contains: search as string } },
              ],
            },
          },
        ];
      }

      if (login_status) {
        where.login_status = login_status;
      }

      if (user_id) {
        where.user_id = Number(user_id);
      }

      if (start_date || end_date) {
        where.login_time = {};
        if (start_date) {
          where.login_time.gte = new Date(start_date as string);
        }
        if (end_date) {
          where.login_time.lte = new Date(end_date as string);
        }
      }

      // Get total count
      const total = await prisma.login_history.count({ where });

      // Get paginated data
      const loginHistory = await prisma.login_history.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { login_time: 'desc' },
        include: {
          users_login_history_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Calculate statistics
      const totalLogins = await prisma.login_history.count();
      const successfulLogins = await prisma.login_history.count({
        where: { login_status: 'success' },
      });
      const failedLogins = await prisma.login_history.count({
        where: { login_status: 'failed' },
      });
      const todayLogins = await prisma.login_history.count({
        where: {
          login_time: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const paginatedData = {
        data: loginHistory.map(serializeLoginHistory),
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total / limitNum),
          total_count: total,
          has_next: pageNum * limitNum < total,
          has_previous: pageNum > 1,
        },
      };

      res.json({
        success: true,
        data: paginatedData.data,
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...paginatedData.pagination,
        },
        stats: {
          total_logins: totalLogins,
          successful_logins: successfulLogins,
          failed_logins: failedLogins,
          today_logins: todayLogins,
        },
      });
    } catch (error) {
      console.error('Error fetching login history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch login history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getLoginHistoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loginHistoryId = Number(id);

      if (isNaN(loginHistoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid login history ID',
        });
      }

      const loginHistory = await prisma.login_history.findUnique({
        where: { id: loginHistoryId },
        include: {
          users_login_history_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!loginHistory) {
        return res.status(404).json({
          success: false,
          message: 'Login history not found',
        });
      }

      res.json({
        success: true,
        data: serializeLoginHistory(loginHistory),
      });
    } catch (error) {
      console.error('Error fetching login history by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch login history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async updateLoginHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loginHistoryId = Number(id);
      const data = req.body;

      if (isNaN(loginHistoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid login history ID',
        });
      }

      // Check if login history exists
      const existingLoginHistory = await prisma.login_history.findUnique({
        where: { id: loginHistoryId },
      });

      if (!existingLoginHistory) {
        return res.status(404).json({
          success: false,
          message: 'Login history not found',
        });
      }

      const updatedLoginHistory = await prisma.login_history.update({
        where: { id: loginHistoryId },
        data: {
          ...data,
          updatedate: new Date(),
          updatedby: data.updatedby
            ? Number(data.updatedby)
            : existingLoginHistory.createdby,
        },
        include: {
          users_login_history_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: serializeLoginHistory(updatedLoginHistory),
        message: 'Login history updated successfully',
      });
    } catch (error) {
      console.error('Error updating login history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update login history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async deleteLoginHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loginHistoryId = Number(id);

      if (isNaN(loginHistoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid login history ID',
        });
      }

      // Check if login history exists
      const existingLoginHistory = await prisma.login_history.findUnique({
        where: { id: loginHistoryId },
      });

      if (!existingLoginHistory) {
        return res.status(404).json({
          success: false,
          message: 'Login history not found',
        });
      }

      await prisma.login_history.delete({
        where: { id: loginHistoryId },
      });

      res.json({
        success: true,
        message: 'Login history deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting login history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete login history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
