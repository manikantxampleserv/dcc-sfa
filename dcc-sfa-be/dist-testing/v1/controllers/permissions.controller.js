"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsController = void 0;
const paginate_1 = require("../../utils/paginate");
const express_validator_1 = require("express-validator");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializePermission = (permission, includeCreatedAt = false, includeUpdatedAt = false) => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
    module: permission.module,
    action: permission.action,
    is_active: permission.is_active,
    ...(includeCreatedAt && { created_at: permission.createdate }),
    ...(includeUpdatedAt && { updated_at: permission.updatedate }),
});
exports.permissionsController = {
    async getAllPermissions(req, res) {
        try {
            const { page = '1', limit = '50', search = '', isActive, module, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(module && { module: module }),
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: searchLower,
                            },
                        },
                        {
                            description: {
                                contains: searchLower,
                            },
                        },
                        {
                            module: {
                                contains: searchLower,
                            },
                        },
                    ],
                }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.permissions,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: [{ module: 'asc' }, { name: 'asc' }],
            });
            res.success('Permissions retrieved successfully', data.map((permission) => serializePermission(permission, true, true)), 200, pagination);
        }
        catch (error) {
            console.error('Error fetching permissions:', error);
            res.error(error.message);
        }
    },
    async getPermissionsByModule(req, res) {
        try {
            const { isActive } = req.query;
            const permissions = await prisma_client_1.default.permissions.findMany({
                where: {
                    is_active: isActive,
                },
                orderBy: [{ module: 'asc' }, { name: 'asc' }],
            });
            // Group permissions by module
            const groupedPermissions = permissions.reduce((acc, permission) => {
                const module = permission.module;
                if (!acc[module]) {
                    acc[module] = {
                        module,
                        permissions: [],
                    };
                }
                acc[module].permissions.push(serializePermission(permission));
                return acc;
            }, {});
            const result = Object.values(groupedPermissions);
            res.success('Permissions by module retrieved successfully', result, 200);
        }
        catch (error) {
            console.error('Error fetching permissions by module:', error);
            res.error(error.message);
        }
    },
    async getPermissionById(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid permission ID', 400);
                return;
            }
            const permission = await prisma_client_1.default.permissions.findFirst({
                where: {
                    id: id,
                    is_active: 'Y',
                },
            });
            if (!permission) {
                res.error('Permission not found', 404);
                return;
            }
            res.success('Permission fetched successfully', serializePermission(permission), 200);
        }
        catch (error) {
            console.error('Error fetching permission:', error);
            res.error(error.message);
        }
    },
    async createPermission(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const { name, description, module, action, is_active } = req.body;
            const existingPermission = await prisma_client_1.default.permissions.findFirst({
                where: {
                    name,
                    is_active: 'Y',
                },
            });
            if (existingPermission) {
                res.error('Permission name already exists', 400);
                return;
            }
            const newPermission = await prisma_client_1.default.permissions.create({
                data: {
                    name,
                    description,
                    module,
                    action,
                    is_active: is_active ?? 'Y',
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                },
            });
            res.success('Permission created successfully', serializePermission(newPermission), 201);
        }
        catch (error) {
            console.error('Error creating permission:', error);
            res.error(error.message);
        }
    },
    async updatePermission(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid permission ID', 400);
                return;
            }
            const { createdate, updatedate, ...permissionData } = req.body;
            // Remove id from update data if present
            if ('id' in permissionData) {
                delete permissionData.id;
            }
            // Check if permission exists
            const existingPermission = await prisma_client_1.default.permissions.findFirst({
                where: {
                    id: id,
                    is_active: 'Y',
                },
            });
            if (!existingPermission) {
                res.error('Permission not found', 404);
                return;
            }
            // Check if name is being changed and if new name already exists
            if (permissionData.name &&
                permissionData.name !== existingPermission.name) {
                const nameExists = await prisma_client_1.default.permissions.findFirst({
                    where: {
                        name: permissionData.name,
                        is_active: 'Y',
                        id: { not: id },
                    },
                });
                if (nameExists) {
                    res.error('Permission name already exists', 400);
                    return;
                }
            }
            const updatedPermission = await prisma_client_1.default.permissions.update({
                where: { id: id },
                data: {
                    ...permissionData,
                    updatedby: req.user?.id || 1,
                    updatedate: new Date(),
                },
            });
            res.success('Permission updated successfully', serializePermission(updatedPermission), 200);
        }
        catch (error) {
            console.error('Error updating permission:', error);
            res.error(error.message);
        }
    },
    async deletePermission(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.validationError(errors.array(), 400);
                return;
            }
            const id = Number(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.error('Invalid permission ID', 400);
                return;
            }
            const existingPermission = await prisma_client_1.default.permissions.findFirst({
                where: {
                    id: id,
                    is_active: 'Y',
                },
            });
            if (!existingPermission) {
                res.error('Permission not found', 404);
                return;
            }
            // Check if permission is being used by any roles
            const rolesWithPermission = await prisma_client_1.default.role_permissions.count({
                where: {
                    permission_id: id,
                    is_active: 'Y',
                },
            });
            if (rolesWithPermission > 0) {
                res.error('Cannot delete permission as it is assigned to roles', 400);
                return;
            }
            await prisma_client_1.default.permissions.delete({ where: { id: id } });
            res.success('Permission deleted successfully', null, 200);
        }
        catch (error) {
            console.error('Error deleting permission:', error);
            res.error(error.message);
        }
    },
};
//# sourceMappingURL=permissions.controller.js.map