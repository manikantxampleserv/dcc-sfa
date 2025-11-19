import { Router } from 'express';
import { promotionsController } from '../controllers/promotions.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createPromotionsValidations } from '../validations/promotions.validator';
const router = Router();

router.post(
  '/promotions',
  authenticateToken,
  auditCreate('promotions'),
  requirePermission([{ module: 'product', action: 'create' }]),
  createPromotionsValidations,
  validate,
  promotionsController.createPromotions
);
router.get(
  '/promotions',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  promotionsController.getAllPromotions
);
router.get(
  '/promotions/:id',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  promotionsController.getPromotionsById
);
router.put(
  '/promotions/:id',
  authenticateToken,
  auditUpdate('promotions'),
  requirePermission([{ module: 'product', action: 'update' }]),
  validate,
  promotionsController.updatePromotions
);
router.delete(
  '/promotions/:id',
  authenticateToken,
  auditDelete('promotions'),
  requirePermission([{ module: 'product', action: 'delete' }]),
  promotionsController.deletePromotions
);

export default router;
