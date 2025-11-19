import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { routesController } from '../controllers/routes.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createRouteValidation } from '../validations/routes.validation';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';

const router = Router();

router.get(
  '/routes/:id',
  authenticateToken,
  requirePermission([{ module: 'route', action: 'read' }]),
  routesController.getRoutesById
);
router.get(
  '/routes',
  authenticateToken,
  requirePermission([{ module: 'route', action: 'read' }]),
  routesController.getRoutes
);

router.put(
  '/routes/:id',
  authenticateToken,
  auditUpdate('routes'),
  requirePermission([{ module: 'route', action: 'update' }]),
  routesController.updateRoutes
);

router.delete(
  '/routes/:id',
  authenticateToken,
  auditDelete('routes'),
  requirePermission([{ module: 'route', action: 'delete' }]),
  routesController.deleteRoutes
);

export default router;
