"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const coolerInspections_controller_1 = require("../controllers/coolerInspections.controller");
const coolerInspections_validation_1 = require("../validations/coolerInspections.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/cooler-inspections', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('cooler_inspections'), (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'create' }]), coolerInspections_validation_1.createCoolerInspectionValidation, validation_middleware_1.validate, coolerInspections_controller_1.coolerInspectionsController.createCoolerInspection);
router.get('/cooler-inspections/status-options', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'read' }]), coolerInspections_controller_1.coolerInspectionsController.getCoolerInspectionStatusOptions);
router.get('/cooler-inspections/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'read' }]), validation_middleware_1.validate, coolerInspections_controller_1.coolerInspectionsController.getCoolerInspectionById);
router.get('/cooler-inspections', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'read' }]), coolerInspections_controller_1.coolerInspectionsController.getCoolerInspections);
router.put('/cooler-inspections/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('cooler_inspections'), (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'update' }]), coolerInspections_controller_1.coolerInspectionsController.updateCoolerInspection);
router.patch('/cooler-inspections/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'update' }]), coolerInspections_controller_1.coolerInspectionsController.updateCoolerInspectionStatus);
router.delete('/cooler-inspections/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('cooler_inspections'), (0, auth_middleware_1.requirePermission)([{ module: 'inspection', action: 'delete' }]), coolerInspections_controller_1.coolerInspectionsController.deleteCoolerInspection);
exports.default = router;
//# sourceMappingURL=coolerInspections.routes.js.map