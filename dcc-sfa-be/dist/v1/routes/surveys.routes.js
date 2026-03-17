"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const surveys_controller_1 = require("../controllers/surveys.controller");
const surveys_validation_1 = require("../validations/surveys.validation");
const router = (0, express_1.Router)();
router.post('/surveys', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('surveys'), (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'create' }]), surveys_validation_1.createSurveyValidation, surveys_controller_1.surveysController.createOrUpdateSurvey);
router.get('/surveys', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'read' }]), surveys_controller_1.surveysController.getAllSurveys);
router.get('/surveys/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'read' }]), surveys_controller_1.surveysController.getSurveyById);
router.delete('/surveys/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('surveys'), (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'delete' }]), surveys_controller_1.surveysController.deleteSurvey);
router.patch('/surveys/:id/publish', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'update' }]), surveys_controller_1.surveysController.publishSurvey);
exports.default = router;
//# sourceMappingURL=surveys.routes.js.map