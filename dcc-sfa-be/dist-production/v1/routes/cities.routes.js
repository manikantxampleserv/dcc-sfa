"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const cities_controller_1 = require("../controllers/cities.controller");
const router = (0, express_1.Router)();
router.post('/cities', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('cities'), (0, auth_middleware_1.requirePermission)([{ module: 'city', action: 'create' }]), cities_controller_1.citiesController.createCities);
router.get('/cities/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'city', action: 'read' }]), cities_controller_1.citiesController.getCitiesById);
router.get('/cities', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'city', action: 'read' }]), cities_controller_1.citiesController.getAllCities);
router.put('/cities/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('cities'), (0, auth_middleware_1.requirePermission)([{ module: 'city', action: 'update' }]), cities_controller_1.citiesController.updateCities);
router.delete('/cities/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('cities'), (0, auth_middleware_1.requirePermission)([{ module: 'city', action: 'delete' }]), cities_controller_1.citiesController.deleteCities);
exports.default = router;
//# sourceMappingURL=cities.routes.js.map