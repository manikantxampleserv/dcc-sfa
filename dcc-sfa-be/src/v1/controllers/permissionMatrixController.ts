import { Request, Response } from 'express';
import { PermissionService } from '../services/permissionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const permissionMatrixController = {
  async getMatrix(req: any, res: any): Promise<void> {
    try {
      const matrix = await PermissionService.getPermissionMatrix();

      res.success('Permission matrix fetched successfully', matrix, 200);
    } catch (error: any) {
      console.error('Error fetching permission matrix:', error);
      res.error(error.message);
    }
  },

  async updateMatrix(req: any, res: any): Promise<void> {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        res.error('Updates must be an array', 400);
        return;
      }

      const results = await prisma.$transaction(async tx => {
        const updatePromises = updates.map(async (update: any) => {
          const { roleId, permissionId, enabled } = update;

          if (enabled) {
            const existing = await tx.role_permissions.findFirst({
              where: {
                role_id: roleId,
                permission_id: permissionId,
                is_active: 'Y',
              },
            });

            if (!existing) {
              return await tx.role_permissions.create({
                data: {
                  role_id: roleId,
                  permission_id: permissionId,
                  is_active: 'Y',
                  createdby: req.user?.id || 1,
                  createdate: new Date(),
                  log_inst: 1,
                },
              });
            }
            return existing;
          } else {
            return await tx.role_permissions.updateMany({
              where: {
                role_id: roleId,
                permission_id: permissionId,
              },
              data: {
                is_active: 'N',
                updatedby: req.user?.id || 1,
                updatedate: new Date(),
              },
            });
          }
        });

        return await Promise.all(updatePromises);
      });

      res.success(
        'Permission matrix updated successfully',
        { updated: results.length },
        200
      );
    } catch (error: any) {
      console.error('Error updating permission matrix:', error);
      res.error(error.message);
    }
  },

  async checkUserPermission(req: any, res: any): Promise<void> {
    try {
      const { module, action } = req.query;

      if (!module || !action) {
        res.error('Module and action are required', 400);
        return;
      }

      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        module as string,
        action as string
      );

      res.success('Permission check completed', { hasPermission }, 200);
    } catch (error: any) {
      console.error('Error checking permission:', error);
      res.error(error.message);
    }
  },

  async getUserPermissions(req: any, res: any): Promise<void> {
    try {
      const userId = req.params.userId
        ? Number(req.params.userId)
        : req.user.id;

      const permissions = await PermissionService.getUserPermissions(userId);

      if (!permissions) {
        res.error('User permissions not found', 404);
        return;
      }

      res.success('User permissions fetched successfully', permissions, 200);
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      res.error(error.message);
    }
  },

  async getDataAccessScope(req: any, res: any): Promise<void> {
    try {
      const userId = req.params.userId
        ? Number(req.params.userId)
        : req.user.id;

      const scope = await PermissionService.getDataAccessScope(userId);

      res.success('Data access scope fetched successfully', scope, 200);
    } catch (error: any) {
      console.error('Error fetching data access scope:', error);
      res.error(error.message);
    }
  },
};
