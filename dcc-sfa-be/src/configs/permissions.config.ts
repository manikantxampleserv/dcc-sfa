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
export const buildPermissionName = (
  module: Modules,
  action: Actions
): string => {
  const moduleKey = module.toLowerCase().replace(/-/g, '_');
  const actionKey = action.toLowerCase();
  return `${moduleKey}_${actionKey}`;
};

/**
 * @function isAdminRole
 * @description Checks if a role name contains "admin" or "super admin" (case-insensitive)
 * @param {string} roleName - Role name to check
 * @returns {boolean} True if role is admin or super admin
 */
export const isAdminRole = (roleName: string): boolean => {
  const roleLower = roleName.toLowerCase();
  return roleLower.includes('admin') || roleLower.includes('super admin');
};

/**
 * @function hasPermission
 * @description Checks if user has a specific permission
 * @description Supports wildcard '*' permission for super admin
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {string} permissionName - Permission name to check (e.g., "user_read")
 * @returns {boolean} True if user has the permission
 */
const hasPermission = (
  userPermissions: string[],
  permissionName: string
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return userPermissions.includes(permissionName);
};

/**
 * @function hasModulePermission
 * @description Checks if user has permission for a module and action
 * @description Builds permission name dynamically from module and action
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {string} module - Module name (e.g., "user", "sales-target-group")
 * @param {string} action - Action name (e.g., "read", "create")
 * @returns {boolean} True if user has the permission
 */
const hasModulePermission = (
  userPermissions: string[],
  module: Modules,
  action: Actions
): boolean => {
  const permissionName = buildPermissionName(module, action);
  return hasPermission(userPermissions, permissionName);
};

/**
 * @function hasAnyModulePermissions
 * @description Checks if user has any of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has at least one of the required permissions
 */
export const hasAnyModulePermissions = (
  userPermissions: string[],
  permissions: Array<{ module: Modules; action: Actions }>
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return permissions.some(p =>
    hasModulePermission(userPermissions, p.module, p.action)
  );
};

/**
 * @function hasAllModulePermissions
 * @description Checks if user has all of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has all of the required permissions
 */
export const hasAllModulePermissions = (
  userPermissions: string[],
  permissions: Array<{ module: Modules; action: Actions }>
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return permissions.every(p =>
    hasModulePermission(userPermissions, p.module, p.action)
  );
};

/**
 * @type Modules
 * @description Union type of all available module keys
 * @description Matches the module keys from permissions.seeder.ts MODULE_MAPPING
 */
export type Modules =
  | 'executive-dashboard'
  | 'grading-dashboard'
  | 'user'
  | 'role'
  | 'depot'
  | 'zone'
  | 'currency'
  | 'route'
  | 'route-type'
  | 'outlet'
  | 'outlet-group'
  | 'asset-type'
  | 'asset-brand'
  | 'asset-sub-types'
  | 'asset-master'
  | 'vehicle'
  | 'brand'
  | 'product-category'
  | 'product-sub-category'
  | 'unit-of-measurement'
  | 'product'
  | 'sales-target-group'
  | 'sales-target'
  | 'sales-bonus-rule'
  | 'kpi-target'
  | 'survey'
  | 'promotions'
  | 'order'
  | 'return'
  | 'payment'
  | 'invoice'
  | 'visit'
  | 'asset-movement'
  | 'maintenance'
  | 'installation'
  | 'inspection'
  | 'van-stock'
  | 'stock-movement'
  | 'inventory-management'
  | 'competitor'
  | 'customer-complaint'
  | 'customer-category'
  | 'customer-type'
  | 'customer-channel'
  | 'product-flavour'
  | 'product-volume'
  | 'product-shelf-life'
  | 'product-type'
  | 'product-target-group'
  | 'product-web-order'
  | 'inventory-items'
  | 'location'
  | 'route-effectiveness'
  | 'report'
  | 'approval'
  | 'exception'
  | 'tax-master'
  | 'login-history'
  | 'token'
  | 'setting'
  | 'templates'
  | 'region'
  | 'district'
  | 'city'
  | 'pricelist'
  | 'audit-log'
  | 'attendance'
  | 'request'
  | 'reconciliation';

/**
 * @type Actions
 * @description Union type of all available action keys
 * @description Matches the actions from permissions.seeder.ts ACTIONS
 */
