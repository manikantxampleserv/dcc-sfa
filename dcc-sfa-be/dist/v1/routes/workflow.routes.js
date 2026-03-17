"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authenticateToken);
/**
 * Get workflow steps for a return request
 * @route GET /steps/:requestId
 */
router.get('/steps/:requestId', (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), workflow_controller_1.workflowController.getWorkflowSteps);
/**
 * Execute workflow action (approve, reject, process, complete)
 * @route POST /action/:requestId
 */
router.post('/action/:requestId', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), workflow_controller_1.workflowController.executeWorkflowAction);
/**
 * Reject return request with reason
 * @route POST /reject/:requestId
 */
router.post('/reject/:requestId', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), workflow_controller_1.workflowController.rejectReturnRequest);
/**
 * Get workflow templates
 * @route GET /templates
 */
router.get('/templates', (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), workflow_controller_1.workflowController.getWorkflowTemplates);
/**
 * Apply workflow template to a return request
 * @route POST /template/:requestId
 */
router.post('/template/:requestId', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), workflow_controller_1.workflowController.applyWorkflowTemplate);
/**
 * Execute full workflow flow - automatically progress through all steps
 * @route POST /full-flow/:requestId
 */
router.post('/full-flow/:requestId', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), workflow_controller_1.workflowController.executeFullWorkflowFlow);
/**
 * Execute next workflow step automatically
 * @route POST /next-step/:requestId
 */
router.post('/next-step/:requestId', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), workflow_controller_1.workflowController.executeNextWorkflowStep);
exports.default = router;
//# sourceMappingURL=workflow.routes.js.map