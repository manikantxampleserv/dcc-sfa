"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissionsController = void 0;
const paginate_1 = require("../../utils/paginate");
const express_validator_1 = require("express-validator");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeRolePermissions = (rolePermission, includeCreatedAt = false, includeUpdatedAt = false) => ({
    id: rolePermission.id,
    role_id: rolePermission.role_id,
    permission_id: rolePermission.permission_id,
    is_active: rolePermission.is_active,
    ...(includeCreatedAt && { created_at: rolePermission.createdate }),
    ...(includeUpdatedAt && { updated_at: rolePermission.updatedate }),
    role: rolePermission.roles_permission
        ? {
            id: rolePermission.roles_permission.id,
            name: rolePermission.roles_permission.name,
            description: rolePermission.roles_permission.description,
        }
        : null,
});
exports.rolePermissionsController = {
    async createRolePermissions(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const { role_id, permission_id, is_active } = req.body;
            const existingRole = await prisma_client_1.default.roles.findFirst({
                where: {
                    id: role_id,
                    is_active: 'Y',
                },
            });
            if (!existingRole) {
                res.error('Role not found', 404);
                return;
            }
            const existingRolePermission = await prisma_client_1.default.role_permissions.findFirst({
                where: {
                    role_id,
                    permission_id,
                },
            });
            if (existingRolePermission) {
                res.error('Role permission combination already exists', 400);
                return;
            }
            const newRolePermission = await prisma_client_1.default.role_permissions.create({
                data: {
                    role_id,
                    permission_id,
                    is_active: is_active ?? 'Y',
                    createdby: req.user?.id ?? 0,
                    createdate: new Date(),
                    log_inst: 1,
                },
                include: {
                    roles_permission: true,
                },
            });
            res.success('Role permission created successfully', serializeRolePermissions(newRolePermission), 201);
        }
        catch (error) {
            console.error('Error creating role permission:', error);
            res.error(error.message);
        }
    },
    async getAllRolePermissions(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, role_id, permission_id, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const filters = {
                is_active: isActive,
                ...(role_id && { role_id: Number(role_id) }),
                ...(permission_id && { permission_id: Number(permission_id) }),
                ...(search && {
                    roles_permission: {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                },
                            },
                            {
                                description: {
                                    contains: search,
                                },
                            },
                        ],
                    },
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.role_permissions,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
                include: {
                    roles_permission: true,
                },
            });
            const totalRolePermissions = await prisma_client_1.default.role_permissions.count();
            const activeRolePermissions = await prisma_client_1.default.role_permissions.count({
                where: { is_active: 'Y' },
            });
            const inactiveRolePermissions = await prisma_client_1.default.role_permissions.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newRolePermissionsThisMonth = await prisma_client_1.default.role_permissions.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            res.success('Role permissions retrieved successfully', data.map((rolePermission) => serializeRolePermissions(rolePermission, true, true)), 200, pagination, {
                total_role_permissions: totalRolePermissions,
                active_role_permissions: activeRolePermissions,
                inactive_role_permissions: inactiveRolePermissions,
                new_role_permissions: newRolePermissionsThisMonth,
            });
        }
        catch (error) {
            console.error('Error fetching role permissions:', error);
            res.error(error.message);
        }
    },
    async getRolePermissionsById(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid role permission ID', 400);
                return;
            }
            const rolePermission = await prisma_client_1.default.role_permissions.findFirst({
                where: {
                    id: id,
                },
                include: {
                    roles_permission: true,
                },
            });
            if (!rolePermission) {
                res.error('Role permission not found', 404);
                return;
            }
            res.success('Role permission fetched successfully', serializeRolePermissions(rolePermission), 200);
        }
        catch (error) {
            console.error('Error fetching role permission:', error);
            res.error(error.message);
        }
    },
    async updateRolePermission(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid role permission ID', 400);
                return;
            }
            const { createdate, updatedate, ...rolePermissionData } = req.body;
            if ('id' in rolePermissionData) {
                delete rolePermissionData.id;
            }
            const existingRolePermission = await prisma_client_1.default.role_permissions.findFirst({
                where: {
                    id: id,
                },
            });
            if (!existingRolePermission) {
                res.error('Role permission not found', 404);
                return;
            }
            if (rolePermissionData.role_id) {
                const existingRole = await prisma_client_1.default.roles.findFirst({
                    where: {
                        id: rolePermissionData.role_id,
                        is_active: 'Y',
                    },
                });
                if (!existingRole) {
                    res.error('Role not found', 404);
                    return;
                }
            }
            if (rolePermissionData.role_id &&
                rolePermissionData.permission_id &&
                (rolePermissionData.role_id !== existingRolePermission.role_id ||
                    rolePermissionData.permission_id !==
                        existingRolePermission.permission_id)) {
                const duplicateRolePermission = await prisma_client_1.default.role_permissions.findFirst({
                    where: {
                        role_id: rolePermissionData.role_id,
                        permission_id: rolePermissionData.permission_id,
                        id: { not: id },
                    },
                });
                if (duplicateRolePermission) {
                    res.error('Role permission combination already exists', 400);
                    return;
                }
            }
            const updateData = {
                ...rolePermissionData,
                updatedby: req.user?.id ?? 0,
                updatedate: new Date(),
            };
            const updatedRolePermission = await prisma_client_1.default.role_permissions.update({
                where: { id: id },
                data: updateData,
                include: {
                    roles_permission: true,
                },
            });
            res.success('Role permission updated successfully', serializeRolePermissions(updatedRolePermission), 200);
        }
        catch (error) {
            console.error('Error updating role permission:', error);
            res.error(error.message);
        }
    },
    async deleteRolePermissions(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid role permission ID', 400);
                return;
            }
            const existingRolePermission = await prisma_client_1.default.role_permissions.findFirst({
                where: {
                    id: id,
                },
            });
            if (!existingRolePermission) {
                res.error('Role permission not found', 404);
                return;
            }
            await prisma_client_1.default.role_permissions.delete({
                where: { id: id },
            });
            res.success('Role permission deleted successfully', null, 200);
        }
        catch (error) {
            console.error('Error deleting role permission:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=rolePermissions.controller.js.map