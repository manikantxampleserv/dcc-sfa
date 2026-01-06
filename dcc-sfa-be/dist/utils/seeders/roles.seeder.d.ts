/**
 * @fileoverview Roles Seeder
 * @description Creates 11 sample roles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
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
declare const mockRoles: MockRole[];
/**
 * @function seedRoles
 * @description Seeds roles table with mock roles data and assigns permissions
 * @description Creates roles if they don't exist and updates permissions if needed
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
 */
export declare function seedRoles(): Promise<void>;
/**
 * @function clearRoles
 * @description Clears all role_permissions from the database
 * @description Note: Does not delete roles themselves, only their permission assignments
 * @returns {Promise<void>}
 * @throws {Error} If clearing fails
 */
export declare function clearRoles(): Promise<void>;
/**
 * @exports mockRoles
 * @description Exported mock roles array for use in other modules
 */
export { mockRoles };
//# sourceMappingURL=roles.seeder.d.ts.map