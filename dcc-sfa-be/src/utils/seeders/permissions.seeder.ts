/**
 * @fileoverview Permissions Seeder
 * @description Creates 11 sample permissions for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockPermission {
  name: string;
  module: string;
  action: string;
  description?: string;
  is_active: string;
}

const MODULES = [
  // Dashboards
  'dashboard',

  // Masters
  'company',
  'user',
  'role',
  'depot',
  'zone',
  'currency',
  'route',
  'outlet',
  'outlet-group',
  'asset-type',
  'asset-master',
  'warehouse',
  'vehicle',
  'brand',
  'product-category',
  'product-sub-category',
  'unit-of-measurement',
  'product',
  'pricelist',
  'sales-target-group',
  'sales-target',
  'sales-bonus-rule',
  'kpi-target',
  'survey',

  // Transactions
  'order',
  'delivery',
  'return',
  'payment',
  'invoice',
  'credit-note',
  'visit',
  'asset-movement',
  'maintenance',
  'installation',
  'van-stock',
  'competitor',

  // Tracking
  'location',
  'route-effectiveness',

  // Integration
  'erp-sync',

  // Reports
  'report',

  // Workflows
  'approval',
  'exception',
  'alert',

  // Settings
  'profile',
  'login-history',
  'token',
  'setting',
];

const ACTIONS = [
  { key: 'read', name: 'Read', description: 'View and access data' },
  { key: 'create', name: 'Create', description: 'Create new records' },
  { key: 'update', name: 'Update', description: 'Modify existing records' },
  { key: 'approve', name: 'Approve', description: 'Approve records' },
  { key: 'delete', name: 'Delete', description: 'Remove records' },
];

const mockPermissions: MockPermission[] = [];

// Modules that should not have delete permissions (read-only or system modules)
const READ_ONLY_MODULES = [
  'dashboard',
  'reports',
  'location',
  'route-effectiveness',
  'erp-sync',
  'profile',
  'login-history',
];

// Generate CRUD permissions for each module
MODULES.forEach(module => {
  ACTIONS.forEach(action => {
    // Skip delete action for read-only modules
    if (READ_ONLY_MODULES.includes(module) && action.key === 'delete') {
      return;
    }

    // Skip write/update/delete for settings (admin only)
    if (module === 'settings' && action.key !== 'read') {
      return;
    }

    // Format module name for display
    const moduleDisplayName = module
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    mockPermissions.push({
      name: `${module}.${action.key}`,
      module,
      action: action.key,
      description: `${action.description} for ${moduleDisplayName} module`,
      is_active: 'Y',
    });
  });
});

/**
 * Seed Permissions with mock data
 */
export async function seedPermissions(): Promise<void> {
  try {
    // Use createMany for better performance
    const permissionsToCreate = [];

    for (const permission of mockPermissions) {
      const existingPermission = await prisma.permissions.findFirst({
        where: {
          name: permission.name,
        },
      });

      if (!existingPermission) {
        permissionsToCreate.push({
          name: permission.name,
          module: permission.module,
          action: permission.action,
          description: permission.description,
          is_active: permission.is_active,
          createdate: new Date(),
          createdby: 1,
          updatedate: new Date(),
          updatedby: 1,
        });
      }
    }

    if (permissionsToCreate.length > 0) {
      await prisma.permissions.createMany({
        data: permissionsToCreate,
      });
    } else {
      // do nothing
    }
  } catch (error) {
    console.error('Error seeding permissions:', error);
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
