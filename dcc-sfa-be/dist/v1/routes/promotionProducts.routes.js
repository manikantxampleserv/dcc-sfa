"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promotionProducts_controller_1 = require("../controllers/promotionProducts.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const promotionProducts_validator_1 = require("../validations/promotionProducts.validator");
const router = (0, express_1.Router)();
router.post('/promotion-products', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('promotion_products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'create' }]), promotionProducts_validator_1.createPromotionProductsValidations, validation_middleware_1.validate, promotionProducts_controller_1.promotionProductsController.createPromotionProduct);
router.get('/promotion-products', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), promotionProducts_controller_1.promotionProductsController.getAllPromotionProducts);
router.get('/promotion-products/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), promotionProducts_controller_1.promotionProductsController.getPromotionProductById);
router.put('/promotion-products/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('promotion_products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'update' }]), promotionProducts_controller_1.promotionProductsController.updatePromotionProduct);
router.delete('/promotion-products/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('promotion_products'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'delete' }]), promotionProducts_controller_1.promotionProductsController.deletePromotionProduct);
exports.default = router;
//# sourceMappingURL=promotionProducts.routes.js.map