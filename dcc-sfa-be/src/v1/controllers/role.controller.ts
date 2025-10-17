// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { paginate } from '../../utils/paginate';
// import { validationResult } from 'express-validator';

// const prisma = new PrismaClient();

// const serializeRole = (
//   role: any,
//   includeCreatedAt = false,
//   includeUpdatedAt = false
// ) => ({
//   id: role.id,
//   name: role.name,
//   description: role.description,
//   // user_id: role.user_id,
//   is_active: role.is_active,
//   ...(includeCreatedAt && { created_at: role.createdate }),
//   ...(includeUpdatedAt && { updated_at: role.updatedate }),
//   permissions: role.roles_permission
//     ? role.roles_permission.map((rp: any) => ({
//         permission_id: rp.permission_id,
//         is_active: rp.is_active,
//         permission: rp.permissions
//           ? {
//               id: rp.permissions.id,
//               name: rp.permissions.name,
//               description: rp.permissions.description,
//               module: rp.permissions.module,
//             }
//           : null,
//       }))
//     : [],
//   user_role: role.user_role
//     ? role.user_role.map((user: any) => ({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       }))
//     : [],
// });

// export const rolesController = {
//   async createRole(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const {
//         name,
//         description,
//         // user_id,
//         is_active,
//         permissions = [],
//       } = req.body;

//       const existingRole = await prisma.roles.findFirst({
//         where: {
//           name,
//           is_active: 'Y',
//         },
//       });

//       if (existingRole) {
//         res.error('Role name already exists', 400);
//         return;
//       }

//       const result = await prisma.$transaction(async tx => {
//         const newRole = await tx.roles.create({
//           data: {
//             name,
//             description,
//             is_active: is_active ?? 'Y',
//             createdby: req.user?.id || 1,
//             createdate: new Date(),
//             log_inst: 1,
//           },
//           include: {
//             roles_permission: true,
//             user_role: true,
//           },
//         });

//         if (permissions.length > 0) {
//           await tx.role_permissions.createMany({
//             data: permissions.map((permissionId: number) => ({
//               role_id: newRole.id,
//               permission_id: permissionId,
//               createdby: req.user?.id ?? 0,
//               createdate: new Date(),
//               log_inst: 1,
//             })),
//           });

//           const roleWithPermissions = await tx.roles.findUnique({
//             where: { id: newRole.id },
//             include: {
//               roles_permission: true,
//               user_role: true,
//             },
//           });

//           return roleWithPermissions;
//         }

//         return newRole;
//       });

//       res.success('Role created successfully', serializeRole(result), 201);
//     } catch (error: any) {
//       console.error('Error creating role:', error);
//       res.error(error.message);
//     }
//   },

//   async getRoleById(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const id = Number(req.params.id);

//       console.log(req.params.id);

//       if (isNaN(id) || id <= 0) {
//         res.error('Invalid role ID', 400);
//         return;
//       }

//       const role = await prisma.roles.findFirst({
//         where: {
//           id: id,
//           is_active: 'Y',
//         },
//         include: {
//           roles_permission: {
//             where: { is_active: 'Y' },
//           },
//           user_role: {
//             where: { is_active: 'Y' },
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },
//         },
//       });

//       if (!role) {
//         res.error('Role not found', 404);
//         return;
//       }

//       res.success('Role fetched successfully', serializeRole(role), 200);
//     } catch (error: any) {
//       console.error('Error fetching role:', error);
//       res.error(error.message);
//     }
//   },

//   async updateRole(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const id = Number(req.params.id);

//       if (isNaN(id) || id <= 0) {
//         res.error('Invalid role ID', 400);
//         return;
//       }

//       const { createdate, updatedate, ...roleData } = req.body;

//       if ('id' in roleData) {
//         delete roleData.id;
//       }

//       if ('permissions' in roleData) {
//         delete roleData.permissions;
//       }

//       const existingRole = await prisma.roles.findFirst({
//         where: {
//           id: id,
//           is_active: 'Y',
//         },
//       });

//       if (!existingRole) {
//         res.error('Role not found', 404);
//         return;
//       }

//       if (roleData.name && roleData.name !== existingRole.name) {
//         const nameExists = await prisma.roles.findFirst({
//           where: {
//             name: roleData.name,
//             is_active: 'Y',
//             id: { not: id },
//           },
//         });

//         if (nameExists) {
//           res.error('Role name already exists', 400);
//           return;
//         }
//       }

//       const result = await prisma.$transaction(async tx => {
//         const updatedRole = await tx.roles.update({
//           where: { id: id },
//           data: {
//             ...roleData,
//             updatedby: req.user?.id ?? 0,
//             updatedate: new Date(),
//           },
//           include: {
//             roles_permission: {
//               where: { is_active: 'Y' },
//             },
//             user_role: {
//               where: { is_active: 'Y' },
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         });

