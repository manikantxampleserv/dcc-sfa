"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productFlavours_controller_1 = require("../controllers/productFlavours.controller");
const productFlavours_validation_1 = require("../validations/productFlavours.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-flavours', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_flavours'), (0, auth_middleware_1.requirePermission)([{ module: 'product-flavour', action: 'create' }]), productFlavours_validation_1.createProductFlavourValidation, validation_middleware_1.validate, productFlavours_controller_1.productFlavoursController.createProductFlavour);
router.get('/product-flavours/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-flavour', action: 'read' }]), validation_middleware_1.validate, productFlavours_controller_1.productFlavoursController.getProductFlavourById);
router.get('/product-flavours', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-flavour', action: 'read' }]), productFlavours_controller_1.productFlavoursController.getProductFlavours);
router.put('/product-flavours/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_flavours'), (0, auth_middleware_1.requirePermission)([{ module: 'product-flavour', action: 'update' }]), productFlavours_controller_1.productFlavoursController.updateProductFlavour);
router.delete('/product-flavours/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_flavours'), (0, auth_middleware_1.requirePermission)([{ module: 'product-flavour', action: 'delete' }]), productFlavours_controller_1.productFlavoursController.deleteProductFlavour);
router.get('/product-flavours-dropdown', auth_middleware_1.authenticateToken, productFlavours_controller_1.productFlavoursController.getProductFlavoursDropdown);
exports.default = router;
//# sourceMappingURL=productFlavours.routes.js.map