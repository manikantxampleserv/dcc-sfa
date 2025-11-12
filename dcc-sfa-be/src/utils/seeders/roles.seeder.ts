/**
 * @fileoverview Roles Seeder
 * @description Creates 11 sample roles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockRole {
  name: string;
  description?: string;
  is_active: string;
  permissions?: string[];
}

const mockRoles: MockRole[] = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Admin',
    description: 'Administrative access with most permissions',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Users',
      'Write Users',
      'Update Users',
      'Delete Users',
      'Read Roles',
      'Write Roles',
      'Update Roles',
      'Delete Roles',
      'Read Company',
      'Write Company',
      'Update Company',
      'Delete Company',
      'Read Depots',
      'Write Depots',
      'Update Depots',
      'Delete Depots',
      'Read Zones',
      'Write Zones',
      'Update Zones',
      'Delete Zones',
      'Read Routes',
      'Write Routes',
      'Update Routes',
      'Delete Routes',
      'Read Outlets',
      'Write Outlets',
      'Update Outlets',
      'Delete Outlets',
      'Read Products',
      'Write Products',
      'Update Products',
      'Delete Products',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Delete Customers',
      'Read Reports',
      'Write Reports',
      'Update Reports',
      'Read Settings',
    ],
  },
  {
    name: 'Manager',
    description: 'Management role with oversight permissions',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Sales Target Groups',
      'Write Sales Target Groups',
      'Update Sales Target Groups',
      'Delete Sales Target Groups',
      'Read Sales Targets',
      'Write Sales Targets',
      'Update Sales Targets',
      'Delete Sales Targets',
      'Read Sales Bonus Rules',
      'Write Sales Bonus Rules',
      'Update Sales Bonus Rules',
      'Delete Sales Bonus Rules',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Delete Orders',
      'Read Visits',
      'Write Visits',
      'Update Visits',
      'Delete Visits',
      'Read Payments',
      'Write Payments',
      'Update Payments',
      'Delete Payments',
      'Read Invoices',
      'Write Invoices',
      'Update Invoices',
      'Delete Invoices',
      'Read Reports',
      'Write Reports',
      'Update Reports',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Delete Customers',
    ],
  },
  {
    name: 'Sales Manager',
    description: 'Sales team management and reporting',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Sales Target Groups',
      'Write Sales Target Groups',
      'Update Sales Target Groups',
      'Delete Sales Target Groups',
      'Read Sales Targets',
      'Write Sales Targets',
      'Update Sales Targets',
      'Delete Sales Targets',
      'Read Sales Bonus Rules',
      'Write Sales Bonus Rules',
      'Update Sales Bonus Rules',
      'Delete Sales Bonus Rules',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Delete Orders',
      'Read Visits',
      'Write Visits',
      'Update Visits',
      'Delete Visits',
      'Read Payments',
      'Write Payments',
      'Update Payments',
      'Delete Payments',
      'Read Invoices',
      'Write Invoices',
      'Update Invoices',
      'Delete Invoices',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Delete Customers',
      'Read Products',
      'Write Products',
      'Update Products',
      'Delete Products',
      'Read Reports',
      'Write Reports',
      'Update Reports',
    ],
  },
  {
    name: 'Sales Representative',
    description: 'Field sales and customer interaction',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Read Visits',
      'Write Visits',
      'Update Visits',
      'Read Payments',
      'Write Payments',
      'Update Payments',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Read Products',
      'Read Reports',
    ],
  },
  {
    name: 'Warehouse Manager',
    description: 'Inventory and warehouse operations',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Warehouses',
      'Write Warehouses',
      'Update Warehouses',
      'Delete Warehouses',
      'Read Inventory',
      'Write Inventory',
      'Update Inventory',
      'Delete Inventory',
      'Read Asset Master',
      'Write Asset Master',
      'Update Asset Master',
      'Delete Asset Master',
      'Read Asset Types',
      'Write Asset Types',
      'Update Asset Types',
      'Delete Asset Types',
      'Read Asset Movement',
      'Write Asset Movement',
      'Update Asset Movement',
      'Delete Asset Movement',
      'Read Van Stock',
      'Write Van Stock',
      'Update Van Stock',
      'Delete Van Stock',
      'Read Products',
      'Write Products',
      'Update Products',
      'Delete Products',
      'Read Reports',
      'Write Reports',
      'Update Reports',
    ],
  },
  {
    name: 'Warehouse Staff',
    description: 'Basic warehouse operations and inventory',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Warehouses',
      'Write Warehouses',
      'Update Warehouses',
      'Read Inventory',
      'Write Inventory',
      'Update Inventory',
      'Read Asset Master',
      'Write Asset Master',
      'Update Asset Master',
      'Read Asset Movement',
      'Write Asset Movement',
      'Update Asset Movement',
      'Read Van Stock',
      'Write Van Stock',
      'Update Van Stock',
      'Read Products',
      'Write Products',
      'Update Products',
    ],
  },
  {
    name: 'Finance Manager',
    description: 'Financial reporting and budget management',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Delete Orders',
      'Read Payments',
      'Write Payments',
      'Update Payments',
      'Delete Payments',
      'Read Invoices',
      'Write Invoices',
      'Update Invoices',
      'Delete Invoices',
      'Read Credit Notes',
      'Write Credit Notes',
      'Update Credit Notes',
      'Delete Credit Notes',
      'Read Currency',
      'Write Currency',
      'Update Currency',
      'Delete Currency',
      'Read Pricelists',
      'Write Pricelists',
      'Update Pricelists',
      'Delete Pricelists',
      'Read Reports',
      'Write Reports',
      'Update Reports',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Delete Customers',
    ],
  },
  {
    name: 'Finance Staff',
    description: 'Basic financial operations and data entry',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Read Payments',
      'Write Payments',
      'Update Payments',
      'Read Invoices',
      'Write Invoices',
      'Update Invoices',
      'Read Credit Notes',
      'Write Credit Notes',
      'Update Credit Notes',
      'Read Reports',
      'Read Customers',
      'Write Customers',
      'Update Customers',
    ],
  },
  {
    name: 'Customer Service',
    description: 'Customer support and issue resolution',
    is_active: 'Y',
    permissions: [
      'Read Dashboard',
      'Write Dashboard',
      'Update Dashboard',
      'Read Customers',
      'Write Customers',
      'Update Customers',
      'Read Orders',
      'Write Orders',
      'Update Orders',
      'Read Returns',
      'Write Returns',
      'Update Returns',
      'Read Visits',
      'Write Visits',
      'Update Visits',
      'Read Reports',
    ],
  },
  {
    name: 'Guest User',
    description: 'Limited access for temporary users',
    is_active: 'N',
    permissions: [
      'Read Dashboard',
      'Read Products',
      'Read Customers',
      'Read Orders',
    ],
  },
];

/**
 * Seed Roles with mock data
 */
