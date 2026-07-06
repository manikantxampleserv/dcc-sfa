import express from 'express';
import { reconciliationController } from '../controllers/reconciliation.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { saveReconciliationValidation } from '../validations/reconciliation.validation';
import { validate } from '../../middlewares/validation.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';
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

router.get(
  '/reconciliation/:id/export',
  authenticateToken,
  requirePermission([{ module: 'reconciliation', action: 'read' }]),
  reconciliationController.exportReconciliationExcel
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
export default router;
