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
import { unitMeasurementController } from '../controllers/unitMeasurement.controller';
import { unitMeasurementValidation } from '../validations/unitMeasurement.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/unit-measurement',
  authenticateToken,
  auditCreate('units_of_measurement'),
  requirePermission([{ module: 'unit-of-measurement', action: 'create' }]),
  unitMeasurementValidation,
  validate,
  unitMeasurementController.createUnitMeasurement
);

router.get(
  '/unit-measurement',
  authenticateToken,
  requirePermission([{ module: 'unit-of-measurement', action: 'read' }]),
  unitMeasurementController.getAllUnitMeasurement
);

router.put(
  '/unit-measurement/:id',
  authenticateToken,
  auditUpdate('units_of_measurement'),
  requirePermission([{ module: 'unit-of-measurement', action: 'update' }]),
  unitMeasurementController.updateUnitMeasurement
);
router.get(
  '/unit-measurement/:id',
  authenticateToken,
  requirePermission([{ module: 'unit-of-measurement', action: 'read' }]),
  unitMeasurementController.getUnitMeasurementById
);

router.delete(
  '/unit-measurement/:id',
  authenticateToken,
  auditDelete('units_of_measurement'),
  requirePermission([{ module: 'unit-of-measurement', action: 'delete' }]),
  unitMeasurementController.deleteUnitMeasurement
);

export default router;
