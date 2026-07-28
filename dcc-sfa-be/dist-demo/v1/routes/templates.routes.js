"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const templates_controller_1 = require("../controllers/templates.controller");
const router = (0, express_1.Router)();
router.post('/templates', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('templates'), (0, auth_middleware_1.requirePermission)([{ module: 'templates', action: 'create' }]), templates_controller_1.templatesController.createTemplates);
router.get('/templates/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'templates', action: 'read' }]), templates_controller_1.templatesController.getTemplatesById);
router.get('/templates', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'templates', action: 'read' }]), templates_controller_1.templatesController.getTemplates);
router.put('/templates/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('templates'), (0, auth_middleware_1.requirePermission)([{ module: 'templates', action: 'update' }]), templates_controller_1.templatesController.updateTemplates);
router.delete('/templates/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('templates'), (0, auth_middleware_1.requirePermission)([{ module: 'templates', action: 'delete' }]), templates_controller_1.templatesController.deleteTemplates);
exports.default = router;
//# sourceMappingURL=templates.routes.js.map