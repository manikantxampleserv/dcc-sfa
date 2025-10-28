import { Router } from 'express';
import { visitTasksController } from '../controllers/visitTasks.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  visitTasksController.createVisitTasks
);
router.get(
  '/reports/visit-tasks',
  authenticateToken,
  visitTasksController.getAllVisitTasks
);
router.get(
  '/reports/visit-tasks/:id',
  authenticateToken,
  visitTasksController.getVisitTasksById
);
router.put(
  '/reports/visit-tasks/:id',
  authenticateToken,
  auditUpdate('visit_tasks'),
  visitTasksController.updateVisitTasks
);
router.delete(
  '/reports/visit-tasks/:id',
  authenticateToken,
  auditDelete('visit_tasks'),
  visitTasksController.deleteVisitTasks
);

export default router;
