/**
 * @fileoverview Permissions Seeder
 * @description Creates 11 sample permissions for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

/**
 * @interface MockPermission
 * @description Permission data structure for seeding
 */
interface MockPermission {
  name: string;
  module: string;
  action: string;
  description?: string;
  is_active: string;
}

/**
 * @constant MODULE_MAPPING
 * @description Maps module keys to their display names for permission generation
 * @type {Record<string, string>}
 */
const MODULE_MAPPING: Record<string, string> = {
  dashboard: 'Dashboard',
  company: 'Company Master',
  user: 'User Management',
  role: 'Role & Permission',
  depot: 'Depot',
  zone: 'Zone',
  currency: 'Currency',
  route: 'Route',
  'route-type': 'Route Type',
  outlet: 'Outlet Master',
  'outlet-group': 'Outlet Group',
  'asset-type': 'Asset Type',
  'asset-master': 'Asset Master',
  warehouse: 'Warehouse',
  vehicle: 'Vehicle',
  brand: 'Brand',
  'product-category': 'Product Category',
  'product-sub-category': 'Product Sub Category',
  'unit-of-measurement': 'Unit Of Measurement',
  product: 'Product',
  pricelist: 'Price List',
  'sales-target-group': 'Sales Target Group',
  'sales-target': 'Sales Target',
  'sales-bonus-rule': 'Sales Bonus Rule',
  'kpi-target': 'KPI Target',
  survey: 'Survey',
  promotions: 'Promotions',
  order: 'Order',
  delivery: 'Delivery Schedule',
  return: 'Return Request',
  payment: 'Payment',
  invoice: 'Invoice',
  'credit-note': 'Credit Note',
  visit: 'Visit',
  'asset-movement': 'Asset Movement',
  maintenance: 'Asset Maintenance',
  installation: 'Cooler Installation',
  inspection: 'Cooler Inspection',
  'van-stock': 'Van Inventory',
  'stock-movement': 'Stock Movement',
  'stock-transfer': 'Stock Transfer Request',
  competitor: 'Competitor Activity',
  'customer-complaint': 'Customer Complaint',
  'customer-category': 'Customer Category',
  'customer-type': 'Customer Type',
  'customer-channel': 'Customer Channel',
  location: 'GPS Tracking',
  'route-effectiveness': 'Route Effectiveness',
  'erp-sync': 'ERP Sync',
  report: 'Report',
  approval: 'Approval Workflow',
  exception: 'Exception',
  alert: 'Alert',
  profile: 'Profile',
  'login-history': 'Login History',
  token: 'Token',
  setting: 'Setting',
};

/**
 * @constant MODULES
 * @description Array of all module keys extracted from MODULE_MAPPING
 * @type {string[]}
 */
const MODULES: string[] = Object.keys(MODULE_MAPPING);

/**
 * @constant ACTIONS
 * @description Available actions for permission generation
 * @type {Array<{key: string, name: string, description: string}>}
 */
const ACTIONS = [
  { key: 'read', name: 'READ', description: 'View and access data' },
  { key: 'create', name: 'CREATE', description: 'Create new records' },
  { key: 'update', name: 'UPDATE', description: 'Modify existing records' },
  { key: 'delete', name: 'DELETE', description: 'Remove records' },
];

/**
 * @constant mockPermissions
 * @description Generated permissions array populated during module iteration
 * @type {MockPermission[]}
 */
const mockPermissions: MockPermission[] = [];

/**
 * @constant READ_ONLY_MODULES
 * @description Modules that should not have delete permissions (read-only or system modules)
 * @type {string[]}
 */
const READ_ONLY_MODULES = [
  'dashboard',
  'report',
  'location',
  'route-effectiveness',
  'erp-sync',
  'profile',
  'login-history',
];

/**
 * @description Generates CRUD permissions for each module based on available actions
 * @description Iterates through all modules and actions to create permission entries
 */
MODULES.forEach(moduleKey => {
  ACTIONS.forEach(action => {
    if (READ_ONLY_MODULES.includes(moduleKey) && action.key === 'delete') {
      return;
    }

    if (moduleKey === 'setting' && action.key !== 'read') {
      return;
    }

    const moduleDisplayName = MODULE_MAPPING[moduleKey];
    const moduleNameForPermission = moduleKey.replace(/-/g, '_').toLowerCase();

    mockPermissions.push({
      name: `${moduleNameForPermission}_${action.key}`,
      module: moduleDisplayName,
      action: action.name,
      description: `${action.description} for ${moduleDisplayName}`,
      is_active: 'Y',
    });
  });
});

/**
 * @function seedPermissions
 * @description Seeds permissions table with generated mock permissions data
 * @description Uses createMany for better performance, only creates non-existing permissions
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
 */
export async function seedPermissions(): Promise<void> {
  try {
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
          description: permission.description || null,
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
    }
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  }
}

/**
 * @function clearPermissions
 * @description Clears all permissions and related role_permissions from the database
 * @description Deletes role_permissions first to avoid foreign key constraint violations
 * @returns {Promise<void>}
 * @throws {Error} If clearing fails
 */
export async function clearPermissions(): Promise<void> {
  try {
    await prisma.role_permissions.deleteMany({});
    await prisma.permissions.deleteMany({});
  } catch (error) {
    throw error;
  }
}

