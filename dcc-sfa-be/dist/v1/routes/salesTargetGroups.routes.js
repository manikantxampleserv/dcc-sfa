"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const salesTargetGroups_controller_1 = require("../controllers/salesTargetGroups.controller");
const salesTargetGroups_validation_1 = require("../validations/salesTargetGroups.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/sales-target-groups', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('sales_target_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target-group', action: 'create' }]), salesTargetGroups_validation_1.createSalesTargetGroupsValidation, validation_middleware_1.validate, salesTargetGroups_controller_1.salesTargetGroupsController.createSalesTargetGroups);
router.get('/sales-target-groups', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target-group', action: 'read' }]), salesTargetGroups_controller_1.salesTargetGroupsController.getAllSalesTargetGroups);
router.put('/sales-target-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('sales_target_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target-group', action: 'update' }]), salesTargetGroups_controller_1.salesTargetGroupsController.updateSalesTargetGroups);
router.get('/sales-target-groups/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target-group', action: 'read' }]), salesTargetGroups_controller_1.salesTargetGroupsController.getSalesTargetGroupsById);
router.delete('/sales-target-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('sales_target_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target-group', action: 'delete' }]), salesTargetGroups_controller_1.salesTargetGroupsController.deleteSalesTargetGroups);
exports.default = router;
//# sourceMappingURL=salesTargetGroups.routes.js.map