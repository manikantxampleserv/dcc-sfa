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
import { warehousesController } from '../controllers/warehouses.controller';
import { createWarehouseValidation } from '../validations/warehouses.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/warehouses',
  authenticateToken,
  auditCreate('warehouses'),
  requirePermission([{ module: 'warehouse', action: 'create' }]),
  createWarehouseValidation,
  validate,
  warehousesController.createWarehouse
);

router.get(
  '/warehouses/:id',
  authenticateToken,
  requirePermission([{ module: 'warehouse', action: 'read' }]),
  validate,
  warehousesController.getWarehouseById
);
router.get(
  '/warehouses',
  authenticateToken,
  requirePermission([{ module: 'warehouse', action: 'read' }]),
  warehousesController.getWarehouses
);

router.put(
  '/warehouses/:id',
  authenticateToken,
  auditUpdate('warehouses'),
  requirePermission([{ module: 'warehouse', action: 'update' }]),
  warehousesController.updateWarehouse
);

router.delete(
  '/warehouses/:id',
  authenticateToken,
  auditDelete('warehouses'),
  requirePermission([{ module: 'warehouse', action: 'delete' }]),
  warehousesController.deleteWarehouse
);

export default router;
