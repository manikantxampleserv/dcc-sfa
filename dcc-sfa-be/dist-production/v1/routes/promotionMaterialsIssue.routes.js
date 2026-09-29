"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const promotionMaterialsIssue_controller_1 = require("../controllers/promotionMaterialsIssue.controller");
const promotionMaterialsIssue_validation_1 = require("../validations/promotionMaterialsIssue.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/promotion-materials-issue', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('promotion_materials_issue'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'create' }]), promotionMaterialsIssue_validation_1.createPromotionMaterialsIssueValidation, validation_middleware_1.validate, promotionMaterialsIssue_controller_1.promotionMaterialsIssueController.createPromotionMaterialsIssue);
router.get('/promotion-materials-issue', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'read' }]), promotionMaterialsIssue_controller_1.promotionMaterialsIssueController.getPromotionMaterialsIssues);
router.get('/promotion-materials-issue/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'read' }]), validation_middleware_1.validate, promotionMaterialsIssue_controller_1.promotionMaterialsIssueController.getPromotionMaterialsIssueById);
router.put('/promotion-materials-issue/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('promotion_materials_issue'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'update' }]), promotionMaterialsIssue_validation_1.updatePromotionMaterialsIssueValidation, validation_middleware_1.validate, promotionMaterialsIssue_controller_1.promotionMaterialsIssueController.updatePromotionMaterialsIssue);
router.delete('/promotion-materials-issue/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('promotion_materials_issue'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'delete' }]), promotionMaterialsIssue_controller_1.promotionMaterialsIssueController.deletePromotionMaterialsIssue);
exports.default = router;
//# sourceMappingURL=promotionMaterialsIssue.routes.js.map