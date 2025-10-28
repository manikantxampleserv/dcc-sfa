import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createLoginHistoryValidation,
  validate,
  loginHistoryController.createLoginHistory
);

router.get(
  '/login-history/:id',
  authenticateToken,
  validate,
  loginHistoryController.getLoginHistoryById
);

router.get(
  '/login-history',
  authenticateToken,
  loginHistoryController.getLoginHistory
);

router.put(
  '/login-history/:id',
  authenticateToken,
  auditUpdate('login_history'),
  loginHistoryController.updateLoginHistory
);

router.delete(
  '/login-history/:id',
  authenticateToken,
  auditDelete('login_history'),
  loginHistoryController.deleteLoginHistory
);

export default router;