export async function seedRoles(): Promise<void> {
  try {
    for (const role of mockRoles) {
      const existingRole = await prisma.roles.findFirst({
        where: { name: role.name },
      });

      let roleId: number;

      if (!existingRole) {
        const newRole = await prisma.roles.create({
          data: {
            name: role.name,
            description: role.description,
            is_active: role.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
        roleId = newRole.id;
      } else {
        roleId = existingRole.id;
      }

      // Assign permissions to the role
      if (role.permissions && role.permissions.length > 0) {
        const needsUpdate = await checkIfPermissionsNeedUpdate(
          roleId,
          role.permissions
        );
        if (needsUpdate) {
          await assignPermissionsToRole(roleId, role.permissions);
        } else {
          //do nothing
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Check if role permissions need to be updated
 */
async function checkIfPermissionsNeedUpdate(
  roleId: number,
  expectedPermissionNames: string[]
): Promise<boolean> {
  try {
    if (expectedPermissionNames.includes('*')) {
      const allPermissions = await prisma.permissions.findMany({
        where: { is_active: 'Y' },
        select: { id: true },
      });

      const expectedPermissionIds = allPermissions.map(p => p.id).sort();

      const currentRolePermissions = await prisma.role_permissions.findMany({
        where: {
          role_id: roleId,
          is_active: 'Y',
        },
        select: { permission_id: true },
      });

      const currentPermissionIds = currentRolePermissions
        .map(rp => rp.permission_id)
        .sort();

      if (expectedPermissionIds.length !== currentPermissionIds.length) {
        return true;
      }

      for (let i = 0; i < expectedPermissionIds.length; i++) {
        if (expectedPermissionIds[i] !== currentPermissionIds[i]) {
          return true;
        }
      }

      return false;
    }

    const expectedPermissions = await prisma.permissions.findMany({
      where: {
        name: { in: expectedPermissionNames },
        is_active: 'Y',
      },
      select: { id: true },
    });

    const expectedPermissionIds = expectedPermissions.map(p => p.id).sort();

    const currentRolePermissions = await prisma.role_permissions.findMany({
      where: {
        role_id: roleId,
        is_active: 'Y',
      },
      select: { permission_id: true },
    });

    const currentPermissionIds = currentRolePermissions
      .map(rp => rp.permission_id)
      .sort();

    // Compare arrays
    if (expectedPermissionIds.length !== currentPermissionIds.length) {
      return true;
    }

    for (let i = 0; i < expectedPermissionIds.length; i++) {
      if (expectedPermissionIds[i] !== currentPermissionIds[i]) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return true;
  }
}

/**
 * Assign permissions to a role
 */
async function assignPermissionsToRole(
  roleId: number,
  permissionNames: string[]
): Promise<void> {
  try {
    if (permissionNames.includes('*')) {
      const allPermissions = await prisma.permissions.findMany({
        where: { is_active: 'Y' },
        select: { id: true },
      });

      const permissionIds = allPermissions.map(p => p.id);
      await assignPermissionIdsToRole(roleId, permissionIds);
      return;
    }

    const permissions = await prisma.permissions.findMany({
      where: {
        name: { in: permissionNames },
        is_active: 'Y',
      },
      select: { id: true, name: true },
    });

    const permissionIds = permissions.map(p => p.id);
    await assignPermissionIdsToRole(roleId, permissionIds);
  } catch (error) {
    throw error;
  }
}

/**
 * Assign permission IDs to a role
 */
async function assignPermissionIdsToRole(
  roleId: number,
  permissionIds: number[]
): Promise<void> {
  await prisma.role_permissions.deleteMany({
    where: { role_id: roleId },
  });

  if (permissionIds.length > 0) {
    const rolePermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      log_inst: 1,
    }));

    await prisma.role_permissions.createMany({
      data: rolePermissions,
    });
  }
}

/**
 * Clear Roles data
 */
export async function clearRoles(): Promise<void> {
  try {
    await prisma.role_permissions.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockRoles };
