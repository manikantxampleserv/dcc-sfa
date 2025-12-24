"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const orders_controller_1 = require("../controllers/orders.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const orders_validation_1 = require("../validations/orders.validation");
const router = (0, express_1.Router)();
router.post('/orders', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('orders'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'create' }]), orders_validation_1.createOrderValidation, validation_middleware_1.validate, orders_controller_1.ordersController.createOrUpdateOrder);
router.get('/orders/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'read' }]), orders_controller_1.ordersController.getOrdersById);
router.get('/orders', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'read' }]), orders_controller_1.ordersController.getAllOrders);
router.put('/orders/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('orders'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'update' }]), orders_controller_1.ordersController.updateOrders);
router.delete('/orders/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('orders'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'delete' }]), orders_controller_1.ordersController.deleteOrders);
router.get('/orders/order-items/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'read' }]), orders_controller_1.ordersController.getOrdersOrderItemsByOrderId);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map