//         if (roleData.permissions) {
//           await tx.role_permissions.updateMany({
//             where: { role_id: id },
//             data: {
//               is_active: 'N',
//               updatedby: req.user?.id ?? 0,
//               updatedate: new Date(),
//             },
//           });

//           if (roleData.permissions.length > 0) {
//             await tx.role_permissions.createMany({
//               data: roleData.permissions.map((permissionId: number) => ({
//                 role_id: id,
//                 permission_id: permissionId,
//                 createdby: req.user?.id || 1,
//                 createdate: new Date(),
//                 log_inst: 1,
//               })),
//             });
//           }

//           const roleWithPermissions = await tx.roles.findUnique({
//             where: { id: id },
//             include: {
//               roles_permission: {
//                 where: { is_active: 'Y' },
//               },
//               user_role: {
//                 where: { is_active: 'Y' },
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                 },
//               },
//             },
//           });

//           return roleWithPermissions;
//         }

//         return updatedRole;
//       });

//       res.success('Role updated successfully', serializeRole(result), 200);
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       res.error(error.message);
//     }
//   },

//   async deleteRole(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const id = Number(req.params.id);

//       if (isNaN(id) || id <= 0) {
//         res.error('Invalid role ID', 400);
//         return;
//       }

//       const existingRole = await prisma.roles.findFirst({
//         where: { id: id },
//       });

//       if (!existingRole) {
//         res.error('Role not found', 404);
//         return;
//       }

//       const usersWithRole = await prisma.users.count({
//         where: {
//           role_id: id,
//           is_active: 'Y',
//         },
//       });

//       if (usersWithRole > 0) {
//         res.error('Cannot delete role as it is assigned to users', 400);
//         return;
//       }

//       await prisma.$transaction(async tx => {
//         await tx.role_permissions.deleteMany({
//           where: { role_id: id },
//         });
//         await tx.roles.delete({
//           where: { id },
//         });
//       });

//       res.success('Role deleted successfully', null, 200);
//     } catch (error: any) {
//       console.error('Error deleting role:', error);
//       res.error(error.message);
//     }
//   },

//   async getAllRoles(req: any, res: any): Promise<void> {
//     try {
//       const { page = '1', limit = '10', search = '', isActive } = req.query;
//       const page_num = parseInt(page as string, 10);
//       const limit_num = parseInt(limit as string, 10);
//       const searchLower = (search as string).toLowerCase();

//       const filters: any = {
//         is_active: isActive as string,
//         ...(search && {
//           OR: [
//             {
//               name: {
//                 contains: searchLower,
//               },
//             },
//             {
//               description: {
//                 contains: searchLower,
//               },
//             },
//           ],
//         }),
//       };

//       const { data, pagination } = await paginate({
//         model: prisma.roles,
//         filters,
//         page: page_num,
//         limit: limit_num,
//         orderBy: { createdate: 'desc' },
//         include: {
//           roles_permission: {
//             where: { is_active: 'Y' },
//           },
//           user_role: {
//             where: { is_active: 'Y' },
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },
//         },
//       });

//       // Calculate role statistics
//       const totalRoles = await prisma.roles.count();
//       const activeRoles = await prisma.roles.count({
//         where: { is_active: 'Y' },
//       });
//       const inactiveRoles = await prisma.roles.count({
//         where: { is_active: 'N' },
//       });

//       // Calculate new roles this month
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

//       const newRolesThisMonth = await prisma.roles.count({
//         where: {
//           createdate: {
//             gte: startOfMonth,
//             lt: endOfMonth,
//           },
//         },
//       });

//       const stats = {
//         total_roles: totalRoles,
//         active_roles: activeRoles,
//         inactive_roles: inactiveRoles,
//         new_roles: newRolesThisMonth,
//       };

//       res.success(
//         'Roles retrieved successfully',
//         data.map((role: any) => serializeRole(role, true, true)),
//         200,
//         pagination,
//         stats
//       );
//     } catch (error: any) {
//       console.error('Error fetching roles:', error);
//       res.error(error.message);
//     }
//   },

//   async assignPermissions(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const id = Number(req.params.id);
//       const { permissions } = req.body;

//       if (!Array.isArray(permissions)) {
//         res.error('Permissions must be an array', 400);
//         return;
//       }

//       const role = await prisma.roles.findFirst({
//         where: {
//           id: id,
//           is_active: 'Y',
//         },
//       });

//       if (!role) {
//         res.error('Role not found', 404);
//         return;
//       }

