"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const warehouses_controller_1 = require("../controllers/warehouses.controller");
const warehouses_validation_1 = require("../validations/warehouses.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/warehouses', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('warehouses'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'create' }]), warehouses_validation_1.createWarehouseValidation, validation_middleware_1.validate, warehouses_controller_1.warehousesController.createWarehouse);
router.get('/warehouses/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'read' }]), validation_middleware_1.validate, warehouses_controller_1.warehousesController.getWarehouseById);
router.get('/warehouses', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'read' }]), warehouses_controller_1.warehousesController.getWarehouses);
router.put('/warehouses/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('warehouses'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'update' }]), warehouses_controller_1.warehousesController.updateWarehouse);
router.delete('/warehouses/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('warehouses'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'delete' }]), warehouses_controller_1.warehousesController.deleteWarehouse);
exports.default = router;
//# sourceMappingURL=warehouses.routes.js.map