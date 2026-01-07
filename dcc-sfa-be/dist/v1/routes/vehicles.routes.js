"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const vehicles_controller_1 = require("../controllers/vehicles.controller");
const vehicles_validation_1 = require("../validations/vehicles.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/vehicles', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('vehicles'), (0, auth_middleware_1.requirePermission)([{ module: 'vehicle', action: 'create' }]), vehicles_validation_1.createVehicleValidation, validation_middleware_1.validate, vehicles_controller_1.vehiclesController.createVehicle);
router.get('/vehicles/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'vehicle', action: 'read' }]), validation_middleware_1.validate, vehicles_controller_1.vehiclesController.getVehicleById);
router.get('/vehicles', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'vehicle', action: 'read' }]), vehicles_controller_1.vehiclesController.getVehicles);
router.put('/vehicles/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('vehicles'), (0, auth_middleware_1.requirePermission)([{ module: 'vehicle', action: 'update' }]), vehicles_controller_1.vehiclesController.updateVehicle);
router.delete('/vehicles/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('vehicles'), (0, auth_middleware_1.requirePermission)([{ module: 'vehicle', action: 'delete' }]), vehicles_controller_1.vehiclesController.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicles.routes.js.map