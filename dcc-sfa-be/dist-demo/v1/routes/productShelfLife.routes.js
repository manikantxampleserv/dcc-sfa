"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productShelfLife_controller_1 = require("../controllers/productShelfLife.controller");
const productShelfLife_validation_1 = require("../validations/productShelfLife.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-shelf-life', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_shelf_life'), (0, auth_middleware_1.requirePermission)([{ module: 'product-shelf-life', action: 'create' }]), productShelfLife_validation_1.createProductShelfLifeValidation, validation_middleware_1.validate, productShelfLife_controller_1.productShelfLifeController.createProductShelfLife);
router.get('/product-shelf-life/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-shelf-life', action: 'read' }]), validation_middleware_1.validate, productShelfLife_controller_1.productShelfLifeController.getProductShelfLifeById);
router.get('/product-shelf-life', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-shelf-life', action: 'read' }]), productShelfLife_controller_1.productShelfLifeController.getProductShelfLife);
router.put('/product-shelf-life/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_shelf_life'), (0, auth_middleware_1.requirePermission)([{ module: 'product-shelf-life', action: 'update' }]), productShelfLife_controller_1.productShelfLifeController.updateProductShelfLife);
router.delete('/product-shelf-life/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_shelf_life'), (0, auth_middleware_1.requirePermission)([{ module: 'product-shelf-life', action: 'delete' }]), productShelfLife_controller_1.productShelfLifeController.deleteProductShelfLife);
router.get('/product-shelf-life-dropdown', auth_middleware_1.authenticateToken, productShelfLife_controller_1.productShelfLifeController.getProductShelfLifeDropdown);
exports.default = router;
//# sourceMappingURL=productShelfLife.routes.js.map