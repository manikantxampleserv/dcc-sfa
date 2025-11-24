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

// import { Router } from 'express';
// import { promotionController } from '../controllers/promotion.controller';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';

// const router = Router();

// router.post(
//   '/promotions',
//   authenticateToken,
//   auditCreate('promotion'),
//   promotionController.createPromotion
// );

// router.get(
//   '/promotions',
//   authenticateToken,
//   promotionController.getAllPromotions
// );

// router.get(
//   '/promotions/:id',
//   authenticateToken,
//   promotionController.getPromotionById
// );

// router.put(
//   '/promotions/:id',
//   authenticateToken,
//   auditUpdate('promotion'),
//   promotionController.updatePromotion
// );

// router.delete(
//   '/promotions/:id',
//   authenticateToken,
//   auditDelete('promotion'),
//   promotionController.deletePromotion
// );

// router.post(
//   '/promotions/:id/depots',
//   authenticateToken,
//   promotionController.assignDepots
// );

// router.post(
//   '/promotions/:id/salespersons',
//   authenticateToken,
//   promotionController.assignSalespersons
// );

// router.post(
//   '/promotions/:id/routes',
//   authenticateToken,
//   promotionController.assignRoutes
// );

// router.post(
//   '/promotions/:id/customer-categories',
//   authenticateToken,
//   promotionController.assignCustomerCategories
// );

// router.post(
//   '/promotions/:id/customer-exclusions',
//   authenticateToken,
//   promotionController.assignCustomerExclusions
// );

// router.post(
//   '/promotions/:id/channels',
//   authenticateToken,
//   promotionController.assignChannels
// );

// router.post(
//   '/promotions/:id/conditions',
//   authenticateToken,
//   promotionController.createCondition
// );

// router.put(
//   '/promotions/:id/conditions/:conditionId',
//   authenticateToken,
//   promotionController.updateCondition
// );

// router.post(
//   '/promotions/:id/conditions/:conditionId/products',
//   authenticateToken,
//   promotionController.assignConditionProducts
// );

// router.post(
//   '/promotions/:id/levels',
//   authenticateToken,
//   promotionController.createLevel
// );

// router.put(
//   '/promotions/:id/levels/:levelId',
//   authenticateToken,
//   promotionController.updateLevel
// );

// router.post(
//   '/promotions/:id/levels/:levelId/benefits',
//   authenticateToken,
//   promotionController.createBenefit
// );

// router.post(
//   '/promotions/calculate',
//   authenticateToken,
//   promotionController.calculateEligiblePromotions
// );

// router.post(
//   '/promotions/apply',
//   authenticateToken,
//   promotionController.applyPromotion
// );

// router.post(
//   '/promotions/:id/settle-period',
//   authenticateToken,
//   promotionController.settlePeriodPromotion
// );

// router.get(
//   '/promotions/reports/active',
//   authenticateToken,
//   promotionController.getActivePromotionsReport
// );

// router.get(
//   '/promotions/reports/tracking',
//   authenticateToken,
//   promotionController.getPromotionTrackingReport
// );

// router.get(
//   '/promotions/reports/customer-qualified',
//   authenticateToken,
//   promotionController.getCustomerQualifiedReport
// );

// export default router;
