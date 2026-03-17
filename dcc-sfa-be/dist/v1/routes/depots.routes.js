"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const depots_controller_1 = require("../controllers/depots.controller");
const depots_validation_1 = require("../validations/depots.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/depots', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('depots'), (0, auth_middleware_1.requirePermission)([{ module: 'depot', action: 'create' }]), depots_validation_1.createDepotValidation, validation_middleware_1.validate, depots_controller_1.depotsController.createDepots);
router.get('/depots/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'depot', action: 'read' }]), validation_middleware_1.validate, depots_controller_1.depotsController.getDepotsById);
router.get('/depots', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'depot', action: 'read' }]), depots_controller_1.depotsController.getDepots);
router.put('/depots/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('depots'), (0, auth_middleware_1.requirePermission)([{ module: 'depot', action: 'update' }]), depots_controller_1.depotsController.updateDepots);
router.delete('/depots/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('depots'), (0, auth_middleware_1.requirePermission)([{ module: 'depot', action: 'delete' }]), depots_controller_1.depotsController.deleteDepots);
exports.default = router;
//# sourceMappingURL=depots.routes.js.map