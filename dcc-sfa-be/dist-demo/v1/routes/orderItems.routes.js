"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const orderItems_controller_1 = require("../controllers/orderItems.controller");
const router = (0, express_1.Router)();
router.post('/order-items', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('order_items'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'create' }]), orderItems_controller_1.orderItemsController.createOrderItems);
router.get('/order-items/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'read' }]), orderItems_controller_1.orderItemsController.getOrderItemsById);
router.get('/order-items', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'read' }]), orderItems_controller_1.orderItemsController.getAllOrderItems);
router.put('/order-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('order_items'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'update' }]), orderItems_controller_1.orderItemsController.updateOrderItems);
router.delete('/order-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('order_items'), (0, auth_middleware_1.requirePermission)([{ module: 'order', action: 'delete' }]), orderItems_controller_1.orderItemsController.deleteOrderItems);
exports.default = router;
//# sourceMappingURL=orderItems.routes.js.map