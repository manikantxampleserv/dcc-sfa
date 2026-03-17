"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const currencies_controller_1 = require("../controllers/currencies.controller");
const currencies_validation_1 = require("../validations/currencies.validation");
const router = (0, express_1.Router)();
router.post('/currencies', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('currencies'), (0, auth_middleware_1.requirePermission)([{ module: 'currency', action: 'create' }]), currencies_validation_1.createCurrenciesValidation, validation_middleware_1.validate, currencies_controller_1.currenciesController.createCurrencies);
router.get('/currencies', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'currency', action: 'read' }]), currencies_controller_1.currenciesController.getAllCurrencies);
router.get('/currencies/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'currency', action: 'read' }]), currencies_controller_1.currenciesController.getCurrenciesById);
router.put('/currencies/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('currencies'), (0, auth_middleware_1.requirePermission)([{ module: 'currency', action: 'update' }]), currencies_controller_1.currenciesController.updateCurrencies);
router.delete('/currencies/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('currencies'), (0, auth_middleware_1.requirePermission)([{ module: 'currency', action: 'delete' }]), currencies_controller_1.currenciesController.deleteCurrencies);
exports.default = router;
//# sourceMappingURL=currencies.routes.js.map