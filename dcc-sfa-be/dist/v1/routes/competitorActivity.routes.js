"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const competitorActivity_controller_1 = require("../controllers/competitorActivity.controller");
const competitorActivity_validation_1 = require("../validations/competitorActivity.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/competitor-activity', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('competitor_activities'), (0, auth_middleware_1.requirePermission)([{ module: 'competitor', action: 'create' }]), competitorActivity_validation_1.createCompetitorActivityValidation, validation_middleware_1.validate, competitorActivity_controller_1.competitorActivityController.createCompetitorActivity);
router.get('/competitor-activity/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'competitor', action: 'read' }]), validation_middleware_1.validate, competitorActivity_controller_1.competitorActivityController.getCompetitorActivityById);
router.get('/competitor-activity', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'competitor', action: 'read' }]), competitorActivity_controller_1.competitorActivityController.getCompetitorActivities);
router.put('/competitor-activity/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('competitor_activities'), (0, auth_middleware_1.requirePermission)([{ module: 'competitor', action: 'update' }]), competitorActivity_controller_1.competitorActivityController.updateCompetitorActivity);
router.delete('/competitor-activity/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('competitor_activities'), (0, auth_middleware_1.requirePermission)([{ module: 'competitor', action: 'delete' }]), competitorActivity_controller_1.competitorActivityController.deleteCompetitorActivity);
exports.default = router;
//# sourceMappingURL=competitorActivity.routes.js.map