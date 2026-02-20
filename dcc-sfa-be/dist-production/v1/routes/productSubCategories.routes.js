"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productSubCategories_controller_1 = require("../controllers/productSubCategories.controller");
const productSubCategories_validation_1 = require("../validations/productSubCategories.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-sub-categories', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_sub_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-sub-category', action: 'create' }]), productSubCategories_validation_1.createProductSubCategoriesValidation, validation_middleware_1.validate, productSubCategories_controller_1.productSubCategoriesController.createProductSubCategories);
router.get('/product-sub-categories', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-sub-category', action: 'read' }]), productSubCategories_controller_1.productSubCategoriesController.getAllProductSubCategories);
router.put('/product-sub-categories/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_sub_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-sub-category', action: 'update' }]), productSubCategories_controller_1.productSubCategoriesController.updateProductSubCategories);
router.get('/product-sub-categories/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-sub-category', action: 'read' }]), productSubCategories_controller_1.productSubCategoriesController.getProductSubCategoriesById);
router.delete('/product-sub-categories/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_sub_categories'), (0, auth_middleware_1.requirePermission)([{ module: 'product-sub-category', action: 'delete' }]), productSubCategories_controller_1.productSubCategoriesController.deleteProductSubCategories);
exports.default = router;
//# sourceMappingURL=productSubCategories.routes.js.map