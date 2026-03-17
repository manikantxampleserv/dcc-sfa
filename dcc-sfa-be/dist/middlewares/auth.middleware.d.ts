import { type Modules, type Actions } from '../configs/permissions.config';
type PermissionItem = {
    module: Modules;
    action: Actions;
};
export declare const authenticateToken: (req: any, res: any, next: any) => Promise<any>;
export declare const authenticateApiToken: (req: any, res: any, next: any) => Promise<any>;
/**
 * @function requirePermission
 * @description Middleware to require any of the specified module/action permissions
 * @description Dynamically builds permission names from module and action
 * @param {PermissionItem[]} permissions - Array of {module, action} objects
 * @returns {Function} Express middleware function
 */
export declare const requirePermission: (permissions: PermissionItem[]) => (req: any, res: any, next: any) => any;
/**
 * @function requireAllPermission
 * @description Middleware to require all of the specified module/action permissions
 * @description Dynamically builds permission names from module and action
 * @param {PermissionItem[]} permissions - Array of {module, action} objects
 * @returns {Function} Express middleware function
 */
export declare const requireAllPermission: (permissions: PermissionItem[]) => Function;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map