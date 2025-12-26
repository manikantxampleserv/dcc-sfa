"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const unitMeasurement_controller_1 = require("../controllers/unitMeasurement.controller");
const unitMeasurement_validation_1 = require("../validations/unitMeasurement.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/unit-measurement', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('units_of_measurement'), (0, auth_middleware_1.requirePermission)([{ module: 'unit-of-measurement', action: 'create' }]), unitMeasurement_validation_1.unitMeasurementValidation, validation_middleware_1.validate, unitMeasurement_controller_1.unitMeasurementController.createUnitMeasurement);
router.get('/unit-measurement', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'unit-of-measurement', action: 'read' }]), unitMeasurement_controller_1.unitMeasurementController.getAllUnitMeasurement);
router.put('/unit-measurement/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('units_of_measurement'), (0, auth_middleware_1.requirePermission)([{ module: 'unit-of-measurement', action: 'update' }]), unitMeasurement_controller_1.unitMeasurementController.updateUnitMeasurement);
router.get('/unit-measurement/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'unit-of-measurement', action: 'read' }]), unitMeasurement_controller_1.unitMeasurementController.getUnitMeasurementById);
router.delete('/unit-measurement/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('units_of_measurement'), (0, auth_middleware_1.requirePermission)([{ module: 'unit-of-measurement', action: 'delete' }]), unitMeasurement_controller_1.unitMeasurementController.deleteUnitMeasurement);
exports.default = router;
//# sourceMappingURL=unitOfMeasurement.routes.js.map