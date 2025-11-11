// routes/attendance.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';
import { attendanceController } from '../controllers/attendance.controller';
import { validate } from '../../middlewares/validation.middleware';
// import {
//   punchInValidation,
//   punchOutValidation,
//   getHistoryValidation,
//   getMonthlySummaryValidation,
//   getTeamAttendanceValidation,
//   getAttendanceByIdValidation,
// } from '../validations/attendance.validation';

const router = Router();

router.post(
  '/attendance/punch',
  authenticateToken,
  auditUpdate('attendance'),
  attendanceController.punch
);

router.get(
  '/attendance/today',
  authenticateToken,
  attendanceController.getTodayAttendance
);

router.get(
  '/attendance/history',
  authenticateToken,
  attendanceController.getAttendanceHistory
);

router.get(
  '/attendance/:id',
  authenticateToken,
  attendanceController.getAttendanceById
);

router.get(
  '/attendance/:id/history',
  authenticateToken,
  attendanceController.getAttendanceWithHistory
);

router.get(
  '/attendance/team',
  authenticateToken,
  attendanceController.getTeamAttendance
);

router.get(
  '/attendance/summary/monthly',
  authenticateToken,
  attendanceController.getMonthlySummary
);

router.put(
  '/attendance/:id',
  authenticateToken,
  auditUpdate('attendance'),
  attendanceController.updateAttendance
);

router.delete(
  '/attendance/:id',
  authenticateToken,
  attendanceController.deleteAttendance
);

export default router;
