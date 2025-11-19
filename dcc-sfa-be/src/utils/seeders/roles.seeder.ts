/**
 * @fileoverview Roles Seeder
 * @description Creates 11 sample roles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

/**
 * @interface MockRole
 * @description Role data structure for seeding
 */
interface MockRole {
  name: string;
  description?: string;
  is_active: string;
  permissions?: string[];
}

/**
 * @constant mockRoles
 * @description Array of mock roles with their associated permissions
 * @type {MockRole[]}
 */
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
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'user_read',
      'user_create',
      'user_update',
      'user_delete',
      'role_read',
      'role_create',
      'role_update',
      'role_delete',
      'company_read',
      'company_create',
      'company_update',
      'company_delete',
      'depot_read',
      'depot_create',
      'depot_update',
      'depot_delete',
      'zone_read',
      'zone_create',
      'zone_update',
      'zone_delete',
      'route_read',
      'route_create',
      'route_update',
      'route_delete',
      'route_type_read',
      'route_type_create',
      'route_type_update',
      'route_type_delete',
      'outlet_read',
      'outlet_create',
      'outlet_update',
      'outlet_delete',
      'outlet_group_read',
      'outlet_group_create',
      'outlet_group_update',
      'outlet_group_delete',
      'product_read',
      'product_create',
      'product_update',
      'product_delete',
      'product_category_read',
      'product_category_create',
      'product_category_update',
      'product_category_delete',
      'product_sub_category_read',
      'product_sub_category_create',
      'product_sub_category_update',
      'product_sub_category_delete',
      'brand_read',
      'brand_create',
      'brand_update',
      'brand_delete',
      'warehouse_read',
      'warehouse_create',
      'warehouse_update',
      'warehouse_delete',
      'vehicle_read',
      'vehicle_create',
      'vehicle_update',
      'vehicle_delete',
      'currency_read',
      'currency_create',
      'currency_update',
      'currency_delete',
      'pricelist_read',
      'pricelist_create',
      'pricelist_update',
      'pricelist_delete',
      'report_read',
      'report_create',
      'report_update',
      'setting_read',
    ],
  },
  {
    name: 'Manager',
    description: 'Management role with oversight permissions',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'sales_target_group_read',
      'sales_target_group_create',
      'sales_target_group_update',
      'sales_target_group_delete',
      'sales_target_read',
      'sales_target_create',
      'sales_target_update',
      'sales_target_delete',
      'sales_bonus_rule_read',
      'sales_bonus_rule_create',
      'sales_bonus_rule_update',
      'sales_bonus_rule_delete',
      'kpi_target_read',
      'kpi_target_create',
      'kpi_target_update',
      'kpi_target_delete',
      'order_read',
      'order_create',
      'order_update',
      'order_delete',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'delivery_delete',
      'visit_read',
      'visit_create',
      'visit_update',
      'visit_delete',
      'payment_read',
      'payment_create',
      'payment_update',
      'payment_delete',
      'invoice_read',
      'invoice_create',
      'invoice_update',
      'invoice_delete',
      'credit_note_read',
      'credit_note_create',
      'credit_note_update',
      'credit_note_delete',
      'return_read',
      'return_create',
      'return_update',
      'return_delete',
      'customer_complaint_read',
      'customer_complaint_create',
      'customer_complaint_update',
      'customer_complaint_delete',
      'report_read',
      'report_create',
      'report_update',
      'location_read',
      'route_effectiveness_read',
    ],
  },
  {
    name: 'Sales Manager',
    description: 'Sales team management and reporting',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'sales_target_group_read',
      'sales_target_group_create',
      'sales_target_group_update',
      'sales_target_group_delete',
      'sales_target_read',
      'sales_target_create',
      'sales_target_update',
      'sales_target_delete',
      'sales_bonus_rule_read',
      'sales_bonus_rule_create',
      'sales_bonus_rule_update',
      'sales_bonus_rule_delete',
      'kpi_target_read',
      'kpi_target_create',
      'kpi_target_update',
      'kpi_target_delete',
      'order_read',
      'order_create',
      'order_update',
      'order_delete',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'delivery_delete',
      'visit_read',
      'visit_create',
      'visit_update',
      'visit_delete',
      'payment_read',
      'payment_create',
      'payment_update',
      'payment_delete',
      'invoice_read',
      'invoice_create',
      'invoice_update',
      'invoice_delete',
      'credit_note_read',
      'credit_note_create',
      'credit_note_update',
      'credit_note_delete',
      'return_read',
      'return_create',
      'return_update',
      'return_delete',
      'product_read',
      'product_create',
      'product_update',
      'product_delete',
      'pricelist_read',
      'pricelist_create',
      'pricelist_update',
      'pricelist_delete',
      'outlet_read',
      'outlet_create',
      'outlet_update',
      'outlet_delete',
      'customer_complaint_read',
      'customer_complaint_create',
      'customer_complaint_update',
      'customer_complaint_delete',
      'competitor_read',
      'competitor_create',
      'competitor_update',
      'competitor_delete',
      'report_read',
      'report_create',
      'report_update',
      'location_read',
      'route_effectiveness_read',
    ],
  },
  {
    name: 'Sales Representative',
    description: 'Field sales and customer interaction',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'order_read',
      'order_create',
      'order_update',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'visit_read',
      'visit_create',
      'visit_update',
      'payment_read',
      'payment_create',
      'payment_update',
      'return_read',
      'return_create',
      'return_update',
      'product_read',
      'pricelist_read',
      'outlet_read',
      'outlet_update',
      'customer_complaint_read',
      'customer_complaint_create',
      'customer_complaint_update',
      'competitor_read',
      'competitor_create',
      'competitor_update',
      'survey_read',
      'survey_create',
      'survey_update',
      'location_read',
      'report_read',
    ],
  },
  {
    name: 'Warehouse Manager',
    description: 'Inventory and warehouse operations',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'warehouse_read',
      'warehouse_create',
      'warehouse_update',
      'warehouse_delete',
      'asset_master_read',
      'asset_master_create',
      'asset_master_update',
      'asset_master_delete',
      'asset_type_read',
      'asset_type_create',
      'asset_type_update',
      'asset_type_delete',
      'asset_movement_read',
      'asset_movement_create',
      'asset_movement_update',
      'asset_movement_delete',
      'maintenance_read',
      'maintenance_create',
      'maintenance_update',
      'maintenance_delete',
      'installation_read',
      'installation_create',
      'installation_update',
      'installation_delete',
      'inspection_read',
      'inspection_create',
      'inspection_update',
      'inspection_delete',
      'van_stock_read',
      'van_stock_create',
      'van_stock_update',
      'van_stock_delete',
      'stock_movement_read',
      'stock_movement_create',
      'stock_movement_update',
      'stock_movement_delete',
      'stock_transfer_read',
      'stock_transfer_create',
      'stock_transfer_update',
      'stock_transfer_delete',
      'product_read',
      'product_create',
      'product_update',
      'product_delete',
      'order_read',
      'order_update',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'report_read',
      'report_create',
      'report_update',
    ],
  },
  {
    name: 'Warehouse Staff',
    description: 'Basic warehouse operations and inventory',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'warehouse_read',
      'warehouse_create',
      'warehouse_update',
      'asset_master_read',
      'asset_master_create',
      'asset_master_update',
      'asset_movement_read',
      'asset_movement_create',
      'asset_movement_update',
      'maintenance_read',
      'maintenance_create',
      'maintenance_update',
      'installation_read',
      'installation_create',
      'installation_update',
      'inspection_read',
      'inspection_create',
      'inspection_update',
      'van_stock_read',
      'van_stock_create',
      'van_stock_update',
      'stock_movement_read',
      'stock_movement_create',
      'stock_movement_update',
      'stock_transfer_read',
      'stock_transfer_create',
      'stock_transfer_update',
      'product_read',
      'product_create',
      'product_update',
      'order_read',
      'delivery_read',
      'delivery_create',
      'delivery_update',
    ],
  },
  {
    name: 'Finance Manager',
    description: 'Financial reporting and budget management',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'order_read',
      'order_create',
      'order_update',
      'order_delete',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'delivery_delete',
      'payment_read',
      'payment_create',
      'payment_update',
      'payment_delete',
      'invoice_read',
      'invoice_create',
      'invoice_update',
      'invoice_delete',
      'credit_note_read',
      'credit_note_create',
      'credit_note_update',
      'credit_note_delete',
      'return_read',
      'return_create',
      'return_update',
      'return_delete',
      'currency_read',
      'currency_create',
      'currency_update',
      'currency_delete',
      'pricelist_read',
      'pricelist_create',
      'pricelist_update',
      'pricelist_delete',
      'product_read',
      'outlet_read',
      'report_read',
      'report_create',
      'report_update',
    ],
  },
  {
    name: 'Finance Staff',
    description: 'Basic financial operations and data entry',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'order_read',
      'order_create',
      'order_update',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'payment_read',
      'payment_create',
      'payment_update',
      'invoice_read',
      'invoice_create',
      'invoice_update',
      'credit_note_read',
      'credit_note_create',
      'credit_note_update',
      'return_read',
      'return_create',
      'return_update',
      'currency_read',
      'pricelist_read',
      'report_read',
    ],
  },
  {
    name: 'Customer Service',
    description: 'Customer support and issue resolution',
    is_active: 'Y',
    permissions: [
      'dashboard_read',
      'dashboard_create',
      'dashboard_update',
      'order_read',
      'order_create',
      'order_update',
      'delivery_read',
      'delivery_create',
      'delivery_update',
      'return_read',
      'return_create',
      'return_update',
      'credit_note_read',
      'credit_note_create',
      'credit_note_update',
      'visit_read',
      'visit_create',
      'visit_update',
      'customer_complaint_read',
      'customer_complaint_create',
      'customer_complaint_update',
      'customer_complaint_delete',
      'outlet_read',
      'outlet_update',
      'product_read',
      'report_read',
    ],
  },
  {
    name: 'Guest User',
    description: 'Limited access for temporary users',
    is_active: 'N',
    permissions: ['dashboard_read', 'product_read', 'order_read'],
  },
];

