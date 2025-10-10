/**
 * @fileoverview Permissions Seeder
 * @description Creates 11 sample permissions for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockPermission {
  name: string;
  module: string;
  action: string;
  description?: string;
  is_active: string;
}

// Mock Permissions Data (11 permissions)
const mockPermissions: MockPermission[] = [
  {
    name: 'View Dashboard',
    module: 'dashboard',
    action: 'read',
    description: 'View dashboard and analytics',
    is_active: 'Y',
  },
  {
    name: 'Manage Users',
    module: 'users',
    action: 'write',
    description: 'Create, update, and delete users',
    is_active: 'Y',
  },
  {
    name: 'View Reports',
    module: 'reports',
    action: 'read',
    description: 'Access to all reports and analytics',
    is_active: 'Y',
  },
  {
    name: 'Manage Orders',
    module: 'orders',
    action: 'write',
    description: 'Create, update, and process orders',
    is_active: 'Y',
  },
  {
    name: 'Manage Inventory',
    module: 'inventory',
    action: 'write',
    description: 'Stock management and inventory operations',
    is_active: 'Y',
  },
  {
    name: 'Manage Customers',
    module: 'customers',
    action: 'write',
    description: 'Customer data management and updates',
    is_active: 'Y',
  },
  {
    name: 'Manage Products',
    module: 'products',
    action: 'write',
    description: 'Product catalog management',
    is_active: 'Y',
  },
  {
    name: 'Manage Sales Targets',
    module: 'sales',
    action: 'write',
    description: 'Sales target setting and management',
    is_active: 'Y',
  },
  {
    name: 'Manage Routes',
    module: 'routes',
    action: 'write',
    description: 'Route planning and management',
    is_active: 'Y',
  },
  {
    name: 'Manage Assets',
    module: 'assets',
    action: 'write',
    description: 'Asset tracking and management',
    is_active: 'Y',
  },
  {
    name: 'System Settings',
    module: 'settings',
    action: 'admin',
    description: 'System configuration and settings',
    is_active: 'N',
  },
];

/**
 * Seed Permissions with mock data
 */
export async function seedPermissions(): Promise<void> {
  try {
    for (const permission of mockPermissions) {
      const existingPermission = await prisma.permissions.findFirst({
        where: {
          name: permission.name,
          module: permission.module,
          action: permission.action,
        },
      });

      if (!existingPermission) {
        await prisma.permissions.create({
          data: {
            name: permission.name,
            module: permission.module,
            action: permission.action,
            description: permission.description,
            is_active: permission.is_active,
            createdate: new Date(),
            createdby: 1,
            updatedate: new Date(),
            updatedby: 1,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Permissions data
 */
export async function clearPermissions(): Promise<void> {
  try {
    await prisma.permissions.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockPermissions };
