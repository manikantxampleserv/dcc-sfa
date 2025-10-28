import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { routesController } from '../controllers/routes.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createRouteValidation } from '../validations/routes.validation';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/routes',
  authenticateToken,
  createRouteValidation,
  auditCreate('routes'),
  validate,
  routesController.createRoutes
);

router.get('/routes/:id', routesController.getRoutesById);
router.get('/routes', authenticateToken, routesController.getRoutes);

router.put(
  '/routes/:id',
  authenticateToken,
  auditUpdate('routes'),
  routesController.updateRoutes
);

router.delete(
  '/routes/:id',
  authenticateToken,
  auditDelete('routes'),
  routesController.deleteRoutes
);

export default router;
