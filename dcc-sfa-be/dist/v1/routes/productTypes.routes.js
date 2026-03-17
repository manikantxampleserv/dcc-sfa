"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productTypes_controller_1 = require("../controllers/productTypes.controller");
const productTypes_validation_1 = require("../validations/productTypes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_type'), (0, auth_middleware_1.requirePermission)([{ module: 'product-type', action: 'create' }]), productTypes_validation_1.createProductTypeValidation, validation_middleware_1.validate, productTypes_controller_1.productTypesController.createProductType);
router.get('/product-types/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-type', action: 'read' }]), validation_middleware_1.validate, productTypes_controller_1.productTypesController.getProductTypeById);
router.get('/product-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-type', action: 'read' }]), productTypes_controller_1.productTypesController.getProductTypes);
router.put('/product-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_type'), (0, auth_middleware_1.requirePermission)([{ module: 'product-type', action: 'update' }]), productTypes_controller_1.productTypesController.updateProductType);
router.delete('/product-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_type'), (0, auth_middleware_1.requirePermission)([{ module: 'product-type', action: 'delete' }]), productTypes_controller_1.productTypesController.deleteProductType);
router.get('/product-types-dropdown', auth_middleware_1.authenticateToken, productTypes_controller_1.productTypesController.getProductTypesDropdown);
exports.default = router;
//# sourceMappingURL=productTypes.routes.js.map