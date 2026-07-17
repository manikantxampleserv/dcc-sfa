import express from 'express';
import { sapController } from '../controllers/sap.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';
import { createRequestLogger } from '../../middlewares/requestLogger.middleware';
const router = express.Router();

router.use(createRequestLogger('sap'));

router.post(
  '/sap/van-inventory',
  authenticateToken,
  sapController.syncVanInventory
);

router.get('/sap/search/users', authenticateToken, sapController.searchUsers);

router.get(
  '/sap/search/locations',
  authenticateToken,
  sapController.searchLocations
);

router.get(
  '/sap/search/vehicles',
  authenticateToken,
  sapController.searchVehicles
);

router.get(
  '/sap/search/product',
  authenticateToken,
  sapController.searchProduct
);

router.patch(
  '/sap-van-inventory/:id/cancel',
  authenticateToken,
  // auditUpdate('van_inventory'),
  requirePermission([{ module: 'van-stock', action: 'update' }]),
  sapController.updateVanInventoryCancellation
);

// Cancel/Uncancel Van Inventory Item
router.patch(
  '/sap-van-inventory/items/:itemId/cancel',
  authenticateToken,
  // auditUpdate('van_inventory_items'),
  requirePermission([{ module: 'van-stock', action: 'update' }]),
  sapController.updateVanInventoryItemCancellation
);

export default router;
