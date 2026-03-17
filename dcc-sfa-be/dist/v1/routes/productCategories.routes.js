"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productCategories_controller_1 = require("../controllers/productCategories.controller");
const productCategories_validation_1 = require("../validations/productCategories.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-categories', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-category', action: 'create' }]), productCategories_validation_1.createProductCategoriesValidation, validation_middleware_1.validate, productCategories_controller_1.productCategoriesController.createProductCategories);
router.get('/product-categories', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-category', action: 'read' }]), productCategories_controller_1.productCategoriesController.getAllProductCategories);
router.put('/product-categories/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-category', action: 'update' }]), productCategories_controller_1.productCategoriesController.updateProductCategories);
router.get('/product-categories/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-category', action: 'read' }]), productCategories_controller_1.productCategoriesController.getProductCategoriesById);
router.delete('/product-categories/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-category', action: 'delete' }]), productCategories_controller_1.productCategoriesController.deleteProductCategories);
router.get('/product-categories-dropdown', auth_middleware_1.authenticateToken, productCategories_controller_1.productCategoriesController.getProductCategoriesDropdown);
exports.default = router;
//# sourceMappingURL=productCategories.routes.js.map