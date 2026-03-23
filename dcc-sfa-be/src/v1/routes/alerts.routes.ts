import { Router } from 'express';
import { alertsController } from '../controllers/alerts.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/alerts', authenticateToken, alertsController.createAlert);

router.put('/alerts/:id', authenticateToken, alertsController.updateAlert);

router.get('/alerts', authenticateToken, alertsController.getAllAlerts);

router.get('/alerts/:id', authenticateToken, alertsController.getAlertById);

router.delete('/alerts/:id', authenticateToken, alertsController.deleteAlert);

router.post(
  '/alerts/:id/process',
  authenticateToken,
  alertsController.processAlert
);

router.post(
  '/alerts/bulk-process',
  authenticateToken,
  alertsController.bulkProcessAlerts
);

router.get('/alerts/stats', authenticateToken, alertsController.getAlertStats);

export default router;
