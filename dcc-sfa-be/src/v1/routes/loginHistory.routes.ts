import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { loginHistoryController } from '../controllers/loginHistory.controller';
import { createLoginHistoryValidation } from '../validations/loginHistory.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/login-history',
  authenticateToken,
  auditCreate('login_history'),
  requirePermission([{ module: 'login-history', action: 'create' }]),
  createLoginHistoryValidation,
  validate,
  loginHistoryController.createLoginHistory
);

router.get(
  '/login-history/:id',
  authenticateToken,
  requirePermission([{ module: 'login-history', action: 'read' }]),
  validate,
  loginHistoryController.getLoginHistoryById
);

router.get(
  '/login-history',
  authenticateToken,
  requirePermission([{ module: 'login-history', action: 'read' }]),
  loginHistoryController.getLoginHistory
);

router.put(
  '/login-history/:id',
  authenticateToken,
  auditUpdate('login_history'),
  requirePermission([{ module: 'login-history', action: 'update' }]),
  loginHistoryController.updateLoginHistory
);

router.delete(
  '/login-history/:id',
  authenticateToken,
  auditDelete('login_history'),
  requirePermission([{ module: 'login-history', action: 'delete' }]),
  loginHistoryController.deleteLoginHistory
);

export default router;
