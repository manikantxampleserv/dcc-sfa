import express from 'express';
import { sapController } from '../controllers/sap.controller';

const router = express.Router();

router.post('/sap/van-inventory', sapController.syncVanInventory);

export default router;
