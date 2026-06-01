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
import { citiesController } from '../controllers/cities.controller';

const router = Router();

router.post(
  '/cities',
  authenticateToken,
  auditCreate('cities'),
  requirePermission([{ module: 'city', action: 'create' }]),
  citiesController.createCities
);

router.get(
  '/cities/:id',
  authenticateToken,
  requirePermission([{ module: 'city', action: 'read' }]),
  citiesController.getCitiesById
);

router.get(
  '/cities',
  authenticateToken,
  requirePermission([{ module: 'city', action: 'read' }]),
  citiesController.getAllCities
);

router.put(
  '/cities/:id',
  authenticateToken,
  auditUpdate('cities'),
  requirePermission([{ module: 'city', action: 'update' }]),
  citiesController.updateCities
);

router.delete(
  '/cities/:id',
  authenticateToken,
  auditDelete('cities'),
  requirePermission([{ module: 'city', action: 'delete' }]),
  citiesController.deleteCities
);

export default router;
