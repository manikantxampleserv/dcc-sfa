import { Router } from 'express';
import { approvalWorkflowsController } from '../controllers/approvalWorkflows.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', approvalWorkflowsController.getApprovalWorkflows);
router.get('/:id', approvalWorkflowsController.getApprovalWorkflowById);
router.post(
  '/:id/approve',
  auditUpdate('workflow_steps'),
  approvalWorkflowsController.approveWorkflowStep
);
router.post(
  '/:id/reject',
  auditUpdate('workflow_steps'),
  approvalWorkflowsController.rejectWorkflowStep
);

export default router;
