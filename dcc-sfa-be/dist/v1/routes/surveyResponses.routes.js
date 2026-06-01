"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const surveyResponses_controller_1 = require("../controllers/surveyResponses.controller");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.post('/survey-responses', auth_middleware_1.authenticateToken, multer_1.upload.single('photo'), (0, audit_middleware_1.auditCreate)('survey_response'), (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'create' }]), surveyResponses_controller_1.surveyResponseController.createOrUpdateSurveyResponse);
router.get('/survey-responses', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'read' }]), surveyResponses_controller_1.surveyResponseController.getAllSurveyResponses);
router.get('/survey-responses/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'read' }]), surveyResponses_controller_1.surveyResponseController.getSurveyResponseById);
router.delete('/survey-responses/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('survey_response'), (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'delete' }]), surveyResponses_controller_1.surveyResponseController.deleteSurveyResponse);
router.get('/survey-responses/:responseId/answers', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'survey', action: 'read' }]), surveyResponses_controller_1.surveyResponseController.getSurveyAnswers);
exports.default = router;
//# sourceMappingURL=surveyResponses.routes.js.map