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
import { coolerSubTypesController } from '../controllers/coolerSubTypes.controller';
import { createCoolerSubTypeValidation } from '../validations/coolerSubTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-sub-types',
  authenticateToken,
  auditCreate('cooler_sub_types'),
  requirePermission([{ module: 'cooler-sub-type', action: 'create' }]),
  createCoolerSubTypeValidation,
  validate,
  coolerSubTypesController.createCoolerSubType
);

router.get(
  '/cooler-sub-types/:id',
  authenticateToken,
  requirePermission([{ module: 'cooler-sub-type', action: 'read' }]),
  validate,
  coolerSubTypesController.getCoolerSubTypeById
);

router.get(
  '/cooler-sub-types',
  authenticateToken,
  requirePermission([{ module: 'cooler-sub-type', action: 'read' }]),
  coolerSubTypesController.getCoolerSubTypes
);

router.get(
  '/cooler-sub-types-dropdown',
  authenticateToken,
  coolerSubTypesController.getCoolerSubTypesDropdown
);

router.put(
  '/cooler-sub-types/:id',
  authenticateToken,
  auditUpdate('cooler_sub_types'),
  requirePermission([{ module: 'cooler-sub-type', action: 'update' }]),
  coolerSubTypesController.updateCoolerSubType
);

router.delete(
  '/cooler-sub-types/:id',
  authenticateToken,
  auditDelete('cooler_sub_types'),
  requirePermission([{ module: 'cooler-sub-type', action: 'delete' }]),
  coolerSubTypesController.deleteCoolerSubType
);

export default router;