//       await prisma.$transaction(async tx => {
//         // Deactivate existing permissions
//         await tx.role_permissions.updateMany({
//           where: { role_id: id },
//           data: {
//             is_active: 'N',
//             updatedby: req.user?.id ?? 0,
//             updatedate: new Date(),
//           },
//         });

//         // Create new permissions
//         if (permissions.length > 0) {
//           await tx.role_permissions.createMany({
//             data: permissions.map((permissionId: number) => ({
//               role_id: id,
//               permission_id: permissionId,
//               createdby: req.user?.id ?? 0,
//               createdate: new Date(),
//               log_inst: 1,
//             })),
//           });
//         }
//       });

//       res.success('Permissions assigned successfully', null, 200);
//     } catch (error: any) {
//       console.error('Error assigning permissions:', error);
//       res.error(error.message);
//     }
//   },

//   async getRolePermissions(req: any, res: any): Promise<void> {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.validationError(errors.array(), 400);
//         return;
//       }

//       const id = Number(req.params.id);

//       const permissions = await prisma.role_permissions.findMany({
//         where: {
//           role_id: id,
//           is_active: 'Y',
//         },
//         select: {
//           permission_id: true,
//         },
//       });

//       res.success(
//         'Role permissions fetched successfully',
//         permissions.map(p => p.permission_id),
//         200
//       );
//     } catch (error: any) {
//       console.error('Error fetching role permissions:', error);
//       res.error(error.message);
//     }
//   },
// };

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import { PermissionService } from '../services/permissionService';

const prisma = new PrismaClient();

const serializeRole = (
  role: any,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  level: role.level,
  is_active: role.is_active,
  ...(includeCreatedAt && { created_at: role.createdate }),
  ...(includeUpdatedAt && { updated_at: role.updatedate }),
  permissions: role.roles_permission
    ? role.roles_permission.map((rp: any) => ({
        permission_id: rp.permission_id,
        is_active: rp.is_active,
        permission: rp.permission
          ? {
              id: rp.permission.id,
              name: rp.permission.name,
              description: rp.permission.description,
              module: rp.permission.module,
              action: rp.permission.action,
            }
          : null,
      }))
    : [],
  user_count: role._count?.user_role || 0,
});

