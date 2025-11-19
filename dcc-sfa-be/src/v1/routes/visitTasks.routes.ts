import { Router } from 'express';
import { visitTasksController } from '../controllers/visitTasks.controller';
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

router.post(
  '/reports/visit-tasks',
  authenticateToken,
  auditCreate('visit_tasks'),
  requirePermission([{ module: 'visit', action: 'create' }]),
  visitTasksController.createVisitTasks
);
router.get(
  '/reports/visit-tasks',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitTasksController.getAllVisitTasks
);
router.get(
  '/reports/visit-tasks/:id',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitTasksController.getVisitTasksById
);
router.put(
  '/reports/visit-tasks/:id',
  authenticateToken,
  auditUpdate('visit_tasks'),
  requirePermission([{ module: 'visit', action: 'update' }]),
  visitTasksController.updateVisitTasks
);
router.delete(
  '/reports/visit-tasks/:id',
  authenticateToken,
  auditDelete('visit_tasks'),
  requirePermission([{ module: 'visit', action: 'delete' }]),
  visitTasksController.deleteVisitTasks
);

export default router;
