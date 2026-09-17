"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const coolerTrackingDashboard_controller_1 = require("../controllers/coolerTrackingDashboard.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/reports/cooler-tracking-dashboard
 * @description Aggregated data for the Cooler Tracking Dashboard (outlet,
 *              coverage, and depot views). Returns the full dataset in one
 *              call — mirrors the shape of the legacy mockData.json.
 * @access Private — requires authentication + report:read permission
 */
router.get('/cooler-tracking-dashboard', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), coolerTrackingDashboard_controller_1.coolerTrackingDashboardController.getDashboardData);
exports.default = router;
//# sourceMappingURL=coolerTrackingDashboard.routes.js.map