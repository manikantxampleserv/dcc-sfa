"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const salesManager_controller_1 = require("../controllers/salesManager.controller");
const router = (0, express_1.Router)();
router.get('/sales-manager/territory/summary', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getTerritorySummary);
router.get('/sales-manager/territory/zones-and-routes', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getZonesAndRoutes);
router.get('/sales-manager/zones/:zoneId/routes', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getZoneRoutes);
// Today summaru of saleperson
router.get('/sales-manager/today-summary', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getTodaySummary);
router.get('/sales-manager/outlets', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getOutlets);
router.get('/sales-manager/outlets/:id', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getOutletDetails);
// Today summaru of saleperson
// Target Dashboard & Details
router.get('/sales-manager/target/summary', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getTargetSummary);
router.get('/sales-manager/target/details', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getTargetDetails);
router.get('/sales-manager/target/attention-routes', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getAttentionRoutes);
router.get('/sales-manager/target/zones/:zoneId/routes', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getZoneTargetRoutes);
// Target Dashboard & Details
// Commission Dashboard & Details
router.get('/sales-manager/commission', auth_middleware_1.authenticateToken, salesManager_controller_1.salesManagerController.getCommissionDetails);
exports.default = router;
//# sourceMappingURL=salesManager.routes.js.map