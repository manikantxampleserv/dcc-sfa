"use strict";
/**
 * @fileoverview Roles Seeder
 * @description Creates 11 sample roles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRoles = void 0;
exports.seedRoles = seedRoles;
exports.clearRoles = clearRoles;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * @constant mockRoles
 * @description Array of mock roles with their associated permissions
 * @type {MockRole[]}
 */
const mockRoles = [
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
        permissions: ['*'],
    },
    {
        name: 'Sub Admin',
        description: 'Sub-administrative access with limited administrative permissions',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Manager',
        description: 'Management role with oversight permissions',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Sales Manager',
        description: 'Sales team management and reporting',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Sales Representative',
        description: 'Field sales and customer interaction',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Warehouse Manager',
        description: 'Inventory and warehouse operations',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Warehouse Staff',
        description: 'Basic warehouse operations and inventory',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Finance Manager',
        description: 'Financial reporting and budget management',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Finance Staff',
        description: 'Basic financial operations and data entry',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Technician',
        description: 'Technician role with maintenance and installation permissions',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Sales Person',
        description: 'Sales person role with sales and customer interaction permissions',
        is_active: 'Y',
        permissions: ['*'],
    },
    {
        name: 'Merchandiser',
        description: 'Merchandiser role with merchandising and product display permissions',
        is_active: 'Y',
        permissions: ['*'],
    },
];
exports.mockRoles = mockRoles;
/**
 * @function seedRoles
 * @description Seeds roles table with mock roles data and assigns permissions
 * @description Creates roles if they don't exist and updates permissions if needed
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
 */
async function seedRoles() {
    try {
        for (const role of mockRoles) {
            const existingRole = await prisma_client_1.default.roles.findFirst({
                where: { name: role.name },
            });
            let roleId;
            if (!existingRole) {
                const newRole = await prisma_client_1.default.roles.create({
                    data: {
                        name: role.name,
                        description: role.description,
                        is_active: role.is_active,
                        level: 1,
                        role_key: role.name.toLowerCase().replace(/ /g, '_'),
                        createdate: new Date(),
                        createdby: 1,
                        updatedate: undefined,
                        updatedby: undefined,
                        log_inst: 1,
                    },
                });
                roleId = newRole.id;
            }
            else {
                roleId = existingRole.id;
            }
            if (role.permissions && role.permissions.length > 0) {
                const needsUpdate = await checkIfPermissionsNeedUpdate(roleId, role.permissions);
                if (needsUpdate) {
                    await assignPermissionsToRole(roleId, role.permissions);
                }
            }
        }
    }
    catch (error) {
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
async function checkIfPermissionsNeedUpdate(roleId, expectedPermissionNames) {
    try {
        if (expectedPermissionNames.includes('*')) {
            const allPermissions = await prisma_client_1.default.permissions.findMany({
                where: { is_active: 'Y' },
                select: { id: true },
            });
            const expectedPermissionIds = allPermissions.map(p => p.id).sort();
            const currentRolePermissions = await prisma_client_1.default.role_permissions.findMany({
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
        const expectedPermissions = await prisma_client_1.default.permissions.findMany({
            where: {
                name: { in: expectedPermissionNames },
                is_active: 'Y',
            },
            select: { id: true },
        });
        const expectedPermissionIds = expectedPermissions.map(p => p.id).sort();
        const currentRolePermissions = await prisma_client_1.default.role_permissions.findMany({
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
    catch (error) {
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
async function assignPermissionsToRole(roleId, permissionNames) {
    try {
        if (permissionNames.includes('*')) {
            const allPermissions = await prisma_client_1.default.permissions.findMany({
                where: { is_active: 'Y' },
                select: { id: true },
            });
            const permissionIds = allPermissions.map(p => p.id);
            await assignPermissionIdsToRole(roleId, permissionIds);
            return;
        }
        const permissions = await prisma_client_1.default.permissions.findMany({
            where: {
                name: { in: permissionNames },
                is_active: 'Y',
            },
            select: { id: true, name: true },
        });
        const permissionIds = permissions.map(p => p.id);
        await assignPermissionIdsToRole(roleId, permissionIds);
    }
    catch (error) {
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
async function assignPermissionIdsToRole(roleId, permissionIds) {
    await prisma_client_1.default.role_permissions.deleteMany({
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
        await prisma_client_1.default.role_permissions.createMany({
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
async function clearRoles() {
    try {
        await prisma_client_1.default.role_permissions.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=roles.seeder.js.map