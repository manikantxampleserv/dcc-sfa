"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productWebOrders_controller_1 = require("../controllers/productWebOrders.controller");
const productWebOrders_validation_1 = require("../validations/productWebOrders.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-web-orders', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_web_order'), (0, auth_middleware_1.requirePermission)([{ module: 'product-web-order', action: 'create' }]), productWebOrders_validation_1.createProductWebOrderValidation, validation_middleware_1.validate, productWebOrders_controller_1.productWebOrdersController.createProductWebOrder);
router.get('/product-web-orders/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-web-order', action: 'read' }]), validation_middleware_1.validate, productWebOrders_controller_1.productWebOrdersController.getProductWebOrderById);
router.get('/product-web-orders', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-web-order', action: 'read' }]), productWebOrders_controller_1.productWebOrdersController.getProductWebOrders);
router.put('/product-web-orders/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_web_order'), (0, auth_middleware_1.requirePermission)([{ module: 'product-web-order', action: 'update' }]), productWebOrders_controller_1.productWebOrdersController.updateProductWebOrder);
router.delete('/product-web-orders/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_web_order'), (0, auth_middleware_1.requirePermission)([{ module: 'product-web-order', action: 'delete' }]), productWebOrders_controller_1.productWebOrdersController.deleteProductWebOrder);
router.get('/product-web-orders-dropdown', auth_middleware_1.authenticateToken, productWebOrders_controller_1.productWebOrdersController.getProductWebOrdersDropdown);
exports.default = router;
//# sourceMappingURL=productWebOrders.routes.js.map