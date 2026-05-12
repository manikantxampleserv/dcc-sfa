"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const routeTypes_controller_1 = require("../controllers/routeTypes.controller");
const routeTypes_validation_1 = require("../validations/routeTypes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/route-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('route_type'), (0, auth_middleware_1.requirePermission)([{ module: 'route-type', action: 'create' }]), routeTypes_validation_1.createRouteTypeValidation, validation_middleware_1.validate, routeTypes_controller_1.routeTypesController.createRouteType);
router.get('/route-types/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'route-type', action: 'read' }]), routeTypes_controller_1.routeTypesController.getRouteTypeById);
router.get('/route-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'route-type', action: 'read' }]), routeTypes_controller_1.routeTypesController.getAllRouteTypes);
router.put('/route-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('route_type'), (0, auth_middleware_1.requirePermission)([{ module: 'route-type', action: 'update' }]), routeTypes_validation_1.updateRouteTypeValidation, validation_middleware_1.validate, routeTypes_controller_1.routeTypesController.updateRouteType);
router.delete('/route-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('route_type'), (0, auth_middleware_1.requirePermission)([{ module: 'route-type', action: 'delete' }]), routeTypes_controller_1.routeTypesController.deleteRouteType);
exports.default = router;
//# sourceMappingURL=routeTypes.routes.js.map