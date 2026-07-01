import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { errorLogsController } from '../controllers/errorLogs.controller';

const router = Router();

/**
 * @route GET /api/v1/error-logs
 * @description Get Error Logs with filtering and pagination
 * @access Private (requires authentication)
 */
router.get(
  '/error-logs',
  authenticateToken,
  requirePermission([{ module: 'setting', action: 'read' }]),
  errorLogsController.getErrorLogs
);

export default router;
