"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const rolePermissions_controller_1 = require("../controllers/rolePermissions.controller");
const router = (0, express_1.Router)();
router.post('/role-permissions', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('role_permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'create' }]), rolePermissions_controller_1.rolePermissionsController.createRolePermissions);
router.get('/role-permissions/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), rolePermissions_controller_1.rolePermissionsController.getRolePermissionsById);
router.get('/all/role-permissions', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), rolePermissions_controller_1.rolePermissionsController.getAllRolePermissions);
router.delete('/role-permissions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('role_permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'delete' }]), rolePermissions_controller_1.rolePermissionsController.deleteRolePermissions);
router.put('/role-permissions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('role_permissions'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'update' }]), rolePermissions_controller_1.rolePermissionsController.updateRolePermission);
exports.default = router;
//# sourceMappingURL=rolePermissions.routes.js.map