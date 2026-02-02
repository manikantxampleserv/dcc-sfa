"use strict";
/**
 * @fileoverview Dynamic Permissions Configuration
 * @description Fully dynamic permission system that works with database models
 * @description No static modules or actions - everything is database-driven
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPermissionErrorMessage = exports.hasAllModulePermissions = exports.hasAnyModulePermissions = exports.isAdminRole = exports.buildPermissionName = void 0;
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
const buildPermissionName = (module, action) => {
    const moduleKey = module.toLowerCase().replace(/-/g, '_');
    const actionKey = action.toLowerCase();
    return `${moduleKey}_${actionKey}`;
};
exports.buildPermissionName = buildPermissionName;
/**
 * @function isAdminRole
 * @description Checks if a role name contains "admin" or "super admin" (case-insensitive)
 * @param {string} roleName - Role name to check
 * @returns {boolean} True if role is admin or super admin
 */
const isAdminRole = (roleName) => {
    const roleLower = roleName.toLowerCase();
    return roleLower.includes('admin') || roleLower.includes('super admin');
};
exports.isAdminRole = isAdminRole;
/**
 * @function hasPermission
 * @description Checks if user has a specific permission
 * @description Supports wildcard '*' permission for super admin
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {string} permissionName - Permission name to check (e.g., "user_read")
 * @returns {boolean} True if user has the permission
 */
const hasPermission = (userPermissions, permissionName) => {
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
const hasModulePermission = (userPermissions, module, action) => {
    const permissionName = (0, exports.buildPermissionName)(module, action);
    return hasPermission(userPermissions, permissionName);
};
/**
 * @function hasAnyModulePermissions
 * @description Checks if user has any of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has at least one of the required permissions
 */
const hasAnyModulePermissions = (userPermissions, permissions) => {
    if (userPermissions.includes('*')) {
        return true;
    }
    return permissions.some(p => hasModulePermission(userPermissions, p.module, p.action));
};
exports.hasAnyModulePermissions = hasAnyModulePermissions;
/**
 * @function hasAllModulePermissions
 * @description Checks if user has all of the specified module/action permissions
 * @param {string[]} userPermissions - Array of permission names the user has
 * @param {Array<{module: string, action: string}>} permissions - Array of module/action pairs
 * @returns {boolean} True if user has all of the required permissions
 */
const hasAllModulePermissions = (userPermissions, permissions) => {
    if (userPermissions.includes('*')) {
        return true;
    }
    return permissions.every(p => hasModulePermission(userPermissions, p.module, p.action));
};
exports.hasAllModulePermissions = hasAllModulePermissions;
/**
 * @constant MODULE_DISPLAY_NAMES
 * @description Maps module keys to user-friendly display names
 * @type {Record<string, string>}
 */
const MODULE_DISPLAY_NAMES = {
    dashboard: 'Dashboard',
    company: 'Company',
    user: 'User',
    role: 'Role',
    depot: 'Depot',
    zone: 'Zone',
    currency: 'Currency',
    route: 'Route',
    'route-type': 'Route Type',
    outlet: 'Outlet',
    'outlet-group': 'Outlet Group',
    'asset-type': 'Asset Type',
    'asset-master': 'Asset Master',
    warehouse: 'Warehouse',
    vehicle: 'Vehicle',
    brand: 'Brand',
    'product-category': 'Product Category',
    'product-sub-category': 'Product Sub Category',
    'unit-of-measurement': 'Unit Of Measurement',
    'sub-unit-of-measurement': 'Sub Unit Of Measurement',
    'product-flavour': 'Product Flavour',
    'product-volume': 'Product Volume',
    'product-shelf-life': 'Product Shelf Life',
    product: 'Product',
    pricelist: 'Price List',
    'sales-target-group': 'Sales Target Group',
    'sales-target': 'Sales Target',
    'sales-bonus-rule': 'Sales Bonus Rule',
    'kpi-target': 'KPI Target',
    survey: 'Survey',
    promotions: 'Promotions',
    order: 'Order',
    delivery: 'Delivery',
    return: 'Return',
    payment: 'Payment',
    invoice: 'Invoice',
    'credit-note': 'Credit Note',
    visit: 'Visit',
    'asset-movement': 'Asset Movement',
    maintenance: 'Maintenance',
    installation: 'Installation',
    inspection: 'Inspection',
    'van-stock': 'Van Stock',
    'stock-movement': 'Stock Movement',
    'stock-transfer': 'Stock Transfer',
    'batch-lots': 'Batch & Lot Management',
    'inventory-management': 'Inventory Management',
    competitor: 'Competitor',
    'customer-complaint': 'Customer Complaint',
    'customer-category': 'Customer Category',
    'customer-type': 'Customer Type',
    location: 'Location',
    'route-effectiveness': 'Route Effectiveness',
    'erp-sync': 'ERP Sync',
    report: 'Report',
    approval: 'Approval',
    exception: 'Exception',
    alert: 'Alert',
    profile: 'Profile',
    'login-history': 'Login History',
    token: 'Token',
    setting: 'Setting',
    'product-type': 'Product Type',
    'product-target-group': 'Product Target Group',
    'product-web-order': 'Product Web Order',
    'inventory-items': 'Inventory Items',
};
/**
 * @constant ACTION_DISPLAY_NAMES
 * @description Maps action keys to user-friendly display names
 * @type {Record<string, string>}
 */
const ACTION_DISPLAY_NAMES = {
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
const formatPermissionErrorMessage = (permissions) => {
    if (permissions.length === 0) {
        return "You don't have permission to access this resource.";
    }
    if (permissions.length === 1) {
        const { module, action } = permissions[0];
        const moduleName = MODULE_DISPLAY_NAMES[module] || module;
        const actionName = ACTION_DISPLAY_NAMES[action] || action;
        return `You don't have permission for ${actionName} the ${moduleName}.`;
    }
    // Multiple permissions
    const permissionDescriptions = permissions.map(({ module, action }) => {
        const moduleName = MODULE_DISPLAY_NAMES[module] || module;
        const actionName = ACTION_DISPLAY_NAMES[action] || action;
        return `${actionName} ${moduleName}`;
    });
    const lastPermission = permissionDescriptions.pop();
    const permissionsList = permissionDescriptions.join(', ') + ` or ${lastPermission}`;
    return `You don't have permission to ${permissionsList}.`;
};
exports.formatPermissionErrorMessage = formatPermissionErrorMessage;
//# sourceMappingURL=permissions.config.js.map