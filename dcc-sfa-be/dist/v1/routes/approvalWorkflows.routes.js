"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approvalWorkflows_controller_1 = require("../controllers/approvalWorkflows.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/', (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflows_controller_1.approvalWorkflowsController.getApprovalWorkflows);
router.get('/:id', (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflows_controller_1.approvalWorkflowsController.getApprovalWorkflowById);
router.post('/:id/approve', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), approvalWorkflows_controller_1.approvalWorkflowsController.approveWorkflowStep);
router.post('/:id/reject', (0, audit_middleware_1.auditUpdate)('workflow_steps'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), approvalWorkflows_controller_1.approvalWorkflowsController.rejectWorkflowStep);
exports.default = router;
//# sourceMappingURL=approvalWorkflows.routes.js.map