import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
router.get('/gps', authenticateToken, gpsTrackingController.getGPSTrackingData);

/**
 * @route GET /api/v1/tracking/gps/realtime
 * @description Get Real-Time GPS Tracking
 * @access Private (requires authentication)
 */
router.get(
  '/gps/realtime',
  authenticateToken,
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
  gpsTrackingController.getUserGPSPath
);

export default router;
