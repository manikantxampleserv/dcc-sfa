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
import { routeTypesController } from '../controllers/routeTypes.controller';
import {
  createRouteTypeValidation,
  updateRouteTypeValidation,
} from '../validations/routeTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/route-types',
  authenticateToken,
  auditCreate('route_type'),
  requirePermission([{ module: 'route-type', action: 'create' }]),
  createRouteTypeValidation,
  validate,
  routeTypesController.createRouteType
);

router.get(
  '/route-types/:id',
  authenticateToken,
  requirePermission([{ module: 'route-type', action: 'read' }]),
  routeTypesController.getRouteTypeById
);

router.get(
  '/route-types',
  authenticateToken,
  requirePermission([{ module: 'route-type', action: 'read' }]),
  routeTypesController.getAllRouteTypes
);

router.put(
  '/route-types/:id',
  authenticateToken,
  auditUpdate('route_type'),
  requirePermission([{ module: 'route-type', action: 'update' }]),
  updateRouteTypeValidation,
  validate,
  routeTypesController.updateRouteType
);

router.delete(
  '/route-types/:id',
  authenticateToken,
  auditDelete('route_type'),
  requirePermission([{ module: 'route-type', action: 'delete' }]),
  routeTypesController.deleteRouteType
);

export default router;
