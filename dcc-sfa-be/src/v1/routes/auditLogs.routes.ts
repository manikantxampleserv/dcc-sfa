import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditLogsController } from '../controllers/auditLogs.controller';

const router = Router();

/**
 * @route GET /api/v1/audit-logs
 * @description Get Audit Logs with filtering and pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, table_name, action, user_id, start_date, end_date
 */
router.get(
  '/audit-logs',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  auditLogsController.getAuditLogs
);

export default router;
