import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

interface Permission {
  id: number;
  name: string;
  description: string | null;
  module: string;
  action: string;
  is_active: string;
  createdate: Date | null;
  updatedate: Date | null;
  createdby: number;
  updatedby: number | null;
}

const serializePermission = (
  permission: Permission,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: permission.id,
  name: permission.name,
  description: permission.description,
  module: permission.module,
  action: permission.action,
  is_active: permission.is_active,
  ...(includeCreatedAt && { created_at: permission.createdate }),
  ...(includeUpdatedAt && { updated_at: permission.updatedate }),
});

export const permissionsController = {
  async getAllPermissions(req: any, res: any): Promise<void> {
    try {
      const {
        page = '1',
        limit = '50',
        search = '',
        isActive,
        module,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
        ...(module && { module: module as string }),
        ...(search && {
          OR: [
            {
              name: {
                contains: searchLower,
              },
            },
            {
              description: {
                contains: searchLower,
              },
            },
            {
              module: {
                contains: searchLower,
              },
            },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.permissions,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: [{ module: 'asc' }, { name: 'asc' }],
      });

      res.success(
        'Permissions retrieved successfully',
        data.map((permission: any) =>
          serializePermission(permission as Permission, true, true)
        ),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      res.error(error.message);
    }
  },

  async getPermissionsByModule(req: any, res: any): Promise<void> {
    try {
      const { isActive } = req.query;

      const permissions = await prisma.permissions.findMany({
        where: {
          is_active: isActive as string,
        },
        orderBy: [{ module: 'asc' }, { name: 'asc' }],
      });

      // Group permissions by module
      const groupedPermissions = permissions.reduce(
        (acc: any, permission: any) => {
          const module = permission.module;
          if (!acc[module]) {
            acc[module] = {
              module,
              permissions: [],
            };
          }
          acc[module].permissions.push(
            serializePermission(permission as Permission)
          );
          return acc;
        },
        {}
      );

      const result = Object.values(groupedPermissions);

      res.success('Permissions by module retrieved successfully', result, 200);
    } catch (error: any) {
      console.error('Error fetching permissions by module:', error);
      res.error(error.message);
    }
  },

  async getPermissionById(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid permission ID', 400);
        return;
      }

      const permission = await prisma.permissions.findFirst({
        where: {
          id: id,
          is_active: 'Y',
        },
      });

      if (!permission) {
        res.error('Permission not found', 404);
        return;
      }

      res.success(
        'Permission fetched successfully',
        serializePermission(permission as unknown as Permission),
        200
      );
    } catch (error: any) {
      console.error('Error fetching permission:', error);
      res.error(error.message);
    }
  },

  async createPermission(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, description, module, action, is_active } = req.body;

      const existingPermission = await prisma.permissions.findFirst({
        where: {
          name,
          is_active: 'Y',
        },
      });

      if (existingPermission) {
        res.error('Permission name already exists', 400);
        return;
      }

      const newPermission = await prisma.permissions.create({
        data: {
          name,
          description,
          module,
          action,
          is_active: is_active ?? 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
        },
      });

      res.success(
        'Permission created successfully',
        serializePermission(newPermission as unknown as Permission),
        201
      );
    } catch (error: any) {
      console.error('Error creating permission:', error);
      res.error(error.message);
    }
  },

  async updatePermission(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid permission ID', 400);
        return;
      }

      const { createdate, updatedate, ...permissionData } = req.body;

      // Remove id from update data if present
      if ('id' in permissionData) {
        delete permissionData.id;
      }

      // Check if permission exists
      const existingPermission = await prisma.permissions.findFirst({
        where: {
          id: id,
          is_active: 'Y',
        },
      });

      if (!existingPermission) {
        res.error('Permission not found', 404);
        return;
      }

      // Check if name is being changed and if new name already exists
      if (
        permissionData.name &&
        permissionData.name !== existingPermission.name
      ) {
        const nameExists = await prisma.permissions.findFirst({
          where: {
            name: permissionData.name,
            is_active: 'Y',
            id: { not: id },
          },
        });

        if (nameExists) {
          res.error('Permission name already exists', 400);
          return;
        }
      }

      const updatedPermission = await prisma.permissions.update({
        where: { id: id },
        data: {
          ...permissionData,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.success(
        'Permission updated successfully',
        serializePermission(updatedPermission as unknown as Permission),
        200
      );
    } catch (error: any) {
      console.error('Error updating permission:', error);
      res.error(error.message);
    }
  },

  async deletePermission(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid permission ID', 400);
        return;
      }

      const existingPermission = await prisma.permissions.findFirst({
        where: {
          id: id,
          is_active: 'Y',
        },
      });

      if (!existingPermission) {
        res.error('Permission not found', 404);
        return;
      }

      // Check if permission is being used by any roles
      const rolesWithPermission = await prisma.role_permissions.count({
        where: {
          permission_id: id,
          is_active: 'Y',
        },
      });

      if (rolesWithPermission > 0) {
        res.error('Cannot delete permission as it is assigned to roles', 400);
        return;
      }

      await prisma.permissions.delete({ where: { id: id } });
      res.success('Permission deleted successfully', null, 200);
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      res.error(error.message);
    }
  },
};
