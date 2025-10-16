// services/permissionService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PermissionCheck {
  module: string;
  action: string;
}

export interface UserPermissions {
  userId: number;
  roleId: number;
  roleName: string;
  roleLevel: number;
  permissions: PermissionCheck[];
}

export class PermissionService {
  static async hasPermission(
    userId: number,
    module: string,
    action: string
  ): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.role_id) return false;

    const role = await prisma.roles.findUnique({
      where: { id: user.role_id },
      include: {
        roles_permission: {
          where: { is_active: 'Y' },
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return false;

    return role.roles_permission.some(
      rp =>
        rp.permission?.module === module &&
        rp.permission?.action === action &&
        rp.permission?.is_active === 'Y'
    );
  }

  static async getUserPermissions(
    userId: number
  ): Promise<UserPermissions | null> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.role_id) return null;

    const role = await prisma.roles.findUnique({
      where: { id: user.role_id },
      include: {
        roles_permission: {
          where: { is_active: 'Y' },
          include: {
            permission: {
              where: { is_active: 'Y' },
            },
          },
        },
      },
    });

    if (!role) return null;

    const permissions: PermissionCheck[] = role.roles_permission
      .filter(rp => rp.permission)
      .map(rp => ({
        module: rp.permission!.module,
        action: rp.permission!.action,
      }));

    return {
      userId: user.id,
      roleId: role.id,
      roleName: role.name,
      roleLevel: role.level,
      permissions,
    };
  }

  static async canRolePerform(
    roleId: number,
    module: string,
    action: string
  ): Promise<boolean> {
    const permission = await prisma.role_permissions.findFirst({
      where: {
        role_id: roleId,
        is_active: 'Y',
        permission: {
          module,
          action,
          is_active: 'Y',
        },
      },
    });

    return !!permission;
  }

  static async getRolePermissionsByModule(roleId: number) {
    const permissions = await prisma.role_permissions.findMany({
      where: {
        role_id: roleId,
        is_active: 'Y',
      },
      include: {
        permission: {
          where: { is_active: 'Y' },
        },
      },
    });

    const grouped = permissions.reduce((acc: any, rp) => {
      if (!rp.permission) return acc;

      const module = rp.permission.module;
      if (!acc[module]) {
        acc[module] = {
          module,
          actions: [],
        };
      }
      acc[module].actions.push({
        action: rp.permission.action,
        permissionId: rp.permission.id,
      });
      return acc;
    }, {});

    return Object.values(grouped);
  }

  static async canAccessHierarchy(
    userRoleLevel: number,
    targetRoleLevel: number
  ): Promise<boolean> {
    return userRoleLevel >= targetRoleLevel;
  }

  static async getDataAccessScope(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.role_id) return { scope: 'none', level: 0 };

    const role = await prisma.roles.findUnique({
      where: { id: user.role_id },
    });

    if (!role) return { scope: 'none', level: 0 };

    const roleLevel = role.level;

    const accessScopes = {
      5: 'global',
      4: 'regional',
      3: 'team',
      2: 'supervised',
      1: 'self',
    };

    return {
      scope: accessScopes[roleLevel as keyof typeof accessScopes] || 'self',
      level: roleLevel,
      userId,
      roleId: role.id,
      roleName: role.name,
    };
  }

  /**
   * Bulk assign permissions to a role
   */
  /**
   * Bulk assign permissions to a role (handles duplicates manually)
   */
  static async bulkAssignPermissions(
    roleId: number,
    permissionIds: number[],
    userId: number
  ) {
    return await prisma.$transaction(async tx => {
      await tx.role_permissions.deleteMany({
        where: { role_id: roleId },
      });

      if (permissionIds.length > 0) {
        const uniquePermissionIds = [...new Set(permissionIds)];

        const rolePermissions = uniquePermissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
          is_active: 'Y',
          createdby: userId,
          createdate: new Date(),
          log_inst: 1,
        }));

        await tx.role_permissions.createMany({
          data: rolePermissions,
        });
      }

      return true;
    });
  }

  static async getPermissionMatrix() {
    const roles = await prisma.roles.findMany({
      where: { is_active: 'Y' },
      orderBy: { level: 'desc' },
    });

    const permissions = await prisma.permissions.findMany({
      where: { is_active: 'Y' },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    const rolePermissions = await prisma.role_permissions.findMany({
      where: { is_active: 'Y' },
    });

    const rpMap = new Map();
    rolePermissions.forEach(rp => {
      const key = `${rp.role_id}-${rp.permission_id}`;
      rpMap.set(key, true);
    });

    const matrix = {
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        level: r.level,
        description: r.description,
      })),
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        module: p.module,
        action: p.action,
        roles: roles.map(r => ({
          roleId: r.id,
          hasPermission: rpMap.has(`${r.id}-${p.id}`),
        })),
      })),
    };

    return matrix;
  }

  static async cloneRolePermissions(
    sourceRoleId: number,
    targetRoleId: number,
    userId: number
  ) {
    const sourcePermissions = await prisma.role_permissions.findMany({
      where: {
        role_id: sourceRoleId,
        is_active: 'Y',
      },
    });

    const permissionIds = sourcePermissions.map(sp => sp.permission_id);

    return await this.bulkAssignPermissions(
      targetRoleId,
      permissionIds,
      userId
    );
  }

  static async getUserRoleLevel(userId: number): Promise<number> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.role_id) return 0;

    const role = await prisma.roles.findUnique({
      where: { id: user.role_id },
    });

    return role?.level || 0;
  }

  static async hasAnyPermission(
    userId: number,
    permissions: { module: string; action: string }[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (await this.hasPermission(userId, perm.module, perm.action)) {
        return true;
      }
    }
    return false;
  }

  static async hasAllPermissions(
    userId: number,
    permissions: { module: string; action: string }[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (!(await this.hasPermission(userId, perm.module, perm.action))) {
        return false;
      }
    }
    return true;
  }

  static async getMultipleRolesPermissions(roleIds: number[]) {
    const permissions = await prisma.role_permissions.findMany({
      where: {
        role_id: { in: roleIds },
        is_active: 'Y',
      },
      include: {
        permission: {
          where: { is_active: 'Y' },
        },
        roles_permission: true,
      },
    });

    const grouped = permissions.reduce((acc: any, rp) => {
      if (!rp.permission) return acc;

      const roleId = rp.role_id;
      if (!acc[roleId]) {
        acc[roleId] = {
          roleId,
          roleName: rp.roles_permission?.name || '',
          permissions: [],
        };
      }

      acc[roleId].permissions.push({
        module: rp.permission.module,
        action: rp.permission.action,
      });

      return acc;
    }, {});

    return Object.values(grouped);
  }
}
