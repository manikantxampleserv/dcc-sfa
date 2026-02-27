"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const promotions_controller_1 = require("../controllers/promotions.controller");
const promotionsNew_controller_1 = require("../controllers/promotionsNew.controller");
const router = (0, express_1.Router)();
router.post('/promotions', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('promotion'), promotionsNew_controller_1.promotionsNewController.createPromotion);
router.get('/promotions', auth_middleware_1.authenticateToken, promotionsNew_controller_1.promotionsNewController.getAllPromotions);
router.get('/promotions/:id', auth_middleware_1.authenticateToken, promotionsNew_controller_1.promotionsNewController.getPromotionById);
router.put('/promotions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('promotion'), promotionsNew_controller_1.promotionsNewController.updatePromotion);
router.delete('/promotions/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('promotion'), promotionsNew_controller_1.promotionsNewController.deletePromotion);
//eligiblity
router.post('/promotions/:id/cheannels', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignChannels);
router.post('/promotions/:id/depots', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignDepots);
router.post('/promotions/:id/salesperson', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignSalespersons);
router.post('/promotions/:id/routes', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignRoutes);
router.post('/promotions/:id/customer-categories', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignCustomerCategories);
router.post('/promotions/:id/customer-exclusions', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignCustomerExclusions);
router.post('/promotions/:id/conditions', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.createCondition);
router.put('/promotions/:id/conditions/:conditionId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.updateCondition);
router.delete('/promotions/:id/conditions/:conditionId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.deleteCondition);
router.post('/promotions/:id/conditions/:conditionId/products', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.assignConditionProducts);
// lvl & benifit
router.post('/promotions/:id/levels', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.createLevel);
router.put('/promotions/:id/levels/:levelId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.updateLevel);
router.delete('/promotions/:id/levels/:levelId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.deleteLevel);
router.post('/promotions/:id/levels/:levelId/benefits', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.createBenefit);
router.put('/promotions/:id/levels/:levelId/benefits/:benefitId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.updateBenefit);
router.delete('/promotions/:id/levels/:levelId/benefits/:benefitId', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.deleteBenefit);
// pprom cal
router.post('/promotions/calculate', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.calculateEligiblePromotions);
router.post('/promotions/apply', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.applyPromotion);
router.post('/promotions/:id/settle-period', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.settlePeriodPromotion);
//actve & saatatus
router.patch('/promotions/:id/activate', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.activatePromotion);
router.patch('/promotions/:id/deactivate', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.deactivatePromotion);
// report
router.get('/promotions/reports/active', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.getActivePromotionsReport);
router.get('/promotions/reports/tracking', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.getPromotionTrackingReport);
router.get('/promotions/reports/usage/:id', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.getPromotionUsageReport);
router.get('/promotions/reports/customer-qualified', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.getCustomerQualifiedReport);
router.get('/promotions/reports/performance', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.getPromotionPerformanceReport);
router.post('/promotions/bulk-activate', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.bulkActivatePromotions);
router.post('/promotions/bulk-deactivate', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.bulkDeactivatePromotions);
router.delete('/promotions/bulk-delete', auth_middleware_1.authenticateToken, promotions_controller_1.promotionsController.bulkDeletePromotions);
router.get('/promotions/salesperson/visits-outlets', auth_middleware_1.authenticateToken, promotionsNew_controller_1.promotionsNewController.getPromotionsWithVisitsAndOutlets);
router.get('/active-promotions-details', promotionsNew_controller_1.promotionsNewController.getActivePromotionsWithDetails);
exports.default = router;
//# sourceMappingURL=promotions.routes.js.map