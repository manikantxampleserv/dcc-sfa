"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const kpiTargets_controller_1 = require("../controllers/kpiTargets.controller");
const kpiTargets_validation_1 = require("../validations/kpiTargets.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
// Create KPI Target
router.post('/kpi-targets', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('kpi_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'kpi-target', action: 'create' }]), kpiTargets_validation_1.createKpiTargetValidation, validation_middleware_1.validate, kpiTargets_controller_1.kpiTargetsController.createKpiTarget);
// Get all KPI Targets with pagination and filters
router.get('/kpi-targets', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'kpi-target', action: 'read' }]), kpiTargets_controller_1.kpiTargetsController.getAllKpiTargets);
// Get KPI Target by ID
router.get('/kpi-targets/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'kpi-target', action: 'read' }]), kpiTargets_controller_1.kpiTargetsController.getKpiTargetById);
// Update KPI Target
router.put('/kpi-targets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('kpi_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'kpi-target', action: 'update' }]), kpiTargets_validation_1.updateKpiTargetValidation, validation_middleware_1.validate, kpiTargets_controller_1.kpiTargetsController.updateKpiTarget);
// Delete KPI Target (soft delete)
router.delete('/kpi-targets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('kpi_targets'), (0, auth_middleware_1.requirePermission)([{ module: 'kpi-target', action: 'delete' }]), kpiTargets_controller_1.kpiTargetsController.deleteKpiTarget);
exports.default = router;
//# sourceMappingURL=kpiTargets.routes.js.map