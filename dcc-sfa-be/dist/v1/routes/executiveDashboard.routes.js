"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const executiveDashboard_controller_1 = require("../controllers/executiveDashboard.controller");
const router = (0, express_1.Router)();
router.get('/dashboard/statistics', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'dashboard', action: 'read' }]), executiveDashboard_controller_1.executiveDashboardController.getStatistics);
router.get('/dashboard/sales-performance', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'dashboard', action: 'read' }]), executiveDashboard_controller_1.executiveDashboardController.getSalesPerformance);
router.get('/dashboard/top-products', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'dashboard', action: 'read' }]), executiveDashboard_controller_1.executiveDashboardController.getTopProducts);
router.get('/dashboard/order-status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'dashboard', action: 'read' }]), executiveDashboard_controller_1.executiveDashboardController.getOrderStatus);
exports.default = router;
//# sourceMappingURL=executiveDashboard.routes.js.map