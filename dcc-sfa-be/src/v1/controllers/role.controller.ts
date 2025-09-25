import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

const serializeRole = (
  role: any,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  user_id: role.user_id,
  is_active: role.is_active,
  ...(includeCreatedAt && { created_at: role.createdate }),
  ...(includeUpdatedAt && { updated_at: role.updatedate }),
  permissions: role.roles_permission
    ? role.roles_permission.map((rp: any) => ({
        permission_id: rp.permission_id,
        is_active: rp.is_active,
      }))
    : [],
  user_role: role.user_role
    ? role.user_role.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }))
    : [],
});

export const rolesController = {
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const {
        name,
        description,
        user_id,
        is_active,
        permissions = [],
      } = req.body;

      const existingRole = await prisma.roles.findFirst({
        where: {
          name,
          is_active: 'Y',
        },
      });

      if (existingRole) {
        res.error('Role name already exists', 400);
        return;
      }

      const result = await prisma.$transaction(async tx => {
        const newRole = await tx.roles.create({
          data: {
            name,
            description,
            user_id,
            is_active: is_active ?? 'Y',
            createdby: req.user?.id ?? 0,
            createdate: new Date(),
            log_inst: 1,
          },
          include: {
            roles_permission: true,
            user_role: true,
          },
        });

        if (permissions.length > 0) {
          await tx.role_permissions.createMany({
            data: permissions.map((permissionId: number) => ({
              role_id: newRole.id,
              permission_id: permissionId,
              createdby: req.user?.id ?? 0,
              createdate: new Date(),
              log_inst: 1,
            })),
          });

          const roleWithPermissions = await tx.roles.findUnique({
            where: { id: newRole.id },
            include: {
              roles_permission: true,
              user_role: true,
            },
          });

          return roleWithPermissions;
        }

        return newRole;
      });

      res.success('Role created successfully', serializeRole(result), 201);
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.error(error.message);
    }
  },

  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const id = Number(req.params.id);
      const role = await prisma.roles.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
          },
          user_role: {
            where: { is_active: 'Y' },
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!role) {
        res.error('Role not found', 404);
        return;
      }

      res.success('Role fetched successfully', serializeRole(role), 200);
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.error(error.message);
    }
  },

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const id = Number(req.params.id);
      const { createdate, updatedate, ...roleData } = req.body;

      if ('id' in roleData) {
        delete roleData.id;
      }

      const existingRole = await prisma.roles.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
      });

      if (!existingRole) {
        res.error('Role not found', 404);
        return;
      }

      if (roleData.name && roleData.name !== existingRole.name) {
        const nameExists = await prisma.roles.findFirst({
          where: {
            name: roleData.name,
            is_active: 'Y',
            id: { not: id },
          },
        });

        if (nameExists) {
          res.error('Role name already exists', 400);
          return;
        }
      }

      // Update role and permissions in a transaction
      const result = await prisma.$transaction(async tx => {
        const updatedRole = await tx.roles.update({
          where: { id },
          data: {
            ...roleData,
            updatedby: req.user?.id ?? 0,
            updatedate: new Date(),
          },
          include: {
            roles_permission: {
              where: { is_active: 'Y' },
            },
            user_role: {
              where: { is_active: 'Y' },
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (roleData.permissions) {
          await tx.role_permissions.updateMany({
            where: { role_id: id },
            data: {
              is_active: 'N',
              updatedby: req.user?.id ?? 0,
              updatedate: new Date(),
            },
          });

          if (roleData.permissions.length > 0) {
            await tx.role_permissions.createMany({
              data: roleData.permissions.map((permissionId: number) => ({
                role_id: id,
                permission_id: permissionId,
                createdby: req.user?.id ?? 0,
                createdate: new Date(),
                log_inst: 1,
              })),
            });
          }

          const roleWithPermissions = await tx.roles.findUnique({
            where: { id },
            include: {
              roles_permission: {
                where: { is_active: 'Y' },
              },
              user_role: {
                where: { is_active: 'Y' },
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

          return roleWithPermissions;
        }

        return updatedRole;
      });

      res.success('Role updated successfully', serializeRole(result), 200);
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.error(error.message);
    }
  },

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const id = Number(req.params.id);

      const existingRole = await prisma.roles.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
      });

      if (!existingRole) {
        res.error('Role not found', 404);
        return;
      }

      const usersWithRole = await prisma.users.count({
        where: {
          role_id: id,
          is_active: 'Y',
        },
      });

      if (usersWithRole > 0) {
        res.error('Cannot delete role as it is assigned to users', 400);
        return;
      }

      await prisma.$transaction(async tx => {
        await tx.roles.update({
          where: { id },
          data: {
            is_active: 'N',
            updatedby: req.user?.id ?? 0,
            updatedate: new Date(),
          },
        });

        await tx.role_permissions.updateMany({
          where: { role_id: id },
          data: {
            is_active: 'N',
            updatedby: req.user?.id ?? 0,
            updatedate: new Date(),
          },
        });
      });

      res.success('Role deleted successfully', 200);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.error(error.message);
    }
  },

  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive = 'Y',
      } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
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
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.roles,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
          },
          user_role: {
            where: { is_active: 'Y' },
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success(
        'Roles retrieved successfully',
        data.map((role: any) => serializeRole(role, true, true)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.error(error.message);
    }
  },

  async assignPermissions(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const id = Number(req.params.id);
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        res.error('Permissions must be an array', 400);
        return;
      }

      const role = await prisma.roles.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
      });

      if (!role) {
        res.error('Role not found', 404);
        return;
      }

      await prisma.$transaction(async tx => {
        await tx.role_permissions.updateMany({
          where: { role_id: id },
          data: {
            is_active: 'N',
            updatedby: req.user?.id ?? 0,
            updatedate: new Date(),
          },
        });

        if (permissions.length > 0) {
          await tx.role_permissions.createMany({
            data: permissions.map((permissionId: number) => ({
              role_id: id,
              permission_id: permissionId,
              createdby: req.user?.id ?? 0,
              createdate: new Date(),
              log_inst: 1,
            })),
          });
        }
      });

      res.success('Permissions assigned successfully', 200);
    } catch (error: any) {
      console.error('Error assigning permissions:', error);
      res.error(error.message);
    }
  },

  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        res.error(firstError.msg, 400);
        return;
      }

      const id = Number(req.params.id);

      const permissions = await prisma.role_permissions.findMany({
        where: {
          role_id: id,
          is_active: 'Y',
        },
        select: {
          permission_id: true,
        },
      });

      res.success(
        'Role permissions fetched successfully',
        permissions.map(p => p.permission_id),
        200
      );
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      res.error(error.message);
    }
  },
};
