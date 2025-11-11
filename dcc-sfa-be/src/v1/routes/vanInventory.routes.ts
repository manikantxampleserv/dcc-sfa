import express from 'express';
import { vanInventoryController } from '../controllers/vanInventory.controller';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createVanInventoryValidation } from '../validations/vanInventory.validation';
import { validate } from '../../middlewares/validation.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/van-inventory',
  authenticateToken,
  auditCreate('van_inventory'),
  createVanInventoryValidation,
  validate,
  vanInventoryController.createOrUpdateVanInventory
);
router.get(
  '/van-inventory',
  authenticateToken,
  vanInventoryController.getAllVanInventory
);
router.get(
  '/van-inventory/:id',
  authenticateToken,
  vanInventoryController.getVanInventoryById
);
router.put(
  '/van-inventory/:id',
  authenticateToken,
  auditUpdate('van_inventory'),
  vanInventoryController.updateVanInventory
);
router.delete(
  '/van-inventory/:id',
  authenticateToken,
  auditDelete('van_inventory'),
  vanInventoryController.deleteVanInventory
);

// Van Inventory Items Routes
router.post(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  auditCreate('van_inventory_items'),
  vanInventoryController.createVanInventoryItem
);
router.get(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  vanInventoryController.getVanInventoryItems
);
router.put(
  '/van-inventory/:vanInventoryId/items/:itemId',
  authenticateToken,
  auditUpdate('van_inventory_items'),
  vanInventoryController.updateVanInventoryItem
);
router.delete(
  '/van-inventory/:vanInventoryId/items/:itemId',
  authenticateToken,
  auditDelete('van_inventory_items'),
  vanInventoryController.deleteVanInventoryItem
);
router.put(
  '/van-inventory/:vanInventoryId/items',
  authenticateToken,
  auditUpdate('van_inventory_items'),
  vanInventoryController.bulkUpdateVanInventoryItems
);

export default router;
