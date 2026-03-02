"use strict";
// import { Router } from 'express';
// import { visitsController } from '../controllers/visits.controller';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// router.post(
//   '/visits',
//   authenticateToken,
//   auditCreate('visits'),
//   requirePermission([{ module: 'visit', action: 'create' }]),
//   visitsController.createVisits
// );
// router.post(
//   '/reports/visits',
//   authenticateToken,
//   auditCreate('visits'),
//   requirePermission([{ module: 'visit', action: 'create' }]),
//   visitsController.bulkUpsertVisits
// );
// router.get(
//   '/reports/visits',
//   authenticateToken,
//   requirePermission([{ module: 'visit', action: 'read' }]),
//   visitsController.getAllVisits
// );
// router.get(
//   '/reports/visits/:id',
//   authenticateToken,
//   requirePermission([{ module: 'visit', action: 'read' }]),
//   visitsController.getVisitsById
// );
// router.put(
//   '/reports/visits/:id',
//   authenticateToken,
//   auditUpdate('visits'),
//   requirePermission([{ module: 'visit', action: 'update' }]),
//   visitsController.updateVisits
// );
// router.delete(
//   '/reports/visits/:id',
//   authenticateToken,
//   auditDelete('visits'),
//   requirePermission([{ module: 'visit', action: 'delete' }]),
//   visitsController.deleteVisits
// );
// // router.get(
// //   '/reports/customer-visits',
// //   authenticateToken,
// //   visitsController.getVisitsBySalesperson
// // );
// router.get(
//   '/reports/customer-visits',
//   authenticateToken,
//   visitsController.getCustomerVisitsBySalesperson
// );
// router.get(
//   '/reports/cooler-visits',
//   authenticateToken,
//   visitsController.getCoolerInspectionsForVisitedCustomers
// );
// export default router;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const dynamicUpload_middleware_1 = require("../../middlewares/dynamicUpload.middleware");
const visits_controller_1 = require("../controllers/visits.controller");
const router = (0, express_1.Router)();
router.post('/visits', auth_middleware_1.authenticateToken, dynamicUpload_middleware_1.dynamicVisitUpload, (0, audit_middleware_1.auditCreate)('visits'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'create' }]), visits_controller_1.visitsController.createVisits);
router.post('/reports/visits', auth_middleware_1.authenticateToken, dynamicUpload_middleware_1.dynamicVisitUpload, (0, audit_middleware_1.auditCreate)('visits'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'create' }]), visits_controller_1.visitsController.bulkUpsertVisits);
router.get('/reports/visits', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'read' }]), visits_controller_1.visitsController.getAllVisits);
router.get('/reports/visits/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'read' }]), visits_controller_1.visitsController.getVisitsById);
router.put('/reports/visits/:id', auth_middleware_1.authenticateToken, dynamicUpload_middleware_1.dynamicVisitUpload, (0, audit_middleware_1.auditUpdate)('visits'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'update' }]), visits_controller_1.visitsController.updateVisits);
router.delete('/reports/visits/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('visits'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'delete' }]), visits_controller_1.visitsController.deleteVisits);
router.get('/reports/customer-visits', auth_middleware_1.authenticateToken, visits_controller_1.visitsController.getCustomerVisitsBySalesperson);
router.get('/reports/cooler-visits', auth_middleware_1.authenticateToken, visits_controller_1.visitsController.getCoolerInspectionsForVisitedCustomers);
exports.default = router;
//# sourceMappingURL=visits.routes.js.map