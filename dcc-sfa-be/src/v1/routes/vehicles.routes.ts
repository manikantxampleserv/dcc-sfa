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
import { vehiclesController } from '../controllers/vehicles.controller';
import { createVehicleValidation } from '../validations/vehicles.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/vehicles',
  authenticateToken,
  auditCreate('vehicles'),
  requirePermission([{ module: 'vehicle', action: 'create' }]),
  createVehicleValidation,
  validate,
  vehiclesController.createVehicle
);

router.get(
  '/vehicles/:id',
  authenticateToken,
  requirePermission([{ module: 'vehicle', action: 'read' }]),
  validate,
  vehiclesController.getVehicleById
);
router.get(
  '/vehicles',
  authenticateToken,
  requirePermission([{ module: 'vehicle', action: 'read' }]),
  vehiclesController.getVehicles
);

router.put(
  '/vehicles/:id',
  authenticateToken,
  auditUpdate('vehicles'),
  requirePermission([{ module: 'vehicle', action: 'update' }]),
  vehiclesController.updateVehicle
);

router.delete(
  '/vehicles/:id',
  authenticateToken,
  auditDelete('vehicles'),
  requirePermission([{ module: 'vehicle', action: 'delete' }]),
  vehiclesController.deleteVehicle
);

export default router;
