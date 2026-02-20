"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const permissions_controller_1 = require("../controllers/permissions.controller");
const router = (0, express_1.Router)();
// Get all permissions with pagination and filters
router.get('/permissions', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), permissions_controller_1.permissionsController.getAllPermissions);
// Get permissions grouped by module
router.get('/permissions/by-module', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), permissions_controller_1.permissionsController.getPermissionsByModule);
// Get permission by ID
router.get('/permissions/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), permissions_controller_1.permissionsController.getPermissionById);
// Create new permission
router.post('/permissions', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'create' }]), permissions_controller_1.permissionsController.createPermission);
// Update permission
router.put('/permissions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'update' }]), permissions_controller_1.permissionsController.updatePermission);
// Delete permission (soft delete)
router.delete('/permissions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'delete' }]), permissions_controller_1.permissionsController.deletePermission);
exports.default = router;
//# sourceMappingURL=permissions.routes.js.map