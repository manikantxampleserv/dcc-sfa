import { Router } from 'express';
import { routeTypesController } from '../controllers/routesTypes.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createRouteTypeValidation } from '../validations/routesTypes.validation';

const router = Router();

router.post(
  '/route-types',
  authenticateToken,
  validate(createRouteTypeValidation),
  routeTypesController.createRouteType
);
router.get(
  '/route-types',
  authenticateToken,
  routeTypesController.getAllRouteTypes
);
router.get(
  '/route-types/:id',
  authenticateToken,
  routeTypesController.getRouteTypeById
);
router.put(
  '/route-types/:id',
  authenticateToken,
  validate(createRouteTypeValidation),
  routeTypesController.updateRouteType
);
router.delete(
  '/route-types/:id',
  authenticateToken,
  routeTypesController.deleteRouteType
);

export default router;
