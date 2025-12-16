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
import { coolerTypesController } from '../controllers/coolerTypes.controller';
import { createCoolerTypeValidation } from '../validations/coolerTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-types',
  authenticateToken,
  auditCreate('cooler_types'),
  requirePermission([{ module: 'cooler-type', action: 'create' }]),
  createCoolerTypeValidation,
  validate,
  coolerTypesController.createCoolerType
);

router.get(
  '/cooler-types/:id',
  authenticateToken,
  requirePermission([{ module: 'cooler-type', action: 'read' }]),
  validate,
  coolerTypesController.getCoolerTypeById
);

router.get(
  '/cooler-types',
  authenticateToken,
  requirePermission([{ module: 'cooler-type', action: 'read' }]),
  coolerTypesController.getCoolerTypes
);

router.get(
  '/cooler-types-dropdown',
  authenticateToken,
  coolerTypesController.getCoolerTypesDropdown
);

router.put(
  '/cooler-types/:id',
  authenticateToken,
  auditUpdate('cooler_types'),
  requirePermission([{ module: 'cooler-type', action: 'update' }]),
  coolerTypesController.updateCoolerType
);

router.delete(
  '/cooler-types/:id',
  authenticateToken,
  auditDelete('cooler_types'),
  requirePermission([{ module: 'cooler-type', action: 'delete' }]),
  coolerTypesController.deleteCoolerType
);

export default router;
