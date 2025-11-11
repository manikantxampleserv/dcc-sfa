import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  approvalWorkflowSetupController.createApprovalWorkFlow
);

router.get(
  '/approval-workflow-setup/:id',
  authenticateToken,
  approvalWorkflowSetupController.getApprovalWorkFlowById
);

router.get(
  '/approval-workflow-setup',
  authenticateToken,
  approvalWorkflowSetupController.getAllApprovalWorkFlow
);

router.put(
  '/approval-workflow-setup/:id',
  authenticateToken,
  auditUpdate('approval_work_flow'),
  approvalWorkflowSetupController.updateApprovalWorkFlow
);

router.delete(
  '/approval-workflow-setup/:requestType',
  authenticateToken,
  auditDelete('approval_work_flow'),
  approvalWorkflowSetupController.deleteApprovalWorkFlow
);

router.post(
  '/approval-workflow-setup/delete-multiple',
  authenticateToken,
  auditDelete('approval_work_flow'),
  approvalWorkflowSetupController.deleteApprovalWorkFlows
);

router.get(
  '/approval-workflow-setup/get-all-workflow',
  authenticateToken,
  approvalWorkflowSetupController.getAllApprovalWorkFlowByRequest
);

router.get(
  '/zones-with-workflow-setup/:requestType',
  authenticateToken,
  approvalWorkflowSetupController.getZonesWithWorkflows
);

router.get(
  '/depots-with-workflow-setup/:requestType',
  authenticateToken,
  approvalWorkflowSetupController.getDepotsWithWorkflows
);

export default router;
