import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { salesBonusRulesController } from '../controllers/salesBonusRule.controller';
import { createSalesTargetGroupsValidation } from '../validations/salesTargetGroups.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/sales-bonus-rule',
  authenticateToken,
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
  salesBonusRulesController.deleteSalesBonusRule
);

export default router;
