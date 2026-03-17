import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

export interface ColumnPreferences {
  [columnName: string]: boolean;
}

export const columnPreferencesController = {
  async getAllUserPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const allPreferences = await prisma.user_column_preferences.findMany({
        where: {
          createdby: userId,
        },
        select: {
          route: true,
          preferences: true,
          updatedate: true,
        },
      });

      const parsedPreferences = allPreferences.map(pref => ({
        ...pref,
        preferences: JSON.parse(pref.preferences),
      }));

      return res.json({
        success: true,
        message: 'All user preferences retrieved successfully',
        data: parsedPreferences,
      });
    } catch (error: any) {
      console.error('Get all user preferences error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve all user preferences',
        error: error.message,
      });
    }
  },

  async saveColumnPreferences(req: Request, res: Response) {
    try {
      const { route, preferences } = req.body;
      const userId = (req as any).user?.id;

      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route is required in request body',
        });
      }

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Preferences object is required',
        });
      }

      const allBooleans = Object.values(preferences).every(
        value => typeof value === 'boolean'
      );
      if (!allBooleans) {
        return res.status(400).json({
          success: false,
          message: 'All preference values must be boolean',
        });
      }

      await prisma.user_column_preferences.upsert({
        where: {
          createdby_route: {
            createdby: userId,
            route: route,
          },
        },
        update: {
          preferences: JSON.stringify(preferences),
          updatedate: new Date(),
          updatedby: userId,
        },
        create: {
          route: route,
          preferences: JSON.stringify(preferences),
          createdby: userId,
          createdate: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Column preferences saved successfully',
        data: preferences,
      });
    } catch (error: any) {
      console.error('Save column preferences error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save column preferences',
        error: error.message,
      });
    }
  },
};
