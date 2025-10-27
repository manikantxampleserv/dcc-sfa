import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { gpsTrackingController } from '../controllers/gpsTracking.controller';

const router = Router();

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
