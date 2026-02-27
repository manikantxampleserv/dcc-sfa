"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const role_controller_1 = require("../../v1/controllers/role.controller");
const role_validation_1 = require("../validations/role.validation");
const router = (0, express_1.Router)();
router.get('/roles', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), role_controller_1.rolesController.getAllRoles);
router.get('/roles/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), role_controller_1.rolesController.getRoleById);
router.post('/roles', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('roles'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'create' }]), role_validation_1.validateRole, role_controller_1.rolesController.createRole);
router.put('/roles/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('roles'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'update' }]), role_validation_1.validateRole, role_controller_1.rolesController.updateRole);
router.delete('/roles/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('roles'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'delete' }]), role_controller_1.rolesController.deleteRole);
router.post('/roles/:id/permissions', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'update' }]), role_controller_1.rolesController.assignPermissions);
router.get('/roles/:id/permissions', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'read' }]), role_controller_1.rolesController.getRolePermissions);
router.get('/roles-dropdown', auth_middleware_1.authenticateToken, role_controller_1.rolesController.getRolesDropdown);
exports.default = router;
//# sourceMappingURL=roles.routes.js.map