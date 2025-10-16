import express from 'express';
import { vanInventoryController } from '../controllers/vanInventory.controller';
import { createVanInventoryValidation } from '../validations/vanInventory.validation';
import { validate } from '../../middlewares/validation.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/van-inventory',
  authenticateToken,
  createVanInventoryValidation,
  validate,
  vanInventoryController.createVanInventory
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
  vanInventoryController.updateVanInventory
);
router.delete(
  '/van-inventory/:id',
  authenticateToken,
  vanInventoryController.deleteVanInventory
);

export default router;
