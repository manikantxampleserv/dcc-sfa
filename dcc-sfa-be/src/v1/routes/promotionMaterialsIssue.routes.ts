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
import { promotionMaterialsIssueController } from '../controllers/promotionMaterialsIssue.controller';
import {
  createPromotionMaterialsIssueValidation,
  updatePromotionMaterialsIssueValidation,
} from '../validations/promotionMaterialsIssue.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/promotion-materials-issue',
  authenticateToken,
  auditCreate('promotion_materials_issue'),
  requirePermission([{ module: 'promotion-materials', action: 'create' }]),
  createPromotionMaterialsIssueValidation,
  validate,
  promotionMaterialsIssueController.createPromotionMaterialsIssue
);

router.get(
  '/promotion-materials-issue',
  authenticateToken,
  requirePermission([{ module: 'promotion-materials', action: 'read' }]),
  promotionMaterialsIssueController.getPromotionMaterialsIssues
);

router.get(
  '/promotion-materials-issue/:id',
  authenticateToken,
  requirePermission([{ module: 'promotion-materials', action: 'read' }]),
  validate,
  promotionMaterialsIssueController.getPromotionMaterialsIssueById
);

router.put(
  '/promotion-materials-issue/:id',
  authenticateToken,
  auditUpdate('promotion_materials_issue'),
  requirePermission([{ module: 'promotion-materials', action: 'update' }]),
  updatePromotionMaterialsIssueValidation,
  validate,
  promotionMaterialsIssueController.updatePromotionMaterialsIssue
);

router.delete(
  '/promotion-materials-issue/:id',
  authenticateToken,
  auditDelete('promotion_materials_issue'),
  requirePermission([{ module: 'promotion-materials', action: 'delete' }]),
  promotionMaterialsIssueController.deletePromotionMaterialsIssue
);

export default router;
