import { Router } from 'express';
import { auditCreate } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { gpsTrackingController } from '../controllers/gpsTracking.controller';
import { createGPSLogValidation } from '../validations/gpsTracking.validation';

const router = Router();

/**
 * @route POST /api/v1/tracking/gps
 * @description Create GPS Log (from mobile app)
 * @access Private (requires authentication)
 * @body { latitude, longitude, accuracy_meters?, speed_kph?, battery_level?, network_type?, log_time? }
 */
router.post(
  '/gps',
  authenticateToken,
  auditCreate('gps_logs'),
  requirePermission([{ module: 'location', action: 'create' }]),
  createGPSLogValidation,
  validate,
  gpsTrackingController.createGPSLog
);

/**
 * @route GET /api/v1/tracking/gps
 * @description Get GPS Tracking Data
 * @access Private (requires authentication)
 * @params Query: user_id, start_date, end_date
 */
router.get(
  '/gps',
  authenticateToken,
  requirePermission([{ module: 'location', action: 'read' }]),
  gpsTrackingController.getGPSTrackingData
);

/**
 * @route GET /api/v1/tracking/gps/realtime
 * @description Get Real-Time GPS Tracking
 * @access Private (requires authentication)
 */
router.get(
  '/gps/realtime',
  authenticateToken,
  requirePermission([{ module: 'location', action: 'read' }]),
  gpsTrackingController.getRealTimeGPSTracking
);

/**
 * @route GET /api/v1/tracking/gps/path/:user_id
 * @description Get User GPS Path
 * @access Private Django (requires authentication)
 * @params Params: user_id
 * @params Query: start_date, end_date
 */
router.get(
  '/gps/path/:user_id',
  authenticateToken,
  requirePermission([{ module: 'location', action: 'read' }]),
  gpsTrackingController.getUserGPSPath
);

/**
 * @route GET /api/v1/tracking/route-effectiveness
 * @description Get Route Effectiveness Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, route_id, depot_id
 */
router.get(
  '/route-effectiveness',
  authenticateToken,
  requirePermission([{ module: 'route-effectiveness', action: 'read' }]),
  gpsTrackingController.getRouteEffectiveness
);

export default router;
