import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { approvalWorkflowSetupController } from '../controllers/approvalWorkflowSetup.controller';

const router = Router();

router.post(
  '/approval-workflow-setup',
  authenticateToken,
  auditCreate('approval_work_flow'),
  requirePermission([{ module: 'approval', action: 'create' }]),
  approvalWorkflowSetupController.createApprovalWorkFlow
);

router.get(
  '/approval-workflow-setup/:id',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getApprovalWorkFlowById
);

router.get(
  '/approval-workflow-setup',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getAllApprovalWorkFlow
);

router.put(
  '/approval-workflow-setup/:id',
  authenticateToken,
  auditUpdate('approval_work_flow'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  approvalWorkflowSetupController.updateApprovalWorkFlow
);

router.delete(
  '/approval-workflow-setup/:requestType',
  authenticateToken,
  auditDelete('approval_work_flow'),
  requirePermission([{ module: 'approval', action: 'delete' }]),
  approvalWorkflowSetupController.deleteApprovalWorkFlow
);

router.post(
  '/approval-workflow-setup/delete-multiple',
  authenticateToken,
  auditDelete('approval_work_flow'),
  requirePermission([{ module: 'approval', action: 'delete' }]),
  approvalWorkflowSetupController.deleteApprovalWorkFlows
);

router.get(
  '/approval-setup/get-all-workflow',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getAllApprovalWorkFlowByRequest
);

router.get(
  '/zones-with-workflow-setup/:requestType',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getZonesWithWorkflows
);

router.get(
  '/depots-with-workflow-setup/:requestType',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getDepotsWithWorkflows
);

export default router;
