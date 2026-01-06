/**
 * @fileoverview Dynamic Permissions Configuration
 * @description Fully dynamic permission system that works with database models
 * @description No static modules or actions - everything is database-driven
 */
/**
 * @function buildPermissionName
 * @description Builds permission name in the format: module_action
 * @description Converts module and action to lowercase with underscores
 * @param {string} module - Module name (e.g., "user", "sales-target-group")
 * @param {string} action - Action name (e.g., "read", "create", "update", "delete")
 * @returns {string} Permission name in format "module_action" (e.g., "user_read", "sales_target_group_create")
 * @example
 * buildPermissionName("user", "read") // returns "user_read"
 * buildPermissionName("sales-target-group", "create") // returns "sales_target_group_create"
 */
export declare const buildPermissionName: (module: Modules, action: Actions) => string;
/**
 * @function isAdminRole
 * @description Checks if a role name contains "admin" or "super admin" (case-insensitive)
 * @param {string} roleName - Role name to check
 * @returns {boolean} True if role is admin or super admin
 */
export declare const isAdminRole: (roleName: string) => boolean;
/**
 * @function hasAnyModulePermissions
 * @description Checks if user has any of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has at least one of the required permissions
 */
export declare const hasAnyModulePermissions: (userPermissions: string[], permissions: Array<{
    module: Modules;
    action: Actions;
}>) => boolean;
/**
 * @function hasAllModulePermissions
 * @description Checks if user has all of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has all of the required permissions
 */
export declare const hasAllModulePermissions: (userPermissions: string[], permissions: Array<{
    module: Modules;
    action: Actions;
}>) => boolean;
/**
 * @type Modules
 * @description Union type of all available module keys
 * @description Matches the module keys from permissions.seeder.ts MODULE_MAPPING
 */
export type Modules = 'dashboard' | 'company' | 'user' | 'role' | 'depot' | 'zone' | 'currency' | 'route' | 'route-type' | 'outlet' | 'outlet-group' | 'asset-type' | 'asset-master' | 'warehouse' | 'vehicle' | 'brand' | 'product-category' | 'product-sub-category' | 'unit-of-measurement' | 'product-flavour' | 'product-volume' | 'product-shelf-life' | 'product' | 'pricelist' | 'sales-target-group' | 'sales-target' | 'sales-bonus-rule' | 'kpi-target' | 'survey' | 'promotions' | 'order' | 'delivery' | 'return' | 'payment' | 'invoice' | 'credit-note' | 'visit' | 'asset-movement' | 'maintenance' | 'installation' | 'inspection' | 'van-stock' | 'stock-movement' | 'stock-transfer' | 'batch-lots' | 'inventory-management' | 'competitor' | 'customer-complaint' | 'customer-category' | 'customer-type' | 'cooler-type' | 'cooler-sub-type' | 'location' | 'route-effectiveness' | 'erp-sync' | 'report' | 'approval' | 'exception' | 'alert' | 'profile' | 'login-history' | 'token' | 'setting' | 'product-type' | 'product-target-group' | 'product-web-order';
/**
 * @type Actions
 * @description Union type of all available action keys
 * @description Matches the actions from permissions.seeder.ts ACTIONS
 */
export type Actions = 'read' | 'create' | 'update' | 'delete';
/**
 * @function formatPermissionErrorMessage
 * @description Formats a user-friendly error message for permission denial
 * @param {Array<{module: Modules, action: Actions}>} permissions - Array of required permissions
 * @returns {string} User-friendly error message
 * @example
 * formatPermissionErrorMessage([{module: 'approval', action: 'read'}])
 * // returns "You don't have permission to read the Approval"
 */
export declare const formatPermissionErrorMessage: (permissions: Array<{
    module: Modules;
    action: Actions;
}>) => string;
//# sourceMappingURL=permissions.config.d.ts.map