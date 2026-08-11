import { Router } from 'express';
import { salesControlTowerController } from '../controllers/salesControlTower.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateToken, salesControlTowerController.getDashboardData);
router.get('/export', authenticateToken, salesControlTowerController.exportSalesData);

export default router;