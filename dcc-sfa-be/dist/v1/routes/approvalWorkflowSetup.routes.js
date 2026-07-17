"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const approvalWorkflowSetup_controller_1 = require("../controllers/approvalWorkflowSetup.controller");
const router = (0, express_1.Router)();
router.post('/approval-workflow-setup', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('approval_work_flow'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'create' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.createApprovalWorkFlow);
router.get('/approval-workflow-setup/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.getApprovalWorkFlowById);
router.get('/approval-workflow-setup', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.getAllApprovalWorkFlow);
router.put('/approval-workflow-setup/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('approval_work_flow'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.updateApprovalWorkFlow);
router.delete('/approval-workflow-setup/:requestType', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('approval_work_flow'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'delete' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.deleteApprovalWorkFlow);
router.post('/approval-workflow-setup/delete-multiple', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('approval_work_flow'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'delete' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.deleteApprovalWorkFlows);
router.get('/approval-setup/get-all-workflow', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.getAllApprovalWorkFlowByRequest);
router.get('/zones-with-workflow-setup/:requestType', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.getZonesWithWorkflows);
router.get('/depots-with-workflow-setup/:requestType', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), approvalWorkflowSetup_controller_1.approvalWorkflowSetupController.getDepotsWithWorkflows);
exports.default = router;
//# sourceMappingURL=approvalWorkflowSetup.routes.js.map