export const rolesController = {
  async createRole(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const {
        name,
        description,
        level = 1,
        is_active,
        permissions = [],
      } = req.body;

      const userScope = await PermissionService.getDataAccessScope(req.user.id);
      if (userScope.level < level) {
        res.error('Cannot create role with higher level than your own', 403);
        return;
      }

      const existingRole = await prisma.roles.findFirst({
        where: { name, is_active: 'Y' },
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
            level,
            is_active: is_active ?? 'Y',
            createdby: req.user?.id || 1,
            createdate: new Date(),
            log_inst: 1,
          },
        });

        if (permissions.length > 0) {
          await PermissionService.bulkAssignPermissions(
            newRole.id,
            permissions,
            req.user?.id || 1
          );
        }

        return await tx.roles.findUnique({
          where: { id: newRole.id },
          include: {
            roles_permission: {
              where: { is_active: 'Y' },
              include: { permission: true },
            },
            _count: {
              select: { user_role: true },
            },
          },
        });
      });

      res.success('Role created successfully', serializeRole(result), 201);
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.error(error.message);
    }
  },

  async getRoleById(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid role ID', 400);
        return;
      }

      const role = await prisma.roles.findFirst({
        where: { id: id, is_active: 'Y' },
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
            include: { permission: true },
          },
          _count: {
            select: { user_role: true },
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

  async updateRole(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid role ID', 400);
        return;
      }

      const { permissions, createdate, updatedate, ...roleData } = req.body;

      // Remove protected fields
      delete roleData.id;

      const existingRole = await prisma.roles.findFirst({
        where: { id: id, is_active: 'Y' },
      });

      if (!existingRole) {
        res.error('Role not found', 404);
        return;
      }

      // Check level permission
      if (roleData.level) {
        const userScope = await PermissionService.getDataAccessScope(
          req.user.id
        );
        if (userScope.level < roleData.level) {
          res.error('Cannot set role level higher than your own', 403);
          return;
        }
      }

      // Check name uniqueness
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

      const result = await prisma.$transaction(async tx => {
        const updatedRole = await tx.roles.update({
          where: { id: id },
          data: {
            ...roleData,
            updatedby: req.user?.id ?? 0,
            updatedate: new Date(),
          },
        });

        if (permissions !== undefined) {
          await PermissionService.bulkAssignPermissions(
            id,
            permissions,
            req.user?.id || 1
          );
        }

        return await tx.roles.findUnique({
          where: { id: id },
          include: {
            roles_permission: {
              where: { is_active: 'Y' },
              include: { permission: true },
            },
            _count: {
              select: { user_role: true },
            },
          },
        });
      });

      res.success('Role updated successfully', serializeRole(result), 200);
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.error(error.message);
    }
  },

  async deleteRole(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.error('Invalid role ID', 400);
        return;
      }

      const existingRole = await prisma.roles.findFirst({
        where: { id: id },
      });

      if (!existingRole) {
        res.error('Role not found', 404);
        return;
      }

      // Check if role is in use
      const usersWithRole = await prisma.users.count({
        where: { role_id: id, is_active: 'Y' },
      });

      if (usersWithRole > 0) {
        res.error(
          `Cannot delete role as it is assigned to ${usersWithRole} user(s)`,
          400
        );
        return;
      }

      // Check level permission
      const userScope = await PermissionService.getDataAccessScope(req.user.id);
      if (userScope.level <= existingRole.level) {
        res.error('Cannot delete role at same or higher level', 403);
        return;
      }

      await prisma.$transaction(async tx => {
        // Delete role permissions
        await tx.role_permissions.deleteMany({
          where: { role_id: id },
        });
        // Delete role
        await tx.roles.delete({
          where: { id },
        });
      });

      res.success('Role deleted successfully', null, 200);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.error(error.message);
    }
  },

  async getAllRoles(req: any, res: any): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive,
        level,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(level && { level: parseInt(level as string, 10) }),
        ...(search && {
          OR: [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.roles,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: [{ level: 'desc' }, { name: 'asc' }],
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
            include: { permission: true },
          },
          _count: {
            select: { user_role: true },
          },
        },
      });

      const stats = await prisma.$transaction([
        prisma.roles.count(),
        prisma.roles.count({ where: { is_active: 'Y' } }),
        prisma.roles.count({ where: { is_active: 'N' } }),
        prisma.roles.groupBy({
          by: ['level'],
          _count: true,
          orderBy: [{ level: 'desc' }],
        }),
      ]);

      const statistics = {
        total_roles: stats[0],
        active_roles: stats[1],
        inactive_roles: stats[2],
        by_level: stats[3],
      };

      res.success(
        'Roles retrieved successfully',
        data.map((role: any) => serializeRole(role, true, true)),
        200,
        pagination,
        statistics
      );
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.error(error.message);
    }
  },

  async assignPermissions(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        res.error('Permissions must be an array of permission IDs', 400);
        return;
      }

      const role = await prisma.roles.findFirst({
        where: { id: id, is_active: 'Y' },
      });

      if (!role) {
        res.error('Role not found', 404);
        return;
      }

      const userScope = await PermissionService.getDataAccessScope(req.user.id);
      if (userScope.level < role.level) {
        res.error(
          'Cannot modify permissions for role at same or higher level',
          403
        );
        return;
      }

      await PermissionService.bulkAssignPermissions(
        id,
        permissions,
        req.user?.id || 1
      );

      const updatedRole = await prisma.roles.findUnique({
        where: { id },
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
            include: { permission: true },
          },
        },
      });

      res.success(
        'Permissions assigned successfully',
        serializeRole(updatedRole),
        200
      );
    } catch (error: any) {
      console.error('Error assigning permissions:', error);
      res.error(error.message);
    }
  },

  async getRolePermissions(req: any, res: any): Promise<void> {
    try {
      const id = Number(req.params.id);

      const permissions =
        await PermissionService.getRolePermissionsByModule(id);

      res.success('Role permissions fetched successfully', permissions, 200);
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      res.error(error.message);
    }
  },

  async cloneRole(req: any, res: any): Promise<void> {
    try {
      const { sourceRoleId, newRoleName, newRoleDescription } = req.body;

      const sourceRole = await prisma.roles.findUnique({
        where: { id: sourceRoleId },
      });

      if (!sourceRole) {
        res.error('Source role not found', 404);
        return;
      }

      const userScope = await PermissionService.getDataAccessScope(req.user.id);
      if (userScope.level < sourceRole.level) {
        res.error('Cannot clone role at same or higher level', 403);
        return;
      }

      const newRole = await prisma.roles.create({
        data: {
          name: newRoleName,
          description: newRoleDescription || `Cloned from ${sourceRole.name}`,
          level: sourceRole.level,
          is_active: 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
      });

      await PermissionService.cloneRolePermissions(
        sourceRoleId,
        newRole.id,
        req.user?.id || 1
      );

      const roleWithPermissions = await prisma.roles.findUnique({
        where: { id: newRole.id },
        include: {
          roles_permission: {
            where: { is_active: 'Y' },
            include: { permission: true },
          },
        },
      });

      res.success(
        'Role cloned successfully',
        serializeRole(roleWithPermissions),
        201
      );
    } catch (error: any) {
      console.error('Error cloning role:', error);
      res.error(error.message);
    }
  },
};
