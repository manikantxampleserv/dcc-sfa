/**
 * @fileoverview Permissions Seeder
 * @description Creates 11 sample permissions for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
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
 * @constant mockPermissions
 * @description Generated permissions array populated during module iteration
 * @type {MockPermission[]}
 */
declare const mockPermissions: MockPermission[];
/**
 * @function seedPermissions
 * @description Seeds permissions table with generated mock permissions data
 * @description Uses createMany for better performance, only creates non-existing permissions
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
 */
export declare function seedPermissions(): Promise<void>;
/**
 * @function clearPermissions
 * @description Clears all permissions and related role_permissions from the database
 * @description Deletes role_permissions first to avoid foreign key constraint violations
 * @returns {Promise<void>}
 * @throws {Error} If clearing fails
 */
export declare function clearPermissions(): Promise<void>;
/**
 * @function addSinglePermission
 * @description Adds a single permission to the database
 * @param {string} moduleKey - Module key (e.g., 'user', 'company', 'depot')
 * @param {string} actionKey - Action key (e.g., 'read', 'create', 'update', 'delete')
 * @param {number} createdBy - User ID who is creating the permission (default: 1)
 * @returns {Promise<{success: boolean, message: string, permission?: any}>}
 * @throws {Error} If adding permission fails
 */
export declare function addSinglePermission(moduleKey: string, actionKey: string, createdBy?: number): Promise<{
    success: boolean;
    message: string;
    permission?: any;
}>;
/**
 * @function addModulePermissions
 * @description Adds all CRUD permissions for a module
 * @param {string} moduleKey - Module key (e.g., 'user', 'company', 'depot')
 * @param {number} createdBy - User ID who is creating the permissions (default: 1)
 * @returns {Promise<{success: boolean, message: string, added: number, skipped: number, permissions?: any[]}>}
 * @throws {Error} If adding permissions fails
 */
export declare function addModulePermissions(moduleKey: string, createdBy?: number): Promise<{
    success: boolean;
    message: string;
    added: number;
    skipped: number;
    permissions?: any[];
}>;
/**
 * @exports mockPermissions
 * @description Exported mock permissions array for use in other modules
 */
export { mockPermissions };
//# sourceMappingURL=permissions.seeder.d.ts.map