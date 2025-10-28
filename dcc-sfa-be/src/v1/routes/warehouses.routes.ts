import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { warehousesController } from '../controllers/warehouses.controller';
import { createWarehouseValidation } from '../validations/warehouses.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/warehouses',
  authenticateToken,
  auditCreate('warehouses'),
  createWarehouseValidation,
  validate,
  warehousesController.createWarehouse
);

router.get(
  '/warehouses/:id',
  authenticateToken,
  validate,
  warehousesController.getWarehouseById
);
router.get(
  '/warehouses',
  authenticateToken,
  warehousesController.getWarehouses
);

router.put(
  '/warehouses/:id',
  authenticateToken,
  auditUpdate('warehouses'),
  warehousesController.updateWarehouse
);

router.delete(
  '/warehouses/:id',
  authenticateToken,
  auditDelete('warehouses'),
  warehousesController.deleteWarehouse
);

export default router;
