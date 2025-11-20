/**
 * @fileoverview Permission Management Hook
 * @description Provides dynamic permission checking based on user's role and permissions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { type BackendModule } from '../utils/permission-auto-generator';
import { useCurrentUser } from './useUsers';

/**
 * @type Module
 * @description Union type of all available module keys
 * @description Derived from BackendModule to ensure single source of truth
 */
type Module = BackendModule;

/**
 * @type Action
 * @description Union type of all available action keys
 */
type Action = 'read' | 'create' | 'update' | 'delete';

/**
 * @function buildPermissionName
 * @description Builds permission name in the format: module_action
 * @description Converts module and action to lowercase with underscores
 * @param {Module} module - Module name (e.g., "user", "sales-target-group")
 * @param {Action} action - Action name (e.g., "read", "create", "update", "delete")
 * @returns {string} Permission name in format "module_action" (e.g., "user_read", "sales_target_group_create")
 * @example
 * buildPermissionName("user", "read") // returns "user_read"
 * buildPermissionName("sales-target-group", "create") // returns "sales_target_group_create"
 */
const buildPermissionName = (module: Module, action: Action): string => {
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
const isAdminRole = (roleName: string): boolean => {
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
 * @param {Module} module - Module name (e.g., "user", "sales-target-group")
 * @param {Action} action - Action name (e.g., "read", "create")
 * @returns {boolean} True if user has the permission
 */
const hasModulePermission = (
  userPermissions: string[],
  module: Module,
  action: Action
): boolean => {
  const permissionName = buildPermissionName(module, action);
  return hasPermission(userPermissions, permissionName);
};

/**
 * @hook usePermissions
 * @description Hook to check user permissions for a specific module
 * @description Uses React Query to fetch user profile which includes permissions
 * @param {Module} module - Module name to check permissions for
 * @returns {Object} Object with permission flags (isCreate, isUpdate, isDelete, isRead)
 * @example
 * const { isCreate, isRead, isUpdate, isDelete } = usePermissions('user');
 * if (isCreate) {
 *   // Show create button
 * }
 */
export const usePermission = (module: Module) => {
  const { data: user, isLoading } = useCurrentUser();

  /**
   * @description Get user permissions from profile or default to empty array
   */
  const userPermissions = useMemo(() => {
    if (!user) {
      return [];
    }

    // Check if user is admin - grant all permissions
    if (user.role?.name && isAdminRole(user.role.name)) {
      return ['*'];
    }

    // Return user's permissions or empty array
    return user.permissions || [];
  }, [user]);

  /**
   * @description Check if user has create permission for the module
   */
  const isCreate = useMemo(() => {
    if (isLoading || !user) {
      return false;
    }
    return hasModulePermission(userPermissions, module, 'create');
  }, [userPermissions, module, isLoading, user]);

  /**
   * @description Check if user has read permission for the module
   */
  const isRead = useMemo(() => {
    if (isLoading || !user) {
      return false;
    }
    return hasModulePermission(userPermissions, module, 'read');
  }, [userPermissions, module, isLoading, user]);

  /**
   * @description Check if user has update permission for the module
   */
  const isUpdate = useMemo(() => {
    if (isLoading || !user) {
      return false;
    }
    return hasModulePermission(userPermissions, module, 'update');
  }, [userPermissions, module, isLoading, user]);

  /**
   * @description Check if user has delete permission for the module
   */
  const isDelete = useMemo(() => {
    if (isLoading || !user) {
      return false;
    }
    return hasModulePermission(userPermissions, module, 'delete');
  }, [userPermissions, module, isLoading, user]);

  return {
    isCreate,
    isUpdate,
    isDelete,
    isRead,
    isLoading,
  };
};
