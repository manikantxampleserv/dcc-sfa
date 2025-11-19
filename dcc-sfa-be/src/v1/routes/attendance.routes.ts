// routes/attendance.routes.ts

import { Router } from 'express';
import { auditUpdate } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { attendanceController } from '../controllers/attendance.controller';

const router = Router();

router.post(
  '/attendance/punch',
  authenticateToken,
  auditUpdate('attendance'),
  requirePermission([{ module: 'profile', action: 'update' }]),
  attendanceController.punch
);

router.get(
  '/attendance/punch/status',
  authenticateToken,
  requirePermission([{ module: 'profile', action: 'read' }]),
  attendanceController.getPunchStatus
);

export default router;
