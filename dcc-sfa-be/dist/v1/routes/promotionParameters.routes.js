"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promotionParameters_controller_1 = require("../controllers/promotionParameters.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const promotionParameters_validator_1 = require("../validations/promotionParameters.validator");
const router = (0, express_1.Router)();
router.post('/promotion-parameters', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('promotion_parameters'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'create' }]), promotionParameters_validator_1.createPromotionParametersValidations, validation_middleware_1.validate, promotionParameters_controller_1.promotionParametersController.createPromotionParameter);
router.get('/promotion-parameters', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), promotionParameters_controller_1.promotionParametersController.getAllPromotionParameters);
router.get('/promotion-parameters/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'read' }]), promotionParameters_controller_1.promotionParametersController.getPromotionParameterById);
router.put('/promotion-parameters/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('promotion_parameters'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'update' }]), promotionParameters_controller_1.promotionParametersController.updatePromotionParameter);
router.delete('/promotion-parameters/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('promotion_parameters'), (0, auth_middleware_1.requirePermission)([{ module: 'product', action: 'delete' }]), promotionParameters_controller_1.promotionParametersController.deletePromotionParameter);
exports.default = router;
//# sourceMappingURL=promotionParameters.routes.js.map