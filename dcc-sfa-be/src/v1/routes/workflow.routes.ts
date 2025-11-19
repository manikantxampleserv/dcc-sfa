import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * Get workflow steps for a return request
 * @route GET /steps/:requestId
 */
router.get(
  '/steps/:requestId',
  requirePermission([{ module: 'approval', action: 'read' }]),
  workflowController.getWorkflowSteps
);

/**
 * Execute workflow action (approve, reject, process, complete)
 * @route POST /action/:requestId
 */
router.post(
  '/action/:requestId',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  workflowController.executeWorkflowAction
);

/**
 * Reject return request with reason
 * @route POST /reject/:requestId
 */
router.post(
  '/reject/:requestId',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  workflowController.rejectReturnRequest
);

/**
 * Get workflow templates
 * @route GET /templates
 */
router.get(
  '/templates',
  requirePermission([{ module: 'approval', action: 'read' }]),
  workflowController.getWorkflowTemplates
);

/**
 * Apply workflow template to a return request
 * @route POST /template/:requestId
 */
router.post(
  '/template/:requestId',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  workflowController.applyWorkflowTemplate
);

/**
 * Execute full workflow flow - automatically progress through all steps
 * @route POST /full-flow/:requestId
 */
router.post(
  '/full-flow/:requestId',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  workflowController.executeFullWorkflowFlow
);

/**
 * Execute next workflow step automatically
 * @route POST /next-step/:requestId
 */
router.post(
  '/next-step/:requestId',
  auditUpdate('workflow_steps'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  workflowController.executeNextWorkflowStep
);

export default router;
