import { Router } from 'express';
import { visitTasksController } from '../controllers/visitTasks.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/reports/visit-tasks',
  authenticateToken,
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
  visitTasksController.updateVisitTasks
);
router.delete(
  '/reports/visit-tasks/:id',
  authenticateToken,
  visitTasksController.deleteVisitTasks
);

export default router;