/**
 * @function seedRoles
 * @description Seeds roles table with mock roles data and assigns permissions
 * @description Creates roles if they don't exist and updates permissions if needed
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
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

      if (role.permissions && role.permissions.length > 0) {
        const needsUpdate = await checkIfPermissionsNeedUpdate(
          roleId,
          role.permissions
        );
        if (needsUpdate) {
          await assignPermissionsToRole(roleId, role.permissions);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * @function checkIfPermissionsNeedUpdate
 * @description Checks if a role's current permissions match the expected permissions
 * @param {number} roleId - The ID of the role to check
 * @param {string[]} expectedPermissionNames - Array of expected permission names (or ['*'] for all)
 * @returns {Promise<boolean>} True if permissions need updating, false otherwise
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
 * @function assignPermissionsToRole
 * @description Assigns permissions to a role by permission names
 * @description Supports '*' wildcard to assign all active permissions
 * @param {number} roleId - The ID of the role to assign permissions to
 * @param {string[]} permissionNames - Array of permission names or ['*'] for all permissions
 * @returns {Promise<void>}
 * @throws {Error} If assignment fails
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
 * @function assignPermissionIdsToRole
 * @description Assigns permissions to a role by permission IDs
 * @description Deletes existing role permissions before assigning new ones
 * @param {number} roleId - The ID of the role to assign permissions to
 * @param {number[]} permissionIds - Array of permission IDs to assign
 * @returns {Promise<void>}
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
 * @function clearRoles
 * @description Clears all role_permissions from the database
 * @description Note: Does not delete roles themselves, only their permission assignments
 * @returns {Promise<void>}
 * @throws {Error} If clearing fails
 */
export async function clearRoles(): Promise<void> {
  try {
    await prisma.role_permissions.deleteMany({});
  } catch (error) {
    throw error;
  }
}

/**
 * @exports mockRoles
 * @description Exported mock roles array for use in other modules
 */
export { mockRoles };
