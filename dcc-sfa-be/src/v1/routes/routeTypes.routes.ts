import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createRouteTypeValidation,
  validate,
  routeTypesController.createRouteType
);

router.get(
  '/route-types/:id',
  authenticateToken,
  routeTypesController.getRouteTypeById
);

router.get(
  '/route-types',
  authenticateToken,
  routeTypesController.getAllRouteTypes
);

router.put(
  '/route-types/:id',
  authenticateToken,
  auditUpdate('route_type'),
  updateRouteTypeValidation,
  validate,
  routeTypesController.updateRouteType
);

router.delete(
  '/route-types/:id',
  authenticateToken,
  auditDelete('route_type'),
  routeTypesController.deleteRouteType
);

export default router;
