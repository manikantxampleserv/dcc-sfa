import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { routeTypesController } from '../controllers/routeTypes.controller';

const router = Router();

router.get(
  '/route-types',
  authenticateToken,
  routeTypesController.getRouteTypes
);

export default router;
