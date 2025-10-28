import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createSalesTargetGroupsValidation,
  validate,
  salesBonusRulesController.createSalesBonusRule
);

router.get(
  '/sales-bonus-rule',
  authenticateToken,
  salesBonusRulesController.getAllSalesBonusRules
);

router.put(
  '/sales-bonus-rule/:id',
  authenticateToken,
  auditUpdate('sales_bonus_rules'),
  salesBonusRulesController.updateSalesBonusRule
);
router.get(
  '/sales-bonus-rule/:id',
  authenticateToken,
  salesBonusRulesController.getSalesBonusRuleById
);

router.delete(
  '/sales-bonus-rule/:id',
  authenticateToken,
  auditDelete('sales_bonus_rules'),
  salesBonusRulesController.deleteSalesBonusRule
);

export default router;
