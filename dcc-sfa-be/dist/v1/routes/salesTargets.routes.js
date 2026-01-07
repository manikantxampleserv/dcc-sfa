"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const salesTargets_controller_1 = require("../controllers/salesTargets.controller");
const salesTargets_validation_1 = require("../validations/salesTargets.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
// Create Sales Target
router.post('/sales-targets', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('sales_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'create' }]), salesTargets_validation_1.createSalesTargetValidation, validation_middleware_1.validate, salesTargets_controller_1.salesTargetsController.createSalesTarget);
// Get all Sales Targets with pagination and filters
router.get('/sales-targets', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'read' }]), salesTargets_controller_1.salesTargetsController.getAllSalesTargets);
// Get Sales Target by ID
router.get('/sales-targets/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'read' }]), salesTargets_controller_1.salesTargetsController.getSalesTargetById);
// Update Sales Target
router.put('/sales-targets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('sales_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'update' }]), salesTargets_validation_1.updateSalesTargetValidation, validation_middleware_1.validate, salesTargets_controller_1.salesTargetsController.updateSalesTarget);
// Delete Sales Target (soft delete)
router.delete('/sales-targets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('sales_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-target', action: 'delete' }]), salesTargets_controller_1.salesTargetsController.deleteSalesTarget);
exports.default = router;
//# sourceMappingURL=salesTargets.routes.js.map