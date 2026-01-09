"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const salesBonusRule_controller_1 = require("../controllers/salesBonusRule.controller");
const salesBonusRule_validation_1 = require("../validations/salesBonusRule.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/sales-bonus-rule', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('sales_bonus_rules'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-bonus-rule', action: 'create' }]), salesBonusRule_validation_1.createSalesBonusRuleValidation, validation_middleware_1.validate, salesBonusRule_controller_1.salesBonusRulesController.createSalesBonusRule);
router.get('/sales-bonus-rule', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-bonus-rule', action: 'read' }]), salesBonusRule_controller_1.salesBonusRulesController.getAllSalesBonusRules);
router.put('/sales-bonus-rule/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('sales_bonus_rules'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-bonus-rule', action: 'update' }]), salesBonusRule_validation_1.updateSalesBonusRuleValidation, validation_middleware_1.validate, salesBonusRule_controller_1.salesBonusRulesController.updateSalesBonusRule);
router.get('/sales-bonus-rule/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'sales-bonus-rule', action: 'read' }]), salesBonusRule_controller_1.salesBonusRulesController.getSalesBonusRuleById);
router.delete('/sales-bonus-rule/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('sales_bonus_rules'), (0, auth_middleware_1.requirePermission)([{ module: 'sales-bonus-rule', action: 'delete' }]), salesBonusRule_controller_1.salesBonusRulesController.deleteSalesBonusRule);
exports.default = router;
//# sourceMappingURL=salesBonusRule.routes.js.map