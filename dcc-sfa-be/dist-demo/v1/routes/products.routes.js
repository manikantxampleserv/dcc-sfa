"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const products_controller_1 = require("../controllers/products.controller");
const products_validation_1 = require("../validations/products.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/products', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'create' }]), products_validation_1.createProductValidation, validation_middleware_1.validate, products_controller_1.productsController.createProduct);
router.get('/products', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), products_controller_1.productsController.getAllProducts);
router.put('/products/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'update' }]), products_controller_1.productsController.updateProduct);
router.get('/products/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), products_controller_1.productsController.getProductById);
router.delete('/products/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'delete' }]), products_controller_1.productsController.deleteProduct);
router.get('/products-dropdown', auth_middleware_1.authenticateToken, products_controller_1.productsController.getProductDropdown);
exports.default = router;
//# sourceMappingURL=products.routes.js.map