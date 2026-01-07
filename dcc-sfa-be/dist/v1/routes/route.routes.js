"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const routes_controller_1 = require("../controllers/routes.controller");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.get('/routes/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'route', action: 'read' }]), routes_controller_1.routesController.getRoutesById);
router.get('/routes', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'route', action: 'read' }]), routes_controller_1.routesController.getRoutes);
router.put('/routes/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('routes'), (0, auth_middleware_1.requirePermission)([{ module: 'route', action: 'update' }]), routes_controller_1.routesController.updateRoutes);
router.delete('/routes/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('routes'), (0, auth_middleware_1.requirePermission)([{ module: 'route', action: 'delete' }]), routes_controller_1.routesController.deleteRoutes);
exports.default = router;
//# sourceMappingURL=route.routes.js.map