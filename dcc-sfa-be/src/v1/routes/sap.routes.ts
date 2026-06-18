import express from 'express';
import { sapController } from '../controllers/sap.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/sap/van-inventory',
  authenticateToken,
  sapController.syncVanInventory
);

export default router;
