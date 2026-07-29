"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const apiTokens_controller_1 = require("../controllers/apiTokens.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/api-tokens', (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'read' }]), apiTokens_controller_1.getApiTokens);
router.get('/api-tokens/:id', (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'read' }]), apiTokens_controller_1.getApiTokenById);
router.patch('/api-tokens/:id/revoke', (0, audit_middleware_1.auditUpdate)('api_tokens'), (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'update' }]), apiTokens_controller_1.revokeApiToken);
router.patch('/api-tokens/:id/activate', (0, audit_middleware_1.auditUpdate)('api_tokens'), (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'update' }]), apiTokens_controller_1.activateApiToken);
router.patch('/api-tokens/:id/deactivate', (0, audit_middleware_1.auditUpdate)('api_tokens'), (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'update' }]), apiTokens_controller_1.deactivateApiToken);
router.delete('/api-tokens/:id', (0, audit_middleware_1.auditDelete)('api_tokens'), (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'delete' }]), apiTokens_controller_1.deleteApiToken);
router.patch('/api-tokens/user/:userId/revoke-all', (0, audit_middleware_1.auditUpdate)('api_tokens'), (0, auth_middleware_1.requirePermission)([{ module: 'token', action: 'update' }]), apiTokens_controller_1.revokeAllUserTokens);
exports.default = router;
//# sourceMappingURL=apiTokens.routes.js.map