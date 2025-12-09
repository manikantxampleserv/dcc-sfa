// import { Router } from 'express';
// import { promotionsController } from '../controllers/promotions.controller';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';
// import { validate } from '../../middlewares/validation.middleware';
// import { createPromotionsValidations } from '../validations/promotions.validator';
// const router = Router();

// router.post(
//   '/promotions',
//   authenticateToken,
//   auditCreate('promotions'),
//   requirePermission([{ module: 'product', action: 'create' }]),
//   createPromotionsValidations,
//   validate,
//   promotionsController.createPromotions
// );
// router.get(
//   '/promotions',
//   authenticateToken,
//   requirePermission([{ module: 'product', action: 'read' }]),
//   promotionsController.getAllPromotions
// );
// router.get(
//   '/promotions/:id',
//   authenticateToken,
//   requirePermission([{ module: 'product', action: 'read' }]),
//   promotionsController.getPromotionsById
// );
// router.put(
//   '/promotions/:id',
//   authenticateToken,
//   auditUpdate('promotions'),
//   requirePermission([{ module: 'product', action: 'update' }]),
//   validate,
//   promotionsController.updatePromotions
// );
// router.delete(
//   '/promotions/:id',
//   authenticateToken,
//   auditDelete('promotions'),
//   requirePermission([{ module: 'product', action: 'delete' }]),
//   promotionsController.deletePromotions
// );

// export default router;

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
import { promotionsController } from '../controllers/promotions.controller';
import { promotionsNewController } from '../controllers/promotionsNew.controller';

const router = Router();

router.post(
  '/promotions',
  authenticateToken,
  auditCreate('promotion'),
  promotionsNewController.createPromotion
);

router.get(
  '/promotions',
  authenticateToken,
  promotionsNewController.getAllPromotions
);

router.get(
  '/promotions/:id',
  authenticateToken,
  promotionsNewController.getPromotionById
);

router.put(
  '/promotions/:id',
  authenticateToken,
  auditUpdate('promotion'),
  promotionsNewController.updatePromotion
);

router.delete(
  '/promotions/:id',
  authenticateToken,
  auditDelete('promotion'),
  promotionsNewController.deletePromotion
);

//eligiblity

router.post(
  '/promotions/:id/cheannels',
  authenticateToken,
  promotionsController.assignChannels
);

router.post(
  '/promotions/:id/depots',
  authenticateToken,
  promotionsController.assignDepots
);

router.post(
  '/promotions/:id/salesperson',
  authenticateToken,
  promotionsController.assignSalespersons
);

router.post(
  '/promotions/:id/routes',
  authenticateToken,
  promotionsController.assignRoutes
);

router.post(
  '/promotions/:id/customer-categories',
  authenticateToken,
  promotionsController.assignCustomerCategories
);

router.post(
  '/promotions/:id/customer-exclusions',
  authenticateToken,
  promotionsController.assignCustomerExclusions
);

router.post(
  '/promotions/:id/conditions',
  authenticateToken,
  promotionsController.createCondition
);

router.put(
  '/promotions/:id/conditions/:conditionId',
  authenticateToken,
  promotionsController.updateCondition
);

router.delete(
  '/promotions/:id/conditions/:conditionId',
  authenticateToken,
  promotionsController.deleteCondition
);

router.post(
  '/promotions/:id/conditions/:conditionId/products',
  authenticateToken,
  promotionsController.assignConditionProducts
);

// lvl & benifit

router.post(
  '/promotions/:id/levels',
  authenticateToken,
  promotionsController.createLevel
);

router.put(
  '/promotions/:id/levels/:levelId',
  authenticateToken,
  promotionsController.updateLevel
);

router.delete(
  '/promotions/:id/levels/:levelId',
  authenticateToken,
  promotionsController.deleteLevel
);

router.post(
  '/promotions/:id/levels/:levelId/benefits',
  authenticateToken,
  promotionsController.createBenefit
);

router.put(
  '/promotions/:id/levels/:levelId/benefits/:benefitId',
  authenticateToken,
  promotionsController.updateBenefit
);

router.delete(
  '/promotions/:id/levels/:levelId/benefits/:benefitId',
  authenticateToken,
  promotionsController.deleteBenefit
);

// pprom cal
router.post(
  '/promotions/calculate',
  authenticateToken,
  promotionsController.calculateEligiblePromotions
);

router.post(
  '/promotions/apply',
  authenticateToken,
  promotionsController.applyPromotion
);

router.post(
  '/promotions/:id/settle-period',
  authenticateToken,
  promotionsController.settlePeriodPromotion
);

//actve & saatatus
router.patch(
  '/promotions/:id/activate',
  authenticateToken,
  promotionsController.activatePromotion
);

router.patch(
  '/promotions/:id/deactivate',
  authenticateToken,
  promotionsController.deactivatePromotion
);

// report

router.get(
  '/promotions/reports/active',
  authenticateToken,
  promotionsController.getActivePromotionsReport
);

router.get(
  '/promotions/reports/tracking',
  authenticateToken,
  promotionsController.getPromotionTrackingReport
);

router.get(
  '/promotions/reports/usage/:id',
  authenticateToken,
  promotionsController.getPromotionUsageReport
);

router.get(
  '/promotions/reports/customer-qualified',
  authenticateToken,
  promotionsController.getCustomerQualifiedReport
);

router.get(
  '/promotions/reports/performance',
  authenticateToken,
  promotionsController.getPromotionPerformanceReport
);

router.post(
  '/promotions/bulk-activate',
  authenticateToken,
  promotionsController.bulkActivatePromotions
);

router.post(
  '/promotions/bulk-deactivate',
  authenticateToken,
  promotionsController.bulkDeactivatePromotions
);

router.delete(
  '/promotions/bulk-delete',
  authenticateToken,
  promotionsController.bulkDeletePromotions
);

export default router;
