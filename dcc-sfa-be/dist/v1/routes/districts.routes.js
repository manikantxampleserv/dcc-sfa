"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const districts_controller_1 = require("../controllers/districts.controller");
const router = (0, express_1.Router)();
router.post('/districts', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('districts'), districts_controller_1.districtsController.createDistricts);
router.get('/districts/:id', auth_middleware_1.authenticateToken, districts_controller_1.districtsController.getDistrictsById);
router.get('/districts', auth_middleware_1.authenticateToken, districts_controller_1.districtsController.getAllDistricts);
router.put('/districts/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('districts'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'update' }]), districts_controller_1.districtsController.updateDistricts);
router.delete('/districts/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('districts'), (0, auth_middleware_1.requirePermission)([{ module: 'role', action: 'delete' }]), districts_controller_1.districtsController.deleteDistricts);
exports.default = router;
//# sourceMappingURL=districts.routes.js.map