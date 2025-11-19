import { Router } from 'express';
import { approvalWorkflowsController } from '../controllers/approvalWorkflows.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowsController.getApprovalWorkflows
);
router.get(
  '/:id',
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowsController.getApprovalWorkflowById
);
router.post(
  '/:id/approve',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  approvalWorkflowsController.approveWorkflowStep
);
router.post(
  '/:id/reject',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  approvalWorkflowsController.rejectWorkflowStep
);

export default router;