export type Actions = 'read' | 'create' | 'update' | 'delete';

/**
 * @constant MODULE_DISPLAY_NAMES
 * @description Maps module keys to user-friendly display names
 * @type {Record<string, string>}
 */
const MODULE_DISPLAY_NAMES: Record<string, string> = {
  'executive-dashboard': 'Executive Dashboard',
  'grading-dashboard': 'Grading Dashboard',
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
  'asset-brand': 'Asset Brand',
  'asset-sub-types': 'Asset Sub Types',
  'asset-master': 'Asset Master',
  'asset-master-brands': 'Asset Master Brands',
  vehicle: 'Vehicle',
  brand: 'Brand',
  'product-category': 'Product Category',
  'product-sub-category': 'Product Sub Category',
  'unit-of-measurement': 'Unit Of Measurement',
  product: 'Product',
  'sales-target-group': 'Sales Target Group',
  'sales-target': 'Sales Target',
  'sales-bonus-rule': 'Sales Bonus Rule',
  'kpi-target': 'KPI Target',
  survey: 'Survey',
  promotions: 'Promotions',
  order: 'Order',
  return: 'Return',
  payment: 'Payment',
  invoice: 'Invoice',
  visit: 'Visit',
  'asset-movement': 'Asset Movement',
  maintenance: 'Asset Maintenance',
  installation: 'Cooler Installation',
  inspection: 'Cooler Inspection',
  'van-stock': 'Van Inventory',
  reconciliation: 'Reconciliation',
  'stock-movement': 'Stock Movement',
  'inventory-management': 'Inventory Management',
  competitor: 'Competitor Activity',
  'customer-complaint': 'Customer Complaint',
  'customer-category': 'Outlet Category',
  'customer-type': 'Outlet Type',
  'customer-channel': 'Outlet Channel',
  'product-flavour': 'Product Flavour',
  'product-volume': 'Product Volume',
  'product-shelf-life': 'Product Shelf Life',
  'product-type': 'Product Type',
  'product-target-group': 'Product Target Group',
  'product-web-order': 'Product Web Order',
  'inventory-items': 'Inventory Items',
  location: 'GPS Tracking',
  'route-effectiveness': 'Route Effectiveness',
  report: 'Report',
  approval: 'Approval Workflow',
  exception: 'Exception',
  'tax-master': 'Tax Master',
  'login-history': 'Login History',
  token: 'Token',
  setting: 'Setting',
  templates: 'Email Templates',
  region: 'Region Master',
  district: 'District Master',
  city: 'City Master',
  pricelist: 'Price List',
  'audit-log': 'Audit Log',
  attendance: 'Attendance',
  request: 'Request',
};

/**
 * @constant ACTION_DISPLAY_NAMES
 * @description Maps action keys to user-friendly display names
 * @type {Record<string, string>}
 */
const ACTION_DISPLAY_NAMES: Record<string, string> = {
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
};

/**
 * @function formatPermissionErrorMessage
 * @description Formats a user-friendly error message for permission denial
 * @param {Array<{module: Modules, action: Actions}>} permissions - Array of required permissions
 * @returns {string} User-friendly error message
 * @example
 * formatPermissionErrorMessage([{module: 'approval', action: 'read'}])
 * // returns "You don't have permission to read the Approval"
 */
export const formatPermissionErrorMessage = (
  permissions: Array<{ module: Modules; action: Actions }>
): string => {
  if (permissions.length === 0) {
    return "You don't have permission to access this resource.";
  }

  if (permissions.length === 1) {
    const { module, action } = permissions[0];
    const moduleName = MODULE_DISPLAY_NAMES[module] || module;
    const actionName = ACTION_DISPLAY_NAMES[action] || action;
    return `You don't have permission for ${actionName} the ${moduleName}.`;
  }

  const permissionDescriptions = permissions.map(({ module, action }) => {
    const moduleName = MODULE_DISPLAY_NAMES[module] || module;
    const actionName = ACTION_DISPLAY_NAMES[action] || action;
    return `${actionName} ${moduleName}`;
  });

  const lastPermission = permissionDescriptions.pop();
  const permissionsList =
    permissionDescriptions.join(', ') + ` or ${lastPermission}`;

  return `You don't have permission to ${permissionsList}.`;
};
