import express from 'express';
import { reconciliationController } from '../controllers/reconciliation.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { saveReconciliationValidation } from '../validations/reconciliation.validation';
import { validate } from '../../middlewares/validation.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';
import { runReconciliationJob } from '../../jobs/reconciliation.job';

const router = express.Router();

router.get(
  '/reconciliation',
  authenticateToken,
  requirePermission([{ module: 'reconciliation', action: 'read' }]),
  reconciliationController.getAllReconciliations
);

router.get(
  '/reconciliation/:id',
  authenticateToken,
  requirePermission([{ module: 'reconciliation', action: 'read' }]),
  reconciliationController.getReconciliationById
);

router.post(
  '/reconciliation/save',
  authenticateToken,
  requirePermission([{ module: 'reconciliation', action: 'update' }]),
  saveReconciliationValidation,
  validate,
  auditUpdate('reconciliation_items'),
  reconciliationController.saveReconciliations
);

// Manual trigger for reconciliation cron (for testing)
router.post(
  '/reconciliation/run-cron',
  authenticateToken,
  requirePermission([{ module: 'reconciliation', action: 'update' }]),
  async (_req, res) => {
    try {
      await runReconciliationJob();
      res.json({ success: true, message: 'Reconciliation cron job completed successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