/**
 * @function addSinglePermission
 * @description Adds a single permission to the database
 * @param {string} moduleKey - Module key (e.g., 'user', 'company', 'depot')
 * @param {string} actionKey - Action key (e.g., 'read', 'create', 'update', 'delete')
 * @param {number} createdBy - User ID who is creating the permission (default: 1)
 * @returns {Promise<{success: boolean, message: string, permission?: any}>}
 * @throws {Error} If adding permission fails
 */
export async function addSinglePermission(
  moduleKey: string,
  actionKey: string,
  createdBy: number = 1
): Promise<{ success: boolean; message: string; permission?: any }> {
  try {
    const moduleDisplayName = MODULE_MAPPING[moduleKey];
    if (!moduleDisplayName) {
      return {
        success: false,
        message: `Invalid module key: ${moduleKey}. Available modules: ${MODULES.join(', ')}`,
      };
    }

    const action = ACTIONS.find(a => a.key === actionKey);
    if (!action) {
      return {
        success: false,
        message: `Invalid action key: ${actionKey}. Available actions: ${ACTIONS.map(a => a.key).join(', ')}`,
      };
    }

    if (READ_ONLY_MODULES.includes(moduleKey) && actionKey === 'delete') {
      return {
        success: false,
        message: `Module "${moduleKey}" does not support delete action`,
      };
    }

    if (moduleKey === 'setting' && actionKey !== 'read') {
      return {
        success: false,
        message: `Module "setting" only supports read action`,
      };
    }

    const moduleNameForPermission = moduleKey.replace(/-/g, '_').toLowerCase();
    const permissionName = `${moduleNameForPermission}_${actionKey}`;

    const existingPermission = await prisma.permissions.findFirst({
      where: {
        name: permissionName,
      },
    });

    if (existingPermission) {
      return {
        success: false,
        message: `Permission "${permissionName}" already exists`,
        permission: existingPermission,
      };
    }

    const permission = await prisma.permissions.create({
      data: {
        name: permissionName,
        module: moduleDisplayName,
        action: action.name,
        description: `${action.description} for ${moduleDisplayName}`,
        is_active: 'Y',
        createdate: new Date(),
        createdby: createdBy,
        updatedate: new Date(),
        updatedby: createdBy,
      },
    });

    return {
      success: true,
      message: `Permission "${permissionName}" created successfully`,
      permission,
    };
  } catch (error) {
    console.error('Error adding permission:', error);
    throw error;
  }
}

/**
 * @function addModulePermissions
 * @description Adds all CRUD permissions for a module
 * @param {string} moduleKey - Module key (e.g., 'user', 'company', 'depot')
 * @param {number} createdBy - User ID who is creating the permissions (default: 1)
 * @returns {Promise<{success: boolean, message: string, added: number, skipped: number, permissions?: any[]}>}
 * @throws {Error} If adding permissions fails
 */
export async function addModulePermissions(
  moduleKey: string,
  createdBy: number = 1
): Promise<{
  success: boolean;
  message: string;
  added: number;
  skipped: number;
  permissions?: any[];
}> {
  try {
    const moduleDisplayName = MODULE_MAPPING[moduleKey];
    if (!moduleDisplayName) {
      return {
        success: false,
        message: `Invalid module key: ${moduleKey}. Available modules: ${MODULES.join(', ')}`,
        added: 0,
        skipped: 0,
      };
    }

    const moduleNameForPermission = moduleKey.replace(/-/g, '_').toLowerCase();
    const permissionsToAdd = [];
    const addedPermissions = [];
    let skippedCount = 0;

    for (const action of ACTIONS) {
      if (READ_ONLY_MODULES.includes(moduleKey) && action.key === 'delete') {
        continue;
      }

      if (moduleKey === 'setting' && action.key !== 'read') {
        continue;
      }

      const permissionName = `${moduleNameForPermission}_${action.key}`;

      const existingPermission = await prisma.permissions.findFirst({
        where: {
          name: permissionName,
        },
      });

      if (existingPermission) {
        skippedCount++;
        continue;
      }

      permissionsToAdd.push({
        name: permissionName,
        module: moduleDisplayName,
        action: action.name,
        description: `${action.description} for ${moduleDisplayName}`,
        is_active: 'Y',
        createdate: new Date(),
        createdby: createdBy,
        updatedate: new Date(),
        updatedby: createdBy,
      });
    }

    if (permissionsToAdd.length === 0) {
      return {
        success: true,
        message: `All permissions for module "${moduleKey}" already exist`,
        added: 0,
        skipped: skippedCount,
      };
    }

    const createdPermissions = await prisma.permissions.createMany({
      data: permissionsToAdd,
    });

    const createdPermissionNames = permissionsToAdd.map(p => p.name);
    const fetchedPermissions = await prisma.permissions.findMany({
      where: {
        name: { in: createdPermissionNames },
      },
    });

    return {
      success: true,
      message: `Successfully added ${createdPermissions.count} permission(s) for module "${moduleKey}"`,
      added: createdPermissions.count,
      skipped: skippedCount,
      permissions: fetchedPermissions,
    };
  } catch (error) {
    console.error('Error adding module permissions:', error);
    throw error;
  }
}

/**
 * @exports mockPermissions
 * @description Exported mock permissions array for use in other modules
 */
export { mockPermissions };
