"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const regions_controller_1 = require("../controllers/regions.controller");
const router = (0, express_1.Router)();
router.post('/regions', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('regions'), (0, auth_middleware_1.requirePermission)([{ module: 'region', action: 'create' }]), regions_controller_1.regionsController.createRegions);
router.get('/regions/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'region', action: 'read' }]), regions_controller_1.regionsController.getRegionsById);
router.get('/regions', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'region', action: 'read' }]), regions_controller_1.regionsController.getAllRegions);
router.put('/regions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('regions'), (0, auth_middleware_1.requirePermission)([{ module: 'region', action: 'update' }]), regions_controller_1.regionsController.updateRegions);
router.delete('/regions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('regions'), (0, auth_middleware_1.requirePermission)([{ module: 'region', action: 'delete' }]), regions_controller_1.regionsController.deleteRegions);
exports.default = router;
//# sourceMappingURL=regions.routes.js.map