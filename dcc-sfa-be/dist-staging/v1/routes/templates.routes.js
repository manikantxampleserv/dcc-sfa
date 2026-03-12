"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const templates_controller_1 = require("../controllers/templates.controller");
const router = (0, express_1.Router)();
router.post('/templates', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('templates'), templates_controller_1.templatesController.createTemplates);
router.get('/templates/:id', auth_middleware_1.authenticateToken, templates_controller_1.templatesController.getTemplatesById);
router.get('/templates', auth_middleware_1.authenticateToken, templates_controller_1.templatesController.getTemplates);
router.put('/templates/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('templates'), templates_controller_1.templatesController.updateTemplates);
router.delete('/templates/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('templates'), templates_controller_1.templatesController.deleteTemplates);
exports.default = router;
//# sourceMappingURL=templates.routes.js.map