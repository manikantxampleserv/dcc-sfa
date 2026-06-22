import express from 'express';
import { sapController } from '../controllers/sap.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

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

export default router;
