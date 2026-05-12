"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const gpsTracking_controller_1 = require("../controllers/gpsTracking.controller");
const gpsTracking_validation_1 = require("../validations/gpsTracking.validation");
const router = (0, express_1.Router)();
/**
 * @route POST /api/v1/tracking/gps
 * @description Create GPS Log (from mobile app)
 * @access Private (requires authentication)
 * @body { latitude, longitude, accuracy_meters?, speed_kph?, battery_level?, network_type?, log_time? }
 */
router.post('/gps', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('gps_logs'), (0, auth_middleware_1.requirePermission)([{ module: 'location', action: 'create' }]), gpsTracking_validation_1.createGPSLogValidation, validation_middleware_1.validate, gpsTracking_controller_1.gpsTrackingController.createGPSLog);
/**
 * @route GET /api/v1/tracking/gps
 * @description Get GPS Tracking Data
 * @access Private (requires authentication)
 * @params Query: user_id, start_date, end_date
 */
router.get('/gps', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'location', action: 'read' }]), gpsTracking_controller_1.gpsTrackingController.getGPSTrackingData);
/**
 * @route GET /api/v1/tracking/gps/realtime
 * @description Get Real-Time GPS Tracking
 * @access Private (requires authentication)
 */
router.get('/gps/realtime', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'location', action: 'read' }]), gpsTracking_controller_1.gpsTrackingController.getRealTimeGPSTracking);
/**
 * @route GET /api/v1/tracking/gps/path/:user_id
 * @description Get User GPS Path
 * @access Private Django (requires authentication)
 * @params Params: user_id
 * @params Query: start_date, end_date
 */
router.get('/gps/path/:user_id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'location', action: 'read' }]), gpsTracking_controller_1.gpsTrackingController.getUserGPSPath);
/**
 * @route GET /api/v1/tracking/route-effectiveness
 * @description Get Route Effectiveness Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, route_id, depot_id
 */
router.get('/route-effectiveness', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'route-effectiveness', action: 'read' }]), gpsTracking_controller_1.gpsTrackingController.getRouteEffectiveness);
exports.default = router;
//# sourceMappingURL=gpsTracking.routes.js.map