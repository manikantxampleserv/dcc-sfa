"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const loginHistory_controller_1 = require("../controllers/loginHistory.controller");
const loginHistory_validation_1 = require("../validations/loginHistory.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/login-history', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('login_history'), (0, auth_middleware_1.requirePermission)([{ module: 'login-history', action: 'create' }]), loginHistory_validation_1.createLoginHistoryValidation, validation_middleware_1.validate, loginHistory_controller_1.loginHistoryController.createLoginHistory);
router.get('/login-history/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'login-history', action: 'read' }]), validation_middleware_1.validate, loginHistory_controller_1.loginHistoryController.getLoginHistoryById);
router.get('/login-history', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'login-history', action: 'read' }]), loginHistory_controller_1.loginHistoryController.getLoginHistory);
router.put('/login-history/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('login_history'), (0, auth_middleware_1.requirePermission)([{ module: 'login-history', action: 'update' }]), loginHistory_controller_1.loginHistoryController.updateLoginHistory);
router.delete('/login-history/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('login_history'), (0, auth_middleware_1.requirePermission)([{ module: 'login-history', action: 'delete' }]), loginHistory_controller_1.loginHistoryController.deleteLoginHistory);
exports.default = router;
//# sourceMappingURL=loginHistory.routes.js.map