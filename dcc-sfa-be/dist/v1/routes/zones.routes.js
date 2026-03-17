"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const zones_controller_1 = require("../controllers/zones.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const zones_validation_1 = require("../validations/zones.validation");
const router = (0, express_1.Router)();
router.post('/zones', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('zones'), (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'create' }]), zones_validation_1.createZoneValidation, validation_middleware_1.validate, zones_controller_1.zonesController.createZone);
router.get('/zones/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'read' }]), zones_controller_1.zonesController.getZoneById);
router.get('/zones', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'read' }]), zones_controller_1.zonesController.getZones);
router.put('/zones/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('zones'), (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'update' }]), zones_controller_1.zonesController.updateZone);
router.delete('/zones/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('zones'), (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'delete' }]), zones_controller_1.zonesController.deleteZone);
router.get('/zone/supervisors', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'zone', action: 'read' }]), zones_controller_1.zonesController.getSupervisors);
exports.default = router;
//# sourceMappingURL=zones.routes.js.map