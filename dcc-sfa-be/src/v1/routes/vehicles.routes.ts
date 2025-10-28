import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { vehiclesController } from '../controllers/vehicles.controller';
import { createVehicleValidation } from '../validations/vehicles.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/vehicles',
  authenticateToken,
  auditCreate('vehicles'),
  createVehicleValidation,
  validate,
  vehiclesController.createVehicle
);

router.get(
  '/vehicles/:id',
  authenticateToken,
  validate,
  vehiclesController.getVehicleById
);
router.get('/vehicles', authenticateToken, vehiclesController.getVehicles);

router.put(
  '/vehicles/:id',
  authenticateToken,
  auditUpdate('vehicles'),
  vehiclesController.updateVehicle
);

router.delete(
  '/vehicles/:id',
  authenticateToken,
  auditDelete('vehicles'),
  vehiclesController.deleteVehicle
);

export default router;
