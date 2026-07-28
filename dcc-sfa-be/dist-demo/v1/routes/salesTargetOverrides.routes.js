"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const salesTargetOverrides_controller_1 = require("../controllers/salesTargetOverrides.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const salesTargetOverrides_validation_1 = require("../validations/salesTargetOverrides.validation");
const router = (0, express_1.Router)();
router.post('/sales-target-overrides', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('sales_target_overrides'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'create' }]), salesTargetOverrides_validation_1.createSalesTargetOverrideValidation, validation_middleware_1.validate, salesTargetOverrides_controller_1.salesTargetOverridesController.createSalesTargetOverride);
router.get('/sales-target-overrides', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'read' }]), salesTargetOverrides_controller_1.salesTargetOverridesController.getAllSalesTargetOverrides);
router.get('/sales-target-overrides/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'read' }]), salesTargetOverrides_controller_1.salesTargetOverridesController.getSalesTargetOverrideById);
router.put('/sales-target-overrides/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('sales_target_overrides'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'update' }]), salesTargetOverrides_controller_1.salesTargetOverridesController.updateSalesTargetOverride);
router.delete('/sales-target-overrides/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('sales_target_overrides'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'delete' }]), salesTargetOverrides_controller_1.salesTargetOverridesController.deleteSalesTargetOverride);
exports.default = router;
//# sourceMappingURL=salesTargetOverrides.routes.js.map