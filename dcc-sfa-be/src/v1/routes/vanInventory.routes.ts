import express from 'express';
import { vanInventoryController } from '../controllers/vanInventory.controller';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createVanInventoryValidation } from '../validations/vanInventory.validation';
import { validate } from '../../middlewares/validation.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/van-inventory',
  authenticateToken,
  auditCreate('van_inventory'),
  requirePermission([{ module: 'van-stock', action: 'create' }]),
  // createVanInventoryValidation,
  validate,
  vanInventoryController.createOrUpdateVanInventory
);
router.get(
  '/van-inventory',
  authenticateToken,
  requirePermission([{ module: 'van-stock', action: 'read' }]),
  vanInventoryController.getAllVanInventory
);
router.get(
  '/van-inventory/:id',
  authenticateToken,
  requirePermission([{ module: 'van-stock', action: 'read' }]),
  vanInventoryController.getVanInventoryById
);
router.put(
  '/van-inventory/:id',
  authenticateToken,
  auditUpdate('van_inventory'),
  requirePermission([{ module: 'van-stock', action: 'update' }]),
  vanInventoryController.updateVanInventory
);
router.delete(
  '/van-inventory/:id',
  authenticateToken,
  auditDelete('van_inventory'),
  requirePermission([{ module: 'van-stock', action: 'delete' }]),
  vanInventoryController.deleteVanInventory
);

router.post(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  auditCreate('van_inventory_items'),
  requirePermission([{ module: 'van-stock', action: 'create' }]),
  vanInventoryController.createVanInventoryItem
);
router.get(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  requirePermission([{ module: 'van-stock', action: 'read' }]),
  vanInventoryController.getVanInventoryItems
);
router.put(
  '/van-inventory/:vanInventoryId/items/:itemId',
  authenticateToken,
  auditUpdate('van_inventory_items'),
  requirePermission([{ module: 'van-stock', action: 'update' }]),
  vanInventoryController.updateVanInventoryItem
);
router.delete(
  '/van-inventory/:vanInventoryId/items/:itemId',
  authenticateToken,
  auditDelete('van_inventory_items'),
  requirePermission([{ module: 'van-stock', action: 'delete' }]),
  vanInventoryController.deleteVanInventoryItem
);
router.put(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  auditUpdate('van_inventory_items'),
  requirePermission([{ module: 'van-stock', action: 'update' }]),
  vanInventoryController.bulkUpdateVanInventoryItems
);

router.get(
  '/products/:productId/batches',
  vanInventoryController.getProductBatches
);

router.get(
  '/products/:productId/batches/:batchId',
  vanInventoryController.getProductBatchDetails
);

router.post(
  '/products/batches/bulk',
  vanInventoryController.getBulkProductBatches
);

export default router;
