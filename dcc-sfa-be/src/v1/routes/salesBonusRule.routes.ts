import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { salesBonusRulesController } from '../controllers/salesBonusRule.controller';
import { createSalesTargetGroupsValidation } from '../validations/salesTargetGroups.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/sales-bonus-rule',
  authenticateToken,
  auditCreate('sales_bonus_rules'),
  requirePermission([{ module: 'sales-bonus-rule', action: 'create' }]),
  createSalesTargetGroupsValidation,
  validate,
  salesBonusRulesController.createSalesBonusRule
);

router.get(
  '/sales-bonus-rule',
  authenticateToken,
  requirePermission([{ module: 'sales-bonus-rule', action: 'read' }]),
  salesBonusRulesController.getAllSalesBonusRules
);

router.put(
  '/sales-bonus-rule/:id',
  authenticateToken,
  auditUpdate('sales_bonus_rules'),
  requirePermission([{ module: 'sales-bonus-rule', action: 'update' }]),
  salesBonusRulesController.updateSalesBonusRule
);
router.get(
  '/sales-bonus-rule/:id',
  authenticateToken,
  requirePermission([{ module: 'sales-bonus-rule', action: 'read' }]),
  salesBonusRulesController.getSalesBonusRuleById
);

router.delete(
  '/sales-bonus-rule/:id',
  authenticateToken,
  auditDelete('sales_bonus_rules'),
  requirePermission([{ module: 'sales-bonus-rule', action: 'delete' }]),
  salesBonusRulesController.deleteSalesBonusRule
);

export default router;
